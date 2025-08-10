#!/bin/bash

# 积分宝系统 - 统一启动脚本
# 支持 Web 版本和移动应用版本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 显示标题
clear
echo -e "${PURPLE}"
echo "  ██████  ██████  █████  ██████  ██    ██ ██ ██      ██████   "
echo "  ██   ██ ██   ██ ██   ██ ██   ██ ██    ██ ██ ██      ██   ██  "
echo "  ██████  ██████  ███████ ██████  ██    ██ ██ ██      ██   ██  "
echo "  ██   ██ ██   ██ ██   ██ ██      ██    ██ ██ ██      ██   ██  "
echo "  ██████  ██████  ██   ██ ██       ██████  ██ ███████ ██████   "
echo -e "${NC}"
echo -e "${CYAN}💎 积分宝 - Web3积分奖励系统${NC}"
echo -e "${CYAN}🚀 统一启动脚本${NC}"
echo "========================================================="
echo ""

# 检测操作系统
OS_TYPE=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS_TYPE="macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS_TYPE="Linux"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS_TYPE="Windows"
else
    OS_TYPE="Unknown"
fi

echo -e "${BLUE}🖥️  操作系统: ${OS_TYPE}${NC}"
echo ""

# 显示菜单
show_menu() {
    echo -e "${YELLOW}请选择要启动的版本:${NC}"
    echo ""
    echo -e "${GREEN}1.${NC} 🌐 Web版本 (浏览器)"
    echo -e "   • 前端演示界面"
    echo -e "   • 管理后台系统"
    echo -e "   • Node.js API服务器"
    echo -e "   • MySQL数据库"
    echo ""
    echo -e "${GREEN}2.${NC} 📱 移动应用版本 (React Native)"
    echo -e "   • Android应用"
    echo -e "   • iOS应用 (仅macOS)"
    echo -e "   • 原生AdMob集成"
    echo -e "   • 完整权限管理"
    echo ""
    echo -e "${GREEN}3.${NC} 🔧 开发环境设置"
    echo -e "   • 安装所有依赖"
    echo -e "   • 配置开发环境"
    echo -e "   • 数据库初始化"
    echo ""
    echo -e "${GREEN}4.${NC} 📊 项目信息"
    echo -e "   • 查看项目状态"
    echo -e "   • 技术栈信息"
    echo -e "   • 功能列表"
    echo ""
    echo -e "${GREEN}0.${NC} 🚪 退出"
    echo ""
}

# 启动Web版本
start_web_version() {
    echo -e "${BLUE}🌐 启动Web版本...${NC}"
    echo ""
    
    if [[ -f "./start-full.sh" ]]; then
        echo -e "${GREEN}✅ 检测到完整版启动脚本${NC}"
        echo -e "${YELLOW}将启动：前端 + 后端 + 数据库${NC}"
        echo ""
        read -p "确认启动? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            chmod +x start-full.sh
            ./start-full.sh
        fi
    elif [[ -f "./start.sh" ]]; then
        echo -e "${GREEN}✅ 检测到简化版启动脚本${NC}"
        echo -e "${YELLOW}将启动：前端演示界面${NC}"
        echo ""
        read -p "确认启动? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            chmod +x start.sh
            ./start.sh
        fi
    else
        echo -e "${RED}❌ 未找到Web版本启动脚本${NC}"
        echo -e "${YELLOW}请确保您在正确的项目目录中${NC}"
    fi
}

# 启动移动应用版本
start_mobile_version() {
    echo -e "${BLUE}📱 启动移动应用版本...${NC}"
    echo ""
    
    if [[ ! -d "./mobile" ]]; then
        echo -e "${RED}❌ 未找到mobile目录${NC}"
        echo -e "${YELLOW}请确保移动应用代码已正确生成${NC}"
        return
    fi
    
    cd mobile
    
    if [[ -f "./setup-mobile.sh" ]]; then
        echo -e "${GREEN}✅ 检测到移动应用设置脚本${NC}"
        echo -e "${YELLOW}将执行：环境检查 + 依赖安装 + 应用启动${NC}"
        echo ""
        
        # 显示平台选择
        echo -e "${CYAN}请选择目标平台:${NC}"
        echo "1. 🤖 Android"
        if [[ "$OS_TYPE" == "macOS" ]]; then
            echo "2. 🍎 iOS"
            echo "3. 🔄 Both (Android + iOS)"
        fi
        echo "0. 🔙 返回"
        echo ""
        
        read -p "请输入选择 (0-3): " platform_choice
        
        case $platform_choice in
            1)
                echo -e "${GREEN}启动Android版本...${NC}"
                chmod +x setup-mobile.sh
                ./setup-mobile.sh
                if [[ $? -eq 0 ]]; then
                    echo ""
                    echo -e "${CYAN}Android环境准备完成，现在启动应用...${NC}"
                    npm run android
                fi
                ;;
            2)
                if [[ "$OS_TYPE" == "macOS" ]]; then
                    echo -e "${GREEN}启动iOS版本...${NC}"
                    chmod +x setup-mobile.sh
                    ./setup-mobile.sh
                    if [[ $? -eq 0 ]]; then
                        echo ""
                        echo -e "${CYAN}iOS环境准备完成，现在启动应用...${NC}"
                        npm run ios
                    fi
                else
                    echo -e "${RED}❌ iOS开发仅支持macOS系统${NC}"
                fi
                ;;
            3)
                if [[ "$OS_TYPE" == "macOS" ]]; then
                    echo -e "${GREEN}准备Android和iOS环境...${NC}"
                    chmod +x setup-mobile.sh
                    ./setup-mobile.sh
                    echo ""
                    echo -e "${CYAN}环境准备完成！${NC}"
                    echo -e "${YELLOW}请手动运行：${NC}"
                    echo "  npm run android  # Android"
                    echo "  npm run ios      # iOS"
                else
                    echo -e "${RED}❌ iOS开发仅支持macOS系统${NC}"
                    echo -e "${YELLOW}将只准备Android环境...${NC}"
                    chmod +x setup-mobile.sh
                    ./setup-mobile.sh
                fi
                ;;
            0)
                echo -e "${YELLOW}返回主菜单...${NC}"
                ;;
            *)
                echo -e "${RED}❌ 无效选择${NC}"
                ;;
        esac
    else
        echo -e "${RED}❌ 未找到移动应用设置脚本${NC}"
        echo -e "${YELLOW}尝试手动安装依赖...${NC}"
        
        if [[ -f "package.json" ]]; then
            npm install
            echo ""
            echo -e "${CYAN}依赖安装完成，请选择启动平台：${NC}"
            echo "1. npm run android"
            echo "2. npm run ios (仅macOS)"
        fi
    fi
    
    cd ..
}

# 设置开发环境
setup_development() {
    echo -e "${BLUE}🔧 设置开发环境...${NC}"
    echo ""
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js 未安装${NC}"
        echo -e "${YELLOW}请先安装 Node.js: https://nodejs.org/${NC}"
        return
    fi
    
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    
    # 检查npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm 未安装${NC}"
        return
    fi
    
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
    
    # 安装Web项目依赖
    echo ""
    echo -e "${CYAN}📦 安装Web项目依赖...${NC}"
    if [[ -f "package.json" ]]; then
        npm install
        echo -e "${GREEN}✅ Web项目依赖安装完成${NC}"
    fi
    
    # 安装后端依赖
    if [[ -d "backend" && -f "backend/package.json" ]]; then
        echo -e "${CYAN}📦 安装后端依赖...${NC}"
        cd backend
        npm install
        cd ..
        echo -e "${GREEN}✅ 后端依赖安装完成${NC}"
    fi
    
    # 安装移动应用依赖
    if [[ -d "mobile" && -f "mobile/package.json" ]]; then
        echo -e "${CYAN}📦 安装移动应用依赖...${NC}"
        cd mobile
        npm install
        
        # iOS CocoaPods
        if [[ "$OS_TYPE" == "macOS" && -f "ios/Podfile" ]]; then
            echo -e "${CYAN}📦 安装iOS CocoaPods依赖...${NC}"
            cd ios
            pod install
            cd ..
        fi
        
        cd ..
        echo -e "${GREEN}✅ 移动应用依赖安装完成${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 开发环境设置完成！${NC}"
    echo ""
    echo -e "${YELLOW}接下来您可以：${NC}"
    echo "1. 启动Web版本进行演示"
    echo "2. 启动移动应用进行开发"
    echo "3. 查看项目文档和说明"
}

# 显示项目信息
show_project_info() {
    echo -e "${BLUE}📊 积分宝项目信息${NC}"
    echo "========================================="
    echo ""
    
    echo -e "${CYAN}🏗️ 项目架构:${NC}"
    echo "  📁 根目录 - Web版本和后端API"
    echo "  📁 mobile/ - React Native移动应用"
    echo "  📁 backend/ - Node.js API服务器"
    echo "  📁 database/ - MySQL数据库结构"
    echo ""
    
    echo -e "${CYAN}🌐 Web版本功能:${NC}"
    echo "  ✅ 用户端界面 (参照UI设计)"
    echo "  ✅ Roblox风格游戏界面"
    echo "  ✅ 管理员登录系统"
    echo "  ✅ 后台管理面板"
    echo "  ✅ AdMob收益分析"
    echo "  ✅ 用户管理系统"
    echo "  ✅ MySQL数据库集成"
    echo ""
    
    echo -e "${CYAN}📱 移动应用功能:${NC}"
    echo "  ✅ Android & iOS 支持"
    echo "  ✅ 完整权限管理 (相机、存储、位置等)"
    echo "  ✅ 原生AdMob集成 (横幅、插页、激励视频)"
    echo "  ✅ 用户认证系统"
    echo "  ✅ 积分奖励机制"
    echo "  ✅ 游戏集成"
    echo "  ✅ 社交分享功能"
    echo "  ✅ 推送通知"
    echo "  ✅ 数据持久化"
    echo ""
    
    echo -e "${CYAN}🔧 技术栈:${NC}"
    echo "  • 前端: HTML5, CSS3, JavaScript"
    echo "  • 移动端: React Native 0.72.6"
    echo "  • 后端: Node.js + Express"
    echo "  • 数据库: MySQL 8.0+"
    echo "  • 广告: Google AdMob"
    echo "  • 认证: JWT"
    echo "  • 权限: react-native-permissions"
    echo ""
    
    echo -e "${CYAN}📞 访问地址:${NC}"
    echo "  🌐 用户端: http://localhost:8080/new-demo.html"
    echo "  🔐 管理登录: http://localhost:8080/admin-login.html"
    echo "  🔧 管理后台: http://localhost:8080/admin-dashboard.html"
    echo "  🔌 API服务: http://localhost:3001/api"
    echo ""
    
    echo -e "${CYAN}🔐 默认账号:${NC}"
    echo "  管理员: admin / admin123"
    echo "  经理: manager / manager123"
    echo "  专员: operator / operator123"
    echo ""
    
    # 检查文件存在性
    echo -e "${CYAN}📁 文件检查:${NC}"
    
    files_to_check=(
        "./start-full.sh:完整启动脚本"
        "./start.sh:简化启动脚本"
        "./admin-login.html:管理员登录"
        "./admin-dashboard.html:管理后台"
        "./new-demo.html:用户端界面"
        "./backend/server.js:后端API服务器"
        "./backend/package.json:后端配置"
        "./database/schema.sql:数据库结构"
        "./mobile/package.json:移动应用配置"
        "./mobile/App.tsx:移动应用主组件"
        "./mobile/README.md:移动应用文档"
    )
    
    for file_info in "${files_to_check[@]}"; do
        IFS=':' read -r file desc <<< "$file_info"
        if [[ -f "$file" ]]; then
            echo -e "  ${GREEN}✅${NC} $desc"
        else
            echo -e "  ${RED}❌${NC} $desc"
        fi
    done
    
    echo ""
}

# 主循环
while true; do
    show_menu
    read -p "请输入您的选择 (0-4): " choice
    echo ""
    
    case $choice in
        1)
            start_web_version
            ;;
        2)
            start_mobile_version
            ;;
        3)
            setup_development
            ;;
        4)
            show_project_info
            ;;
        0)
            echo -e "${GREEN}感谢使用积分宝系统！${NC}"
            echo -e "${CYAN}祝您开发愉快！ 🚀${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ 无效选择，请输入 0-4${NC}"
            ;;
    esac
    
    echo ""
    read -p "按Enter键继续..." -r
    clear
done
