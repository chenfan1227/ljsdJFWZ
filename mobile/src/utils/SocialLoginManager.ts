import { Platform, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
  AppleAuthCredentialState,
} from '@invertase/react-native-apple-authentication';

export interface SocialUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'apple' | 'facebook';
  token: string;
}

export interface SocialLoginResult {
  success: boolean;
  user?: SocialUser;
  error?: string;
}

export class SocialLoginManager {
  private static instance: SocialLoginManager;

  private constructor() {}

  static getInstance(): SocialLoginManager {
    if (!SocialLoginManager.instance) {
      SocialLoginManager.instance = new SocialLoginManager();
    }
    return SocialLoginManager.instance;
  }

  // 初始化社交登录服务
  async initialize(): Promise<void> {
    try {
      // 配置Google登录
      await this.configureGoogleSignIn();
      
      console.log('✅ 社交登录服务初始化成功');
    } catch (error) {
      console.error('❌ 社交登录服务初始化失败:', error);
    }
  }

  // 配置Google登录
  private async configureGoogleSignIn(): Promise<void> {
    try {
      await GoogleSignin.configure({
        // Web客户端ID (从Google Cloud Console获取)
        webClientId: Platform.OS === 'ios' 
          ? '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com' // iOS Web Client ID
          : '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com', // Android Web Client ID
        
        // iOS客户端ID (仅iOS需要)
        iosClientId: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
        
        // 请求的范围
        scopes: ['email', 'profile'],
        
        // 启用ID令牌
        requestIdToken: true,
        
        // 离线访问
        offlineAccess: true,
        
        // 强制代码用于服务器端访问
        forceCodeForRefreshToken: true,
      });

      console.log('✅ Google Sign-In 配置成功');
    } catch (error) {
      console.error('❌ Google Sign-In 配置失败:', error);
      throw error;
    }
  }

  // Google登录
  async signInWithGoogle(): Promise<SocialLoginResult> {
    try {
      console.log('🔐 开始Google登录...');

      // 检查Google Play服务
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 执行登录
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.user) {
        throw new Error('Google登录失败：未获取到用户信息');
      }

      const { user, idToken } = userInfo;

      const socialUser: SocialUser = {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        avatar: user.photo,
        provider: 'google',
        token: idToken || '',
      };

      console.log('✅ Google登录成功:', socialUser.name);

      return {
        success: true,
        user: socialUser,
      };

    } catch (error: any) {
      console.error('❌ Google登录失败:', error);

      let errorMessage = '登录失败';
      
      if (error.code === 'SIGN_IN_CANCELLED') {
        errorMessage = '用户取消登录';
      } else if (error.code === 'IN_PROGRESS') {
        errorMessage = '登录正在进行中';
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        errorMessage = 'Google Play服务不可用';
      } else {
        errorMessage = error.message || '登录失败';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Apple登录 (仅iOS)
  async signInWithApple(): Promise<SocialLoginResult> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Apple登录仅支持iOS设备',
      };
    }

    try {
      console.log('🍎 开始Apple登录...');

      // 检查Apple登录可用性
      const isSupported = await appleAuth.isSupported();
      if (!isSupported) {
        throw new Error('设备不支持Apple登录');
      }

      // 执行Apple登录请求
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      });

      // 检查凭据状态
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      if (credentialState === AppleAuthCredentialState.AUTHORIZED) {
        const { user, email, fullName, identityToken } = appleAuthRequestResponse;

        const socialUser: SocialUser = {
          id: user,
          email: email || '',
          name: fullName ? `${fullName.givenName || ''} ${fullName.familyName || ''}`.trim() : email || 'Apple用户',
          provider: 'apple',
          token: identityToken || '',
        };

        console.log('✅ Apple登录成功:', socialUser.name);

        return {
          success: true,
          user: socialUser,
        };
      } else {
        throw new Error('Apple登录凭据无效');
      }

    } catch (error: any) {
      console.error('❌ Apple登录失败:', error);

      let errorMessage = '登录失败';
      
      if (error.code === '1001') {
        errorMessage = '用户取消登录';
      } else {
        errorMessage = error.message || '登录失败';
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Facebook登录
  async signInWithFacebook(): Promise<SocialLoginResult> {
    try {
      console.log('📘 Facebook登录功能开发中...');
      
      return {
        success: false,
        error: 'Facebook登录功能开发中',
      };

    } catch (error: any) {
      console.error('❌ Facebook登录失败:', error);

      return {
        success: false,
        error: error.message || 'Facebook登录失败',
      };
    }
  }

  // 获取当前登录用户
  async getCurrentUser(): Promise<SocialUser | null> {
    try {
      // 检查Google登录状态
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        const userInfo = await GoogleSignin.getCurrentUser();
        if (userInfo?.user) {
          return {
            id: userInfo.user.id,
            email: userInfo.user.email,
            name: userInfo.user.name || userInfo.user.email,
            avatar: userInfo.user.photo,
            provider: 'google',
            token: userInfo.idToken || '',
          };
        }
      }

      // 检查Apple登录状态 (仅iOS)
      if (Platform.OS === 'ios') {
        // Apple登录状态检查需要存储用户ID
        // 这里简化处理，实际应用中应该存储用户ID到本地存储
      }

      return null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }

  // 退出登录
  async signOut(): Promise<void> {
    try {
      // Google登录退出
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.signOut();
        console.log('✅ Google登录已退出');
      }

      // Apple登录退出 (Apple不提供主动退出方法)
      // Facebook登录退出
      
      console.log('✅ 所有社交登录已退出');
    } catch (error) {
      console.error('❌ 退出登录失败:', error);
    }
  }

  // 撤销访问权限
  async revokeAccess(): Promise<void> {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.revokeAccess();
        console.log('✅ Google访问权限已撤销');
      }
    } catch (error) {
      console.error('❌ 撤销访问权限失败:', error);
    }
  }

  // 检查登录状态
  async isSignedIn(): Promise<boolean> {
    try {
      // 检查Google登录状态
      const googleSignedIn = await GoogleSignin.isSignedIn();
      if (googleSignedIn) return true;

      // 检查其他登录状态...

      return false;
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  }

  // 获取可用的登录方式
  getAvailableProviders(): string[] {
    const providers = ['google'];

    if (Platform.OS === 'ios') {
      providers.push('apple');
    }

    // Facebook等其他登录方式
    // providers.push('facebook');

    return providers;
  }

  // 验证社交登录令牌
  async validateSocialToken(user: SocialUser): Promise<boolean> {
    try {
      // 这里应该向后端API发送验证请求
      // 验证社交登录令牌的有效性
      
      console.log('验证社交登录令牌:', user.provider);
      
      // 模拟验证成功
      return true;
    } catch (error) {
      console.error('验证社交登录令牌失败:', error);
      return false;
    }
  }

  // 获取错误信息
  getErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    return '未知错误';
  }
}
