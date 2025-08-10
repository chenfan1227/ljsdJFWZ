import { Platform } from 'react-native';
import MobileAds, {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  NativeAd,
  AppOpenAd,
  AdEventType,
  RewardedAdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

export interface AdConfig {
  appId: string;
  bannerId: string;
  interstitialId: string;
  rewardedId: string;
  nativeId: string;
  appOpenId: string;
}

export interface AdReward {
  type: string;
  amount: number;
}

export interface AdEventCallbacks {
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
  onAdOpened?: () => void;
  onAdClosed?: () => void;
  onAdClicked?: () => void;
  onRewardEarned?: (reward: AdReward) => void;
}

export class AdMobManager {
  private static instance: AdMobManager;
  private interstitialAd: InterstitialAd | null = null;
  private rewardedAd: RewardedAd | null = null;
  private appOpenAd: AppOpenAd | null = null;
  private isInitialized = false;

  // AdMob配置
  private static readonly AD_CONFIG: AdConfig = {
    appId: Platform.OS === 'ios' 
      ? 'ca-app-pub-3940256099942544~1458002511'  // iOS App ID
      : 'ca-app-pub-3940256099942544~3347511713', // Android App ID
    
    bannerId: Platform.OS === 'ios'
      ? 'ca-app-pub-3940256099942544/2934735716'  // iOS Banner
      : 'ca-app-pub-3940256099942544/6300978111', // Android Banner
    
    interstitialId: Platform.OS === 'ios'
      ? 'ca-app-pub-3940256099942544/4411468910'  // iOS Interstitial
      : 'ca-app-pub-3940256099942544/1033173712', // Android Interstitial
    
    rewardedId: Platform.OS === 'ios'
      ? 'ca-app-pub-3940256099942544/1712485313'  // iOS Rewarded
      : 'ca-app-pub-3940256099942544/5224354917', // Android Rewarded
    
    nativeId: Platform.OS === 'ios'
      ? 'ca-app-pub-3940256099942544/3986624511'  // iOS Native
      : 'ca-app-pub-3940256099942544/2247696110', // Android Native
    
    appOpenId: Platform.OS === 'ios'
      ? 'ca-app-pub-3940256099942544/5662855259'  // iOS App Open
      : 'ca-app-pub-3940256099942544/3419835294', // Android App Open
  };

  // 测试广告ID（用于开发测试）
  private static readonly TEST_AD_CONFIG: AdConfig = {
    appId: TestIds.APP_ID,
    bannerId: TestIds.BANNER,
    interstitialId: TestIds.INTERSTITIAL,
    rewardedId: TestIds.REWARDED,
    nativeId: TestIds.NATIVE,
    appOpenId: TestIds.APP_OPEN,
  };

  private constructor() {}

  // 获取单例实例
  static getInstance(): AdMobManager {
    if (!AdMobManager.instance) {
      AdMobManager.instance = new AdMobManager();
    }
    return AdMobManager.instance;
  }

  // 初始化AdMob
  async initialize(useTestAds: boolean = __DEV__): Promise<void> {
    try {
      if (this.isInitialized) {
        console.log('📺 AdMob已经初始化');
        return;
      }

      // 初始化MobileAds
      await MobileAds().initialize();

      // 设置请求配置
      await MobileAds().setRequestConfiguration({
        testDeviceIdentifiers: useTestAds ? ['EMULATOR'] : [],
        tagForChildDirectedTreatment: false,
        tagForUnderAgeOfConsent: false,
        maxAdContentRating: 'T', // Teen适合13+年龄
      });

      this.isInitialized = true;
      console.log('✅ AdMob初始化成功');

      // 预加载广告
      await this.preloadAds();

    } catch (error) {
      console.error('❌ AdMob初始化失败:', error);
      throw error;
    }
  }

  // 获取当前配置
  getAdConfig(useTestAds: boolean = __DEV__): AdConfig {
    return useTestAds ? AdMobManager.TEST_AD_CONFIG : AdMobManager.AD_CONFIG;
  }

  // 预加载广告
  async preloadAds(): Promise<void> {
    try {
      // 预加载插页广告
      await this.loadInterstitialAd();
      
      // 预加载激励视频广告
      await this.loadRewardedAd();
      
      // 预加载开屏广告
      await this.loadAppOpenAd();
      
      console.log('📺 广告预加载完成');
    } catch (error) {
      console.error('广告预加载失败:', error);
    }
  }

  // ==================== 插页广告 ====================

  // 加载插页广告
  async loadInterstitialAd(callbacks?: AdEventCallbacks): Promise<void> {
    try {
      const config = this.getAdConfig();
      
      this.interstitialAd = InterstitialAd.createForAdRequest(config.interstitialId);

      // 设置事件监听器
      this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('插页广告加载成功');
        callbacks?.onAdLoaded?.();
      });

      this.interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('插页广告加载失败:', error);
        callbacks?.onAdFailedToLoad?.(error);
      });

      this.interstitialAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('插页广告打开');
        callbacks?.onAdOpened?.();
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('插页广告关闭');
        callbacks?.onAdClosed?.();
        // 广告关闭后重新加载
        this.loadInterstitialAd();
      });

      this.interstitialAd.addAdEventListener(AdEventType.CLICKED, () => {
        console.log('插页广告被点击');
        callbacks?.onAdClicked?.();
      });

      // 开始加载广告
      await this.interstitialAd.load();

    } catch (error) {
      console.error('加载插页广告失败:', error);
      throw error;
    }
  }

  // 显示插页广告
  async showInterstitialAd(): Promise<boolean> {
    try {
      if (this.interstitialAd && this.interstitialAd.loaded) {
        await this.interstitialAd.show();
        return true;
      } else {
        console.log('插页广告未准备好');
        // 尝试重新加载
        await this.loadInterstitialAd();
        return false;
      }
    } catch (error) {
      console.error('显示插页广告失败:', error);
      return false;
    }
  }

  // ==================== 激励视频广告 ====================

  // 加载激励视频广告
  async loadRewardedAd(callbacks?: AdEventCallbacks): Promise<void> {
    try {
      const config = this.getAdConfig();
      
      this.rewardedAd = RewardedAd.createForAdRequest(config.rewardedId);

      // 设置事件监听器
      this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('激励视频广告加载成功');
        callbacks?.onAdLoaded?.();
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
        console.error('激励视频广告加载失败:', error);
        callbacks?.onAdFailedToLoad?.(error);
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.OPENED, () => {
        console.log('激励视频广告打开');
        callbacks?.onAdOpened?.();
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.CLOSED, () => {
        console.log('激励视频广告关闭');
        callbacks?.onAdClosed?.();
        // 广告关闭后重新加载
        this.loadRewardedAd();
      });

      this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
        console.log('用户获得奖励:', reward);
        callbacks?.onRewardEarned?.(reward);
      });

      // 开始加载广告
      await this.rewardedAd.load();

    } catch (error) {
      console.error('加载激励视频广告失败:', error);
      throw error;
    }
  }

  // 显示激励视频广告
  async showRewardedAd(): Promise<boolean> {
    try {
      if (this.rewardedAd && this.rewardedAd.loaded) {
        await this.rewardedAd.show();
        return true;
      } else {
        console.log('激励视频广告未准备好');
        // 尝试重新加载
        await this.loadRewardedAd();
        return false;
      }
    } catch (error) {
      console.error('显示激励视频广告失败:', error);
      return false;
    }
  }

  // ==================== 开屏广告 ====================

  // 加载开屏广告
  async loadAppOpenAd(callbacks?: AdEventCallbacks): Promise<void> {
    try {
      const config = this.getAdConfig();
      
      this.appOpenAd = AppOpenAd.createForAdRequest(config.appOpenId);

      // 设置事件监听器
      this.appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
        console.log('开屏广告加载成功');
        callbacks?.onAdLoaded?.();
      });

      this.appOpenAd.addAdEventListener(AdEventType.ERROR, (error) => {
        console.error('开屏广告加载失败:', error);
        callbacks?.onAdFailedToLoad?.(error);
      });

      this.appOpenAd.addAdEventListener(AdEventType.OPENED, () => {
        console.log('开屏广告打开');
        callbacks?.onAdOpened?.();
      });

      this.appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('开屏广告关闭');
        callbacks?.onAdClosed?.();
      });

      // 开始加载广告
      await this.appOpenAd.load();

    } catch (error) {
      console.error('加载开屏广告失败:', error);
      throw error;
    }
  }

  // 显示开屏广告
  async showAppOpenAd(): Promise<boolean> {
    try {
      if (this.appOpenAd && this.appOpenAd.loaded) {
        await this.appOpenAd.show();
        return true;
      } else {
        console.log('开屏广告未准备好');
        return false;
      }
    } catch (error) {
      console.error('显示开屏广告失败:', error);
      return false;
    }
  }

  // ==================== 工具方法 ====================

  // 检查广告是否准备好
  isInterstitialReady(): boolean {
    return this.interstitialAd?.loaded ?? false;
  }

  isRewardedReady(): boolean {
    return this.rewardedAd?.loaded ?? false;
  }

  isAppOpenReady(): boolean {
    return this.appOpenAd?.loaded ?? false;
  }

  // 获取横幅广告ID
  getBannerAdId(): string {
    const config = this.getAdConfig();
    return config.bannerId;
  }

  // 获取原生广告ID
  getNativeAdId(): string {
    const config = this.getAdConfig();
    return config.nativeId;
  }

  // 销毁所有广告
  destroy(): void {
    this.interstitialAd = null;
    this.rewardedAd = null;
    this.appOpenAd = null;
    console.log('📺 AdMob管理器已销毁');
  }

  // ==================== 高级功能 ====================

  // 显示激励视频广告并处理奖励
  async showRewardedAdWithReward(
    onReward: (reward: AdReward) => void,
    onError?: (error: any) => void
  ): Promise<void> {
    try {
      await this.loadRewardedAd({
        onRewardEarned: onReward,
        onAdFailedToLoad: onError,
      });

      const shown = await this.showRewardedAd();
      if (!shown && onError) {
        onError(new Error('广告显示失败'));
      }
    } catch (error) {
      console.error('显示激励视频广告失败:', error);
      onError?.(error);
    }
  }

  // 智能显示插页广告（避免过于频繁）
  private lastInterstitialTime = 0;
  private readonly INTERSTITIAL_COOLDOWN = 30000; // 30秒冷却时间

  async showInterstitialAdSmart(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.INTERSTITIAL_COOLDOWN) {
      console.log('插页广告冷却中，跳过显示');
      return false;
    }

    const shown = await this.showInterstitialAd();
    if (shown) {
      this.lastInterstitialTime = now;
    }
    return shown;
  }

  // 获取广告收益统计
  getAdRevenueStats(): any {
    // 这里可以集成第三方分析工具来获取收益统计
    return {
      totalRevenue: 0,
      todayRevenue: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      ecpm: 0,
    };
  }
}
