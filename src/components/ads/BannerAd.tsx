import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAdStore } from '../../stores/adStore'
import { motion, AnimatePresence } from 'framer-motion'

export const BannerAd: React.FC = () => {
  const { hideBannerAd, loadBannerAd } = useAdStore()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    loadBannerAd()
  }, [loadBannerAd])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      hideBannerAd()
    }, 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 mx-4 rounded-lg shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  🎁
                </div>
                <div>
                  <p className="font-semibold text-sm">限时优惠！</p>
                  <p className="text-xs opacity-90">升级会员享受无广告体验</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                onClick={() => {
                  // 导航到会员页面
                  window.location.href = '/membership'
                }}
              >
                升级
              </button>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
