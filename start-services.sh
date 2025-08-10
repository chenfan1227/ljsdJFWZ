#!/bin/bash

echo "🚀 启动积分宝管理系统服务..."
echo ""

# 停止现有进程
echo "🔄 清理现有进程..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# 启动前端服务
echo "📱 启动前端HTTP服务器 (端口8080)..."
python3 -m http.server 8080 --bind 0.0.0.0 &
FRONTEND_PID=$!

# 启动后端服务
echo "⚙️  启动后端API服务器 (端口3001)..."
cd backend
node mock-server.js &
BACKEND_PID=$!
cd ..

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "🔍 检查服务状态..."

# 检查前端
if curl -s -I http://localhost:8080/ | grep -q "200 OK"; then
    echo "✅ 前端服务: 正常运行 (端口8080)"
else
    echo "❌ 前端服务: 启动失败"
fi

# 检查后端
if curl -s http://localhost:3001/api/health | grep -q "OK"; then
    echo "✅ 后端服务: 正常运行 (端口3001)"
else
    echo "❌ 后端服务: 启动失败"
fi

echo ""
echo "🌐 访问地址:"
echo "• 管理后台: http://192.168.1.29:8080/admin-dashboard.html"
echo "• 快速修复: http://192.168.1.29:8080/admin-quick-fix.html"
echo "• 用户App: http://192.168.1.29:8080/app-demo.html"
echo ""
echo "🔑 默认登录信息:"
echo "• 用户名: admin"
echo "• 密码: admin123"
echo ""
echo "💡 使用 'ps aux | grep -E \"python|node\"' 查看进程"
echo "💡 使用 'kill $FRONTEND_PID $BACKEND_PID' 停止服务"
echo ""
echo "🎉 所有服务启动完成！"


echo "🚀 启动积分宝管理系统服务..."
echo ""

# 停止现有进程
echo "🔄 清理现有进程..."
lsof -ti:8080 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# 启动前端服务
echo "📱 启动前端HTTP服务器 (端口8080)..."
python3 -m http.server 8080 --bind 0.0.0.0 &
FRONTEND_PID=$!

# 启动后端服务
echo "⚙️  启动后端API服务器 (端口3001)..."
cd backend
node mock-server.js &
BACKEND_PID=$!
cd ..

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo "🔍 检查服务状态..."

# 检查前端
if curl -s -I http://localhost:8080/ | grep -q "200 OK"; then
    echo "✅ 前端服务: 正常运行 (端口8080)"
else
    echo "❌ 前端服务: 启动失败"
fi

# 检查后端
if curl -s http://localhost:3001/api/health | grep -q "OK"; then
    echo "✅ 后端服务: 正常运行 (端口3001)"
else
    echo "❌ 后端服务: 启动失败"
fi

echo ""
echo "🌐 访问地址:"
echo "• 管理后台: http://192.168.1.29:8080/admin-dashboard.html"
echo "• 快速修复: http://192.168.1.29:8080/admin-quick-fix.html"
echo "• 用户App: http://192.168.1.29:8080/app-demo.html"
echo ""
echo "🔑 默认登录信息:"
echo "• 用户名: admin"
echo "• 密码: admin123"
echo ""
echo "💡 使用 'ps aux | grep -E \"python|node\"' 查看进程"
echo "💡 使用 'kill $FRONTEND_PID $BACKEND_PID' 停止服务"
echo ""
echo "🎉 所有服务启动完成！"
