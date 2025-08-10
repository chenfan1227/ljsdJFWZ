# 🔧 Auth0回调URL配置指南

## ❌ 当前问题
**错误**: "Callback URL mismatch. The provided redirect_uri is not in the list of allowed callback URLs."

## ✅ 解决方案

### 1. 登录Auth0控制台
访问: https://manage.auth0.com/
使用您的Auth0账户登录

### 2. 找到您的应用
- 点击左侧菜单 "Applications"
- 找到应用名称对应的应用
- 点击进入应用设置

### 3. 配置回调URL
在 **"Allowed Callback URLs"** 字段中添加以下URL（用逗号分隔）:

```
http://192.168.1.29:8080/app-demo.html,
http://localhost:8080/app-demo.html,
http://192.168.1.29:8080/auth0-debug-fixed.html,
http://localhost:8080/auth0-debug-fixed.html
```

### 4. 配置其他必需URL

**Allowed Web Origins**:
```
http://192.168.1.29:8080,
http://localhost:8080
```

**Allowed Logout URLs**:
```
http://192.168.1.29:8080/app-demo.html,
http://localhost:8080/app-demo.html
```

### 5. 保存设置
点击页面底部的 **"Save Changes"** 按钮

### 6. 验证Google连接
- 点击左侧菜单 "Connections" → "Social"
- 确保 "Google" 连接已启用
- 确保您的应用已关联到Google连接

## 🚀 完成后测试
配置完成后，重新访问:
- http://192.168.1.29:8080/auth0-debug-fixed.html

## 📝 重要提示
- 所有URL必须完全匹配（包括端口号）
- 不要有多余的斜杠
- 确保应用类型设置为 "Single Page Application"
