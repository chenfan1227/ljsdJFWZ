#!/bin/bash

# 积分宝移动应用安装脚本
# 支持 Android 和 iOS 平台

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
echo -e "${PURPLE}"
echo "██████  ██████  █████  ██████  ██    ██ ██ ██      ██████  "
echo "██   ██ ██   ██ ██   ██ ██   ██ ██    ██ ██ ██      ██   ██ "
echo "██████  ██████  ███████ ██████  ██    ██ ██ ██      ██   ██ "
echo "██   ██ ██   ██ ██   ██ ██      ██    ██ ██ ██      ██   ██ "
echo "██████  ██████  ██   ██ ██       ██████  ██ ███████ ██████  "
echo -e "${NC}"
echo -e "${CYAN}🚀 积分宝移动应用构建脚本${NC}"
echo -e "${CYAN}支持 Android & iOS 平台${NC}"
echo "=================================================="
echo ""

# 检查操作系统
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

echo -e "${BLUE}🖥️  检测到操作系统: ${OS_TYPE}${NC}"
echo ""

# 检查必需工具
echo -e "${BLUE}🔍 检查开发环境...${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    echo -e "${YELLOW}请先安装 Node.js: https://nodejs.org/${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION}${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm ${NPM_VERSION}${NC}"

# 检查 yarn (可选)
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    echo -e "${GREEN}✅ yarn ${YARN_VERSION}${NC}"
    PACKAGE_MANAGER="yarn"
else
    echo -e "${YELLOW}⚠️  建议安装 yarn: npm install -g yarn${NC}"
    PACKAGE_MANAGER="npm"
fi

# 检查 React Native CLI
if ! command -v react-native &> /dev/null; then
    echo -e "${YELLOW}⚠️  React Native CLI 未安装，正在安装...${NC}"
    npm install -g @react-native-community/cli
fi
echo -e "${GREEN}✅ React Native CLI${NC}"

# 检查 Android 开发环境
echo ""
echo -e "${BLUE}📱 检查 Android 开发环境...${NC}"

ANDROID_HOME_SET=false
if [[ -n "$ANDROID_HOME" ]]; then
    echo -e "${GREEN}✅ ANDROID_HOME: $ANDROID_HOME${NC}"
    ANDROID_HOME_SET=true
elif [[ -n "$ANDROID_SDK_ROOT" ]]; then
    echo -e "${GREEN}✅ ANDROID_SDK_ROOT: $ANDROID_SDK_ROOT${NC}"
    ANDROID_HOME_SET=true
else
    echo -e "${RED}❌ ANDROID_HOME 未设置${NC}"
    echo -e "${YELLOW}请设置 Android SDK 路径${NC}"
fi

# 检查 Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo -e "${GREEN}✅ Java: ${JAVA_VERSION}${NC}"
else
    echo -e "${RED}❌ Java 未安装${NC}"
    echo -e "${YELLOW}请安装 Java 8 或更高版本${NC}"
fi

# 检查 iOS 开发环境 (仅 macOS)
if [[ "$OS_TYPE" == "macOS" ]]; then
    echo ""
    echo -e "${BLUE}🍎 检查 iOS 开发环境...${NC}"
    
    if command -v xcodebuild &> /dev/null; then
        XCODE_VERSION=$(xcodebuild -version | head -n 1)
        echo -e "${GREEN}✅ ${XCODE_VERSION}${NC}"
    else
        echo -e "${RED}❌ Xcode 未安装${NC}"
        echo -e "${YELLOW}请从 App Store 安装 Xcode${NC}"
    fi
    
    if command -v pod &> /dev/null; then
        POD_VERSION=$(pod --version)
        echo -e "${GREEN}✅ CocoaPods ${POD_VERSION}${NC}"
    else
        echo -e "${YELLOW}⚠️  CocoaPods 未安装，正在安装...${NC}"
        sudo gem install cocoapods
    fi
fi

echo ""
echo -e "${BLUE}📦 安装项目依赖...${NC}"

# 安装 npm 依赖
if [[ "$PACKAGE_MANAGER" == "yarn" ]]; then
    echo "使用 yarn 安装依赖..."
    yarn install
else
    echo "使用 npm 安装依赖..."
    npm install
fi

if [[ $? -ne 0 ]]; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 依赖安装完成${NC}"

# iOS 特定设置
if [[ "$OS_TYPE" == "macOS" ]]; then
    echo ""
    echo -e "${BLUE}🍎 设置 iOS 项目...${NC}"
    
    cd ios
    
    # 安装 CocoaPods 依赖
    echo "安装 CocoaPods 依赖..."
    pod install
    
    if [[ $? -ne 0 ]]; then
        echo -e "${YELLOW}⚠️  Pod install 失败，尝试更新 repo...${NC}"
        pod repo update
        pod install
    fi
    
    cd ..
    echo -e "${GREEN}✅ iOS 项目设置完成${NC}"
fi

# Android 特定设置
echo ""
echo -e "${BLUE}🤖 设置 Android 项目...${NC}"

# 检查 Android 目录
if [[ ! -d "android" ]]; then
    echo -e "${RED}❌ android 目录不存在${NC}"
    exit 1
fi

cd android

# 清理并构建
echo "清理 Android 项目..."
./gradlew clean

echo -e "${GREEN}✅ Android 项目设置完成${NC}"

cd ..

# 创建配置文件
echo ""
echo -e "${BLUE}⚙️  创建配置文件...${NC}"

# 创建 .env 文件
if [[ ! -f ".env" ]]; then
    cat > .env << EOF
# AdMob 配置
ADMOB_APP_ID_ANDROID=ca-app-pub-3940256099942544~3347511713
ADMOB_APP_ID_IOS=ca-app-pub-3940256099942544~1458002511

ADMOB_BANNER_ANDROID=ca-app-pub-3940256099942544/6300978111
ADMOB_BANNER_IOS=ca-app-pub-3940256099942544/2934735716

ADMOB_INTERSTITIAL_ANDROID=ca-app-pub-3940256099942544/1033173712
ADMOB_INTERSTITIAL_IOS=ca-app-pub-3940256099942544/4411468910

ADMOB_REWARDED_ANDROID=ca-app-pub-3940256099942544/5224354917
ADMOB_REWARDED_IOS=ca-app-pub-3940256099942544/1712485313

# API 配置
API_BASE_URL=http://localhost:3001/api
API_TIMEOUT=30000

# 应用配置
APP_NAME=积分宝
APP_VERSION=1.0.0
BUILD_NUMBER=1

# 调试模式
DEBUG_MODE=true
LOG_LEVEL=info
EOF
    echo -e "${GREEN}✅ .env 配置文件已创建${NC}"
fi

# 显示完成信息
echo ""
echo -e "${GREEN}🎉 积分宝移动应用环境配置完成！${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}🚀 开始开发:${NC}"
echo ""

if [[ "$ANDROID_HOME_SET" == true ]]; then
    echo -e "${GREEN}Android 开发:${NC}"
    echo "  npm run android        # 启动 Android 应用"
    echo "  npm run build:android  # 构建 Android APK"
    echo ""
fi

if [[ "$OS_TYPE" == "macOS" ]]; then
    echo -e "${GREEN}iOS 开发:${NC}"
    echo "  npm run ios           # 启动 iOS 模拟器"
    echo "  npm run build:ios     # 构建 iOS 应用"
    echo ""
fi

echo -e "${GREEN}通用命令:${NC}"
echo "  npm start             # 启动 Metro 服务器"
echo "  npm test              # 运行测试"
echo "  npm run lint          # 代码检查"
echo ""

echo -e "${BLUE}📱 功能特性:${NC}"
echo "  ✅ AdMob 广告集成 (横幅、插页、激励视频)"
echo "  ✅ 完整权限管理 (相机、存储、位置等)"
echo "  ✅ 用户认证系统"
echo "  ✅ 积分奖励机制"
echo "  ✅ 游戏集成"
echo "  ✅ 社交分享"
echo "  ✅ 推送通知"
echo "  ✅ 数据持久化"
echo "  ✅ 原生性能优化"
echo ""

echo -e "${YELLOW}⚠️  注意事项:${NC}"
echo "  1. 首次运行需要等待依赖下载"
echo "  2. Android 需要连接设备或启动模拟器"
echo "  3. iOS 需要 Xcode 和开发者账号"
echo "  4. 生产环境请替换 AdMob ID"
echo ""

echo -e "${PURPLE}📞 技术支持:${NC}"
echo "  如遇问题请检查 React Native 官方文档"
echo "  或联系技术支持团队"
echo ""

echo -e "${CYAN}开始您的积分宝应用开发之旅吧！ 🚀${NC}"
