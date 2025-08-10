#!/bin/bash

echo "🚀 启动积分宝完整系统（前端+后端+数据库）"
echo "=================================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查依赖
echo -e "${BLUE}🔍 检查系统依赖...${NC}"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未找到${NC}"
    echo "请先安装Node.js: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 检查通过: $(node --version)${NC}"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未找到${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm 检查通过: $(npm --version)${NC}"

# 检查MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL客户端未找到，请确保MySQL服务器正在运行${NC}"
else
    echo -e "${GREEN}✅ MySQL 检查通过${NC}"
fi

# 检查Python3
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 未找到${NC}"
    echo "请先安装Python3"
    exit 1
fi
echo -e "${GREEN}✅ Python3 检查通过: $(python3 --version)${NC}"

echo ""

# 安装后端依赖
echo -e "${BLUE}📦 安装后端依赖...${NC}"
cd backend

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 后端package.json文件不存在${NC}"
    exit 1
fi

# 检查是否已经安装了依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装Node.js依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 后端依赖安装失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ 后端依赖已安装${NC}"
fi

# 创建环境配置文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 创建环境配置文件...${NC}"
    cat > .env << EOF
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jifenbao_system

# JWT配置
JWT_SECRET=jifenbao_super_secret_key_2024_very_secure

# 服务器配置
PORT=3001
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ 环境配置文件创建完成${NC}"
fi

# 创建日志目录
if [ ! -d "logs" ]; then
    mkdir logs
    echo -e "${GREEN}✅ 日志目录创建完成${NC}"
fi

echo ""

# 设置数据库
echo -e "${BLUE}🗄️  设置数据库...${NC}"
echo "正在检查数据库连接..."

node scripts/setup-database.js
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 数据库设置失败${NC}"
    echo ""
    echo -e "${YELLOW}请确保:${NC}"
    echo "1. MySQL服务器正在运行"
    echo "2. root用户可以无密码连接（或修改.env中的密码）"
    echo "3. MySQL监听在默认端口3306"
    echo ""
    echo -e "${BLUE}手动启动MySQL的方法:${NC}"
    echo "macOS: brew services start mysql"
    echo "Ubuntu: sudo service mysql start"
    echo "Windows: net start mysql"
    exit 1
fi

echo ""

# 启动后端服务
echo -e "${BLUE}🔧 启动后端API服务器...${NC}"
echo "API服务器将在端口3001运行"

# 检查端口是否被占用
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  端口3001已被占用，正在尝试关闭...${NC}"
    kill -9 $(lsof -t -i:3001) 2>/dev/null
    sleep 2
fi

# 后台启动API服务器
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# 等待后端启动
echo "等待后端服务启动..."
sleep 5

# 检查后端是否启动成功
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${GREEN}✅ 后端API服务器启动成功${NC}"
else
    echo -e "${RED}❌ 后端API服务器启动失败${NC}"
    echo "请检查logs/backend.log文件获取详细错误信息"
    exit 1
fi

# 返回根目录
cd ..

echo ""

# 启动前端服务器
echo -e "${BLUE}🌐 启动前端Web服务器...${NC}"

# 检查端口是否被占用
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  端口8080已被占用，正在尝试关闭...${NC}"
    kill -9 $(lsof -t -i:8080) 2>/dev/null
    sleep 2
fi

# 后台启动HTTP服务器
python3 -m http.server 8080 > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
sleep 2

echo ""
echo -e "${GREEN}🎉 积分宝系统启动成功！${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}📱 访问地址:${NC}"
echo "   用户端应用: http://localhost:8080/new-demo.html"
echo "   管理后台登录: http://localhost:8080/admin-login.html"
echo "   管理后台系统: http://localhost:8080/admin-dashboard.html"
echo ""
echo -e "${BLUE}🔐 管理员账号:${NC}"
echo "   超级管理员: admin / admin123"
echo "   运营经理: manager / manager123" 
echo "   运营专员: operator / operator123"
echo ""
echo -e "${BLUE}🔧 API服务:${NC}"
echo "   后端API: http://localhost:3001/api"
echo "   健康检查: http://localhost:3001/api/health"
echo ""
echo -e "${BLUE}📊 数据库:${NC}"
echo "   数据库名: jifenbao_system"
echo "   表数量: 15个主要表"
echo "   示例数据: 已初始化"
echo ""
echo -e "${BLUE}📝 日志文件:${NC}"
echo "   后端日志: logs/backend.log"
echo "   前端日志: logs/frontend.log"
echo ""

# 自动打开浏览器
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 正在打开浏览器...${NC}"
    sleep 2
    open http://localhost:8080/admin-login.html
    sleep 1
    open http://localhost:8080/new-demo.html
fi

echo -e "${YELLOW}⚠️  按 Ctrl+C 停止所有服务${NC}"
echo ""

# 创建停止函数
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 正在停止所有服务...${NC}"
    
    # 停止后端
    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo "停止后端服务器..."
        kill $BACKEND_PID
    fi
    
    # 停止前端
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        echo "停止前端服务器..."
        kill $FRONTEND_PID
    fi
    
    # 强制关闭端口占用
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
        kill -9 $(lsof -t -i:3001) 2>/dev/null
    fi
    
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
        kill -9 $(lsof -t -i:8080) 2>/dev/null
    fi
    
    echo -e "${GREEN}✅ 所有服务已停止${NC}"
    exit 0
}

# 注册信号处理
trap cleanup SIGINT SIGTERM

# 监控服务状态
while true; do
    # 检查后端是否还在运行
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ 后端服务器意外停止${NC}"
        echo "查看日志: cat logs/backend.log"
        cleanup
    fi
    
    # 检查前端是否还在运行
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ 前端服务器意外停止${NC}"
        echo "查看日志: cat logs/frontend.log"
        cleanup
    fi
    
    sleep 5
done
