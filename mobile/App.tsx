import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  BackHandler,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { request, PERMISSIONS, RESULTS, checkMultiple, requestMultiple } from 'react-native-permissions';
import MobileAds, { BannerAd, BannerAdSize, TestIds, InterstitialAd, RewardedAd, AdEventType } from 'react-native-google-mobile-ads';

// 导入页面组件
import HomeScreen from './src/screens/HomeScreen';
import GamesScreen from './src/screens/GamesScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import LotteryScreen from './src/screens/LotteryScreen';
import WithdrawScreen from './src/screens/WithdrawScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';

// 导入工具类
import { PermissionManager } from './src/utils/PermissionManager';
import { AdMobManager } from './src/utils/AdMobManager';
import { StorageManager } from './src/utils/StorageManager';
import { APIClient } from './src/utils/APIClient';

// 导入图标
import Icon from 'react-native-vector-icons/MaterialIcons';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// AdMob广告ID配置
const ADMOB_CONFIG = {
  APP_ID: Platform.OS === 'ios' 
    ? 'ca-app-pub-3940256099942544~1458002511'
    : 'ca-app-pub-3940256099942544~3347511713',
  BANNER_ID: Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/2934735716'
    : 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL_ID: Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/4411468910'
    : 'ca-app-pub-3940256099942544/1033173712',
  REWARDED_ID: Platform.OS === 'ios'
    ? 'ca-app-pub-3940256099942544/1712485313'
    : 'ca-app-pub-3940256099942544/5224354917',
};

// 底部导航组件
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconColor = focused ? '#667eea' : '#999';

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Games':
              iconName = 'games';
              break;
            case 'Rewards':
              iconName = 'card-giftcard';
              break;
            case 'Lottery':
              iconName = 'casino';
              break;
            case 'Withdraw':
              iconName = 'account-balance-wallet';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'home';
          }

          return (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: focused ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
              marginTop: 5,
            }}>
              <Icon name={iconName} size={focused ? 26 : 24} color={iconColor} />
              {focused && (
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#667eea',
                  marginTop: 2,
                }} />
              )}
            </View>
          );
        },
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          paddingTop: 15,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: Platform.OS === 'ios' ? 25 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -5,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Games" component={GamesScreen} options={{ title: '游戏' }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} options={{ title: '奖励' }} />
      <Tab.Screen name="Lottery" component={LotteryScreen} options={{ title: '抽奖' }} />
      <Tab.Screen name="Withdraw" component={WithdrawScreen} options={{ title: '提现' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [appInfo, setAppInfo] = useState<any>({});

  // 初始化应用
  useEffect(() => {
    initializeApp();
  }, []);

  // 应用初始化
  const initializeApp = async () => {
    try {
      console.log('🚀 积分宝应用启动中...');
      
      // 1. 获取设备信息
      await getDeviceInfo();
      
      // 2. 初始化AdMob
      await initializeAdMob();
      
      // 3. 请求权限
      await requestAllPermissions();
      
      // 4. 检查登录状态
      await checkLoginStatus();
      
      // 5. 初始化API客户端
      APIClient.initialize();
      
      console.log('✅ 应用初始化完成');
      
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      Alert.alert('初始化失败', '应用启动时发生错误，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 获取设备信息
  const getDeviceInfo = async () => {
    try {
      const deviceInfo = {
        deviceId: await DeviceInfo.getUniqueId(),
        brand: await DeviceInfo.getBrand(),
        model: await DeviceInfo.getModel(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
        bundleId: await DeviceInfo.getBundleId(),
        isEmulator: await DeviceInfo.isEmulator(),
        carrier: await DeviceInfo.getCarrier(),
        totalMemory: await DeviceInfo.getTotalMemory(),
        usedMemory: await DeviceInfo.getUsedMemory(),
      };
      
      setAppInfo(deviceInfo);
      console.log('📱 设备信息:', deviceInfo);
      
      // 保存设备信息
      await StorageManager.setItem('deviceInfo', deviceInfo);
      
    } catch (error) {
      console.error('获取设备信息失败:', error);
    }
  };

  // 初始化AdMob
  const initializeAdMob = async () => {
    try {
      await MobileAds().initialize();
      
      // 设置测试设备ID
      await MobileAds().setRequestConfiguration({
        testDeviceIdentifiers: ['EMULATOR'],
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
      });
      
      console.log('📺 AdMob初始化成功');
      
    } catch (error) {
      console.error('AdMob初始化失败:', error);
    }
  };

  // 请求所有权限
  const requestAllPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const permissions = [
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
          PERMISSIONS.ANDROID.RECORD_AUDIO,
          PERMISSIONS.ANDROID.READ_CONTACTS,
          PERMISSIONS.ANDROID.READ_PHONE_STATE,
          PERMISSIONS.ANDROID.READ_SMS,
          PERMISSIONS.ANDROID.CALL_PHONE,
        ];

        const results = await requestMultiple(permissions);
        console.log('Android权限请求结果:', results);
        
        // 检查重要权限
        const criticalPermissions = [
          PERMISSIONS.ANDROID.CAMERA,
          PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ];
        
        for (const permission of criticalPermissions) {
          if (results[permission] === RESULTS.DENIED) {
            Alert.alert(
              '权限需要',
              '积分宝需要相机、存储和位置权限来提供完整功能，请在设置中手动开启。',
              [
                { text: '稍后', style: 'cancel' },
                { text: '去设置', onPress: () => Linking.openSettings() },
              ]
            );
            break;
          }
        }
      } else {
        // iOS权限在使用时动态请求
        console.log('iOS权限将在使用时动态请求');
      }
      
    } catch (error) {
      console.error('权限请求失败:', error);
    }
  };

  // 检查登录状态
  const checkLoginStatus = async () => {
    try {
      const authToken = await StorageManager.getItem('authToken');
      const userData = await StorageManager.getItem('userData');
      
      if (authToken && userData) {
        setIsLoggedIn(true);
        setUserInfo(userData);
        console.log('✅ 用户已登录:', userData.username);
      } else {
        console.log('❌ 用户未登录');
      }
      
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  };

  // 处理登录成功
  const handleLoginSuccess = (userData: any, token: string) => {
    setIsLoggedIn(true);
    setUserInfo(userData);
    StorageManager.setItem('authToken', token);
    StorageManager.setItem('userData', userData);
  };

  // 处理退出登录
  const handleLogout = async () => {
    try {
      await StorageManager.removeItem('authToken');
      await StorageManager.removeItem('userData');
      setIsLoggedIn(false);
      setUserInfo(null);
      
      Alert.alert('退出成功', '您已成功退出登录');
      
    } catch (error) {
      console.error('退出登录失败:', error);
    }
  };

  // 处理Android返回键
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // 自定义返回键处理逻辑
        Alert.alert(
          '退出应用',
          '确定要退出积分宝吗？',
          [
            { text: '取消', style: 'cancel' },
            { text: '退出', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      });

      return () => backHandler.remove();
    }
  }, []);

  // 加载页面
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <View style={styles.loadingContent}>
          <Text style={styles.loadingLogo}>💎</Text>
          <Text style={styles.loadingTitle}>积分宝</Text>
          <Text style={styles.loadingSubtitle}>正在启动应用...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Main" component={TabNavigator} />
          ) : (
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={handleLoginSuccess}
                />
              )}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* 底部横幅广告 */}
      {isLoggedIn && (
        <View style={styles.bannerContainer}>
          <BannerAd
            unitId={ADMOB_CONFIG.BANNER_ID}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: false,
            }}
            onAdLoaded={() => console.log('横幅广告加载成功')}
            onAdFailedToLoad={(error) => console.log('横幅广告加载失败:', error)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  bannerContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 5,
  },
});

export default App;
