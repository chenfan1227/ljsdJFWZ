# 积分宝管理系统

一个现代化的积分管理和AdMob广告配置系统，包含前端应用和后台管理界面。

## 🚀 功能特性

### 前端应用 (app-demo.html)
- **用户认证**: 支持Auth0登录系统
- **积分系统**: 用户可以通过各种任务获得积分
- **现代化UI**: 采用Apple Design风格的界面设计
- **移动端优化**: 响应式设计，支持移动设备

### 后台管理系统 (admin-dashboard.html)
- **数据概览**: 实时展示用户数据、收益报告和关键指标
- **积分配置**: 管理积分获取规则、任务配置和奖励设置
- **AdMob配置**: 配置移动广告单元和展示策略
- **用户管理**: 查看和管理用户信息
- **系统设置**: 认证管理、安全配置等

### 后端API服务 (mock-server.js)
- **RESTful API**: 完整的后端API接口
- **JWT认证**: 安全的用户认证系统
- **数据模拟**: 内置模拟数据，无需外部数据库
- **CORS支持**: 跨域请求支持

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **UI框架**: Bootstrap 5, Apple Design风格
- **认证**: Auth0
- **后端**: Node.js, Express.js
- **数据**: JSON模拟数据
- **图标**: Apple Design风格的Emoji图标

## 📦 快速开始

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 启动服务
```bash
# 启动后端API服务 (端口3001)
cd backend
node mock-server.js

# 启动前端服务 (端口8080)
python3 -m http.server 8080 --bind 0.0.0.0
```

### 3. 访问应用
- 前端应用: http://localhost:8080/app-demo.html
- 后台管理: http://localhost:8080/admin-dashboard.html
- 登录界面: http://localhost:8080/admin-login-simple.html

## 🔐 默认账号

### 后台管理员账号
- **超级管理员**: admin / admin123
- **系统管理员**: manager / manager123
- **运营专员**: operator / operator123

## 📱 界面特色

### Apple Design风格
- **简洁图标**: 使用Apple风格的emoji图标
- **现代布局**: 清晰的卡片式布局
- **一致性**: 统一的设计语言和交互体验
- **响应式**: 适配各种屏幕尺寸

### 核心功能
- **积分任务管理**: 支持CRUD操作、排序、统计
- **AdMob广告配置**: 完整的广告单元配置
- **实时数据**: 动态图表和统计信息
- **用户体验**: 骨架屏加载、平滑动画

## 🔧 开发说明

### 项目结构
```
web3/
├── admin-dashboard.html      # 后台管理界面
├── admin-login-simple.html  # 登录界面
├── app-demo.html            # 前端应用
├── backend/
│   ├── mock-server.js       # 后端API服务
│   └── package.json         # 依赖配置
├── README.md               # 项目说明
└── .gitignore             # Git忽略文件
```

### API接口
- `GET /api/admin/dashboard` - 获取仪表板数据
- `GET/POST/PUT/DELETE /api/admin/points/config` - 积分配置管理
- `GET/PUT /api/admin/admob/config` - AdMob配置管理
- `POST /api/admin/login` - 管理员登录
- `GET /api/app/points/config` - 获取前端积分配置
- `GET /api/app/admob/config` - 获取前端广告配置

## 🎨 设计理念

本项目采用Apple Design的设计哲学，追求简洁、直观和高效的用户体验：

- **极简主义**: 去除不必要的装饰，专注核心功能
- **直观操作**: 所见即所得的交互设计
- **一致性**: 统一的视觉语言和交互模式
- **可访问性**: 良好的可读性和易用性

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📞 联系

如有问题或建议，请联系项目维护者。