import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppleButton } from '@invertase/react-native-apple-authentication';

// 导入工具类
import { SocialLoginManager, SocialUser } from '../utils/SocialLoginManager';
import { StorageManager } from '../utils/StorageManager';
import { APIClient } from '../utils/APIClient';

const { width, height } = Dimensions.get('window');

interface LoginScreenProps {
  onLoginSuccess: (userData: any, token: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));
  const [scaleValue] = useState(new Animated.Value(0.9));
  
  const socialLoginManager = SocialLoginManager.getInstance();

  useEffect(() => {
    initializeScreen();
    startAnimations();
  }, []);

  // 初始化屏幕
  const initializeScreen = async () => {
    try {
      // 初始化社交登录服务
      await socialLoginManager.initialize();
      
      // 检查是否已有登录状态
      const currentUser = await socialLoginManager.getCurrentUser();
      if (currentUser) {
        console.log('检测到已登录用户:', currentUser.name);
        // 可以选择自动登录或显示用户信息
      }
    } catch (error) {
      console.error('初始化登录屏幕失败:', error);
    }
  };

  // 启动动画
  const startAnimations = () => {
    // 启动浮动动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 启动缩放动画
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Google登录
  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await socialLoginManager.signInWithGoogle();
      
      if (result.success && result.user) {
        await handleSocialLoginSuccess(result.user);
      } else {
        Alert.alert('登录失败', result.error || 'Google登录失败');
      }
    } catch (error) {
      console.error('Google登录错误:', error);
      Alert.alert('登录失败', '网络连接异常，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // Apple登录
  const handleAppleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await socialLoginManager.signInWithApple();
      
      if (result.success && result.user) {
        await handleSocialLoginSuccess(result.user);
      } else {
        if (result.error !== '用户取消登录') {
          Alert.alert('登录失败', result.error || 'Apple登录失败');
        }
      }
    } catch (error) {
      console.error('Apple登录错误:', error);
      Alert.alert('登录失败', '网络连接异常，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理社交登录成功
  const handleSocialLoginSuccess = async (socialUser: SocialUser) => {
    try {
      console.log('社交登录成功:', socialUser);

      // 向后端验证社交登录并获取应用token
      const response = await APIClient.post('/auth/social-login', {
        provider: socialUser.provider,
        social_id: socialUser.id,
        email: socialUser.email,
        name: socialUser.name,
        avatar: socialUser.avatar,
        social_token: socialUser.token,
      });

      if (response.success) {
        const { user, token } = response.data;
        
        // 保存用户信息和token
        await StorageManager.setItem('authToken', token);
        await StorageManager.setItem('userData', user);
        await StorageManager.setItem('socialUser', socialUser);

        // 显示欢迎消息
        Alert.alert(
          '🎉 登录成功！',
          `欢迎回来，${socialUser.name}！`,
          [
            {
              text: '开始赚取积分',
              onPress: () => onLoginSuccess(user, token),
            },
          ]
        );
      } else {
        throw new Error(response.error || '登录验证失败');
      }

    } catch (error) {
      console.error('处理社交登录失败:', error);
      Alert.alert(
        '登录失败',
        '无法连接到服务器，请检查网络连接后重试',
        [
          { text: '重试', onPress: () => handleSocialLoginSuccess(socialUser) },
          { text: '取消', style: 'cancel' },
        ]
      );
    }
  };

  // 游客模式
  const handleGuestMode = () => {
    Alert.alert(
      '游客模式',
      '游客模式下功能有限，建议登录以获得完整体验',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '继续',
          onPress: () => {
            // 创建游客用户数据
            const guestUser = {
              id: 'guest_' + Date.now(),
              username: '游客用户',
              email: '',
              points_balance: 0,
              membership_level: 'guest',
              isGuest: true,
            };
            onLoginSuccess(guestUser, '');
          },
        },
      ]
    );
  };

  // 浮动动画样式
  const floatingStyle = {
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        }),
      },
    ],
  };

  // 缩放动画样式
  const scaleStyle = {
    transform: [{ scale: scaleValue }],
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      {/* 背景渐变 */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* 装饰性圆圈 */}
        <View style={styles.decorativeCircles}>
          <Animated.View style={[styles.circle, styles.circle1, floatingStyle]} />
          <Animated.View style={[styles.circle, styles.circle2, floatingStyle]} />
          <Animated.View style={[styles.circle, styles.circle3, floatingStyle]} />
        </View>

        {/* 主内容 */}
        <Animated.View style={[styles.content, scaleStyle]}>
          {/* Logo和标题 */}
          <View style={styles.header}>
            <Animated.View style={[styles.logoContainer, floatingStyle]}>
              <Text style={styles.logoEmoji}>💎</Text>
            </Animated.View>
            <Text style={styles.appTitle}>积分宝</Text>
            <Text style={styles.appSubtitle}>让赚钱变得简单有趣</Text>
          </View>

          {/* 功能亮点 */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Icon name="play-circle-filled" size={24} color="#fff" />
              <Text style={styles.featureText}>观看视频赚积分</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="get-app" size={24} color="#fff" />
              <Text style={styles.featureText}>下载应用获奖励</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="casino" size={24} color="#fff" />
              <Text style={styles.featureText}>抽奖赢大奖</Text>
            </View>
          </View>

          {/* 登录按钮区域 */}
          <View style={styles.loginSection}>
            <Text style={styles.loginTitle}>开始您的积分之旅</Text>

            {/* Google登录按钮 */}
            <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Icon name="account-circle" size={24} color="#4285f4" />
              <Text style={[styles.socialButtonText, styles.googleButtonText]}>
                使用 Google 登录
              </Text>
              {isLoading && <ActivityIndicator size="small" color="#4285f4" />}
            </TouchableOpacity>

            {/* Apple登录按钮 (仅iOS) */}
            {Platform.OS === 'ios' && (
              <View style={styles.appleButtonContainer}>
                <AppleButton
                  buttonStyle={AppleButton.Style.WHITE}
                  buttonType={AppleButton.Type.SIGN_IN}
                  style={styles.appleButton}
                  onPress={handleAppleLogin}
                  disabled={isLoading}
                />
              </View>
            )}

            {/* 分隔线 */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 游客模式按钮 */}
            <TouchableOpacity
              style={styles.guestButton}
              onPress={handleGuestMode}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Icon name="person-outline" size={24} color="rgba(255,255,255,0.8)" />
              <Text style={styles.guestButtonText}>游客模式体验</Text>
            </TouchableOpacity>
          </View>

          {/* 底部信息 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              登录即表示您同意我们的
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => Alert.alert('服务条款', '功能开发中...')}>
                <Text style={styles.footerLink}>服务条款</Text>
              </TouchableOpacity>
              <Text style={styles.footerText}> 和 </Text>
              <TouchableOpacity onPress={() => Alert.alert('隐私政策', '功能开发中...')}>
                <Text style={styles.footerLink}>隐私政策</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* 加载遮罩 */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>登录中...</Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: 'relative',
  },
  decorativeCircles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 150,
    height: 150,
    top: 100,
    right: -50,
  },
  circle2: {
    width: 100,
    height: 100,
    top: 300,
    left: -30,
  },
  circle3: {
    width: 80,
    height: 80,
    bottom: 200,
    right: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginSection: {
    marginBottom: 30,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
    textAlign: 'center',
  },
  googleButtonText: {
    color: '#333',
  },
  appleButtonContainer: {
    marginBottom: 15,
    borderRadius: 25,
    overflow: 'hidden',
  },
  appleButton: {
    height: 50,
    borderRadius: 25,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.7)',
    marginHorizontal: 15,
    fontSize: 14,
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  guestButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  footerLink: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
});

export default LoginScreen;
