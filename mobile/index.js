/**
 * 积分宝移动应用入口文件
 * @format
 */

import 'react-native-gesture-handler'; // 必须在最顶部导入
import 'react-native-get-random-values'; // 加密库支持
import 'react-native-url-polyfill/auto'; // URL polyfill

import React from 'react';
import { AppRegistry, LogBox, Platform } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// 配置日志
if (__DEV__) {
  // 开发模式下显示详细日志
  console.log('🚀 积分宝应用启动 - 开发模式');
  
  // 忽略特定警告
  LogBox.ignoreLogs([
    'Require cycle:', // 循环依赖警告
    'Remote debugger', // 远程调试警告
    'Setting a timer', // 定时器警告
    'VirtualizedLists should never be nested', // VirtualizedList 嵌套警告
    'componentWillReceiveProps has been renamed', // 组件生命周期警告
    'componentWillMount has been renamed', // 组件生命周期警告
    'AsyncStorage has been extracted', // AsyncStorage 警告
    'Animated: `useNativeDriver`', // 动画驱动警告
  ]);
} else {
  // 生产模式下禁用控制台日志
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// 全局错误处理
const originalConsoleError = console.error;
console.error = (...args) => {
  // 过滤掉一些已知的无害错误
  const message = args[0];
  if (typeof message === 'string') {
    if (
      message.includes('Warning: Failed prop type') ||
      message.includes('Warning: ReactDOM.render is no longer supported') ||
      message.includes('Warning: componentWillReceiveProps has been renamed')
    ) {
      return; // 忽略这些警告
    }
  }
  
  originalConsoleError.apply(console, args);
};

// 全局未捕获异常处理
const ErrorUtils = require('ErrorUtils');
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('全局错误捕获:', error);
  
  if (__DEV__) {
    // 开发模式下显示错误详情
    console.error('错误堆栈:', error.stack);
  }
  
  // 这里可以上报错误到崩溃分析服务
  // 例如: Crashlytics, Bugsnag 等
  
  if (isFatal) {
    console.error('致命错误，应用即将重启');
    // 可以在这里执行一些清理操作
  }
});

// Promise 未捕获异常处理
const originalRejectionHandler = require('promise/setimmediate/rejection-tracking').enable;
require('promise/setimmediate/rejection-tracking').enable({
  allRejections: true,
  onUnhandled: (id, error) => {
    console.error('未处理的 Promise 拒绝:', error);
    
    // 这里可以上报错误
    if (__DEV__) {
      console.error('Promise 错误堆栈:', error.stack);
    }
  },
  onHandled: (id, error) => {
    console.log('Promise 拒绝已被处理:', id);
  },
});

// 网络状态监听
import NetInfo from '@react-native-community/netinfo';

// 监听网络状态变化
NetInfo.addEventListener(state => {
  console.log('网络连接类型:', state.type);
  console.log('网络是否连接:', state.isConnected);
  
  if (!state.isConnected) {
    console.warn('网络连接已断开');
    // 可以在这里显示网络断开提示
  }
});

// 性能监控
import { Performance } from 'react-native';

if (__DEV__) {
  // 开发模式下启用性能监控
  console.log('🔧 性能监控已启用');
  
  // 监控应用启动时间
  const startTime = Date.now();
  
  setTimeout(() => {
    const loadTime = Date.now() - startTime;
    console.log(`📊 应用启动耗时: ${loadTime}ms`);
  }, 100);
}

// 内存警告处理
import { DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';

if (Platform.OS === 'ios') {
  // iOS 内存警告监听
  const eventEmitter = new NativeEventEmitter();
  eventEmitter.addListener('memoryWarning', () => {
    console.warn('⚠️ 收到内存警告');
    // 可以在这里执行内存清理操作
  });
} else if (Platform.OS === 'android') {
  // Android 低内存监听
  DeviceEventEmitter.addListener('lowMemory', () => {
    console.warn('⚠️ Android 低内存警告');
    // 可以在这里执行内存清理操作
  });
}

// 应用状态监听
import { AppState } from 'react-native';

let appState = AppState.currentState;
console.log('📱 当前应用状态:', appState);

AppState.addEventListener('change', nextAppState => {
  if (appState.match(/inactive|background/) && nextAppState === 'active') {
    console.log('📱 应用已切换到前台');
    // 应用从后台切换到前台
    // 可以在这里刷新数据、重新连接等
  } else if (appState === 'active' && nextAppState.match(/inactive|background/)) {
    console.log('📱 应用已切换到后台');
    // 应用从前台切换到后台
    // 可以在这里保存数据、暂停任务等
  }
  
  appState = nextAppState;
  console.log('📱 应用状态变更为:', appState);
});

// React Native 新架构支持
if (Platform.OS === 'android') {
  // 启用 Hermes 引擎优化
  if (typeof HermesInternal !== 'undefined') {
    console.log('🚀 Hermes 引擎已启用');
  }
  
  // 启用 Fabric 渲染器（如果可用）
  if (global._IS_FABRIC) {
    console.log('🎨 Fabric 渲染器已启用');
  }
  
  // 启用 TurboModules（如果可用）
  if (global.__turboModuleProxy) {
    console.log('⚡ TurboModules 已启用');
  }
}

// 国际化支持
import { I18nManager } from 'react-native';

// 检查是否为 RTL（从右到左）语言
if (I18nManager.isRTL) {
  console.log('🌍 检测到 RTL 语言环境');
}

// 根组件包装器
const AppWrapper = () => {
  React.useEffect(() => {
    // 应用初始化完成
    console.log('✅ 积分宝应用初始化完成');
    
    // 可以在这里执行一些初始化任务
    // 例如：检查更新、同步数据等
    
    return () => {
      // 应用卸载时的清理工作
      console.log('🧹 应用清理工作执行中...');
    };
  }, []);

  return <App />;
};

// 注册应用
AppRegistry.registerComponent(appName, () => AppWrapper);

// 导出应用名称（供其他地方使用）
export { appName };

// 添加应用信息到全局对象（便于调试）
if (__DEV__) {
  global.APP_INFO = {
    name: appName,
    version: require('./package.json').version,
    platform: Platform.OS,
    platformVersion: Platform.Version,
    isHermes: typeof HermesInternal !== 'undefined',
    isFabric: global._IS_FABRIC || false,
    isTurboModule: !!global.__turboModuleProxy,
  };
  
  console.log('📋 应用信息:', global.APP_INFO);
}

console.log('🎉 积分宝应用入口文件加载完成');
