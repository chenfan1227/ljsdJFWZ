import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Crown, 
  Star, 
  Zap, 
  Shield,
  TrendingUp,
  Gift,
  Sparkles,
  Check,
  X,
  Coins,
  Calendar,
  Users,
  Award,
  Clock,
  Heart
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useAdStore } from '../stores/adStore'
import toast from 'react-hot-toast'

interface MembershipTier {
  id: string
  name: string
  level: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum'
  price: number
  duration: number // months
  pointsCost?: number
  icon: string
  color: string
  gradient: string
  features: string[]
  benefits: {
    pointsBonus: number
    adFree: boolean
    exclusiveGames: boolean
    prioritySupport: boolean
    withdrawDiscount: number
    lotteryBonus: number
    referralBonus: number
  }
  popular?: boolean
}

export const Membership: React.FC = () => {
  const { user, isAuthenticated, updatePoints, updateUser } = useAuthStore()
  const { setAdVisibility } = useAdStore()
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'points' | 'crypto'>('points')

  const membershipTiers: MembershipTier[] = [
    {
      id: 'free',
      name: '免费用户',
      level: 'free',
      price: 0,
      duration: 0,
      icon: '👤',
      color: 'text-gray-600',
      gradient: 'from-gray-400 to-gray-600',
      features: [
        '基础积分获取',
        '观看所有广告',
        '基础抽奖权限',
        '标准客服支持'
      ],
      benefits: {
        pointsBonus: 0,
        adFree: false,
        exclusiveGames: false,
        prioritySupport: false,
        withdrawDiscount: 0,
        lotteryBonus: 0,
        referralBonus: 0
      }
    },
    {
      id: 'bronze',
      name: '青铜会员',
      level: 'bronze',
      price: 9.99,
      duration: 1,
      pointsCost: 1000,
      icon: '🥉',
      color: 'text-amber-600',
      gradient: 'from-amber-400 to-amber-600',
      features: [
        '积分获取 +10%',
        '去除横幅广告',
        '专属青铜游戏',
        '优先客服支持',
        '提现手续费 -5%'
      ],
      benefits: {
        pointsBonus: 10,
        adFree: true,
        exclusiveGames: true,
        prioritySupport: true,
        withdrawDiscount: 5,
        lotteryBonus: 5,
        referralBonus: 10
      }
    },
    {
      id: 'silver',
      name: '白银会员',
      level: 'silver',
      price: 19.99,
      duration: 1,
      pointsCost: 2000,
      icon: '🥈',
      color: 'text-gray-500',
      gradient: 'from-gray-400 to-gray-600',
      features: [
        '积分获取 +20%',
        '完全无广告体验',
        '专属白银游戏',
        '24/7客服支持',
        '提现手续费 -10%',
        '抽奖中奖率 +10%'
      ],
      benefits: {
        pointsBonus: 20,
        adFree: true,
        exclusiveGames: true,
        prioritySupport: true,
        withdrawDiscount: 10,
        lotteryBonus: 10,
        referralBonus: 20
      },
      popular: true
    },
    {
      id: 'gold',
      name: '黄金会员',
      level: 'gold',
      price: 39.99,
      duration: 1,
      pointsCost: 4000,
      icon: '🥇',
      color: 'text-yellow-500',
      gradient: 'from-yellow-400 to-yellow-600',
      features: [
        '积分获取 +35%',
        '完全无广告体验',
        '全部专属游戏',
        'VIP客服专线',
        '提现手续费 -20%',
        '抽奖中奖率 +20%',
        '推荐奖励 +50%'
      ],
      benefits: {
        pointsBonus: 35,
        adFree: true,
        exclusiveGames: true,
        prioritySupport: true,
        withdrawDiscount: 20,
        lotteryBonus: 20,
        referralBonus: 50
      }
    },
    {
      id: 'platinum',
      name: '铂金会员',
      level: 'platinum',
      price: 99.99,
      duration: 1,
      pointsCost: 10000,
      icon: '💎',
      color: 'text-purple-600',
      gradient: 'from-purple-400 to-purple-600',
      features: [
        '积分获取 +50%',
        '完全无广告体验',
        '独家铂金内容',
        '专属客户经理',
        '零手续费提现',
        '抽奖中奖率 +30%',
        '推荐奖励 +100%',
        '专属NFT奖励'
      ],
      benefits: {
        pointsBonus: 50,
        adFree: true,
        exclusiveGames: true,
        prioritySupport: true,
        withdrawDiscount: 100,
        lotteryBonus: 30,
        referralBonus: 100
      }
    }
  ]

  const currentTier = membershipTiers.find(tier => tier.level === (user?.membershipLevel || 'free'))

  const handleUpgrade = async (tier: MembershipTier) => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录')
      return
    }

    if (tier.level === user.membershipLevel) {
      toast.error('您已经是该等级会员')
      return
    }

    if (paymentMethod === 'points') {
      if (!tier.pointsCost) {
        toast.error('该等级不支持积分支付')
        return
      }

      if (user.points < tier.pointsCost) {
        toast.error('积分不足')
        return
      }

      // 扣除积分
      updatePoints(-tier.pointsCost)
    }

    // 升级会员等级
    updateUser({ membershipLevel: tier.level })

    // 如果是会员，关闭广告
    if (tier.benefits.adFree) {
      setAdVisibility('banner', false)
      setAdVisibility('interstitial', false)
      setAdVisibility('appOpen', false)
    }

    toast.success(`成功升级到${tier.name}！`)
  }

  const canAfford = (tier: MembershipTier) => {
    if (paymentMethod === 'points') {
      return tier.pointsCost ? user && user.points >= tier.pointsCost : false
    }
    return true // 假设加密货币支付总是可用的
  }

  const isCurrentTier = (tier: MembershipTier) => {
    return user?.membershipLevel === tier.level
  }

  const isDowngrade = (tier: MembershipTier) => {
    if (!user) return false
    const tierOrder = ['free', 'bronze', 'silver', 'gold', 'platinum']
    const currentIndex = tierOrder.indexOf(user.membershipLevel)
    const targetIndex = tierOrder.indexOf(tier.level)
    return targetIndex < currentIndex
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            👑 会员中心
          </h1>
          <p className="text-gray-600">
            升级会员，享受更多特权和更高收益
          </p>
        </motion.div>

        {/* Current Status */}
        {isAuthenticated && user && currentTier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${currentTier.gradient} text-white rounded-2xl p-6 mb-8`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{currentTier.icon}</div>
                <div>
                  <h2 className="text-2xl font-bold">
                    当前等级: {currentTier.name}
                  </h2>
                  <p className="opacity-90">
                    享受 {currentTier.benefits.pointsBonus}% 积分加成
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  {user.points.toLocaleString()}
                </div>
                <div className="opacity-80">可用积分</div>
              </div>
            </div>

            {currentTier.level !== 'free' && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">+{currentTier.benefits.pointsBonus}%</div>
                  <div className="text-sm opacity-80">积分加成</div>
                </div>
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">{currentTier.benefits.adFree ? '已开启' : '未开启'}</div>
                  <div className="text-sm opacity-80">无广告</div>
                </div>
                <div className="text-center">
                  <Star className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">+{currentTier.benefits.lotteryBonus}%</div>
                  <div className="text-sm opacity-80">中奖率</div>
                </div>
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-1" />
                  <div className="font-semibold">+{currentTier.benefits.referralBonus}%</div>
                  <div className="text-sm opacity-80">推荐奖励</div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Payment Method Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setPaymentMethod('points')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                paymentMethod === 'points'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Coins className="h-4 w-4 inline mr-2" />
              积分支付
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                paymentMethod === 'crypto'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Zap className="h-4 w-4 inline mr-2" />
              加密货币
            </button>
          </div>
        </div>

        {/* Membership Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
          {membershipTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                tier.popular ? 'ring-2 ring-primary-500' : ''
              } ${isCurrentTier(tier) ? 'bg-primary-50 border-primary-200' : ''}`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary-600 text-white text-center py-1 text-xs font-medium">
                  最受欢迎
                </div>
              )}

              {/* Current Badge */}
              {isCurrentTier(tier) && (
                <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-1 text-xs font-medium rounded-bl-lg">
                  当前等级
                </div>
              )}

              <div className={`mt-${tier.popular ? '6' : '0'}`}>
                {/* Icon */}
                <div className="text-center mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${tier.gradient} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <span className="text-white text-2xl">{tier.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {tier.name}
                  </h3>
                </div>

                {/* Price */}
                <div className="text-center mb-4">
                  {tier.level === 'free' ? (
                    <div className="text-2xl font-bold text-gray-900">免费</div>
                  ) : (
                    <>
                      {paymentMethod === 'points' ? (
                        <div>
                          <div className="text-2xl font-bold text-primary-600">
                            {tier.pointsCost?.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">积分</div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-2xl font-bold text-primary-600">
                            ${tier.price}
                          </div>
                          <div className="text-sm text-gray-600">
                            每月
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleUpgrade(tier)}
                  disabled={
                    isCurrentTier(tier) || 
                    isDowngrade(tier) || 
                    !canAfford(tier) ||
                    !isAuthenticated
                  }
                  className={`w-full btn text-sm ${
                    isCurrentTier(tier)
                      ? 'bg-green-600 text-white cursor-default'
                      : isDowngrade(tier)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : !canAfford(tier)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : !isAuthenticated
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : tier.level === 'free'
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'btn-primary'
                  }`}
                >
                  {isCurrentTier(tier) ? (
                    '当前等级'
                  ) : isDowngrade(tier) ? (
                    '无法降级'
                  ) : !isAuthenticated ? (
                    '请先登录'
                  ) : !canAfford(tier) ? (
                    '积分不足'
                  ) : tier.level === 'free' ? (
                    '当前方案'
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      升级
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Benefits Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
        >
          <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6">
            <h2 className="text-2xl font-bold text-center">会员特权对比</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    特权
                  </th>
                  {membershipTiers.slice(1).map((tier) => (
                    <th key={tier.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {tier.icon} {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    积分获取加成
                  </td>
                  {membershipTiers.slice(1).map((tier) => (
                    <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-green-600 font-semibold">
                        +{tier.benefits.pointsBonus}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    无广告体验
                  </td>
                  {membershipTiers.slice(1).map((tier) => (
                    <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                      {tier.benefits.adFree ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    专属游戏
                  </td>
                  {membershipTiers.slice(1).map((tier) => (
                    <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                      {tier.benefits.exclusiveGames ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-500 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    提现手续费减免
                  </td>
                  {membershipTiers.slice(1).map((tier) => (
                    <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-blue-600 font-semibold">
                        -{tier.benefits.withdrawDiscount}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    抽奖中奖率加成
                  </td>
                  {membershipTiers.slice(1).map((tier) => (
                    <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-purple-600 font-semibold">
                        +{tier.benefits.lotteryBonus}%
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    推荐奖励加成
                  </td>
                  {membershipTiers.slice(1).map((tier) => (
                    <td key={tier.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-orange-600 font-semibold">
                        +{tier.benefits.referralBonus}%
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                会员特权说明
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 会员等级一旦升级，当月有效，不可降级</li>
                <li>• 积分加成适用于所有积分获取活动</li>
                <li>• 无广告体验包括横幅、插页和开屏广告</li>
                <li>• 专属游戏会定期更新，带来更多乐趣</li>
                <li>• 提现手续费减免适用于所有加密货币</li>
                <li>• 推荐奖励加成让您的邀请更有价值</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
