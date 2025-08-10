# Auth0 集成设置指南

## 🔧 Auth0 应用配置

### 1. 创建Auth0应用

1. 登录 [Auth0管理控制台](https://manage.auth0.com/)
2. 点击 "Applications" → "Create Application"
3. 选择 "Single Page Application (SPA)"
4. 记录以下信息：
   - **Domain**: `your-domain.auth0.com`
   - **Client ID**: `your-client-id`

### 2. 配置应用设置

在Auth0应用设置中配置：

**Allowed Callback URLs:**
```
http://localhost:8080/app-demo.html
http://192.168.1.29:8080/app-demo.html
https://your-domain.com/app-demo.html
```

**Allowed Web Origins:**
```
http://localhost:8080
http://192.168.1.29:8080
https://your-domain.com
```

**Allowed Logout URLs:**
```
http://localhost:8080/app-demo.html
http://192.168.1.29:8080/app-demo.html
https://your-domain.com/app-demo.html
```

### 3. 启用社交登录

在Auth0控制台中启用以下连接：

1. **Google Social Connection**
   - 获取Google OAuth2 客户端ID和密钥
   - 在Auth0中配置Google连接

2. **Apple Social Connection**
   - 配置Apple Sign In
   - 设置Apple开发者账号相关信息

### 4. 更新应用配置

在 `app-demo.html` 中更新Auth0配置：

```javascript
const auth0Config = {
    domain: 'your-actual-domain.auth0.com',     // 替换为您的Auth0域名
    clientId: 'your-actual-client-id',          // 替换为您的客户端ID
    redirectUri: window.location.origin + '/app-demo.html',
    responseType: 'token id_token',
    scope: 'openid profile email'
};
```

## 🔄 集成功能

### 前端功能
- ✅ Google登录 (通过Auth0)
- ✅ Apple登录 (通过Auth0)
- ✅ 用户信息获取
- ✅ 自动登录状态维护
- ✅ 安全退出登录

### 后端功能
- ✅ Auth0 JWT验证
- ✅ 用户信息同步
- ✅ 积分系统集成
- ✅ 新用户自动注册

## 🧪 测试说明

当前版本使用模拟的Auth0响应进行测试：

1. 点击任何登录按钮将触发Auth0流程
2. 在真实环境中将跳转到Auth0登录页面
3. 登录成功后返回应用并同步用户信息
4. 新用户自动获得10000积分奖励

## 🚀 部署建议

1. **生产环境**: 配置真实的Auth0应用
2. **开发环境**: 使用Auth0的开发环境配置
3. **JWT验证**: 在生产环境中实现真实的JWT验证
4. **HTTPS**: 生产环境必须使用HTTPS

## 📋 下一步

1. 在Auth0控制台中创建应用
2. 配置社交登录提供商
3. 更新应用中的Auth0配置
4. 测试完整的登录流程
5. 部署到生产环境
