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

// 管理员权限检查 (manager 或 super_admin)
const requireManager = (req, res, next) => {
    if (!req.admin || !['manager', 'super_admin'].includes(req.admin.role)) {
        return res.status(403).json({ 
            error: '需要管理员权限',
            required_role: 'manager_or_super_admin',
            current_role: req.admin?.role || 'none'
        });
    }
    next();
};

// ===================== 认证API =====================

// 邮箱密码登录
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: '邮箱和密码不能为空'
            });
        }
        
        // 查找用户
        const user = mockData.appUsers.find(u => u.email === email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '邮箱或密码错误'
            });
        }
        
        // 模拟密码验证（实际应用中应该验证加密密码）
        if (user.password && user.password !== password) {
            return res.status(401).json({
                success: false,
                message: '邮箱或密码错误'
            });
        }
        
        // 生成JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // 更新最后登录时间
        user.last_login = new Date().toISOString();
        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    points: user.points_balance,
                    avatar: user.avatar,
                    membership_level: user.membership_level,
                    is_vip: user.is_vip
                },
                token
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 用户注册
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password, referralCode } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名、邮箱和密码不能为空'
            });
        }
        
        // 检查邮箱是否已存在
        const existingUser = mockData.appUsers.find(u => u.email === email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: '该邮箱已注册'
            });
        }
        
        // 生成验证码
        const verificationCode = Math.random().toString().substr(2, 6);
        
        // 临时存储待验证用户
        const tempUser = {
            username,
            email,
            password,
            referralCode,
            verificationCode,
            createdAt: Date.now()
        };
        
        // 模拟存储（实际应用中应该存储到Redis或数据库）
        if (!global.tempUsers) global.tempUsers = new Map();
        global.tempUsers.set(email, tempUser);
        
        // 模拟发送邮件（实际应用中应该发送真实邮件）
        console.log(`📧 发送验证码到 ${email}: ${verificationCode}`);
        
        res.json({
            success: true,
            message: '注册信息已提交，验证码已发送到您的邮箱'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 邮箱验证
app.post('/api/auth/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: '邮箱和验证码不能为空'
            });
        }
        
        // 获取临时用户信息
        if (!global.tempUsers) global.tempUsers = new Map();
        const tempUser = global.tempUsers.get(email);
        
        if (!tempUser) {
            return res.status(400).json({
                success: false,
                message: '验证码已过期，请重新注册'
            });
        }
        
        if (tempUser.verificationCode !== code) {
            return res.status(400).json({
                success: false,
                message: '验证码错误'
            });
        }
        
        // 创建正式用户
        const userId = 'user_' + Date.now();
        const newUser = {
            id: userId,
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password,
            points_balance: tempUser.referralCode ? 15000 : 10000, // 推荐奖励
            total_earned: tempUser.referralCode ? 15000 : 10000,
            membership_level: 'basic',
            is_vip: false,
            avatar: '👤',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            email_verified: true
        };
        
        mockData.appUsers.push(newUser);
        
        // 添加注册奖励交易记录
        mockData.pointsTransactions.push({
            id: 'tx_' + Date.now(),
            user_id: userId,
            points_change: tempUser.referralCode ? 15000 : 10000,
            transaction_type: 'registration_bonus',
            description: tempUser.referralCode ? '新用户注册奖励（推荐）' : '新用户注册奖励',
            created_at: new Date().toISOString()
        });
        
        // 生成JWT token
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // 清除临时用户信息
        global.tempUsers.delete(email);
        
        res.json({
            success: true,
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    points: newUser.points_balance,
                    avatar: newUser.avatar,
                    membership_level: newUser.membership_level,
                    is_vip: newUser.is_vip
                },
                token
            }
        });
        
        console.log(`✅ 新用户注册完成: ${newUser.username} (${newUser.email})`);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 重新发送验证码
app.post('/api/auth/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '邮箱不能为空'
            });
        }
        
        // 获取临时用户信息
        if (!global.tempUsers) global.tempUsers = new Map();
        const tempUser = global.tempUsers.get(email);
        
        if (!tempUser) {
            return res.status(400).json({
                success: false,
                message: '请先注册'
            });
        }
        
        // 重新生成验证码
        const verificationCode = Math.random().toString().substr(2, 6);
        tempUser.verificationCode = verificationCode;
        tempUser.createdAt = Date.now();
        
        // 模拟发送邮件
        console.log(`📧 重新发送验证码到 ${email}: ${verificationCode}`);
        
        res.json({
            success: true,
            message: '验证码已重新发送'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 忘记密码
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: '邮箱不能为空'
            });
        }
        
        // 查找用户
        const user = mockData.appUsers.find(u => u.email === email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '该邮箱未注册'
            });
        }
        
        // 生成重置token
        const resetToken = Math.random().toString(36).substr(2, 32);
        
        // 模拟存储重置token（实际应用中应该存储到数据库）
        if (!global.resetTokens) global.resetTokens = new Map();
        global.resetTokens.set(resetToken, {
            email,
            createdAt: Date.now()
        });
        
        // 模拟发送邮件
        const resetLink = `http://localhost:8080/reset-password?token=${resetToken}`;
        console.log(`📧 发送密码重置链接到 ${email}: ${resetLink}`);
        
        res.json({
            success: true,
            message: '密码重置链接已发送到您的邮箱'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

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
                user_id: userId,
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

// App端获取积分交易记录
app.get('/api/app/user/transactions', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub;
        const list = mockData.pointsTransactions
            .filter(t => t.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 50);
        return res.json({ success: true, data: list });
    } catch (error) {
        return res.status(401).json({ success: false, error: '认证失败' });
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

// ===================== 积分增强功能API =====================

// 检查积分过期
app.post('/api/points/check-expiration', authenticateToken, async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: '用户ID不能为空'
            });
        }
        
        // 查找用户
        const user = mockData.appUsers.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        // 模拟检查过期积分（实际应用中应该检查数据库中的积分记录）
        const expiredPoints = Math.floor(Math.random() * 500); // 随机生成过期积分
        const newBalance = Math.max(0, user.points_balance - expiredPoints);
        
        if (expiredPoints > 0) {
            // 更新用户积分
            user.points_balance = newBalance;
            
            // 添加过期记录
            mockData.pointsTransactions.push({
                id: 'tx_' + Date.now(),
                user_id: userId,
                points_change: -expiredPoints,
                transaction_type: 'expiration',
                description: '积分过期',
                created_at: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: {
                expiredPoints,
                newBalance
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 积分转赠
app.post('/api/points/transfer', authenticateToken, async (req, res) => {
    try {
        const { fromUserId, toUserIdentifier, amount, message } = req.body;
        
        if (!fromUserId || !toUserIdentifier || !amount) {
            return res.status(400).json({
                success: false,
                message: '转赠信息不完整'
            });
        }
        
        if (amount < 100) {
            return res.status(400).json({
                success: false,
                message: '单次最少转赠100积分'
            });
        }
        
        // 查找转出用户
        const fromUser = mockData.appUsers.find(u => u.id === fromUserId);
        if (!fromUser) {
            return res.status(404).json({
                success: false,
                message: '转出用户不存在'
            });
        }
        
        if (fromUser.points_balance < amount) {
            return res.status(400).json({
                success: false,
                message: '积分余额不足'
            });
        }
        
        // 查找接收用户（支持邮箱或用户ID）
        const toUser = mockData.appUsers.find(u => 
            u.id === toUserIdentifier || u.email === toUserIdentifier
        );
        
        if (!toUser) {
            return res.status(404).json({
                success: false,
                message: '接收用户不存在'
            });
        }
        
        if (fromUser.id === toUser.id) {
            return res.status(400).json({
                success: false,
                message: '不能向自己转赠积分'
            });
        }
        
        // 执行转赠
        fromUser.points_balance -= amount;
        toUser.points_balance += amount;
        
        const transferId = 'transfer_' + Date.now();
        
        // 记录转出交易
        mockData.pointsTransactions.push({
            id: 'tx_out_' + Date.now(),
            user_id: fromUserId,
            points_change: -amount,
            transaction_type: 'transfer_out',
            description: `转赠给 ${toUser.username || toUser.email}${message ? ': ' + message : ''}`,
            metadata: { transferId, recipient: toUser.id },
            created_at: new Date().toISOString()
        });
        
        // 记录转入交易
        mockData.pointsTransactions.push({
            id: 'tx_in_' + Date.now(),
            user_id: toUser.id,
            points_change: amount,
            transaction_type: 'transfer_in',
            description: `来自 ${fromUser.username || fromUser.email} 的转赠${message ? ': ' + message : ''}`,
            metadata: { transferId, sender: fromUserId },
            created_at: new Date().toISOString()
        });
        
        res.json({
            success: true,
            data: {
                newBalance: fromUser.points_balance,
                transferId
            }
        });
        
        console.log(`✅ 积分转赠: ${fromUser.username} -> ${toUser.username}, ${amount}积分`);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取商城商品列表（App端可访问）
app.get('/api/shop/items', verifyAuth0Token, async (req, res) => {
    try {
        // 模拟商城商品数据
        const shopItems = [
            {
                id: 'item_1',
                name: '10元话费券',
                description: '中国移动/联通/电信通用话费券',
                price: 1000,
                originalPrice: 1200,
                discount: 15,
                category: 'coupon',
                stock: 50,
                image: null
            },
            {
                id: 'item_2',
                name: '星巴克咖啡券',
                description: '星巴克任意饮品券，全国门店通用',
                price: 2800,
                category: 'coupon',
                stock: 20,
                image: null
            },
            {
                id: 'item_3',
                name: '1000积分',
                description: '直接获得1000积分奖励',
                price: 900,
                category: 'virtual',
                stock: 100,
                image: null
            },
            {
                id: 'item_4',
                name: 'VIP会员7天',
                description: '享受VIP特权，无限制赚取积分',
                price: 1500,
                category: 'virtual',
                stock: 30,
                image: null
            },
            {
                id: 'item_5',
                name: '小米充电宝',
                description: '小米10000mAh充电宝，支持快充',
                price: 8800,
                category: 'physical',
                stock: 5,
                image: null
            },
            {
                id: 'item_6',
                name: 'AirPods耳机',
                description: 'Apple AirPods 3代无线耳机',
                price: 15000,
                category: 'physical',
                stock: 2,
                image: null
            }
        ];
        
        res.json({
            success: true,
            data: shopItems
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 购买商品（App端可访问）
app.post('/api/shop/buy', verifyAuth0Token, async (req, res) => {
    try {
        let { userId, itemId } = req.body;
        if (!userId && req.user?.sub) {
            userId = req.user.sub;
        }
        
        if (!userId || !itemId) {
            return res.status(400).json({
                success: false,
                message: '购买信息不完整'
            });
        }
        
        // 查找用户
        const user = mockData.appUsers.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        // 模拟商品信息（实际应用中应该从数据库获取）
        const items = [
            { id: 'item_1', price: 1000, name: '10元话费券', stock: 50 },
            { id: 'item_2', price: 2800, name: '星巴克咖啡券', stock: 20 },
            { id: 'item_3', price: 900, name: '1000积分', stock: 100 },
            { id: 'item_4', price: 1500, name: 'VIP会员7天', stock: 30 },
            { id: 'item_5', price: 8800, name: '小米充电宝', stock: 5 },
            { id: 'item_6', price: 15000, name: 'AirPods耳机', stock: 2 }
        ];
        
        const item = items.find(i => i.id === itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: '商品不存在'
            });
        }
        
        if (item.stock <= 0) {
            return res.status(400).json({
                success: false,
                message: '商品缺货'
            });
        }
        
        if (user.points_balance < item.price) {
            return res.status(400).json({
                success: false,
                message: '积分不足'
            });
        }
        
        // 扣除积分
        user.points_balance -= item.price;
        
        // 减少库存（模拟）
        item.stock -= 1;
        
        // 记录交易
        mockData.pointsTransactions.push({
            id: 'tx_' + Date.now(),
            user_id: userId,
            points_change: -item.price,
            transaction_type: 'purchase',
            description: `兑换商品: ${item.name}`,
            metadata: { itemId, itemName: item.name },
            created_at: new Date().toISOString()
        });
        
        // 如果是积分商品，直接发放积分
        if (itemId === 'item_3') {
            user.points_balance += 1000;
            mockData.pointsTransactions.push({
                id: 'tx_bonus_' + Date.now(),
                user_id: userId,
                points_change: 1000,
                transaction_type: 'purchase_bonus',
                description: '商品奖励: 1000积分',
                created_at: new Date().toISOString()
            });
        }
        
        res.json({
            success: true,
            data: {
                newBalance: user.points_balance,
                item: item.name
            }
        });
        
        console.log(`✅ 商品兑换: ${user.username} 兑换 ${item.name}, 花费${item.price}积分`);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// ===================== 提现管理API =====================

// 提交提现申请
app.post('/api/withdrawal/request', authenticateToken, async (req, res) => {
    try {
        const { userId, amount, method, accountInfo, cryptoType, walletAddress } = req.body;
        
        if (!userId || !amount || (!method && !cryptoType)) {
            return res.status(400).json({
                success: false,
                message: '提现信息不完整'
            });
        }
        
        // 查找用户
        const user = mockData.appUsers.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        // 计算所需积分和手续费
        let pointsNeeded, feeAmount, actualAmount;
        
        if (cryptoType) {
            // 加密货币提现
            const exchangeRates = {
                'USDT': 100,    // 100积分 = 1 USDT
                'USDC': 100,    // 100积分 = 1 USDC  
                'BTC': 6500000, // 6,500,000积分 = 1 BTC
                'ETH': 350000   // 350,000积分 = 1 ETH
            };
            
            const fees = {
                'USDT': 1,      // 1 USDT 手续费
                'USDC': 2,      // 2 USDC 手续费
                'BTC': 0.0001,  // 0.0001 BTC 手续费
                'ETH': 0.002    // 0.002 ETH 手续费
            };
            
            const rate = exchangeRates[cryptoType];
            pointsNeeded = Math.ceil(amount * rate);
            feeAmount = fees[cryptoType];
            actualAmount = amount - feeAmount;
        } else {
            // 法币提现
            pointsNeeded = amount * 1000; // 1000积分 = $1
            feeAmount = 0.50; // $0.50 手续费
            actualAmount = amount - feeAmount;
        }
        
        if (user.points_balance < pointsNeeded) {
            return res.status(400).json({
                success: false,
                message: '积分余额不足'
            });
        }
        
        if (amount < 10) {
            return res.status(400).json({
                success: false,
                message: '最低提现金额为10美元或等值加密货币'
            });
        }
        
        // 创建提现记录
        const requestId = 'wd_' + Date.now();
        const withdrawalRequest = {
            id: requestId,
            user_id: userId,
            amount: amount,
            points_amount: pointsNeeded,
            method: method || cryptoType,
            account_info: accountInfo || walletAddress,
            fee_amount: feeAmount,
            actual_amount: actualAmount,
            status: 'pending',
            created_at: new Date().toISOString(),
            estimated_completion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3天后
        };
        
        // 存储提现记录
        if (!mockData.withdrawalRequests) mockData.withdrawalRequests = [];
        mockData.withdrawalRequests.push(withdrawalRequest);
        
        // 冻结用户积分
        user.points_balance -= pointsNeeded;
        
        // 记录积分交易
        mockData.pointsTransactions.push({
            id: 'tx_wd_' + Date.now(),
            user_id: userId,
            points_change: -pointsNeeded,
            transaction_type: 'withdrawal_pending',
            description: `提现申请: ${actualAmount} ${method || cryptoType}`,
            metadata: { 
                withdrawalId: requestId,
                method: method || cryptoType,
                amount: actualAmount 
            },
            created_at: new Date().toISOString()
        });
        
        res.json({
            success: true,
            data: {
                requestId,
                estimatedCompletion: withdrawalRequest.estimated_completion,
                actualAmount
            },
            message: '提现申请已提交，请等待审核'
        });
        
        console.log(`✅ 提现申请: ${user.username} 申请提现 ${actualAmount} ${method || cryptoType}`);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取提现记录
app.get('/api/withdrawal/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!mockData.withdrawalRequests) mockData.withdrawalRequests = [];
        
        const userWithdrawals = mockData.withdrawalRequests
            .filter(w => w.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json({
            success: true,
            data: userWithdrawals
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 管理员获取提现申请列表
app.get('/api/admin/withdrawals', [authenticateToken, requireManager], async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        
        if (!mockData.withdrawalRequests) mockData.withdrawalRequests = [];
        
        let withdrawals = mockData.withdrawalRequests;
        
        // 状态筛选
        if (status && status !== 'all') {
            withdrawals = withdrawals.filter(w => w.status === status);
        }
        
        // 排序
        withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedWithdrawals = withdrawals.slice(startIndex, endIndex);
        
        // 添加用户信息
        const enrichedWithdrawals = paginatedWithdrawals.map(w => {
            const user = mockData.appUsers.find(u => u.id === w.user_id);
            return {
                ...w,
                username: user?.username || 'Unknown',
                user_email: user?.email || 'Unknown'
            };
        });
        
        res.json({
            success: true,
            data: {
                withdrawals: enrichedWithdrawals,
                total: withdrawals.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(withdrawals.length / limit)
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 管理员审核提现申请
app.post('/api/admin/withdrawals/:requestId/review', [authenticateToken, requireManager], async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, notes, transactionHash } = req.body;
        
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: '无效的操作'
            });
        }
        
        if (!mockData.withdrawalRequests) mockData.withdrawalRequests = [];
        
        const withdrawal = mockData.withdrawalRequests.find(w => w.id === requestId);
        if (!withdrawal) {
            return res.status(404).json({
                success: false,
                message: '提现申请不存在'
            });
        }
        
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: '该申请已被处理'
            });
        }
        
        const user = mockData.appUsers.find(u => u.id === withdrawal.user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        if (action === 'approve') {
            // 批准提现
            withdrawal.status = 'processing';
            withdrawal.admin_notes = notes;
            withdrawal.processed_by = req.user.username;
            withdrawal.processed_at = new Date().toISOString();
            withdrawal.transaction_hash = transactionHash;
            
            // 更新积分交易状态
            const transaction = mockData.pointsTransactions.find(t => 
                t.metadata?.withdrawalId === requestId
            );
            if (transaction) {
                transaction.transaction_type = 'withdrawal_approved';
                transaction.description = `提现已批准: ${withdrawal.actual_amount} ${withdrawal.method}`;
            }
            
            // 模拟处理后自动完成
            setTimeout(() => {
                withdrawal.status = 'completed';
                console.log(`✅ 提现完成: ${requestId}`);
            }, 5000);
            
            console.log(`✅ 提现批准: ${req.user.username} 批准了 ${user.username} 的提现申请`);
            
        } else {
            // 拒绝提现，返还积分
            withdrawal.status = 'rejected';
            withdrawal.admin_notes = notes;
            withdrawal.processed_by = req.user.username;
            withdrawal.processed_at = new Date().toISOString();
            
            // 返还积分
            user.points_balance += withdrawal.points_amount;
            
            // 添加退款记录
            mockData.pointsTransactions.push({
                id: 'tx_refund_' + Date.now(),
                user_id: withdrawal.user_id,
                points_change: withdrawal.points_amount,
                transaction_type: 'withdrawal_refund',
                description: `提现被拒绝，积分退还: ${notes || '未提供原因'}`,
                metadata: { 
                    withdrawalId: requestId,
                    originalAmount: withdrawal.actual_amount 
                },
                created_at: new Date().toISOString()
            });
            
            console.log(`❌ 提现拒绝: ${req.user.username} 拒绝了 ${user.username} 的提现申请`);
        }
        
        res.json({
            success: true,
            data: withdrawal,
            message: action === 'approve' ? '提现申请已批准' : '提现申请已拒绝'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取提现统计
app.get('/api/admin/withdrawals/stats', [authenticateToken, requireManager], async (req, res) => {
    try {
        if (!mockData.withdrawalRequests) mockData.withdrawalRequests = [];
        
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().substring(0, 7);
        
        const stats = {
            total: mockData.withdrawalRequests.length,
            pending: mockData.withdrawalRequests.filter(w => w.status === 'pending').length,
            processing: mockData.withdrawalRequests.filter(w => w.status === 'processing').length,
            completed: mockData.withdrawalRequests.filter(w => w.status === 'completed').length,
            rejected: mockData.withdrawalRequests.filter(w => w.status === 'rejected').length,
            todayAmount: mockData.withdrawalRequests
                .filter(w => w.created_at.startsWith(today) && w.status === 'completed')
                .reduce((sum, w) => sum + w.actual_amount, 0),
            monthlyAmount: mockData.withdrawalRequests
                .filter(w => w.created_at.startsWith(thisMonth) && w.status === 'completed')
                .reduce((sum, w) => sum + w.actual_amount, 0)
        };
        
        res.json({
            success: true,
            data: stats
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// ===================== 会员系统API =====================

// 会员升级
app.post('/api/membership/upgrade', authenticateToken, async (req, res) => {
    try {
        const { userId, level, paymentMethod } = req.body;
        
        if (!userId || !level || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: '升级信息不完整'
            });
        }
        
        // 查找用户
        const user = mockData.appUsers.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        // 会员等级和价格配置
        const membershipPlans = {
            'bronze': { name: '青铜会员', price: 9.9, points: 1000, benefits: { pointsBonus: 10, adFree: true, withdrawDiscount: 5 } },
            'silver': { name: '白银会员', price: 29.9, points: 3000, benefits: { pointsBonus: 25, adFree: true, withdrawDiscount: 10 } },
            'gold': { name: '黄金会员', price: 59.9, points: 6000, benefits: { pointsBonus: 35, adFree: true, withdrawDiscount: 20 } },
            'diamond': { name: '钻石会员', price: 99.9, points: 10000, benefits: { pointsBonus: 50, adFree: true, withdrawDiscount: 100 } }
        };
        
        const plan = membershipPlans[level];
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: '无效的会员等级'
            });
        }
        
        // 检查当前等级
        const currentLevel = user.membership_level || 'basic';
        const levelOrder = ['basic', 'bronze', 'silver', 'gold', 'diamond'];
        if (levelOrder.indexOf(currentLevel) >= levelOrder.indexOf(level)) {
            return res.status(400).json({
                success: false,
                message: '您已经是该等级或更高等级的会员'
            });
        }
        
        let newBalance = user.points_balance;
        
        if (paymentMethod === 'points') {
            // 积分支付
            if (user.points_balance < plan.points) {
                return res.status(400).json({
                    success: false,
                    message: '积分余额不足'
                });
            }
            
            // 扣除积分
            newBalance = user.points_balance - plan.points;
            user.points_balance = newBalance;
            
            // 记录积分交易
            mockData.pointsTransactions.push({
                id: 'tx_membership_' + Date.now(),
                user_id: userId,
                points_change: -plan.points,
                transaction_type: 'membership_upgrade',
                description: `升级到${plan.name}`,
                metadata: { 
                    membershipLevel: level,
                    paymentMethod: paymentMethod 
                },
                created_at: new Date().toISOString()
            });
        } else {
            // 现金支付（模拟）
            console.log(`💳 模拟现金支付: ¥${plan.price} 升级到${plan.name}`);
        }
        
        // 更新用户会员等级
        user.membership_level = level;
        user.membership_expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30天后过期
        
        // 创建会员订阅记录
        const subscriptionId = 'sub_' + Date.now();
        const membershipSubscription = {
            id: subscriptionId,
            user_id: userId,
            plan_type: 'monthly',
            membership_level: level,
            price: plan.price,
            points_cost: paymentMethod === 'points' ? plan.points : null,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'active',
            payment_method: paymentMethod,
            auto_renew: false,
            created_at: new Date().toISOString()
        };
        
        if (!mockData.membershipSubscriptions) mockData.membershipSubscriptions = [];
        mockData.membershipSubscriptions.push(membershipSubscription);
        
        res.json({
            success: true,
            data: {
                newBalance,
                membership: {
                    level: level,
                    name: plan.name,
                    expires: user.membership_expires,
                    benefits: plan.benefits
                },
                subscriptionId
            },
            message: `恭喜您成功升级到${plan.name}！`
        });
        
        console.log(`✅ 会员升级: ${user.username} 升级到 ${plan.name} (${paymentMethod})`);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取会员信息
app.get('/api/membership/info', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = mockData.appUsers.find(u => u.id === userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            });
        }
        
        const membershipLevels = {
            'basic': { name: '免费用户', icon: '👤', benefits: [] },
            'bronze': { name: '青铜会员', icon: '🥉', benefits: ['积分获取 +10%', '去除横幅广告', '专属青铜游戏'] },
            'silver': { name: '白银会员', icon: '🥈', benefits: ['积分获取 +25%', '完全无广告', '独家白银游戏'] },
            'gold': { name: '黄金会员', icon: '🥇', benefits: ['积分获取 +35%', '零广告体验', '独家黄金内容'] },
            'diamond': { name: '钻石会员', icon: '💎', benefits: ['积分获取 +50%', '完全无广告', '独家钻石内容'] }
        };
        
        const currentLevel = user.membership_level || 'basic';
        const membership = membershipLevels[currentLevel];
        
        res.json({
            success: true,
            data: {
                level: currentLevel,
                name: membership.name,
                icon: membership.icon,
                expires: user.membership_expires || null,
                benefits: membership.benefits,
                isVip: currentLevel !== 'basic'
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取会员订阅历史
app.get('/api/membership/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        if (!mockData.membershipSubscriptions) mockData.membershipSubscriptions = [];
        
        const userSubscriptions = mockData.membershipSubscriptions
            .filter(s => s.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json({
            success: true,
            data: userSubscriptions
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 取消会员自动续费
app.post('/api/membership/cancel-auto-renew', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { subscriptionId } = req.body;
        
        if (!mockData.membershipSubscriptions) mockData.membershipSubscriptions = [];
        
        const subscription = mockData.membershipSubscriptions.find(s => 
            s.id === subscriptionId && s.user_id === userId && s.status === 'active'
        );
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: '订阅不存在或已过期'
            });
        }
        
        subscription.auto_renew = false;
        subscription.updated_at = new Date().toISOString();
        
        res.json({
            success: true,
            message: '已取消自动续费'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
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

// 记录AdMob广告展示
app.post('/api/admin/admob/impression', verifyAuth0Token, (req, res) => {
    try {
        const { ad_type, timestamp, user_id } = req.body;
        
        if (!ad_type || !timestamp) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }
        
        // 模拟记录广告展示
        const impression = {
            id: Date.now(),
            ad_type,
            timestamp,
            user_id: user_id || 'anonymous',
            revenue: getAdRevenue(ad_type),
            created_at: new Date().toISOString()
        };
        
        // 添加到模拟数据中
        if (!mockData.admobImpressions) {
            mockData.admobImpressions = [];
        }
        mockData.admobImpressions.push(impression);
        
        // 更新收益数据
        updateAdRevenue(ad_type, impression.revenue);
        
        res.json({
            success: true,
            data: {
                impression_id: impression.id,
                revenue: impression.revenue
            },
            message: '广告展示记录成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '记录广告展示失败',
            details: error.message
        });
    }
});

// 获取广告收益（基于广告类型）
function getAdRevenue(adType) {
    const revenueRates = {
        banner: 0.01,      // 横幅广告每次展示0.01美元
        interstitial: 0.05, // 插屏广告每次展示0.05美元
        rewarded: 0.10,     // 激励视频每次展示0.10美元
        native: 0.03        // 原生广告每次展示0.03美元
    };
    
    return revenueRates[adType] || 0.01;
}

// 更新广告收益数据
function updateAdRevenue(adType, revenue) {
    // 更新今天的收益数据
    const today = new Date().toISOString().split('T')[0];
    
    // 找到或创建今天的收益记录
    let todayRevenue = mockData.admobRevenue.find(item => 
        item.date === today && item.type === adType
    );
    
    if (!todayRevenue) {
        todayRevenue = {
            date: today,
            type: adType,
            revenue: 0,
            impressions: 0
        };
        mockData.admobRevenue.push(todayRevenue);
    }
    
    todayRevenue.revenue += revenue;
    todayRevenue.impressions += 1;
}

// ===================== 游戏系统API =====================

// 记录游戏成绩
app.post('/api/game/score', verifyAuth0Token, (req, res) => {
    try {
        const { gameType, score, points, attempts, duration } = req.body;
        const userId = req.user.sub;
        
        if (!gameType || score === undefined || points === undefined) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }
        
        // 创建游戏记录
        const gameRecord = {
            id: Date.now(),
            user_id: userId,
            game_type: gameType,
            score: parseInt(score),
            points: parseInt(points),
            attempts: parseInt(attempts) || 1,
            duration: parseInt(duration) || 0,
            created_at: new Date().toISOString()
        };
        
        // 存储到模拟数据中
        if (!mockData.gameScores) {
            mockData.gameScores = [];
        }
        mockData.gameScores.push(gameRecord);
        
        // 更新用户积分（如果用户存在）
        const user = mockData.users.find(u => u.sub === userId);
        if (user) {
            user.points = (user.points || 0) + points;
        }
        
        res.json({
            success: true,
            data: gameRecord,
            message: '游戏成绩记录成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '记录游戏成绩失败',
            details: error.message
        });
    }
});

// 获取用户游戏记录
app.get('/api/game/scores', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub;
        const { gameType, limit = 20 } = req.query;
        
        if (!mockData.gameScores) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        let userScores = mockData.gameScores.filter(score => score.user_id === userId);
        
        // 如果指定了游戏类型，进行过滤
        if (gameType) {
            userScores = userScores.filter(score => score.game_type === gameType);
        }
        
        // 按时间排序并限制数量
        userScores = userScores
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, parseInt(limit));
        
        res.json({
            success: true,
            data: userScores
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取游戏记录失败',
            details: error.message
        });
    }
});

// 获取游戏排行榜
app.get('/api/game/leaderboard', verifyAuth0Token, (req, res) => {
    try {
        const { gameType, period = 'all', limit = 10 } = req.query;
        
        if (!mockData.gameScores) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        let scores = [...mockData.gameScores];
        
        // 如果指定了游戏类型，进行过滤
        if (gameType) {
            scores = scores.filter(score => score.game_type === gameType);
        }
        
        // 根据时间期间过滤
        if (period !== 'all') {
            const now = new Date();
            let startDate;
            
            switch(period) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
            }
            
            if (startDate) {
                scores = scores.filter(score => new Date(score.created_at) >= startDate);
            }
        }
        
        // 按分数排序，获取最高分
        const leaderboard = scores
            .sort((a, b) => b.score - a.score)
            .slice(0, parseInt(limit))
            .map((score, index) => ({
                rank: index + 1,
                user_id: score.user_id,
                game_type: score.game_type,
                score: score.score,
                points: score.points,
                created_at: score.created_at
            }));
        
        res.json({
            success: true,
            data: leaderboard
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取排行榜失败',
            details: error.message
        });
    }
});

// 获取游戏统计信息
app.get('/api/game/stats', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub;
        
        if (!mockData.gameScores) {
            return res.json({
                success: true,
                data: {
                    totalGames: 0,
                    totalPoints: 0,
                    bestScores: {},
                    todayGames: 0,
                    weekGames: 0
                }
            });
        }
        
        const userScores = mockData.gameScores.filter(score => score.user_id === userId);
        
        // 计算统计信息
        const totalGames = userScores.length;
        const totalPoints = userScores.reduce((sum, score) => sum + score.points, 0);
        
        // 各游戏最佳成绩
        const bestScores = {};
        const gameTypes = ['guessNumber', 'memoryCards', 'reactionSpeed'];
        
        gameTypes.forEach(gameType => {
            const gameScores = userScores.filter(score => score.game_type === gameType);
            if (gameScores.length > 0) {
                bestScores[gameType] = Math.max(...gameScores.map(s => s.score));
            } else {
                bestScores[gameType] = 0;
            }
        });
        
        // 今日游戏次数
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayGames = userScores.filter(score => new Date(score.created_at) >= todayStart).length;
        
        // 本周游戏次数
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekGames = userScores.filter(score => new Date(score.created_at) >= weekStart).length;
        
        res.json({
            success: true,
            data: {
                totalGames,
                totalPoints,
                bestScores,
                todayGames,
                weekGames
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取游戏统计失败',
            details: error.message
        });
    }
});

// ===================== 抽奖系统API =====================

// 记录抽奖结果
app.post('/api/lottery/record', verifyAuth0Token, (req, res) => {
    try {
        const { prize_id, prize_name, prize_value, prize_type } = req.body;
        const userId = req.user.sub;
        
        if (!prize_id || !prize_name || prize_value === undefined || !prize_type) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }
        
        // 创建抽奖记录
        const lotteryRecord = {
            id: Date.now(),
            user_id: userId,
            prize_id: parseInt(prize_id),
            prize_name,
            prize_value: parseInt(prize_value),
            prize_type,
            created_at: new Date().toISOString()
        };
        
        // 存储到模拟数据中
        if (!mockData.lotteryRecords) {
            mockData.lotteryRecords = [];
        }
        mockData.lotteryRecords.push(lotteryRecord);
        
        // 如果是积分奖励，直接发放给用户
        if (prize_type === 'points') {
            const user = mockData.users.find(u => u.sub === userId);
            if (user) {
                user.points = (user.points || 0) + prize_value;
            }
        }
        
        res.json({
            success: true,
            data: lotteryRecord,
            message: '抽奖记录保存成功'
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '记录抽奖结果失败',
            details: error.message
        });
    }
});

// 获取用户抽奖记录
app.get('/api/lottery/history', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub;
        const { limit = 20 } = req.query;
        
        if (!mockData.lotteryRecords) {
            return res.json({
                success: true,
                data: []
            });
        }
        
        const userRecords = mockData.lotteryRecords
            .filter(record => record.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, parseInt(limit));
        
        res.json({
            success: true,
            data: userRecords
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取抽奖记录失败',
            details: error.message
        });
    }
});

// 获取抽奖统计信息
app.get('/api/lottery/stats', verifyAuth0Token, (req, res) => {
    try {
        const userId = req.user.sub;
        
        if (!mockData.lotteryRecords) {
            return res.json({
                success: true,
                data: {
                    totalLotteries: 0,
                    totalPointsWon: 0,
                    todayLotteries: 0,
                    weekLotteries: 0,
                    bestPrize: null
                }
            });
        }
        
        const userRecords = mockData.lotteryRecords.filter(record => record.user_id === userId);
        
        // 总抽奖次数
        const totalLotteries = userRecords.length;
        
        // 总获得积分
        const totalPointsWon = userRecords
            .filter(record => record.prize_type === 'points')
            .reduce((sum, record) => sum + record.prize_value, 0);
        
        // 今日抽奖次数
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const todayLotteries = userRecords.filter(record => 
            new Date(record.created_at) >= todayStart
        ).length;
        
        // 本周抽奖次数
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const weekLotteries = userRecords.filter(record => 
            new Date(record.created_at) >= weekStart
        ).length;
        
        // 最佳奖品（积分最高）
        const bestPrize = userRecords
            .filter(record => record.prize_type === 'points')
            .sort((a, b) => b.prize_value - a.prize_value)[0] || null;
        
        res.json({
            success: true,
            data: {
                totalLotteries,
                totalPointsWon,
                todayLotteries,
                weekLotteries,
                bestPrize
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取抽奖统计失败',
            details: error.message
        });
    }
});

// 获取抽奖配置
app.get('/api/lottery/config', verifyAuth0Token, (req, res) => {
    try {
        const lotteryConfig = {
            dailyFreeSpins: 3,
            pointsPerSpin: 100,
            vipBonusSpins: 2,
            prizes: [
                { id: 1, name: "100积分", value: 100, type: "points", probability: 30, color: "#FEF3C7", icon: "💰" },
                { id: 2, name: "50积分", value: 50, type: "points", probability: 25, color: "#DBEAFE", icon: "💎" },
                { id: 3, name: "VIP体验卡", value: 7, type: "vip_trial", probability: 15, color: "#F3E8FF", icon: "👑" },
                { id: 4, name: "200积分", value: 200, type: "points", probability: 10, color: "#ECFDF5", icon: "🎁" },
                { id: 5, name: "500积分", value: 500, type: "points", probability: 8, color: "#FEF2F2", icon: "💸" },
                { id: 6, name: "抽奖券x3", value: 3, type: "lottery_tickets", probability: 7, color: "#F0F9FF", icon: "🎫" },
                { id: 7, name: "1000积分", value: 1000, type: "points", probability: 3, color: "#FFFBEB", icon: "🏆" },
                { id: 8, name: "谢谢参与", value: 0, type: "empty", probability: 2, color: "#F9FAFB", icon: "😊" }
            ]
        };
        
        res.json({
            success: true,
            data: lotteryConfig
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: '获取抽奖配置失败',
            details: error.message
        });
    }
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
