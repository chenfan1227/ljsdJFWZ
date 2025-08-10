# 💎 积分宝移动应用 - React Native

[![React Native](https://img.shields.io/badge/React%20Native-0.72.6-blue.svg)](https://reactnative.dev/)
[![Android](https://img.shields.io/badge/Android-API%2021+-green.svg)](https://developer.android.com/)
[![iOS](https://img.shields.io/badge/iOS-11.0+-lightgrey.svg)](https://developer.apple.com/ios/)
[![AdMob](https://img.shields.io/badge/AdMob-22.4.0-orange.svg)](https://admob.google.com/)

一个功能完整的移动端积分奖励应用，支持Android和iOS平台，集成了所有必要的原生功能和权限。

## 🚀 快速开始

### 环境要求

- **Node.js** v16+ (推荐 v18+)
- **React Native CLI** 
- **Android Studio** (Android 开发)
- **Xcode** (iOS 开发，仅 macOS)
- **CocoaPods** (iOS 依赖管理)

### 一键安装

```bash
# 克隆项目
git clone <repository-url>
cd mobile

# 运行安装脚本
chmod +x setup-mobile.sh
./setup-mobile.sh
```

### 手动安装

```bash
# 安装依赖
npm install
# 或
yarn install

# iOS 特定设置 (仅 macOS)
cd ios && pod install && cd ..

# Android 清理构建
cd android && ./gradlew clean && cd ..
```

## 📱 运行应用

### Android

```bash
# 启动 Metro 服务器
npm start

# 在另一个终端运行 Android
npm run android

# 或者直接运行
npx react-native run-android
```

### iOS (仅 macOS)

```bash
# 启动 Metro 服务器
npm start

# 在另一个终端运行 iOS
npm run ios

# 或者直接运行
npx react-native run-ios
```

## 🏗️ 项目架构

```
mobile/
├── android/                 # Android 原生代码
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   └── ...
│   │   └── build.gradle
│   └── ...
├── ios/                     # iOS 原生代码
│   ├── JifenbaoMobile/
│   │   ├── Info.plist
│   │   └── ...
│   ├── Podfile
│   └── ...
├── src/                     # React Native 源码
│   ├── components/          # 可复用组件
│   ├── screens/            # 页面组件
│   ├── utils/              # 工具类
│   │   ├── PermissionManager.ts
│   │   ├── AdMobManager.ts
│   │   └── ...
│   ├── services/           # 服务层
│   └── types/              # TypeScript 类型
├── App.tsx                 # 应用根组件
├── index.js               # 应用入口
├── package.json           # 项目配置
└── metro.config.js        # Metro 配置
```

## 🔐 权限管理

### Android 权限 (AndroidManifest.xml)

应用已配置所有常用权限：

#### 📸 **媒体权限**
- `CAMERA` - 相机访问
- `RECORD_AUDIO` - 录音
- `READ_EXTERNAL_STORAGE` - 读取存储
- `WRITE_EXTERNAL_STORAGE` - 写入存储
- `READ_MEDIA_IMAGES` - 读取图片 (Android 13+)
- `READ_MEDIA_VIDEO` - 读取视频 (Android 13+)
- `READ_MEDIA_AUDIO` - 读取音频 (Android 13+)

#### 🌍 **位置权限**
- `ACCESS_FINE_LOCATION` - 精确位置
- `ACCESS_COARSE_LOCATION` - 大概位置
- `ACCESS_BACKGROUND_LOCATION` - 后台位置

#### 👥 **联系人和社交**
- `READ_CONTACTS` - 读取联系人
- `WRITE_CONTACTS` - 写入联系人
- `GET_ACCOUNTS` - 获取账户信息

#### 📞 **通信权限**
- `READ_PHONE_STATE` - 读取电话状态
- `CALL_PHONE` - 拨打电话
- `SEND_SMS` - 发送短信
- `RECEIVE_SMS` - 接收短信
- `READ_SMS` - 读取短信

#### 🔵 **蓝牙权限**
- `BLUETOOTH_CONNECT` - 蓝牙连接
- `BLUETOOTH_SCAN` - 蓝牙扫描
- `BLUETOOTH_ADVERTISE` - 蓝牙广播

#### 🌐 **网络权限**
- `INTERNET` - 网络访问
- `ACCESS_NETWORK_STATE` - 网络状态
- `ACCESS_WIFI_STATE` - WiFi 状态
- `CHANGE_WIFI_STATE` - 修改 WiFi 状态

#### ⚙️ **系统权限**
- `WAKE_LOCK` - 保持唤醒
- `VIBRATE` - 震动
- `SYSTEM_ALERT_WINDOW` - 悬浮窗
- `FOREGROUND_SERVICE` - 前台服务
- `POST_NOTIFICATIONS` - 通知权限
- `PACKAGE_USAGE_STATS` - 应用使用统计

### iOS 权限 (Info.plist)

#### 📸 **媒体权限**
- `NSCameraUsageDescription` - 相机使用说明
- `NSPhotoLibraryUsageDescription` - 相册访问说明
- `NSPhotoLibraryAddUsageDescription` - 相册添加说明
- `NSMicrophoneUsageDescription` - 麦克风使用说明

#### 🌍 **位置权限**
- `NSLocationWhenInUseUsageDescription` - 使用时位置
- `NSLocationAlwaysAndWhenInUseUsageDescription` - 始终位置
- `NSLocationAlwaysUsageDescription` - 后台位置

#### 👥 **联系人和社交**
- `NSContactsUsageDescription` - 联系人访问
- `NSCalendarsUsageDescription` - 日历访问
- `NSRemindersUsageDescription` - 提醒事项

#### 🏃 **健康和运动**
- `NSMotionUsageDescription` - 运动数据
- `NSHealthUpdateUsageDescription` - 健康数据更新
- `NSHealthShareUsageDescription` - 健康数据共享

#### 🎤 **语音和AI**
- `NSSpeechRecognitionUsageDescription` - 语音识别
- `NSSiriUsageDescription` - Siri 集成

#### 🔵 **蓝牙和设备**
- `NSBluetoothAlwaysUsageDescription` - 蓝牙使用
- `NSBluetoothPeripheralUsageDescription` - 蓝牙外设

#### 🔒 **隐私和安全**
- `NSFaceIDUsageDescription` - Face ID 使用
- `NSUserTrackingUsageDescription` - 用户跟踪 (iOS 14.5+)

## 📺 AdMob 集成

### 配置信息

```javascript
// 生产环境 AdMob ID
const ADMOB_CONFIG = {
  // 应用 ID
  appId: {
    android: 'ca-app-pub-3940256099942544~3347511713',
    ios: 'ca-app-pub-3940256099942544~1458002511'
  },
  
  // 广告单元 ID
  banner: {
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716'
  },
  
  interstitial: {
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910'
  },
  
  rewarded: {
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313'
  },
  
  native: {
    android: 'ca-app-pub-3940256099942544/2247696110',
    ios: 'ca-app-pub-3940256099942544/3986624511'
  }
};
```

### 广告类型

#### 🎯 **横幅广告 (Banner)**
- 固定显示在屏幕底部
- 不影响用户操作
- 持续展示

#### 📱 **插页广告 (Interstitial)**
- 全屏展示
- 在自然切换点显示
- 智能频率控制 (30秒冷却)

#### 💰 **激励视频广告 (Rewarded)**
- 用户主动观看
- 观看完成给予积分奖励
- 高用户参与度

#### 📰 **原生广告 (Native)**
- 融入应用界面
- 自然的用户体验
- 高点击率

#### 🚀 **开屏广告 (App Open)**
- 应用启动时展示
- 快速加载
- 良好的用户体验

### 使用示例

```typescript
import { AdMobManager } from '@/utils/AdMobManager';

// 初始化 AdMob
await AdMobManager.getInstance().initialize();

// 显示激励视频广告
await AdMobManager.getInstance().showRewardedAdWithReward(
  (reward) => {
    console.log('用户获得奖励:', reward);
    // 给用户发放积分
  },
  (error) => {
    console.error('广告加载失败:', error);
  }
);

// 显示插页广告
await AdMobManager.getInstance().showInterstitialAdSmart();
```

## 🛠️ 核心功能

### 🔐 **权限管理系统**

```typescript
import { PermissionManager } from '@/utils/PermissionManager';

// 请求相机权限
const cameraResult = await PermissionManager.requestCameraPermission();

// 批量请求权限
const results = await PermissionManager.requestAllBasicPermissions();

// 带说明的权限请求
const granted = await PermissionManager.checkAndRequestPermissionWithAlert(
  PERMISSIONS.ANDROID.CAMERA,
  '相机权限',
  '我们需要相机权限来拍摄照片'
);
```

### 💾 **数据存储管理**

```typescript
import { StorageManager } from '@/utils/StorageManager';

// 存储数据
await StorageManager.setItem('userData', userInfo);

// 读取数据
const userData = await StorageManager.getItem('userData');

// 移除数据
await StorageManager.removeItem('authToken');
```

### 🌐 **API 客户端**

```typescript
import { APIClient } from '@/utils/APIClient';

// 初始化
APIClient.initialize();

// 发起请求
const response = await APIClient.get('/api/user/profile');
const result = await APIClient.post('/api/points/earn', { amount: 1000 });
```

### 🎮 **游戏集成**

- Roblox 风格的游戏界面
- 多种游戏类型支持
- 游戏完成奖励机制
- 广告观看额外奖励

### 🎁 **积分奖励系统**

- 观看视频获得积分
- 下载应用获得奖励
- 每日签到奖励
- 邀请好友奖励
- 游戏完成奖励

## 📦 构建和发布

### Android 构建

```bash
# 调试版本
npm run build:android

# 生产版本
cd android
./gradlew assembleRelease

# 生成 AAB (推荐)
./gradlew bundleRelease
```

### iOS 构建

```bash
# 调试版本
npm run build:ios

# 生产版本 (需要在 Xcode 中配置)
cd ios
xcodebuild -workspace JifenbaoMobile.xcworkspace -scheme JifenbaoMobile -configuration Release archive
```

### 签名配置

#### Android 签名

1. 生成签名密钥：
```bash
keytool -genkeypair -v -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. 在 `android/gradle.properties` 中配置：
```properties
MYAPP_UPLOAD_STORE_FILE=my-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=my-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```

#### iOS 签名

1. 在 Xcode 中配置开发者账号
2. 设置 Bundle Identifier
3. 配置 Provisioning Profile
4. 设置代码签名身份

## 🔧 开发调试

### 调试工具

#### React Native Debugger
```bash
# 安装
npm install -g react-native-debugger

# 启动
react-native-debugger
```

#### Flipper 集成
- 网络请求监控
- 布局检查器
- 日志查看
- 数据库检查

#### 真机调试

```bash
# Android 设备调试
adb devices
npm run android

# iOS 设备调试 (需要开发者账号)
npm run ios --device
```

### 性能优化

#### Bundle 分析
```bash
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res --verbose
```

#### 内存监控
- 使用 Flipper 内存分析器
- 监控 JavaScript 堆内存
- 检查原生内存泄漏

## 🚨 故障排除

### 常见问题

#### Metro 服务器问题
```bash
# 重置 Metro 缓存
npx react-native start --reset-cache

# 清理 Node modules
rm -rf node_modules && npm install
```

#### Android 构建问题
```bash
# 清理构建缓存
cd android && ./gradlew clean

# 重置 Gradle 缓存
rm -rf ~/.gradle/caches/
```

#### iOS 构建问题
```bash
# 清理 CocoaPods 缓存
cd ios && rm -rf Pods && pod install

# 清理 Xcode 缓存
rm -rf ~/Library/Developer/Xcode/DerivedData/
```

#### 权限问题
- 检查 AndroidManifest.xml 权限配置
- 确认 iOS Info.plist 权限说明
- 使用权限管理器统一处理

### 调试技巧

#### 日志输出
```typescript
console.log('调试信息:', data);
console.warn('警告信息:', warning);
console.error('错误信息:', error);
```

#### 远程调试
1. 摇晃设备打开开发者菜单
2. 选择 "Debug"
3. 在浏览器中调试 JavaScript

#### 布局调试
1. 开启布局边界显示
2. 使用 Flipper 布局检查器
3. 检查样式属性

## 📞 技术支持

### 开发团队联系方式
- 📧 邮箱：dev@jifenbao.com
- 💬 微信：JifenbaoSupport
- 📱 电话：400-888-8888

### 在线资源
- [React Native 官方文档](https://reactnative.dev/)
- [AdMob 开发者指南](https://developers.google.com/admob)
- [Android 开发者文档](https://developer.android.com/)
- [iOS 开发者文档](https://developer.apple.com/documentation/)

---

## 🎉 开始开发

现在您已经有了一个功能完整的移动应用基础架构！

**包含功能：**
✅ 完整的权限管理系统  
✅ AdMob 广告集成  
✅ 原生功能支持  
✅ 跨平台兼容性  
✅ 性能优化  
✅ 调试工具集成  
✅ 构建和发布配置  

**立即开始您的积分宝移动应用开发之旅！** 🚀📱
