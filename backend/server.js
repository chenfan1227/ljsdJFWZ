const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 日志配置
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple()
        })
    ]
});

// 中间件配置
app.use(helmet());
app.use(compression());
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jifenbao_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// JWT秘钥
const JWT_SECRET = process.env.JWT_SECRET || 'jifenbao_super_secret_key_2024';

// 中间件：验证JWT Token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: '访问被拒绝，需要认证' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: '无效的认证令牌' });
    }
};

// 中间件：验证管理员权限
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin || !roles.includes(req.admin.role)) {
            return res.status(403).json({ error: '权限不足' });
        }
        next();
    };
};

// 中间件：验证超级管理员权限（用于积分操作）
const requireSuperAdmin = (req, res, next) => {
    if (!req.admin || req.admin.role !== 'super_admin') {
        return res.status(403).json({ 
            error: '只有超级管理员可以操作积分系统',
            required_role: 'super_admin',
            current_role: req.admin?.role || 'none'
        });
    }
    next();
};

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ error: '服务器内部错误' });
};

// ===================== 认证相关API =====================

// 管理员登录
app.post('/api/admin/login', [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6位')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        // 查询管理员
        const [rows] = await pool.execute(
            'SELECT * FROM admin_users WHERE username = ? AND status = "active"',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const admin = rows[0];

        // 验证密码（这里使用简单比较，实际应该使用bcrypt）
        const validPassword = password === 'admin123' && username === 'admin' ||
                             password === 'manager123' && username === 'manager' ||
                             password === 'operator123' && username === 'operator';

        if (!validPassword) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        // 更新最后登录时间
        await pool.execute(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [admin.id]
        );

        // 生成JWT token
        const token = jwt.sign(
            { 
                id: admin.id,
                username: admin.username,
                role: admin.role,
                name: admin.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // 记录登录日志
        await pool.execute(
            'INSERT INTO admin_logs (admin_username, action, details, ip_address) VALUES (?, ?, ?, ?)',
            [username, 'login', JSON.stringify({ success: true }), req.ip]
        );

        res.json({
            success: true,
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                name: admin.name,
                role: admin.role,
                email: admin.email
            }
        });

    } catch (error) {
        logger.error('登录错误:', error);
        res.status(500).json({ error: '服务器内部错误' });
    }
});

// 验证token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, admin: req.admin });
});

// ===================== 数据概览API =====================

// 获取仪表板数据
app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24*60*60*1000).toISOString().split('T')[0];

        // 今日总收益
        const [revenueToday] = await pool.execute(
            'SELECT COALESCE(SUM(revenue), 0) as revenue FROM admob_revenue WHERE date = ?',
            [today]
        );

        const [revenueYesterday] = await pool.execute(
            'SELECT COALESCE(SUM(revenue), 0) as revenue FROM admob_revenue WHERE date = ?',
            [yesterday]
        );

        // 活跃用户
        const [activeUsers] = await pool.execute(
            'SELECT COUNT(*) as count FROM app_users WHERE status = "active" AND last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
        );

        // 今日新增用户
        const [newUsersToday] = await pool.execute(
            'SELECT COUNT(*) as count FROM app_users WHERE DATE(created_at) = ?',
            [today]
        );

        const [newUsersYesterday] = await pool.execute(
            'SELECT COUNT(*) as count FROM app_users WHERE DATE(created_at) = ?',
            [yesterday]
        );

        // 今日广告展示
        const [adImpressions] = await pool.execute(
            'SELECT COALESCE(SUM(impressions), 0) as count FROM admob_revenue WHERE date = ?',
            [today]
        );

        const [adImpressionsYesterday] = await pool.execute(
            'SELECT COALESCE(SUM(impressions), 0) as count FROM admob_revenue WHERE date = ?',
            [yesterday]
        );

        // 计算增长率
        const calculateGrowth = (today, yesterday) => {
            if (yesterday === 0) return today > 0 ? 100 : 0;
            return ((today - yesterday) / yesterday * 100).toFixed(1);
        };

        res.json({
            success: true,
            data: {
                revenue: {
                    today: revenueToday[0].revenue,
                    growth: calculateGrowth(revenueToday[0].revenue, revenueYesterday[0].revenue)
                },
                activeUsers: {
                    count: activeUsers[0].count,
                    growth: '8.7' // 示例数据
                },
                newUsers: {
                    today: newUsersToday[0].count,
                    growth: calculateGrowth(newUsersToday[0].count, newUsersYesterday[0].count)
                },
                adImpressions: {
                    today: adImpressions[0].count,
                    growth: calculateGrowth(adImpressions[0].count, adImpressionsYesterday[0].count)
                }
            }
        });

    } catch (error) {
        logger.error('获取仪表板数据错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取收益趋势数据
app.get('/api/admin/revenue-trend', authenticateToken, async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        
        const [rows] = await pool.execute(`
            SELECT 
                DATE(date) as date,
                SUM(revenue) as revenue
            FROM admob_revenue 
            WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY DATE(date)
            ORDER BY date ASC
        `, [days]);

        res.json({ success: true, data: rows });

    } catch (error) {
        logger.error('获取收益趋势错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// ===================== AdMob数据API =====================

// 获取AdMob收益数据
app.get('/api/admin/admob/revenue', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // 今日AdMob总收益
        const [totalRevenue] = await pool.execute(
            'SELECT COALESCE(SUM(revenue), 0) as revenue FROM admob_revenue WHERE date = ?',
            [today]
        );

        // 各类型广告收益
        const [adTypeRevenue] = await pool.execute(`
            SELECT 
                ad_type,
                SUM(revenue) as revenue,
                SUM(impressions) as impressions,
                SUM(clicks) as clicks,
                AVG(ecpm) as ecpm,
                AVG(ctr) as ctr
            FROM admob_revenue 
            WHERE date = ?
            GROUP BY ad_type
        `, [today]);

        // 详细广告单元数据
        const [adUnits] = await pool.execute(`
            SELECT * FROM admob_revenue WHERE date = ? ORDER BY revenue DESC
        `, [today]);

        res.json({
            success: true,
            data: {
                totalRevenue: totalRevenue[0].revenue,
                adTypes: adTypeRevenue,
                adUnits: adUnits
            }
        });

    } catch (error) {
        logger.error('获取AdMob数据错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// ===================== 用户管理API =====================

// 获取用户列表
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];

        if (search) {
            whereClause = 'WHERE username LIKE ? OR email LIKE ? OR user_id LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        // 获取用户列表
        const [users] = await pool.execute(`
            SELECT 
                user_id,
                username,
                email,
                points_balance,
                total_earned,
                membership_level,
                status,
                created_at,
                last_active
            FROM app_users 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // 获取总数
        const [total] = await pool.execute(`
            SELECT COUNT(*) as count FROM app_users ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total: total[0].count,
                    pages: Math.ceil(total[0].count / limit)
                }
            }
        });

    } catch (error) {
        logger.error('获取用户列表错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取用户统计
app.get('/api/admin/users/stats', authenticateToken, async (req, res) => {
    try {
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
                COUNT(CASE WHEN membership_level IN ('vip', 'diamond') THEN 1 END) as vip_users,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as daily_new_users,
                COUNT(CASE WHEN last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as weekly_active
            FROM app_users
        `);

        res.json({ success: true, data: stats[0] });

    } catch (error) {
        logger.error('获取用户统计错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// ===================== 收益报告API =====================

// 获取收益报告
app.get('/api/admin/revenue/report', authenticateToken, async (req, res) => {
    try {
        const startDate = req.query.start_date || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0];
        const endDate = req.query.end_date || new Date().toISOString().split('T')[0];

        // AdMob收益
        const [admobRevenue] = await pool.execute(`
            SELECT 
                DATE(date) as date,
                ad_type,
                SUM(revenue) as revenue,
                SUM(impressions) as impressions,
                COUNT(DISTINCT ad_unit_id) as ad_units
            FROM admob_revenue 
            WHERE date BETWEEN ? AND ?
            GROUP BY DATE(date), ad_type
            ORDER BY date DESC, revenue DESC
        `, [startDate, endDate]);

        // 总收益统计
        const [totalStats] = await pool.execute(`
            SELECT 
                SUM(revenue) as total_revenue,
                SUM(impressions) as total_impressions,
                AVG(ecpm) as avg_ecpm,
                AVG(ctr) as avg_ctr
            FROM admob_revenue 
            WHERE date BETWEEN ? AND ?
        `, [startDate, endDate]);

        res.json({
            success: true,
            data: {
                revenue: admobRevenue,
                summary: totalStats[0],
                period: { startDate, endDate }
            }
        });

    } catch (error) {
        logger.error('获取收益报告错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// ===================== 积分管理API (仅超级管理员) =====================

// 获取所有用户积分概览
app.get('/api/admin/points/overview', [authenticateToken, requireSuperAdmin], async (req, res) => {
    try {
        // 积分总览统计
        const [pointsStats] = await pool.execute(`
            SELECT 
                SUM(points_balance) as total_points,
                SUM(total_earned) as total_earned_all,
                COUNT(*) as total_users,
                AVG(points_balance) as avg_balance,
                MAX(points_balance) as max_balance,
                COUNT(CASE WHEN points_balance > 100000 THEN 1 END) as rich_users
            FROM app_users
        `);

        // 今日积分变动
        const today = new Date().toISOString().split('T')[0];
        const [todayStats] = await pool.execute(`
            SELECT 
                SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END) as points_earned_today,
                SUM(CASE WHEN points_change < 0 THEN ABS(points_change) ELSE 0 END) as points_spent_today,
                COUNT(*) as transactions_today
            FROM points_transactions 
            WHERE DATE(created_at) = ?
        `, [today]);

        // 积分类型分布
        const [pointsTypes] = await pool.execute(`
            SELECT 
                transaction_type,
                COUNT(*) as count,
                SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END) as total_earned,
                SUM(CASE WHEN points_change < 0 THEN ABS(points_change) ELSE 0 END) as total_spent
            FROM points_transactions 
            WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY transaction_type
            ORDER BY total_earned DESC
        `);

        res.json({
            success: true,
            data: {
                overview: pointsStats[0],
                today: todayStats[0],
                types: pointsTypes
            }
        });

    } catch (error) {
        logger.error('获取积分概览错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 获取用户积分详情
app.get('/api/admin/points/user/:userId', [authenticateToken, requireSuperAdmin], async (req, res) => {
    try {
        const { userId } = req.params;

        // 用户基本信息和积分
        const [userInfo] = await pool.execute(`
            SELECT 
                user_id,
                username,
                email,
                points_balance,
                total_earned,
                membership_level,
                status,
                created_at,
                last_active
            FROM app_users 
            WHERE user_id = ?
        `, [userId]);

        if (userInfo.length === 0) {
            return res.status(404).json({ error: '用户不存在' });
        }

        // 用户积分交易记录
        const [transactions] = await pool.execute(`
            SELECT 
                transaction_id,
                transaction_type,
                points_change,
                balance_after,
                description,
                reference_id,
                created_at
            FROM points_transactions 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 50
        `, [userId]);

        // 用户积分统计
        const [stats] = await pool.execute(`
            SELECT 
                COUNT(*) as total_transactions,
                SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END) as total_earned,
                SUM(CASE WHEN points_change < 0 THEN ABS(points_change) ELSE 0 END) as total_spent,
                COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_transactions
            FROM points_transactions 
            WHERE user_id = ?
        `, [userId]);

        res.json({
            success: true,
            data: {
                user: userInfo[0],
                transactions,
                stats: stats[0]
            }
        });

    } catch (error) {
        logger.error('获取用户积分详情错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 手动调整用户积分 (仅超级管理员)
app.post('/api/admin/points/adjust', [
    authenticateToken, 
    requireSuperAdmin,
    body('user_id').notEmpty().withMessage('用户ID不能为空'),
    body('points_change').isInt().withMessage('积分变动必须是整数'),
    body('reason').notEmpty().withMessage('调整原因不能为空')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { user_id, points_change, reason } = req.body;

        // 开始事务
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // 检查用户是否存在
            const [userCheck] = await connection.execute(
                'SELECT user_id, points_balance, username FROM app_users WHERE user_id = ?',
                [user_id]
            );

            if (userCheck.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(404).json({ error: '用户不存在' });
            }

            const currentBalance = userCheck[0].points_balance;
            const newBalance = currentBalance + points_change;

            // 检查余额不能为负数
            if (newBalance < 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ 
                    error: '调整后积分不能为负数',
                    current_balance: currentBalance,
                    requested_change: points_change,
                    would_result_in: newBalance
                });
            }

            // 更新用户积分
            await connection.execute(
                'UPDATE app_users SET points_balance = ?, total_earned = total_earned + ? WHERE user_id = ?',
                [newBalance, Math.max(0, points_change), user_id]
            );

            // 插入积分交易记录
            await connection.execute(`
                INSERT INTO points_transactions 
                (user_id, transaction_type, points_change, balance_after, description, reference_id, admin_username) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                user_id, 
                'admin_adjustment', 
                points_change, 
                newBalance, 
                `管理员调整: ${reason}`,
                `admin_${Date.now()}`,
                req.admin.username
            ]);

            // 记录管理员操作日志
            await connection.execute(`
                INSERT INTO admin_logs 
                (admin_username, action, target_type, target_id, details, ip_address) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                req.admin.username,
                'adjust_points',
                'user',
                user_id,
                JSON.stringify({
                    user: userCheck[0].username,
                    points_change,
                    reason,
                    old_balance: currentBalance,
                    new_balance: newBalance
                }),
                req.ip
            ]);

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: '积分调整成功',
                data: {
                    user_id,
                    username: userCheck[0].username,
                    old_balance: currentBalance,
                    points_change,
                    new_balance: newBalance,
                    reason
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        logger.error('调整用户积分错误:', error);
        res.status(500).json({ error: '积分调整失败' });
    }
});

// 批量调整积分 (仅超级管理员)
app.post('/api/admin/points/batch-adjust', [
    authenticateToken,
    requireSuperAdmin,
    body('adjustments').isArray().withMessage('调整列表必须是数组'),
    body('adjustments.*.user_id').notEmpty().withMessage('用户ID不能为空'),
    body('adjustments.*.points_change').isInt().withMessage('积分变动必须是整数'),
    body('batch_reason').notEmpty().withMessage('批量调整原因不能为空')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { adjustments, batch_reason } = req.body;

        if (adjustments.length === 0) {
            return res.status(400).json({ error: '调整列表不能为空' });
        }

        if (adjustments.length > 100) {
            return res.status(400).json({ error: '批量调整一次最多100个用户' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const results = [];
        const batchId = `batch_${Date.now()}`;

        try {
            for (const adjustment of adjustments) {
                const { user_id, points_change } = adjustment;

                // 检查用户
                const [userCheck] = await connection.execute(
                    'SELECT user_id, points_balance, username FROM app_users WHERE user_id = ?',
                    [user_id]
                );

                if (userCheck.length === 0) {
                    results.push({ user_id, status: 'failed', reason: '用户不存在' });
                    continue;
                }

                const currentBalance = userCheck[0].points_balance;
                const newBalance = currentBalance + points_change;

                if (newBalance < 0) {
                    results.push({ 
                        user_id, 
                        status: 'failed', 
                        reason: '调整后积分不能为负数',
                        current_balance: currentBalance
                    });
                    continue;
                }

                // 更新积分
                await connection.execute(
                    'UPDATE app_users SET points_balance = ?, total_earned = total_earned + ? WHERE user_id = ?',
                    [newBalance, Math.max(0, points_change), user_id]
                );

                // 插入交易记录
                await connection.execute(`
                    INSERT INTO points_transactions 
                    (user_id, transaction_type, points_change, balance_after, description, reference_id, admin_username) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `, [
                    user_id,
                    'admin_batch_adjustment',
                    points_change,
                    newBalance,
                    `批量调整: ${batch_reason}`,
                    batchId,
                    req.admin.username
                ]);

                results.push({
                    user_id,
                    username: userCheck[0].username,
                    status: 'success',
                    old_balance: currentBalance,
                    points_change,
                    new_balance: newBalance
                });
            }

            // 记录批量操作日志
            await connection.execute(`
                INSERT INTO admin_logs 
                (admin_username, action, target_type, target_id, details, ip_address) 
                VALUES (?, ?, ?, ?, ?, ?)
            `, [
                req.admin.username,
                'batch_adjust_points',
                'batch',
                batchId,
                JSON.stringify({
                    batch_reason,
                    total_adjustments: adjustments.length,
                    successful: results.filter(r => r.status === 'success').length,
                    failed: results.filter(r => r.status === 'failed').length
                }),
                req.ip
            ]);

            await connection.commit();
            connection.release();

            res.json({
                success: true,
                message: '批量积分调整完成',
                data: {
                    batch_id: batchId,
                    results,
                    summary: {
                        total: adjustments.length,
                        successful: results.filter(r => r.status === 'success').length,
                        failed: results.filter(r => r.status === 'failed').length
                    }
                }
            });

        } catch (error) {
            await connection.rollback();
            connection.release();
            throw error;
        }

    } catch (error) {
        logger.error('批量调整积分错误:', error);
        res.status(500).json({ error: '批量调整失败' });
    }
});

// 获取积分交易记录
app.get('/api/admin/points/transactions', [authenticateToken, requireSuperAdmin], async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const type = req.query.type || '';
        const user_id = req.query.user_id || '';
        const start_date = req.query.start_date || '';
        const end_date = req.query.end_date || '';
        const offset = (page - 1) * limit;

        let whereClause = 'WHERE 1=1';
        let params = [];

        if (type) {
            whereClause += ' AND pt.transaction_type = ?';
            params.push(type);
        }

        if (user_id) {
            whereClause += ' AND pt.user_id = ?';
            params.push(user_id);
        }

        if (start_date) {
            whereClause += ' AND DATE(pt.created_at) >= ?';
            params.push(start_date);
        }

        if (end_date) {
            whereClause += ' AND DATE(pt.created_at) <= ?';
            params.push(end_date);
        }

        // 获取交易记录
        const [transactions] = await pool.execute(`
            SELECT 
                pt.transaction_id,
                pt.user_id,
                au.username,
                pt.transaction_type,
                pt.points_change,
                pt.balance_after,
                pt.description,
                pt.reference_id,
                pt.admin_username,
                pt.created_at
            FROM points_transactions pt
            LEFT JOIN app_users au ON pt.user_id = au.user_id
            ${whereClause}
            ORDER BY pt.created_at DESC
            LIMIT ? OFFSET ?
        `, [...params, limit, offset]);

        // 获取总数
        const [total] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM points_transactions pt
            LEFT JOIN app_users au ON pt.user_id = au.user_id
            ${whereClause}
        `, params);

        res.json({
            success: true,
            data: {
                transactions,
                pagination: {
                    page,
                    limit,
                    total: total[0].count,
                    pages: Math.ceil(total[0].count / limit)
                }
            }
        });

    } catch (error) {
        logger.error('获取积分交易记录错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// ===================== 系统配置API =====================

// 获取系统配置
app.get('/api/admin/config', authenticateToken, async (req, res) => {
    try {
        const [configs] = await pool.execute(`
            SELECT config_key, config_value, description, category 
            FROM system_config 
            ORDER BY category, config_key
        `);

        res.json({ success: true, data: configs });

    } catch (error) {
        logger.error('获取系统配置错误:', error);
        res.status(500).json({ error: '获取数据失败' });
    }
});

// 更新系统配置
app.put('/api/admin/config/:key', [authenticateToken, requireRole(['super_admin', 'manager'])], async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        await pool.execute(
            'UPDATE system_config SET config_value = ?, updated_by = ?, updated_at = NOW() WHERE config_key = ?',
            [value, req.admin.username, key]
        );

        // 记录操作日志
        await pool.execute(
            'INSERT INTO admin_logs (admin_username, action, target_type, target_id, details, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
            [req.admin.username, 'update_config', 'config', key, JSON.stringify({ old_value: '', new_value: value }), req.ip]
        );

        res.json({ success: true, message: '配置更新成功' });

    } catch (error) {
        logger.error('更新系统配置错误:', error);
        res.status(500).json({ error: '更新失败' });
    }
});

// ===================== 通用API =====================

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 获取数据库状态
app.get('/api/admin/db-status', authenticateToken, async (req, res) => {
    try {
        const [result] = await pool.execute('SELECT 1 as connected');
        res.json({ 
            success: true, 
            database: 'connected',
            connection_pool: {
                total: pool.pool._allConnections.length,
                free: pool.pool._freeConnections.length,
                used: pool.pool._acquiringConnections.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, database: 'disconnected' });
    }
});

// 错误处理
app.use(errorHandler);

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
    logger.info(`积分宝后台API服务器启动成功 - 端口: ${PORT}`);
    logger.info(`环境: ${process.env.NODE_ENV || 'development'}`);
    logger.info('API文档: http://localhost:' + PORT + '/api/health');
});

// 优雅关闭
process.on('SIGTERM', async () => {
    logger.info('收到SIGTERM信号，正在关闭服务器...');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('收到SIGINT信号，正在关闭服务器...');
    await pool.end();
    process.exit(0);
});

module.exports = app;
