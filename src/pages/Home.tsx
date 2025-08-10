import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Download, 
  Coins, 
  Gift, 
  Crown, 
  Zap,
  TrendingUp,
  Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useAdStore } from '../stores/adStore'
import { LoginModal } from '../components/auth/LoginModal'
import toast from 'react-hot-toast'

export const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  const { showRewardedAd, isAdLoaded, isAdPlaying } = useAdStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleWatchAd = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    const success = await showRewardedAd()
    if (!success && !isAdLoaded) {
      toast.error('广告加载中，请稍后再试')
    }
  }

  const handleDownloadReward = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    // 模拟下载奖励
    useAuthStore.getState().updatePoints(50)
    toast.success('下载完成！获得50积分奖励！')
  }

  const earnMethods = [
    {
      id: 'watch-ad',
      title: '观看视频',
      description: '观看激励视频广告',
      icon: Play,
      reward: '10积分',
      color: 'from-red-500 to-pink-500',
      action: handleWatchAd,
      loading: isAdPlaying
    },
    {
      id: 'download',
      title: '下载应用',
      description: '下载推荐的应用',
      icon: Download,
      reward: '50积分',
      color: 'from-blue-500 to-cyan-500',
      action: handleDownloadReward
    },
    {
      id: 'games',
      title: '玩游戏',
      description: '完成游戏任务',
      icon: Zap,
      reward: '20-100积分',
      color: 'from-purple-500 to-indigo-500',
      action: () => window.location.href = '/games'
    },
    {
      id: 'daily',
      title: '每日签到',
      description: '连续签到获得奖励',
      icon: Star,
      reward: '5-50积分',
      color: 'from-yellow-500 to-orange-500',
      action: () => {
        if (!isAuthenticated) {
          setShowLoginModal(true)
          return
        }
        useAuthStore.getState().updatePoints(15)
        toast.success('签到成功！获得15积分！')
      }
    }
  ]

  const quickActions = [
    {
      title: '奖品兑换',
      description: '用积分兑换游戏奖品',
      icon: Gift,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      link: '/rewards'
    },
    {
      title: '抽奖活动',
      description: '参与抽奖赢大奖',
      icon: Crown,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      link: '/lottery'
    },
    {
      title: '加密提现',
      description: '兑换USDT/BTC等',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      link: '/withdraw'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              积分宝
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              看视频、玩游戏、赚积分、换现金
            </p>
            
            {isAuthenticated && user ? (
              <div className="flex items-center justify-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="text-sm opacity-80">当前积分</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    ${(user.totalEarned * 0.01).toFixed(2)}
                  </div>
                  <div className="text-sm opacity-80">累计收益</div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-white text-primary-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors"
              >
                立即开始赚取积分
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Earning Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            赚取积分的方式
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earnMethods.map((method, index) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={method.action}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center mb-3`}>
                  <method.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {method.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {method.description}
                </p>
                <div className="text-primary-600 font-semibold text-sm">
                  {method.reward}
                </div>
                {method.loading && (
                  <div className="mt-2 text-xs text-gray-500">
                    播放中...
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            快速操作
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.a
                key={action.title}
                href={action.link}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${action.color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 block`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {action.title}
                    </h3>
                    <p className="opacity-90">
                      {action.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </section>

        {/* Stats */}
        {isAuthenticated && user && (
          <section className="mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card text-center">
                <Coins className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">可用积分</div>
              </div>
              
              <div className="card text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {user.totalEarned.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">累计获得</div>
              </div>
              
              <div className="card text-center">
                <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 capitalize">
                  {user.membershipLevel}
                </div>
                <div className="text-sm text-gray-600">会员等级</div>
              </div>
              
              <div className="card text-center">
                <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">
                  {user.totalWithdrawn.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">已提现</div>
              </div>
            </div>
          </section>
        )}
      </div>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
