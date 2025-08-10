import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Calendar, 
  Coins, 
  TrendingUp, 
  Share2, 
  Copy,
  Settings,
  Crown,
  Wallet,
  QrCode
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

export const Profile: React.FC = () => {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'referral'>('info')

  if (!user) {
    return <div>请先登录</div>
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode)
    toast.success('推荐码已复制到剪贴板')
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: '积分宝 - 邀请好友',
        text: `使用我的推荐码 ${user.referralCode} 注册积分宝，立即获得额外奖励！`,
        url: `${window.location.origin}?ref=${user.referralCode}`
      })
    } else {
      copyReferralCode()
    }
  }

  const getMembershipBadge = () => {
    const badges = {
      free: { icon: '👤', name: '免费用户', color: 'bg-gray-100 text-gray-800' },
      bronze: { icon: '🥉', name: '青铜会员', color: 'bg-amber-100 text-amber-800' },
      silver: { icon: '🥈', name: '白银会员', color: 'bg-gray-100 text-gray-800' },
      gold: { icon: '🥇', name: '黄金会员', color: 'bg-yellow-100 text-yellow-800' },
      platinum: { icon: '💎', name: '铂金会员', color: 'bg-purple-100 text-purple-800' }
    }
    
    return badges[user.membershipLevel] || badges.free
  }

  const membershipBadge = getMembershipBadge()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.username}
                </h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${membershipBadge.color}`}>
                  {membershipBadge.icon} {membershipBadge.name}
                </span>
              </div>
              
              <p className="text-gray-600 flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </p>
              
              <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                <Calendar className="h-4 w-4" />
                <span>注册时间: {new Date(user.createdAt).toLocaleDateString()}</span>
              </p>
            </div>

            {user.walletAddress && (
              <div className="text-green-600">
                <Wallet className="h-8 w-8" />
                <p className="text-xs mt-1">已连接钱包</p>
              </div>
            )}
          </div>

          {/* Points Display */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl">
              <Coins className="h-6 w-6 text-primary-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-primary-600">
                {user.points.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">可用积分</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-600">
                {user.totalEarned.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">累计获得</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Crown className="h-6 w-6 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-600">
                ${(user.totalWithdrawn * 0.01).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">已提现</div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {[
              { id: 'info', label: '个人信息', icon: User },
              { id: 'stats', label: '数据统计', icon: TrendingUp },
              { id: 'referral', label: '推荐好友', icon: Share2 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'info' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      用户名
                    </label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      邮箱
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会员等级
                    </label>
                    <div className={`px-4 py-2 rounded-lg ${membershipBadge.color}`}>
                      {membershipBadge.icon} {membershipBadge.name}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      钱包地址
                    </label>
                    <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      {user.walletAddress ? 
                        `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                        '未连接'
                      }
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="btn btn-primary">
                    <Settings className="h-4 w-4 mr-2" />
                    修改资料
                  </button>
                  <button className="btn bg-gray-600 text-white hover:bg-gray-700">
                    <Wallet className="h-4 w-4 mr-2" />
                    {user.walletAddress ? '更换钱包' : '连接钱包'}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-primary-600">
                      {user.points.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">当前积分</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {user.totalEarned.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">累计获得</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {user.totalWithdrawn.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">已提现积分</div>
                  </div>
                  
                  <div className="card text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">使用天数</div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">收益历史</h3>
                  <div className="space-y-3">
                    {[
                      { action: '观看视频', points: 10, time: '2小时前' },
                      { action: '完成任务', points: 50, time: '4小时前' },
                      { action: '每日签到', points: 15, time: '1天前' },
                      { action: '推荐好友', points: 100, time: '2天前' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <span className="font-medium">{item.action}</span>
                          <span className="text-sm text-gray-500 ml-2">{item.time}</span>
                        </div>
                        <span className="text-green-600 font-semibold">+{item.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'referral' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">我的推荐码</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                        <QrCode className="h-8 w-8 text-gray-400" />
                        <div>
                          <div className="text-2xl font-bold text-primary-600">
                            {user.referralCode}
                          </div>
                          <div className="text-sm text-gray-600">
                            邀请好友使用此码可获得奖励
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={copyReferralCode}
                        className="btn btn-primary"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        复制
                      </button>
                      <button
                        onClick={shareReferral}
                        className="btn bg-green-600 text-white hover:bg-green-700"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        分享
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold mb-4">推荐奖励规则</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <div className="font-medium">好友注册</div>
                        <div className="text-sm text-gray-600">好友使用推荐码注册，您获得100积分</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <div className="font-medium">好友活跃</div>
                        <div className="text-sm text-gray-600">好友每获得100积分，您获得10积分</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <div className="font-medium">好友升级</div>
                        <div className="text-sm text-gray-600">好友升级会员，您获得500积分</div>
                      </div>
                    </div>
                  </div>
                </div>

                {user.referredBy && (
                  <div className="card">
                    <h3 className="text-lg font-semibold mb-2">推荐人</h3>
                    <p className="text-gray-600">
                      您是通过推荐码 <span className="font-bold text-primary-600">{user.referredBy}</span> 注册的
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
