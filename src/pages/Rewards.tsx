import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Gift, 
  Star, 
  ShoppingCart, 
  Clock, 
  Tag,
  Sparkles,
  Package,
  Coins,
  Crown,
  Smartphone,
  Headphones,
  Gamepad2,
  Coffee,
  ArrowRight,
  Check
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface Reward {
  id: string
  name: string
  description: string
  image: string
  cost: number
  category: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  stock: number
  estimatedDelivery: string
  features: string[]
  discount?: number
  isExclusive?: boolean
}

export const Rewards: React.FC = () => {
  const { user, isAuthenticated, updatePoints } = useAuthStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)

  const rewards: Reward[] = [
    // 数字商品
    {
      id: 'steam-key-10',
      name: 'Steam游戏激活码',
      description: '随机Steam游戏激活码，价值$10',
      image: '🎮',
      cost: 1000,
      category: '数字商品',
      rarity: 'common',
      stock: 50,
      estimatedDelivery: '即时发放',
      features: ['随机游戏', '价值$10', '永久激活']
    },
    {
      id: 'netflix-month',
      name: 'Netflix会员1个月',
      description: 'Netflix高级会员账户1个月',
      image: '📺',
      cost: 1500,
      category: '数字商品',
      rarity: 'rare',
      stock: 30,
      estimatedDelivery: '即时发放',
      features: ['高清画质', '多设备使用', '无广告']
    },
    {
      id: 'spotify-premium',
      name: 'Spotify Premium 3个月',
      description: 'Spotify高级会员3个月',
      image: '🎵',
      cost: 2000,
      category: '数字商品',
      rarity: 'rare',
      stock: 25,
      estimatedDelivery: '即时发放',
      features: ['无广告', '离线下载', '高音质']
    },

    // 实物商品
    {
      id: 'wireless-earbuds',
      name: '无线蓝牙耳机',
      description: '高品质TWS蓝牙耳机，续航8小时',
      image: '🎧',
      cost: 3000,
      category: '电子产品',
      rarity: 'epic',
      stock: 15,
      estimatedDelivery: '3-7个工作日',
      features: ['降噪功能', '8小时续航', '快充支持']
    },
    {
      id: 'gaming-mouse',
      name: '游戏鼠标',
      description: '专业电竞游戏鼠标，RGB灯效',
      image: '🖱️',
      cost: 2500,
      category: '电子产品',
      rarity: 'rare',
      stock: 20,
      estimatedDelivery: '3-7个工作日',
      features: ['16000 DPI', 'RGB灯效', '人体工学设计']
    },
    {
      id: 'power-bank',
      name: '快充移动电源',
      description: '20000mAh大容量移动电源',
      image: '🔋',
      cost: 1800,
      category: '电子产品',
      rarity: 'common',
      stock: 40,
      estimatedDelivery: '3-7个工作日',
      features: ['20000mAh容量', '22.5W快充', '三口输出']
    },

    // 代金券
    {
      id: 'amazon-voucher-25',
      name: 'Amazon代金券 $25',
      description: 'Amazon购物代金券，可购买任意商品',
      image: '🛒',
      cost: 2500,
      category: '代金券',
      rarity: 'rare',
      stock: 35,
      estimatedDelivery: '即时发放',
      features: ['全球通用', '无使用限制', '永不过期']
    },
    {
      id: 'starbucks-card',
      name: '星巴克礼品卡 $15',
      description: '星巴克电子礼品卡',
      image: '☕',
      cost: 1500,
      category: '代金券',
      rarity: 'common',
      stock: 60,
      estimatedDelivery: '即时发放',
      features: ['全球门店通用', '电子卡券', '即时到账']
    },

    // 游戏内道具
    {
      id: 'game-gems-1000',
      name: '游戏宝石 x1000',
      description: '通用游戏内货币，可在多款游戏使用',
      image: '💎',
      cost: 500,
      category: '游戏道具',
      rarity: 'common',
      stock: 100,
      estimatedDelivery: '即时发放',
      features: ['多游戏通用', '永不过期', '即时到账']
    },
    {
      id: 'legendary-skin',
      name: '传说级皮肤',
      description: '随机传说级游戏皮肤',
      image: '✨',
      cost: 3500,
      category: '游戏道具',
      rarity: 'legendary',
      stock: 10,
      estimatedDelivery: '即时发放',
      features: ['传说级稀有度', '独特特效', '限量发放'],
      isExclusive: true
    },

    // VIP奖励（仅限会员）
    {
      id: 'iphone-15',
      name: 'iPhone 15 128GB',
      description: '全新iPhone 15，128GB存储',
      image: '📱',
      cost: 50000,
      category: 'VIP奖励',
      rarity: 'legendary',
      stock: 2,
      estimatedDelivery: '7-15个工作日',
      features: ['全新正品', '全球联保', '免费包邮'],
      isExclusive: true
    },
    {
      id: 'macbook-air',
      name: 'MacBook Air M2',
      description: 'MacBook Air M2芯片版本',
      image: '💻',
      cost: 80000,
      category: 'VIP奖励',
      rarity: 'legendary',
      stock: 1,
      estimatedDelivery: '7-15个工作日',
      features: ['M2芯片', '8GB内存', '256GB存储'],
      isExclusive: true
    }
  ]

  const categories = ['all', '数字商品', '电子产品', '代金券', '游戏道具', 'VIP奖励']

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory)

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return '普通'
      case 'rare': return '稀有'
      case 'epic': return '史诗'
      case 'legendary': return '传说'
      default: return '未知'
    }
  }

  const canAfford = (cost: number) => {
    return user ? user.points >= cost : false
  }

  const canAccess = (reward: Reward) => {
    if (reward.category === 'VIP奖励') {
      return user && user.membershipLevel !== 'free'
    }
    return true
  }

  const handlePurchase = (reward: Reward) => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录')
      return
    }

    if (!canAfford(reward.cost)) {
      toast.error('积分不足')
      return
    }

    if (!canAccess(reward)) {
      toast.error('需要会员等级才能兑换此奖励')
      return
    }

    if (reward.stock <= 0) {
      toast.error('库存不足')
      return
    }

    // 扣除积分
    updatePoints(-reward.cost)
    
    // 模拟奖励发放
    toast.success(`成功兑换 ${reward.name}！`)
    
    // 显示详细信息
    setTimeout(() => {
      toast((t) => (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5 text-green-600" />
            <span className="font-medium">兑换成功！</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>奖励：{reward.name}</p>
            <p>预计到账：{reward.estimatedDelivery}</p>
            <p>我们会通过邮件或应用内消息通知您</p>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700 self-start"
          >
            知道了
          </button>
        </div>
      ), { duration: 8000 })
    }, 1000)
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
            奖品商城
          </h1>
          <p className="text-gray-600">
            用积分兑换心仪的奖品和服务
          </p>
        </motion.div>

        {/* User Points */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">我的积分</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-6 w-6" />
                    <span className="text-3xl font-bold">
                      {user.points.toLocaleString()}
                    </span>
                  </div>
                  {user.membershipLevel !== 'free' && (
                    <div className="flex items-center space-x-1 bg-white/20 px-3 py-1 rounded-full">
                      <Crown className="h-4 w-4" />
                      <span className="text-sm font-medium">VIP会员</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80">下次积分到账</p>
                <p className="font-semibold">每日签到 +15</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            >
              {/* Rarity Border */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(reward.rarity)}`} />
              
              {/* Exclusive Badge */}
              {reward.isExclusive && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  限量
                </div>
              )}

              {/* Reward Image */}
              <div className="text-4xl mb-4 text-center">
                {reward.image}
              </div>

              {/* Reward Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {reward.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {reward.description}
                  </p>
                </div>

                {/* Rarity & Stock */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(reward.rarity)} text-white`}>
                    {getRarityText(reward.rarity)}
                  </span>
                  <span className="text-xs text-gray-500">
                    库存: {reward.stock}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-1">
                  {reward.features.slice(0, 2).map((feature, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-600">
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Delivery Time */}
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{reward.estimatedDelivery}</span>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-4 w-4 text-primary-600" />
                    <span className="font-bold text-primary-600">
                      {reward.cost.toLocaleString()}
                    </span>
                  </div>
                  
                  {!canAccess(reward) && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Crown className="h-4 w-4" />
                      <span className="text-xs">VIP</span>
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(reward)}
                  disabled={
                    !isAuthenticated || 
                    !canAfford(reward.cost) || 
                    !canAccess(reward) ||
                    reward.stock <= 0
                  }
                  className={`w-full btn text-sm ${
                    isAuthenticated && canAfford(reward.cost) && canAccess(reward) && reward.stock > 0
                      ? 'btn-primary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {!isAuthenticated ? (
                    '请先登录'
                  ) : !canAccess(reward) ? (
                    '需要会员'
                  ) : reward.stock <= 0 ? (
                    '已售罄'
                  ) : !canAfford(reward.cost) ? (
                    '积分不足'
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      立即兑换
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                兑换说明
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 数字商品和代金券会即时发放到您的账户</li>
                <li>• 实物商品需要填写收货地址，包邮配送</li>
                <li>• VIP奖励仅限会员兑换，享受更多专属特权</li>
                <li>• 所有奖品均为正品，提供售后保障</li>
                <li>• 兑换后积分无法退回，请谨慎选择</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
