#!/bin/bash

echo "🚀 启动积分宝系统..."
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未找到，请先安装Python3"
    exit 1
fi

echo "✅ Python3 检查通过"

# 启动HTTP服务器
echo "🌐 启动Web服务器在端口8080..."
python3 -m http.server 8080 &
SERVER_PID=$!

# 等待服务器启动
sleep 2

echo ""
echo "🎉 积分宝系统启动成功！"
echo ""
echo "📱 前端用户界面:"
echo "   http://localhost:8080/new-demo.html"
echo ""
echo "🔧 管理后台系统:"
echo "   http://localhost:8080/admin.html"
echo ""
echo "📋 完整功能说明:"
echo "   http://localhost:8080/FEATURES.md"
echo ""
echo "⚠️  按 Ctrl+C 停止服务器"
echo ""

# 自动打开浏览器
if command -v open &> /dev/null; then
    echo "🌐 正在打开浏览器..."
    open http://localhost:8080/new-demo.html
    sleep 1
    open http://localhost:8080/admin.html
fi

# 等待用户停止
wait $SERVER_PID
