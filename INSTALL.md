# 🚀 积分宝系统安装指南

## 📋 系统要求

### 必需软件
- **Node.js** v16+ (推荐v18+)
- **MySQL** v8.0+ 
- **Python3** v3.7+
- **Git** (用于克隆仓库)

### 操作系统支持
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+
- ✅ Windows 10+
- ✅ CentOS 7+

## 🔧 快速安装

### 1. 安装依赖软件

#### macOS (使用Homebrew)
```bash
# 安装Homebrew (如果还没安装)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装依赖
brew install node mysql python3 git
brew services start mysql
```

#### Ubuntu/Debian
```bash
# 更新包列表
sudo apt update

# 安装依赖
sudo apt install nodejs npm mysql-server python3 git

# 启动MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Windows
1. 下载安装 [Node.js](https://nodejs.org/)
2. 下载安装 [MySQL](https://dev.mysql.com/downloads/installer/)
3. 安装 [Python3](https://www.python.org/downloads/)
4. 安装 [Git](https://git-scm.com/downloads)

### 2. 配置MySQL

#### 创建数据库用户（可选）
```sql
-- 登录MySQL
mysql -u root -p

-- 创建专用用户（可选，也可以直接使用root）
CREATE USER 'jifenbao'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON jifenbao_system.* TO 'jifenbao'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. 启动系统

#### 一键启动（推荐）
```bash
# 给脚本执行权限
chmod +x start-full.sh

# 启动完整系统
./start-full.sh
```

#### 手动启动
```bash
# 1. 安装后端依赖
cd backend
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑.env文件，设置数据库密码等

# 3. 设置数据库
node scripts/setup-database.js

# 4. 启动后端API
npm start &

# 5. 返回根目录启动前端
cd ..
python3 -m http.server 8080 &
```

## 🌐 访问系统

### 前端应用
- **用户端**: http://localhost:8080/new-demo.html
- **管理登录**: http://localhost:8080/admin-login.html
- **管理后台**: http://localhost:8080/admin-dashboard.html

### 后端API
- **API基地址**: http://localhost:3001/api
- **健康检查**: http://localhost:3001/api/health

## 🔐 默认账号

### 管理员账号
| 用户名 | 密码 | 角色 | 权限 |
|--------|------|------|------|
| admin | admin123 | 超级管理员 | 全部权限 |
| manager | manager123 | 运营经理 | 管理权限 |
| operator | operator123 | 运营专员 | 基础权限 |

### 测试用户
系统会自动创建5个测试用户账号，用于演示用户管理功能。

## 📊 数据库结构

### 主要表结构
- **admin_users** - 管理员用户表
- **app_users** - 应用用户表  
- **points_transactions** - 积分交易记录
- **admob_revenue** - AdMob收益数据
- **game_sessions** - 游戏会话记录
- **ad_views** - 广告观看记录
- **download_tasks** - 下载任务表
- **lottery_events** - 抽奖活动表
- **membership_subscriptions** - 会员订阅
- **withdrawal_requests** - 提现请求
- **system_config** - 系统配置
- **admin_logs** - 操作日志

### 统计视图
- **user_stats** - 用户统计视图
- **admob_stats** - AdMob统计视图  
- **daily_points_stats** - 每日积分统计

## 🛠️ 故障排除

### 常见问题

#### 1. MySQL连接失败
```bash
# 检查MySQL是否运行
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# 重启MySQL
sudo systemctl restart mysql  # Linux
brew services restart mysql  # macOS
```

#### 2. 端口被占用
```bash
# 查看端口占用
lsof -i :3001  # 后端端口
lsof -i :8080  # 前端端口

# 强制关闭进程
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:8080)
```

#### 3. Node.js依赖安装失败
```bash
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 4. 权限问题
```bash
# macOS/Linux给脚本执行权限
chmod +x start-full.sh

# 如果MySQL权限不足
sudo mysql -u root -p
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 查看日志
```bash
# 后端日志
tail -f logs/backend.log

# 前端日志  
tail -f logs/frontend.log

# MySQL错误日志
sudo tail -f /var/log/mysql/error.log  # Linux
tail -f /usr/local/var/mysql/*.err     # macOS
```

## 🔄 更新系统

### 获取最新代码
```bash
git pull origin main
cd backend
npm install  # 更新依赖
node scripts/setup-database.js  # 更新数据库
```

### 重启服务
```bash
# 停止所有服务 (Ctrl+C)
# 重新启动
./start-full.sh
```

## 📞 技术支持

如遇到安装问题，请：

1. 检查上述故障排除步骤
2. 查看系统日志文件
3. 确认所有依赖软件版本正确
4. 联系技术支持团队

---

## 🎯 下一步

安装完成后，您可以：

1. 🎮 体验用户端的积分赚取功能
2. 🔧 登录管理后台查看数据统计
3. 📊 查看AdMob收益分析
4. 👥 管理用户和系统配置
5. 💰 监控收益和用户增长

**祝您使用愉快！** 🎉
