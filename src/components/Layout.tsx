import React from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { BottomNavigation } from './BottomNavigation'
import { BannerAd } from './ads/BannerAd'
import { useAdStore } from '../stores/adStore'
import { useAuthStore } from '../stores/authStore'

export const Layout: React.FC = () => {
  const showBannerAds = useAdStore(state => state.showBannerAds)
  const user = useAuthStore(state => state.user)
  
  // 会员用户可以关闭横幅广告
  const shouldShowBanner = showBannerAds && (!user || user.membershipLevel === 'free')

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      
      {shouldShowBanner && (
        <div className="fixed bottom-20 left-0 right-0 z-40">
          <BannerAd />
        </div>
      )}
      
      <BottomNavigation />
    </div>
  )
}
