const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://192.168.1.29:8080'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Auth0验证中间件（模拟）
const verifyAuth0Token = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '缺少认证令牌' });
    }
    
    const token = authHeader.substring(7);
    
    // 在真实环境中，这里会验证Auth0 JWT token
    // 现在我们模拟验证成功，接受任何Bearer token
    try {
        console.log('🔐 收到Token:', token.substring(0, 20) + '...');
        
        // 检查是否是我们模拟的token格式
        if (token.startsWith('mock_access_token_')) {
            // 模拟登录的token
            const mockUser = {
                sub: 'auth0|mock_' + Date.now(),
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://via.placeholder.com/64'
            };
            req.user = mockUser;
            console.log('✅ 模拟Token验证成功:', mockUser.name);
        } else {
            // 可能是真实的Auth0 token，我们也接受
            const mockUser = {
                sub: 'auth0|real_user_' + Date.now(),
                email: 'auth0user@example.com',
                name: 'Auth0 User',
                picture: 'https://example.com/avatar.jpg'
            };
            req.user = mockUser;
            console.log('✅ Auth0 Token验证成功:', mockUser.name);
        }
        
        next();
    } catch (error) {
        console.error('❌ Token验证失败:', error);
        return res.status(401).json({ error: 'Token验证失败' });
    }
};

const JWT_SECRET = 'jifenbao_super_secret_key_2024';

// 角色权限中间件
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: '未提供认证令牌' });
        }
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            if (!allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ error: '权限不足' });
            }
            
            req.admin = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ error: '无效的认证令牌' });
        }
    };
};

// 模拟数据
let mockData = {
    adminUsers: [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            name: '超级管理员',
            role: 'super_admin',
            email: 'admin@jifenbao.com',
            status: 'active',
            last_login: new Date().toISOString()
        },
        {
            id: 2,
            username: 'manager',
            password: 'manager123',
            name: '系统管理员',
            role: 'manager',
            email: 'manager@jifenbao.com',
            status: 'active',
            last_login: new Date().toISOString()
        },
        {
            id: 3,
            username: 'operator',
            password: 'operator123',
            name: '运营专员',
            role: 'operator',
            email: 'operator@jifenbao.com',
            status: 'active',
            last_login: new Date().toISOString()
        }
    ],
    appUsers: [
        {
            user_id: 'google_123456789',
            username: 'Google用户',
            email: 'google.user@gmail.com',
            points_balance: 150000,
            total_earned: 250000,
            membership_level: 'vip',
            status: 'active',
            created_at: '2024-08-01T10:00:00Z',
            last_active: new Date().toISOString(),
            login_provider: 'google',
            social_id: '123456789',
            avatar: 'https://example.com/avatar1.jpg'
        },
        {
            user_id: 'apple_987654321',
            username: 'Apple用户',
            email: 'apple.user@icloud.com',
            points_balance: 89000,
            total_earned: 120000,
            membership_level: 'premium',
            status: 'active',
            created_at: '2024-08-05T14:30:00Z',
            last_active: new Date().toISOString(),
            login_provider: 'apple',
            social_id: '987654321',
            avatar: 'https://example.com/avatar2.jpg'
        },
        {
            user_id: 'google_555666777',
            username: '测试用户3',
            email: 'test.user3@gmail.com',
            points_balance: 45000,
            total_earned: 78000,
            membership_level: 'basic',
            status: 'active',
            created_at: '2024-08-07T09:15:00Z',
            last_active: new Date().toISOString(),
            login_provider: 'google',
            social_id: '555666777',
            avatar: 'https://example.com/avatar3.jpg'
        },
        {
            user_id: 'guest_1691234567',
            username: '游客用户',
            email: '',
            points_balance: 5000,
            total_earned: 5000,
            membership_level: 'guest',
            status: 'active',
            created_at: '2024-08-08T15:20:00Z',
            last_active: new Date().toISOString(),
            login_provider: 'guest',
            social_id: '1691234567'
        }
    ],
    pointsTransactions: [
        {
            transaction_id: 'tx_001',
            user_id: 'google_123456789',
            transaction_type: 'registration_bonus',
            points_change: 10000,
            balance_after: 10000,
            description: 'Google登录注册奖励',
            reference_id: 'register_google_001',
            created_at: '2024-08-01T10:00:00Z'
        },
        {
            transaction_id: 'tx_002',
            user_id: 'google_123456789',
            transaction_type: 'watch_video',
            points_change: 50000,
            balance_after: 60000,
            description: '观看激励视频广告',
            reference_id: 'ad_video_001',
            created_at: '2024-08-01T11:30:00Z'
        },
        {
            transaction_id: 'tx_003',
            user_id: 'apple_987654321',
            transaction_type: 'registration_bonus',
            points_change: 10000,
            balance_after: 10000,
            description: 'Apple登录注册奖励',
            reference_id: 'register_apple_001',
            created_at: '2024-08-05T14:30:00Z'
        },
        {
            transaction_id: 'tx_004',
            user_id: 'apple_987654321',
            transaction_type: 'download_app',
            points_change: 30000,
            balance_after: 40000,
            description: '下载推荐应用',
            reference_id: 'app_download_001',
            created_at: '2024-08-05T15:45:00Z'
        },
        {
            transaction_id: 'tx_005',
            user_id: 'google_555666777',
            transaction_type: 'registration_bonus',
            points_change: 10000,
            balance_after: 10000,
            description: 'Google登录注册奖励',
            reference_id: 'register_google_002',
            created_at: '2024-08-07T09:15:00Z'
        },
        {
            transaction_id: 'tx_006',
            user_id: 'google_555666777',
            transaction_type: 'daily_checkin',
            points_change: 5000,
            balance_after: 15000,
            description: '每日签到奖励',
            reference_id: 'daily_checkin_001',
            created_at: new Date().toISOString()
        }
    ],
    admobRevenue: [
        {
            date: new Date().toISOString().split('T')[0],
            ad_type: 'rewarded',
            revenue: 125.50,
            impressions: 1250,
            clicks: 89,
            ecpm: 10.04,
            ctr: 7.12
        },
        {
            date: new Date().toISOString().split('T')[0],
            ad_type: 'interstitial',
            revenue: 89.30,
            impressions: 890,
            clicks: 45,
            ecpm: 10.03,
            ctr: 5.06
        },
        {
            date: new Date().toISOString().split('T')[0],
            ad_type: 'banner',
            revenue: 45.20,
            impressions: 4520,
            clicks: 135,
            ecpm: 1.00,
            ctr: 2.99
        }
    ]
};

// 认证中间件
const authenticateToken = (req, res, next) => {
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

// 超级管理员权限检查
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

// ===================== 认证API =====================

// Auth0用户同步
app.post('/api/auth/auth0-sync', verifyAuth0Token, async (req, res) => {
    try {
        const { auth0_id, email, name, avatar } = req.body;
        const userId = auth0_id || req.user.sub;
        
        // 检查用户是否已存在
        let user = mockData.appUsers.find(u => u.auth0_id === userId);
        
        if (!user) {
            // 创建新用户
            user = {
                id: userId,
                auth0_id: userId,
                username: name,
                email: email,
                points_balance: 10000, // 新用户奖励
                total_earned: 10000,
                membership_level: 'basic',
                is_vip: false,
                avatar: avatar,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            
            mockData.appUsers.push(user);
            
            // 添加注册奖励交易记录
            mockData.pointsTransactions.push({
                id: 'tx_' + Date.now(),
                user_id: userId,
                points_change: 10000,
                transaction_type: 'registration_bonus',
                description: '新用户注册奖励',
                created_at: new Date().toISOString()
            });
            
            console.log(`✅ 新用户注册: ${name} (${email})`);
        } else {
            // 更新现有用户信息
            user.username = name;
            user.email = email;
            user.avatar = avatar;
            user.last_login = new Date().toISOString();
            
            console.log(`✅ 用户登录: ${name} (${email})`);
        }
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.username,
                    email: user.email,
                    points: user.points_balance,
                    avatar: user.avatar,
                    is_vip: user.is_vip
                },
                points: user.points_balance
            },
            message: user.points_balance === 10000 && mockData.pointsTransactions.length === 1 ? 
                '注册成功！获得10000积分奖励' : '登录成功！'
        });
        
    } catch (error) {
        console.error('Auth0用户同步失败:', error);
        res.status(500).json({
            success: false,
            error: '用户同步失败'
        });
    }
});

// App端社交登录
app.post('/api/auth/social-login', (req, res) => {
    const { provider, social_id, email, name, avatar, social_token } = req.body;

    try {
        // 检查用户是否已存在
        let user = mockData.appUsers.find(u => u.email === email || u.user_id === social_id);
        
        if (!user) {
            // 创建新用户
            user = {
                user_id: `${provider}_${social_id}`,
                username: name || email.split('@')[0],
                email: email,
                points_balance: 10000, // 新用户奖励10000积分
                total_earned: 10000,
                membership_level: 'basic',
                status: 'active',
                created_at: new Date().toISOString(),
                last_active: new Date().toISOString(),
                login_provider: provider,
                social_id: social_id,
                avatar: avatar
            };
            
            mockData.appUsers.push(user);
            
            // 添加注册奖励积分记录
            const transaction = {
                transaction_id: `tx_register_${Date.now()}`,
                user_id: user.user_id,
                transaction_type: 'registration_bonus',
                points_change: 10000,
                balance_after: 10000,
                description: `${provider}登录注册奖励`,
                reference_id: `register_${provider}_${Date.now()}`,
                created_at: new Date().toISOString()
            };
            
            mockData.pointsTransactions.push(transaction);
            
            console.log(`🎉 新用户注册: ${user.username} (${provider})`);
        } else {
            // 更新现有用户信息
            user.last_active = new Date().toISOString();
            user.login_provider = provider;
            if (avatar) user.avatar = avatar;
            
            console.log(`🔄 用户登录: ${user.username} (${provider})`);
        }

        // 生成App用户的JWT token
        const appToken = jwt.sign(
            { 
                id: user.user_id,
                username: user.username,
                email: user.email,
                role: 'app_user',
                provider: provider
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.user_id,
                    username: user.username,
                    email: user.email,
                    points_balance: user.points_balance,
                    total_earned: user.total_earned,
                    membership_level: user.membership_level,
                    avatar: user.avatar,
                    created_at: user.created_at
                },
                token: appToken
            },
            message: user.created_at === user.last_active ? '注册成功！获得10000积分奖励' : '登录成功！'
        });

    } catch (error) {
        console.error('社交登录失败:', error);
        res.status(500).json({ 
            success: false, 
            error: '登录失败，请稍后重试' 
        });
    }
});

// App端验证token
app.get('/api/auth/verify', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: '未提供令牌' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role === 'app_user') {
            // App用户验证
            const user = mockData.appUsers.find(u => u.user_id === decoded.id);
            if (user) {
                res.json({
                    success: true,
                    data: {
                        id: user.user_id,
                        username: user.username,
                        email: user.email,
                        points_balance: user.points_balance,
                        membership_level: user.membership_level,
                        avatar: user.avatar
                    }
                });
            } else {
                res.status(404).json({ success: false, error: '用户不存在' });
            }
        } else {
            res.status(403).json({ success: false, error: '无效的用户类型' });
        }
    } catch (error) {
        res.status(401).json({ success: false, error: '无效的令牌' });
    }
});

// 管理员登录
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    const admin = mockData.adminUsers.find(u => 
        u.username === username && u.password === password && u.status === 'active'
    );

    if (!admin) {
        return res.status(401).json({ error: '用户名或密码错误' });
    }

    // 更新最后登录时间
    admin.last_login = new Date().toISOString();

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
});

// 验证token
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ valid: true, admin: req.admin });
});

// ===================== 仪表板API =====================

// 获取仪表板数据
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
    const totalRevenue = mockData.admobRevenue.reduce((sum, item) => sum + item.revenue, 0);
    const totalImpressions = mockData.admobRevenue.reduce((sum, item) => sum + item.impressions, 0);
    
    res.json({
        success: true,
        data: {
            revenue: {
                today: totalRevenue,
                growth: '12.5'
            },
            activeUsers: {
                count: mockData.appUsers.filter(u => u.status === 'active').length,
                growth: '8.7'
            },
            newUsers: {
                today: 15,
                growth: '23.1'
            },
            adImpressions: {
                today: totalImpressions,
                growth: '15.8'
            }
        }
    });
});

// ===================== AdMob数据API =====================

// 获取AdMob收益数据
app.get('/api/admin/admob/revenue', authenticateToken, (req, res) => {
    const totalRevenue = mockData.admobRevenue.reduce((sum, item) => sum + item.revenue, 0);
    
    res.json({
        success: true,
        data: {
            totalRevenue: totalRevenue,
            adTypes: mockData.admobRevenue,
            adUnits: mockData.admobRevenue
        }
    });
});

// ===================== 用户管理API =====================

// 获取用户列表
app.get('/api/admin/users', authenticateToken, (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    let users = mockData.appUsers;
    
    if (search) {
        users = users.filter(user => 
            user.username.includes(search) || 
            user.email.includes(search) || 
            user.user_id.includes(search)
        );
    }
    
    const start = (page - 1) * limit;
    const paginatedUsers = users.slice(start, start + limit);
    
    res.json({
        success: true,
        data: {
            users: paginatedUsers,
            pagination: {
                page,
                limit,
                total: users.length,
                pages: Math.ceil(users.length / limit)
            }
        }
    });
});

// 获取用户统计
app.get('/api/admin/users/stats', authenticateToken, (req, res) => {
    const users = mockData.appUsers;
    
    res.json({
        success: true,
        data: {
            total_users: users.length,
            active_users: users.filter(u => u.status === 'active').length,
            vip_users: users.filter(u => ['vip', 'premium'].includes(u.membership_level)).length,
            daily_new_users: 5,
            weekly_active: users.length
        }
    });
});

// ===================== 积分管理API (仅超级管理员) =====================

// 获取积分概览
app.get('/api/admin/points/overview', [authenticateToken, requireSuperAdmin], (req, res) => {
    const users = mockData.appUsers;
    const transactions = mockData.pointsTransactions;
    
    const totalPoints = users.reduce((sum, user) => sum + user.points_balance, 0);
    const totalEarned = users.reduce((sum, user) => sum + user.total_earned, 0);
    const todayEarned = transactions
        .filter(t => t.points_change > 0)
        .reduce((sum, t) => sum + t.points_change, 0);
    
    res.json({
        success: true,
        data: {
            overview: {
                total_points: totalPoints,
                total_earned_all: totalEarned,
                total_users: users.length,
                avg_balance: Math.round(totalPoints / users.length),
                max_balance: Math.max(...users.map(u => u.points_balance)),
                rich_users: users.filter(u => u.points_balance > 100000).length
            },
            today: {
                points_earned_today: todayEarned,
                points_spent_today: 15000,
                transactions_today: transactions.length
            },
            types: [
                { transaction_type: 'watch_video', count: 125, total_earned: 250000, total_spent: 0 },
                { transaction_type: 'download_app', count: 89, total_earned: 180000, total_spent: 0 },
                { transaction_type: 'daily_checkin', count: 234, total_earned: 145000, total_spent: 0 },
                { transaction_type: 'withdrawal', count: 23, total_earned: 0, total_spent: 75000 }
            ]
        }
    });
});

// 获取用户积分详情
app.get('/api/admin/points/user/:userId', [authenticateToken, requireSuperAdmin], (req, res) => {
    const { userId } = req.params;
    
    const user = mockData.appUsers.find(u => u.user_id === userId);
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }
    
    const userTransactions = mockData.pointsTransactions.filter(t => t.user_id === userId);
    
    res.json({
        success: true,
        data: {
            user,
            transactions: userTransactions,
            stats: {
                total_transactions: userTransactions.length,
                total_earned: userTransactions.filter(t => t.points_change > 0).reduce((sum, t) => sum + t.points_change, 0),
                total_spent: userTransactions.filter(t => t.points_change < 0).reduce((sum, t) => sum + Math.abs(t.points_change), 0),
                today_transactions: userTransactions.length
            }
        }
    });
});

// 调整用户积分
app.post('/api/admin/points/adjust', [authenticateToken, requireSuperAdmin], (req, res) => {
    const { user_id, points_change, reason } = req.body;
    
    const user = mockData.appUsers.find(u => u.user_id === user_id);
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }
    
    const oldBalance = user.points_balance;
    const newBalance = oldBalance + points_change;
    
    if (newBalance < 0) {
        return res.status(400).json({ 
            error: '调整后积分不能为负数',
            current_balance: oldBalance,
            requested_change: points_change,
            would_result_in: newBalance
        });
    }
    
    // 更新用户积分
    user.points_balance = newBalance;
    if (points_change > 0) {
        user.total_earned += points_change;
    }
    
    // 添加交易记录
    const transaction = {
        transaction_id: `tx_admin_${Date.now()}`,
        user_id,
        transaction_type: 'admin_adjustment',
        points_change,
        balance_after: newBalance,
        description: `管理员调整: ${reason}`,
        reference_id: `admin_${Date.now()}`,
        admin_username: req.admin.username,
        created_at: new Date().toISOString()
    };
    
    mockData.pointsTransactions.push(transaction);
    
    res.json({
        success: true,
        message: '积分调整成功',
        data: {
            user_id,
            username: user.username,
            old_balance: oldBalance,
            points_change,
            new_balance: newBalance,
            reason
        }
    });
});

// 获取积分交易记录
app.get('/api/admin/points/transactions', [authenticateToken, requireSuperAdmin], (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    let transactions = mockData.pointsTransactions.map(t => {
        const user = mockData.appUsers.find(u => u.user_id === t.user_id);
        return {
            ...t,
            username: user ? user.username : 'Unknown'
        };
    });
    
    // 排序并分页
    transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paginatedTransactions = transactions.slice(offset, offset + limit);
    
    res.json({
        success: true,
        data: {
            transactions: paginatedTransactions,
            pagination: {
                page,
                limit,
                total: transactions.length,
                pages: Math.ceil(transactions.length / limit)
            }
        }
    });
});

// ===================== 旧收益报告API已删除，使用新版本 =====================

// ===================== 收益趋势API =====================

app.get('/api/admin/revenue-trend', authenticateToken, (req, res) => {
    const days = parseInt(req.query.days) || 7;
    
    // 生成过去几天的模拟数据
    const trendData = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        trendData.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.random() * 200 + 50
        });
    }
    
    res.json({ success: true, data: trendData });
});

// ===================== App端积分操作API =====================

// App端获取用户积分信息
app.get('/api/app/user/points', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub; // Auth0 用户ID
        console.log('🔍 查询用户积分:', userId);
        
        // 查找或创建用户
        let user = mockData.appUsers.find(u => u.auth0_id === userId || u.id === userId);
        if (!user) {
            // 如果用户不存在，创建一个默认用户
            user = {
                id: userId,
                auth0_id: userId,
                username: req.user.name || 'New User',
                email: req.user.email || 'user@example.com',
                points_balance: 10000, // 新用户奖励
                total_earned: 10000,
                membership_level: 'basic',
                is_vip: false,
                avatar: req.user.picture || 'https://via.placeholder.com/64',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            mockData.appUsers.push(user);
            console.log('✅ 创建新用户:', user.username);
        }
        
        // 获取最近的积分交易记录
        const recentTransactions = mockData.pointsTransactions
            .filter(t => t.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 10);
        
        res.json({
            success: true,
            data: {
                user_id: user.user_id,
                username: user.username,
                points_balance: user.points_balance,
                total_earned: user.total_earned,
                membership_level: user.membership_level,
                recent_transactions: recentTransactions
            }
        });
        
    } catch (error) {
        res.status(401).json({ success: false, error: '认证失败' });
    }
});

// App端观看视频获得积分
app.post('/api/app/earn/watch-video', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub;
        const { ad_id, video_duration, completion_rate } = req.body;
        console.log('🎬 用户观看视频:', userId, '完成度:', completion_rate + '%');
        
        // 查找或创建用户
        let user = mockData.appUsers.find(u => u.auth0_id === userId || u.id === userId);
        if (!user) {
            // 创建新用户
            user = {
                id: userId,
                auth0_id: userId,
                username: req.user.name || 'Video User',
                email: req.user.email || 'user@example.com',
                points_balance: 10000,
                total_earned: 10000,
                membership_level: 'basic',
                is_vip: false,
                avatar: req.user.picture || 'https://via.placeholder.com/64',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString()
            };
            mockData.appUsers.push(user);
        }
        
        // 计算奖励积分（基础50000，根据完成度调整）
        let points = 50000;
        if (completion_rate >= 100) {
            points = 50000;
        } else if (completion_rate >= 80) {
            points = 40000;
        } else if (completion_rate >= 60) {
            points = 30000;
        } else {
            return res.status(400).json({ success: false, error: '视频观看时长不足' });
        }
        
        // 更新用户积分
        user.points_balance += points;
        user.total_earned += points;
        user.last_active = new Date().toISOString();
        
        // 添加积分交易记录
        const transaction = {
            transaction_id: `tx_video_${Date.now()}`,
            user_id: user.user_id,
            transaction_type: 'watch_video',
            points_change: points,
            balance_after: user.points_balance,
            description: `观看视频广告获得积分 (完成度: ${completion_rate}%)`,
            reference_id: ad_id || `video_${Date.now()}`,
            created_at: new Date().toISOString()
        };
        
        mockData.pointsTransactions.push(transaction);
        
        res.json({
            success: true,
            data: {
                points_earned: points,
                new_balance: user.points_balance,
                message: `🎉 恭喜！获得 ${points.toLocaleString()} 积分`
            }
        });
        
    } catch (error) {
        res.status(401).json({ success: false, error: '认证失败' });
    }
});

// App端下载应用获得积分
app.post('/api/app/earn/download-app', verifyAuth0Token, (req, res) => {
    try {
        const decoded = jwt.verify(req.headers.authorization?.split(' ')[1], JWT_SECRET);
        const { app_id, app_name, platform } = req.body;
        
        if (decoded.role !== 'app_user') {
            return res.status(403).json({ success: false, error: '权限不足' });
        }
        
        const user = mockData.appUsers.find(u => u.user_id === decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, error: '用户不存在' });
        }
        
        // 检查是否已经下载过这个应用
        const existingDownload = mockData.pointsTransactions.find(t => 
            t.user_id === user.user_id && 
            t.transaction_type === 'download_app' && 
            t.reference_id === app_id
        );
        
        if (existingDownload) {
            return res.status(400).json({ success: false, error: '您已经下载过这个应用了' });
        }
        
        // 奖励积分
        const points = 30000;
        user.points_balance += points;
        user.total_earned += points;
        user.last_active = new Date().toISOString();
        
        // 添加积分交易记录
        const transaction = {
            transaction_id: `tx_download_${Date.now()}`,
            user_id: user.user_id,
            transaction_type: 'download_app',
            points_change: points,
            balance_after: user.points_balance,
            description: `下载应用获得积分: ${app_name || '推荐应用'}`,
            reference_id: app_id || `app_${Date.now()}`,
            created_at: new Date().toISOString()
        };
        
        mockData.pointsTransactions.push(transaction);
        
        res.json({
            success: true,
            data: {
                points_earned: points,
                new_balance: user.points_balance,
                message: `🎉 下载成功！获得 ${points.toLocaleString()} 积分`
            }
        });
        
    } catch (error) {
        res.status(401).json({ success: false, error: '认证失败' });
    }
});

// App端每日签到
app.post('/api/app/earn/daily-checkin', verifyAuth0Token, (req, res) => {
    try {
        const decoded = jwt.verify(req.headers.authorization?.split(' ')[1], JWT_SECRET);
        
        if (decoded.role !== 'app_user') {
            return res.status(403).json({ success: false, error: '权限不足' });
        }
        
        const user = mockData.appUsers.find(u => u.user_id === decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, error: '用户不存在' });
        }
        
        // 检查今天是否已经签到过
        const today = new Date().toISOString().split('T')[0];
        const todayCheckin = mockData.pointsTransactions.find(t => 
            t.user_id === user.user_id && 
            t.transaction_type === 'daily_checkin' && 
            t.created_at.startsWith(today)
        );
        
        if (todayCheckin) {
            return res.status(400).json({ success: false, error: '今天已经签到过了，明天再来吧！' });
        }
        
        // 签到奖励积分
        const points = 5000;
        user.points_balance += points;
        user.total_earned += points;
        user.last_active = new Date().toISOString();
        
        // 添加积分交易记录
        const transaction = {
            transaction_id: `tx_checkin_${Date.now()}`,
            user_id: user.user_id,
            transaction_type: 'daily_checkin',
            points_change: points,
            balance_after: user.points_balance,
            description: '每日签到奖励',
            reference_id: `checkin_${today}`,
            created_at: new Date().toISOString()
        };
        
        mockData.pointsTransactions.push(transaction);
        
        res.json({
            success: true,
            data: {
                points_earned: points,
                new_balance: user.points_balance,
                message: `📅 签到成功！获得 ${points.toLocaleString()} 积分`,
                consecutive_days: 1 // 简化处理，实际应该计算连续签到天数
            }
        });
        
    } catch (error) {
        res.status(401).json({ success: false, error: '认证失败' });
    }
});

// ===================== 系统配置API =====================

app.get('/api/admin/config', authenticateToken, (req, res) => {
    const configs = [
        { config_key: 'points_per_video', config_value: '50000', description: '每个视频奖励积分', category: 'rewards' },
        { config_key: 'points_per_download', config_value: '30000', description: '每个下载奖励积分', category: 'rewards' },
        { config_key: 'daily_checkin_points', config_value: '10000', description: '每日签到奖励积分', category: 'rewards' },
        { config_key: 'min_withdrawal_points', config_value: '100000', description: '最小提现积分', category: 'withdrawal' }
    ];
    
    res.json({ success: true, data: configs });
});

// ===================== 通用API =====================

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: 'Mock API Server Running'
    });
});

// 数据库状态
app.get('/api/admin/db-status', authenticateToken, (req, res) => {
    res.json({ 
        success: true, 
        database: 'connected',
        connection_pool: {
            total: 10,
            free: 8,
            used: 2
        },
        type: 'mock_data'
    });
});

// 收益报告API
app.get('/api/admin/revenue/report', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { period = '30', start_date, end_date } = req.query;
    
    // 生成收益报告数据
    const generateRevenueData = (days) => {
        const data = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            data.push({
                date: date.toISOString().split('T')[0],
                admob_revenue: Math.random() * 100 + 50,
                in_app_purchases: Math.random() * 200 + 100,
                total_revenue: 0
            });
        }
        data.forEach(item => {
            item.total_revenue = item.admob_revenue + item.in_app_purchases;
        });
        return data;
    };
    
    const dailyData = generateRevenueData(parseInt(period));
    const totalRevenue = dailyData.reduce((sum, item) => sum + item.total_revenue, 0);
    const avgDailyRevenue = totalRevenue / dailyData.length;
    
    res.json({
        success: true,
        data: {
            summary: {
                total_revenue: totalRevenue,
                avg_daily_revenue: avgDailyRevenue,
                admob_total: dailyData.reduce((sum, item) => sum + item.admob_revenue, 0),
                iap_total: dailyData.reduce((sum, item) => sum + item.in_app_purchases, 0),
                growth_rate: Math.random() * 20 - 10, // -10% to +10%
                period_days: parseInt(period)
            },
            daily_data: dailyData,
            breakdown: {
                by_source: [
                    { source: 'AdMob广告', revenue: dailyData.reduce((sum, item) => sum + item.admob_revenue, 0), percentage: 40 },
                    { source: '应用内购买', revenue: dailyData.reduce((sum, item) => sum + item.in_app_purchases, 0), percentage: 60 }
                ],
                by_country: [
                    { country: '中国', revenue: totalRevenue * 0.45, percentage: 45 },
                    { country: '美国', revenue: totalRevenue * 0.25, percentage: 25 },
                    { country: '日本', revenue: totalRevenue * 0.15, percentage: 15 },
                    { country: '其他', revenue: totalRevenue * 0.15, percentage: 15 }
                ]
            }
        }
    });
});

// 数据分析API
app.get('/api/admin/analytics/overview', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { period = '30' } = req.query;
    
    const generateAnalyticsData = () => {
        const days = parseInt(period);
        const userData = [];
        const revenueData = [];
        const activityData = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            userData.push({
                date: dateStr,
                new_users: Math.floor(Math.random() * 100 + 20),
                active_users: Math.floor(Math.random() * 500 + 200),
                retention_rate: Math.random() * 20 + 70
            });
            
            revenueData.push({
                date: dateStr,
                revenue: Math.random() * 300 + 100,
                arpu: Math.random() * 5 + 2
            });
            
            activityData.push({
                date: dateStr,
                sessions: Math.floor(Math.random() * 1000 + 500),
                avg_session_time: Math.random() * 300 + 180,
                bounce_rate: Math.random() * 30 + 20
            });
        }
        
        return { userData, revenueData, activityData };
    };
    
    const { userData, revenueData, activityData } = generateAnalyticsData();
    
    res.json({
        success: true,
        data: {
            user_metrics: {
                total_users: 12580,
                new_users_today: userData[userData.length - 1]?.new_users || 0,
                active_users_today: userData[userData.length - 1]?.active_users || 0,
                avg_retention_rate: userData.reduce((sum, item) => sum + item.retention_rate, 0) / userData.length
            },
            revenue_metrics: {
                total_revenue: revenueData.reduce((sum, item) => sum + item.revenue, 0),
                avg_arpu: revenueData.reduce((sum, item) => sum + item.arpu, 0) / revenueData.length,
                revenue_growth: Math.random() * 30 - 10
            },
            activity_metrics: {
                total_sessions: activityData.reduce((sum, item) => sum + item.sessions, 0),
                avg_session_time: activityData.reduce((sum, item) => sum + item.avg_session_time, 0) / activityData.length,
                avg_bounce_rate: activityData.reduce((sum, item) => sum + item.bounce_rate, 0) / activityData.length
            },
            time_series: {
                users: userData,
                revenue: revenueData,
                activity: activityData
            },
            top_features: [
                { feature: '每日签到', usage_rate: 85.2, user_count: 10734 },
                { feature: '观看广告', usage_rate: 72.8, user_count: 9158 },
                { feature: '下载应用', usage_rate: 45.3, user_count: 5699 },
                { feature: '积分商城', usage_rate: 38.7, user_count: 4868 }
            ]
        }
    });
});

// 用户行为分析API
app.get('/api/admin/analytics/user-behavior', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    res.json({
        success: true,
        data: {
            user_segments: [
                { segment: '高价值用户', count: 1250, percentage: 9.9, avg_revenue: 25.6 },
                { segment: '活跃用户', count: 3780, percentage: 30.1, avg_revenue: 8.2 },
                { segment: '普通用户', count: 5890, percentage: 46.8, avg_revenue: 2.1 },
                { segment: '流失风险用户', count: 1660, percentage: 13.2, avg_revenue: 0.5 }
            ],
            funnel_analysis: [
                { step: '应用下载', users: 15000, conversion: 100 },
                { step: '注册完成', users: 12580, conversion: 83.9 },
                { step: '首次签到', users: 10720, conversion: 71.5 },
                { step: '观看第一个广告', users: 8890, conversion: 59.3 },
                { step: '获得首次收益', users: 7560, conversion: 50.4 }
            ],
            cohort_analysis: {
                retention_by_week: [
                    { week: 'Week 1', retention: 100 },
                    { week: 'Week 2', retention: 65.2 },
                    { week: 'Week 3', retention: 48.7 },
                    { week: 'Week 4', retention: 38.9 },
                    { week: 'Week 8', retention: 25.1 },
                    { week: 'Week 12', retention: 18.3 }
                ]
            }
        }
    });
});

// ===================== 积分配置管理 API =====================

// 模拟积分配置数据
let pointsConfig = {
    watch_video: {
        id: 'watch_video',
        name: '观看视频',
        points: 10,
        daily_limit: 5,
        enabled: true,
        description: '观看完整视频广告获得积分',
        icon: '📺',
        priority: 1,
        created_at: '2024-01-01T00:00:00Z',
        total_clicks: 15420,
        total_revenue: 154200,
        today_clicks: 145,
        category: 'video'
    },
    download_app: {
        id: 'download_app',
        name: '下载应用',
        points: 50,
        daily_limit: 3,
        enabled: true,
        description: '下载推荐应用获得积分',
        icon: '📱',
        priority: 2,
        created_at: '2024-01-01T00:00:00Z',
        total_clicks: 8965,
        total_revenue: 448250,
        today_clicks: 67,
        category: 'download'
    },
    daily_checkin: {
        id: 'daily_checkin',
        name: '每日签到',
        points: 20,
        daily_limit: 1,
        enabled: true,
        description: '每日首次登录获得积分',
        icon: '📅',
        priority: 3,
        created_at: '2024-01-01T00:00:00Z',
        total_clicks: 25430,
        total_revenue: 508600,
        today_clicks: 234,
        category: 'daily'
    },
    invite_friend: {
        id: 'invite_friend',
        name: '邀请好友',
        points: 100,
        daily_limit: 10,
        enabled: true,
        description: '成功邀请好友注册获得积分',
        icon: '👥',
        priority: 4,
        created_at: '2024-01-01T00:00:00Z',
        total_clicks: 3267,
        total_revenue: 326700,
        today_clicks: 23,
        category: 'social'
    },
    complete_task: {
        id: 'complete_task',
        name: '完成任务',
        points: 30,
        daily_limit: 8,
        enabled: true,
        description: '完成日常任务获得积分',
        icon: '✅',
        priority: 5,
        created_at: '2024-01-01T00:00:00Z',
        total_clicks: 12890,
        total_revenue: 386700,
        today_clicks: 89,
        category: 'task'
    }
};

// 模拟AdMob配置数据
let admobConfig = {
    app_id: 'ca-app-pub-3940256099942544~3347511713',
    banner_ad_unit: 'ca-app-pub-3940256099942544/6300978111',
    interstitial_ad_unit: 'ca-app-pub-3940256099942544/1033173712',
    rewarded_ad_unit: 'ca-app-pub-3940256099942544/5224354917',
    native_ad_unit: 'ca-app-pub-3940256099942544/2247696110',
    test_mode: true,
    auto_refresh_interval: 30,
    show_frequency: {
        banner: 'always',
        interstitial: 'every_3_actions',
        rewarded: 'on_demand'
    },
    enabled: true
};

// 获取积分配置
app.get('/api/admin/points/config', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    res.json({
        success: true,
        data: pointsConfig
    });
});

// 更新积分配置
app.put('/api/admin/points/config', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { action_type, points, daily_limit, enabled, description, name, icon, priority } = req.body;
    
    if (!pointsConfig[action_type]) {
        return res.status(400).json({
            success: false,
            error: '无效的积分类型'
        });
    }
    
    // 更新配置
    if (points !== undefined) pointsConfig[action_type].points = parseInt(points);
    if (daily_limit !== undefined) pointsConfig[action_type].daily_limit = parseInt(daily_limit);
    if (enabled !== undefined) pointsConfig[action_type].enabled = Boolean(enabled);
    if (description !== undefined) pointsConfig[action_type].description = description;
    if (name !== undefined) pointsConfig[action_type].name = name;
    if (icon !== undefined) pointsConfig[action_type].icon = icon;
    if (priority !== undefined) pointsConfig[action_type].priority = parseInt(priority);
    
    res.json({
        success: true,
        data: pointsConfig[action_type],
        message: '积分配置更新成功'
    });
});

// 新增积分任务
app.post('/api/admin/points/config', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { id, name, points, daily_limit, description, icon, category } = req.body;
    
    if (!id || !name || points === undefined) {
        return res.status(400).json({
            success: false,
            error: '缺少必要参数: id, name, points'
        });
    }
    
    if (pointsConfig[id]) {
        return res.status(400).json({
            success: false,
            error: '任务ID已存在'
        });
    }
    
    // 获取下一个优先级
    const maxPriority = Math.max(...Object.values(pointsConfig).map(config => config.priority || 0));
    
    pointsConfig[id] = {
        id,
        name,
        points: parseInt(points),
        daily_limit: parseInt(daily_limit) || 999,
        enabled: true,
        description: description || '',
        icon: icon || '🎯',
        priority: maxPriority + 1,
        created_at: new Date().toISOString(),
        total_clicks: 0,
        total_revenue: 0,
        today_clicks: 0,
        category: category || 'custom'
    };
    
    res.json({
        success: true,
        data: pointsConfig[id],
        message: '新任务创建成功'
    });
});

// 删除积分任务
app.delete('/api/admin/points/config/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { id } = req.params;
    
    if (!pointsConfig[id]) {
        return res.status(404).json({
            success: false,
            error: '任务不存在'
        });
    }
    
    delete pointsConfig[id];
    
    res.json({
        success: true,
        message: '任务删除成功'
    });
});

// 批量更新任务优先级
app.post('/api/admin/points/config/reorder', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { tasks } = req.body; // Array of {id, priority}
    
    if (!Array.isArray(tasks)) {
        return res.status(400).json({
            success: false,
            error: '无效的任务列表'
        });
    }
    
    tasks.forEach(task => {
        if (pointsConfig[task.id] && task.priority !== undefined) {
            pointsConfig[task.id].priority = parseInt(task.priority);
        }
    });
    
    res.json({
        success: true,
        message: '任务排序更新成功'
    });
});

// 获取任务统计数据
app.get('/api/admin/points/stats/:id', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const { id } = req.params;
    const { days = 7 } = req.query;
    
    if (!pointsConfig[id]) {
        return res.status(404).json({
            success: false,
            error: '任务不存在'
        });
    }
    
    // 生成模拟的历史数据
    const stats = [];
    const daysNum = parseInt(days);
    
    for (let i = daysNum - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        stats.push({
            date: date.toISOString().split('T')[0],
            clicks: Math.floor(Math.random() * 200) + 50,
            revenue: Math.floor(Math.random() * 5000) + 1000,
            conversion_rate: (Math.random() * 0.3 + 0.1).toFixed(3),
            avg_points: pointsConfig[id].points
        });
    }
    
    const task = pointsConfig[id];
    const responseData = {
        task_info: task,
        daily_stats: stats,
        summary: {
            total_clicks: task.total_clicks,
            total_revenue: task.total_revenue,
            avg_daily_clicks: Math.floor(task.total_clicks / 30),
            avg_daily_revenue: Math.floor(task.total_revenue / 30),
            best_day_clicks: Math.max(...stats.map(s => s.clicks)),
            trend: stats.length > 1 ? (stats[stats.length - 1].clicks > stats[0].clicks ? 'up' : 'down') : 'stable'
        }
    };
    
    res.json({
        success: true,
        data: responseData
    });
});

// 获取AdMob配置
app.get('/api/admin/admob/config', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    res.json({
        success: true,
        data: admobConfig
    });
});

// 更新AdMob配置
app.put('/api/admin/admob/config', authenticateToken, requireRole(['super_admin', 'manager']), (req, res) => {
    const updates = req.body;
    
    // 更新配置
    Object.keys(updates).forEach(key => {
        if (admobConfig.hasOwnProperty(key)) {
            admobConfig[key] = updates[key];
        }
    });
    
    res.json({
        success: true,
        data: admobConfig,
        message: 'AdMob配置更新成功'
    });
});

// 前端获取积分配置（供APP使用）
app.get('/api/app/points/config', verifyAuth0Token, (req, res) => {
    // 只返回前端需要的配置
    const publicConfig = {};
    Object.keys(pointsConfig).forEach(key => {
        if (pointsConfig[key].enabled) {
            publicConfig[key] = {
                name: pointsConfig[key].name,
                points: pointsConfig[key].points,
                daily_limit: pointsConfig[key].daily_limit,
                description: pointsConfig[key].description
            };
        }
    });
    
    res.json({
        success: true,
        data: publicConfig
    });
});

// 前端获取AdMob配置（供APP使用）
app.get('/api/app/admob/config', verifyAuth0Token, (req, res) => {
    if (!admobConfig.enabled) {
        return res.json({
            success: true,
            data: { enabled: false }
        });
    }
    
    // 只返回前端需要的配置
    const publicConfig = {
        app_id: admobConfig.app_id,
        banner_ad_unit: admobConfig.banner_ad_unit,
        interstitial_ad_unit: admobConfig.interstitial_ad_unit,
        rewarded_ad_unit: admobConfig.rewarded_ad_unit,
        native_ad_unit: admobConfig.native_ad_unit,
        test_mode: admobConfig.test_mode,
        auto_refresh_interval: admobConfig.auto_refresh_interval,
        show_frequency: admobConfig.show_frequency,
        enabled: admobConfig.enabled
    };
    
    res.json({
        success: true,
        data: publicConfig
    });
});

// 404处理
app.use('*', (req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 积分宝Mock API服务器启动成功 - 端口: ${PORT}`);
    console.log(`💡 模拟数据模式 - 无需MySQL数据库`);
    console.log(`📊 管理员账号:`);
    console.log(`   超级管理员: admin / admin123`);
    console.log(`   系统管理员: manager / manager123`);
    console.log(`   运营专员: operator / operator123`);
    console.log(`🌐 API文档: http://localhost:${PORT}/api/health`);
});

module.exports = app;
