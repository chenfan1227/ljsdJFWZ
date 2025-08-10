import { create } from 'zustand'
import { useAuthStore } from './authStore'
import toast from 'react-hot-toast'

export interface AdConfig {
  rewardedVideoAdId: string
  bannerAdId: string
  interstitialAdId: string
  nativeAdId: string
  appOpenAdId: string
}

interface AdState {
  isAdLoaded: boolean
  isAdPlaying: boolean
  adReward: number
  showBannerAds: boolean
  showInterstitialAds: boolean
  showAppOpenAds: boolean
  adConfig: AdConfig
  
  // Ad methods
  loadRewardedAd: () => Promise<boolean>
  showRewardedAd: () => Promise<boolean>
  loadBannerAd: () => void
  hideBannerAd: () => void
  loadInterstitialAd: () => Promise<boolean>
  showInterstitialAd: () => Promise<boolean>
  loadAppOpenAd: () => Promise<boolean>
  showAppOpenAd: () => Promise<boolean>
  loadNativeAd: () => Promise<boolean>
  
  // Ad controls
  setAdVisibility: (type: 'banner' | 'interstitial' | 'appOpen', visible: boolean) => void
}

export const useAdStore = create<AdState>((set, get) => ({
  isAdLoaded: false,
  isAdPlaying: false,
  adReward: 10, // 默认每次观看奖励10积分
  showBannerAds: true,
  showInterstitialAds: true,
  showAppOpenAds: true,
  
  adConfig: {
    rewardedVideoAdId: 'ca-app-pub-3940256099942544/5224354917', // 测试ID
    bannerAdId: 'ca-app-pub-3940256099942544/6300978111',
    interstitialAdId: 'ca-app-pub-3940256099942544/1033173712',
    nativeAdId: 'ca-app-pub-3940256099942544/2247696110',
    appOpenAdId: 'ca-app-pub-3940256099942544/3419835294'
  },

  loadRewardedAd: async () => {
    set({ isAdLoaded: false })
    
    try {
      // 模拟广告加载
      await new Promise(resolve => setTimeout(resolve, 1000))
      set({ isAdLoaded: true })
      return true
    } catch (error) {
      console.error('Failed to load rewarded ad:', error)
      return false
    }
  },

  showRewardedAd: async () => {
    const { isAdLoaded, adReward } = get()
    
    if (!isAdLoaded) {
      toast.error('广告未准备就绪，请稍后再试')
      return false
    }

    set({ isAdPlaying: true })
    
    try {
      // 模拟观看广告
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 给用户奖励积分
      useAuthStore.getState().updatePoints(adReward)
      toast.success(`恭喜！您获得了 ${adReward} 积分！`)
      
      set({ isAdPlaying: false, isAdLoaded: false })
      
      // 重新加载广告
      get().loadRewardedAd()
      
      return true
    } catch (error) {
      console.error('Failed to show rewarded ad:', error)
      set({ isAdPlaying: false })
      toast.error('广告播放失败')
      return false
    }
  },

  loadBannerAd: () => {
    // 模拟横幅广告加载
    console.log('Loading banner ad...')
  },

  hideBannerAd: () => {
    set({ showBannerAds: false })
  },

  loadInterstitialAd: async () => {
    try {
      // 模拟插页广告加载
      await new Promise(resolve => setTimeout(resolve, 500))
      return true
    } catch (error) {
      console.error('Failed to load interstitial ad:', error)
      return false
    }
  },

  showInterstitialAd: async () => {
    const { showInterstitialAds } = get()
    
    if (!showInterstitialAds) return true
    
    try {
      // 模拟显示插页广告
      await new Promise(resolve => setTimeout(resolve, 2000))
      return true
    } catch (error) {
      console.error('Failed to show interstitial ad:', error)
      return false
    }
  },

  loadAppOpenAd: async () => {
    try {
      // 模拟开屏广告加载
      await new Promise(resolve => setTimeout(resolve, 300))
      return true
    } catch (error) {
      console.error('Failed to load app open ad:', error)
      return false
    }
  },

  showAppOpenAd: async () => {
    const { showAppOpenAds } = get()
    
    if (!showAppOpenAds) return true
    
    try {
      // 模拟显示开屏广告
      await new Promise(resolve => setTimeout(resolve, 3000))
      return true
    } catch (error) {
      console.error('Failed to show app open ad:', error)
      return false
    }
  },

  loadNativeAd: async () => {
    try {
      // 模拟原生广告加载
      await new Promise(resolve => setTimeout(resolve, 800))
      return true
    } catch (error) {
      console.error('Failed to load native ad:', error)
      return false
    }
  },

  setAdVisibility: (type: 'banner' | 'interstitial' | 'appOpen', visible: boolean) => {
    switch (type) {
      case 'banner':
        set({ showBannerAds: visible })
        break
      case 'interstitial':
        set({ showInterstitialAds: visible })
        break
      case 'appOpen':
        set({ showAppOpenAds: visible })
        break
    }
  }
}))

// 自动初始化广告
useAdStore.getState().loadRewardedAd()
