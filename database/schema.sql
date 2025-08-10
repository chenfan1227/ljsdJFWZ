-- 积分宝管理系统数据库结构
-- Database: jifenbao_system

CREATE DATABASE IF NOT EXISTS jifenbao_system;
USE jifenbao_system;

-- 管理员用户表
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('super_admin', 'manager', 'operator') DEFAULT 'operator',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role),
    INDEX idx_status (status)
);

-- 应用用户表
CREATE TABLE IF NOT EXISTS app_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    points_balance DECIMAL(15,2) DEFAULT 0.00,
    total_earned DECIMAL(15,2) DEFAULT 0.00,
    membership_level ENUM('bronze', 'silver', 'gold', 'vip', 'diamond') DEFAULT 'bronze',
    membership_expires TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    referral_code VARCHAR(20),
    referred_by VARCHAR(50),
    register_ip VARCHAR(45),
    device_info TEXT,
    last_active TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_membership (membership_level),
    INDEX idx_status (status),
    INDEX idx_referral (referral_code),
    INDEX idx_created (created_at)
);

-- 积分交易记录表
CREATE TABLE IF NOT EXISTS points_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    type ENUM('earn', 'spend', 'refund', 'expire', 'bonus') NOT NULL,
    source ENUM('video_ad', 'game', 'download', 'daily_signin', 'referral', 'purchase', 'admin_bonus', 'lottery', 'cashout') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    balance_before DECIMAL(15,2) NOT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    description TEXT,
    metadata JSON,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_source (source),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
);

-- AdMob收益记录表
CREATE TABLE IF NOT EXISTS admob_revenue (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    ad_unit_id VARCHAR(100) NOT NULL,
    ad_type ENUM('banner', 'interstitial', 'rewarded', 'native', 'app_open') NOT NULL,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    revenue DECIMAL(10,4) DEFAULT 0.0000,
    ecpm DECIMAL(8,4) DEFAULT 0.0000,
    ctr DECIMAL(6,4) DEFAULT 0.0000,
    fill_rate DECIMAL(6,4) DEFAULT 0.0000,
    app_id VARCHAR(100),
    country_code VARCHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_daily_unit (date, ad_unit_id, country_code),
    INDEX idx_date (date),
    INDEX idx_ad_unit (ad_unit_id),
    INDEX idx_ad_type (ad_type),
    INDEX idx_country (country_code)
);

-- 游戏记录表
CREATE TABLE IF NOT EXISTS game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    game_name VARCHAR(100) NOT NULL,
    game_type VARCHAR(50),
    level_completed INT,
    score INT DEFAULT 0,
    duration_seconds INT,
    points_earned DECIMAL(15,2) DEFAULT 0.00,
    ad_watched BOOLEAN DEFAULT FALSE,
    bonus_points DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('started', 'completed', 'abandoned', 'failed') DEFAULT 'started',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_game_name (game_name),
    INDEX idx_status (status),
    INDEX idx_started (started_at),
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
);

-- 广告观看记录表
CREATE TABLE IF NOT EXISTS ad_views (
    id INT PRIMARY KEY AUTO_INCREMENT,
    view_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    ad_unit_id VARCHAR(100) NOT NULL,
    ad_type ENUM('banner', 'interstitial', 'rewarded', 'native', 'app_open') NOT NULL,
    source ENUM('video_reward', 'game_bonus', 'daily_bonus', 'level_complete') NOT NULL,
    points_earned DECIMAL(15,2) DEFAULT 0.00,
    watch_duration_seconds INT,
    completion_rate DECIMAL(5,2),
    revenue_share DECIMAL(10,4) DEFAULT 0.0000,
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_ad_unit (ad_unit_id),
    INDEX idx_ad_type (ad_type),
    INDEX idx_source (source),
    INDEX idx_created (created_at),
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
);

-- 下载任务表
CREATE TABLE IF NOT EXISTS download_tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id VARCHAR(50) UNIQUE NOT NULL,
    app_name VARCHAR(200) NOT NULL,
    app_package VARCHAR(200),
    app_store_url TEXT,
    icon_url TEXT,
    description TEXT,
    points_reward DECIMAL(15,2) NOT NULL,
    requirements JSON,
    status ENUM('active', 'paused', 'expired', 'removed') DEFAULT 'active',
    daily_limit INT DEFAULT 1000,
    total_completions INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_task_id (task_id),
    INDEX idx_status (status),
    INDEX idx_points (points_reward),
    INDEX idx_dates (start_date, end_date)
);

-- 下载完成记录表
CREATE TABLE IF NOT EXISTS download_completions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    completion_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    points_earned DECIMAL(15,2) NOT NULL,
    device_id VARCHAR(100),
    install_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(50),
    user_ip VARCHAR(45),
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_task_id (task_id),
    INDEX idx_completed (completed_at),
    INDEX idx_verified (install_verified),
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES download_tasks(task_id) ON DELETE CASCADE
);

-- 抽奖活动表
CREATE TABLE IF NOT EXISTS lottery_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    cost_per_entry DECIMAL(15,2) NOT NULL,
    max_entries_per_user INT DEFAULT 10,
    total_entries INT DEFAULT 0,
    prizes JSON NOT NULL,
    status ENUM('upcoming', 'active', 'drawing', 'completed', 'cancelled') DEFAULT 'upcoming',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    draw_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_event_id (event_id),
    INDEX idx_status (status),
    INDEX idx_times (start_time, end_time)
);

-- 抽奖参与记录表
CREATE TABLE IF NOT EXISTS lottery_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entry_id VARCHAR(50) UNIQUE NOT NULL,
    event_id VARCHAR(50) NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    entry_numbers JSON,
    points_spent DECIMAL(15,2) NOT NULL,
    status ENUM('active', 'won', 'lost') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entry_id (entry_id),
    INDEX idx_event_id (event_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    FOREIGN KEY (event_id) REFERENCES lottery_events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
);

-- 会员订阅记录表
CREATE TABLE IF NOT EXISTS membership_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subscription_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    plan_type ENUM('monthly', 'quarterly', 'yearly') NOT NULL,
    membership_level ENUM('silver', 'gold', 'vip', 'diamond') NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    points_cost DECIMAL(15,2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    status ENUM('active', 'expired', 'cancelled', 'refunded') DEFAULT 'active',
    payment_method ENUM('points', 'alipay', 'wechat', 'credit_card') DEFAULT 'points',
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_level (membership_level),
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
);

-- 提现记录表
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    crypto_type ENUM('USDT', 'USDC', 'BTC', 'ETH') NOT NULL,
    wallet_address VARCHAR(100) NOT NULL,
    points_amount DECIMAL(15,2) NOT NULL,
    crypto_amount DECIMAL(18,8) NOT NULL,
    exchange_rate DECIMAL(18,8) NOT NULL,
    fee_points DECIMAL(15,2) DEFAULT 0.00,
    fee_crypto DECIMAL(18,8) DEFAULT 0.00000000,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT,
    transaction_hash VARCHAR(100),
    processed_by VARCHAR(50),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_crypto_type (crypto_type),
    INDEX idx_requested (requested_at),
    FOREIGN KEY (user_id) REFERENCES app_users(user_id) ON DELETE CASCADE
);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT FALSE,
    updated_by VARCHAR(50),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_key (config_key)
);

-- 操作日志表
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_username VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(50),
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin (admin_username),
    INDEX idx_action (action),
    INDEX idx_target (target_type, target_id),
    INDEX idx_created (created_at)
);

-- 插入默认管理员账号
INSERT INTO admin_users (username, password_hash, name, email, role) VALUES
('admin', '$2b$10$rOjK.6zKZGFJvz.HqSFrEetGsG5YvJoWTlW8jLCPf8LGh9uEqWFPS', '超级管理员', 'admin@jifenbao.com', 'super_admin'),
('manager', '$2b$10$rOjK.6zKZGFJvz.HqSFrEetGsG5YvJoWTlW8jLCPf8LGh9uEqWFPS', '运营经理', 'manager@jifenbao.com', 'manager'),
('operator', '$2b$10$rOjK.6zKZGFJvz.HqSFrEetGsG5YvJoWTlW8jLCPf8LGh9uEqWFPS', '运营专员', 'operator@jifenbao.com', 'operator');

-- 插入系统配置
INSERT INTO system_config (config_key, config_value, description, category) VALUES
('app_name', '积分宝', '应用名称', 'basic'),
('points_per_video', '1000', '观看视频奖励积分', 'rewards'),
('points_per_download', '5000', '下载应用奖励积分', 'rewards'),
('points_per_game', '2000', '游戏完成奖励积分', 'rewards'),
('daily_signin_bonus', '500', '每日签到奖励积分', 'rewards'),
('referral_bonus', '10000', '推荐好友奖励积分', 'rewards'),
('withdrawal_min_points', '100000', '最低提现积分', 'withdrawal'),
('withdrawal_fee_rate', '0.05', '提现手续费率', 'withdrawal'),
('membership_prices', '{"silver":50000,"gold":100000,"vip":200000,"diamond":500000}', '会员价格配置', 'membership'),
('admob_app_id', 'ca-app-pub-3940256099942544~3347511713', 'AdMob应用ID', 'ads'),
('admob_banner_id', 'ca-app-pub-3940256099942544/6300978111', 'AdMob横幅广告ID', 'ads'),
('admob_interstitial_id', 'ca-app-pub-3940256099942544/1033173712', 'AdMob插页广告ID', 'ads'),
('admob_rewarded_id', 'ca-app-pub-3940256099942544/5224354917', 'AdMob激励视频ID', 'ads'),
('admob_native_id', 'ca-app-pub-3940256099942544/2247696110', 'AdMob原生广告ID', 'ads');

-- 插入示例用户数据
INSERT INTO app_users (user_id, username, email, points_balance, total_earned, membership_level, status) VALUES
('user_001', 'testuser001', 'user001@test.com', 125000, 250000, 'vip', 'active'),
('user_002', 'testuser002', 'user002@test.com', 89000, 180000, 'gold', 'active'),
('user_003', 'testuser003', 'user003@test.com', 45000, 95000, 'silver', 'active'),
('user_004', 'testuser004', 'user004@test.com', 23000, 67000, 'bronze', 'inactive'),
('user_005', 'testuser005', 'user005@test.com', 156000, 320000, 'vip', 'active');

-- 插入示例AdMob收益数据
INSERT INTO admob_revenue (date, ad_unit_id, ad_type, impressions, clicks, revenue, ecpm, ctr, fill_rate, country_code) VALUES
(CURDATE(), 'ca-app-pub-3940256099942544/5224354917', 'rewarded', 78429, 5234, 4523.67, 5.77, 6.67, 92.3, 'CN'),
(CURDATE(), 'ca-app-pub-3940256099942544/1033173712', 'interstitial', 45681, 2843, 2847.23, 6.23, 6.22, 89.5, 'CN'),
(CURDATE(), 'ca-app-pub-3940256099942544/6300978111', 'banner', 156892, 1247, 1234.89, 0.79, 0.79, 95.8, 'CN'),
(CURDATE(), 'ca-app-pub-3940256099942544/2247696110', 'native', 12485, 623, 320.45, 2.57, 4.99, 87.2, 'CN');

-- 创建数据库视图
-- 用户统计视图
CREATE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
    COUNT(CASE WHEN membership_level IN ('vip', 'diamond') THEN 1 END) as vip_users,
    SUM(points_balance) as total_points,
    SUM(total_earned) as total_earned,
    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as daily_new_users
FROM app_users;

-- AdMob收益统计视图
CREATE VIEW admob_stats AS
SELECT 
    DATE(date) as revenue_date,
    SUM(impressions) as total_impressions,
    SUM(clicks) as total_clicks,
    SUM(revenue) as total_revenue,
    AVG(ecpm) as avg_ecpm,
    AVG(ctr) as avg_ctr,
    AVG(fill_rate) as avg_fill_rate
FROM admob_revenue
GROUP BY DATE(date)
ORDER BY revenue_date DESC;

-- 每日积分统计视图
CREATE VIEW daily_points_stats AS
SELECT 
    DATE(created_at) as transaction_date,
    source,
    COUNT(*) as transaction_count,
    SUM(amount) as total_points,
    AVG(amount) as avg_points
FROM points_transactions
WHERE type = 'earn'
GROUP BY DATE(created_at), source
ORDER BY transaction_date DESC;
