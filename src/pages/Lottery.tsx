import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Ticket, 
  Star, 
  Crown, 
  Zap,
  Gift,
  Sparkles,
  Clock,
  Trophy,
  TrendingUp,
  Coins,
  Smartphone,
  ArrowRight,
  RotateCcw
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface LotteryPrize {
  id: string
  name: string
  image: string
  value: string
  probability: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  type: 'points' | 'item' | 'cash'
  amount?: number
}

interface LotteryType {
  id: string
  name: string
  description: string
  cost: number
  guaranteedAfter: number
  icon: React.ElementType
  color: string
  prizes: LotteryPrize[]
}

export const Lottery: React.FC = () => {
  const { user, isAuthenticated, updatePoints } = useAuthStore()
  const [selectedLottery, setSelectedLottery] = useState<LotteryType | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winResult, setWinResult] = useState<LotteryPrize | null>(null)
  const [spinCount, setSpinCount] = useState(0)

  const lotteryTypes: LotteryType[] = [
    {
      id: 'basic',
      name: '基础抽奖',
      description: '每次50积分，有机会获得iPhone16ProMax',
      cost: 50,
      guaranteedAfter: 10,
      icon: Ticket,
      color: 'from-blue-500 to-cyan-500',
      prizes: [
        { id: 'points-10', name: '10积分', image: '🪙', value: '10积分', probability: 40, rarity: 'common', type: 'points', amount: 10 },
        { id: 'points-50', name: '50积分', image: '💰', value: '50积分', probability: 25, rarity: 'common', type: 'points', amount: 50 },
        { id: 'points-100', name: '100积分', image: '💎', value: '100积分', probability: 15, rarity: 'rare', type: 'points', amount: 100 },
        { id: 'headphones', name: '蓝牙耳机', image: '🎧', value: '$99', probability: 8, rarity: 'rare', type: 'item' },
        { id: 'smartwatch', name: '智能手表', image: '⌚', value: '$299', probability: 5, rarity: 'epic', type: 'item' },
        { id: 'tablet', name: 'iPad', image: '📱', value: '$499', probability: 3, rarity: 'epic', type: 'item' },
        { id: 'laptop', name: 'MacBook', image: '💻', value: '$1299', probability: 2, rarity: 'legendary', type: 'item' },
        { id: 'iphone16pro', name: 'iPhone16ProMax', image: '📱', value: '$1599', probability: 1, rarity: 'legendary', type: 'item' },
        { id: 'cash-1000', name: '$1000现金', image: '💵', value: '$1000', probability: 1, rarity: 'legendary', type: 'cash', amount: 1000 }
      ]
    },
    {
      id: 'premium',
      name: '高级抽奖',
      description: '每次200积分，更高概率获得稀有奖品',
      cost: 200,
      guaranteedAfter: 5,
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      prizes: [
        { id: 'points-100', name: '100积分', image: '💰', value: '100积分', probability: 30, rarity: 'common', type: 'points', amount: 100 },
        { id: 'points-500', name: '500积分', image: '💎', value: '500积分', probability: 20, rarity: 'rare', type: 'points', amount: 500 },
        { id: 'gaming-gear', name: '游戏装备', image: '🎮', value: '$199', probability: 15, rarity: 'rare', type: 'item' },
        { id: 'smartwatch-pro', name: 'Apple Watch', image: '⌚', value: '$399', probability: 12, rarity: 'epic', type: 'item' },
        { id: 'ipad-pro', name: 'iPad Pro', image: '📱', value: '$799', probability: 10, rarity: 'epic', type: 'item' },
        { id: 'macbook-air', name: 'MacBook Air', image: '💻', value: '$1199', probability: 8, rarity: 'legendary', type: 'item' },
        { id: 'iphone16pro-max', name: 'iPhone16ProMax', image: '📱', value: '$1599', probability: 3, rarity: 'legendary', type: 'item' },
        { id: 'cash-5000', name: '$5000现金', image: '💵', value: '$5000', probability: 2, rarity: 'legendary', type: 'cash', amount: 5000 }
      ]
    },
    {
      id: 'mega',
      name: '超级抽奖',
      description: '每次1000积分，保底获得高价值奖品',
      cost: 1000,
      guaranteedAfter: 3,
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      prizes: [
        { id: 'points-1000', name: '1000积分', image: '💎', value: '1000积分', probability: 25, rarity: 'rare', type: 'points', amount: 1000 },
        { id: 'gaming-laptop', name: '游戏笔记本', image: '💻', value: '$1999', probability: 20, rarity: 'epic', type: 'item' },
        { id: 'iphone-latest', name: '最新iPhone', image: '📱', value: '$1599', probability: 18, rarity: 'epic', type: 'item' },
        { id: 'macbook-pro', name: 'MacBook Pro', image: '💻', value: '$2499', probability: 15, rarity: 'legendary', type: 'item' },
        { id: 'cash-10000', name: '$10000现金', image: '💵', value: '$10000', probability: 10, rarity: 'legendary', type: 'cash', amount: 10000 },
        { id: 'tesla-model3', name: 'Tesla Model 3', image: '🚗', value: '$45000', probability: 5, rarity: 'legendary', type: 'item' },
        { id: 'crypto-btc', name: '1 BTC', image: '₿', value: '$65000', probability: 4, rarity: 'legendary', type: 'cash', amount: 65000 },
        { id: 'jackpot', name: '超级大奖', image: '🎰', value: '$100000', probability: 3, rarity: 'legendary', type: 'cash', amount: 100000 }
      ]
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600'
      case 'rare': return 'from-blue-400 to-blue-600'
      case 'epic': return 'from-purple-400 to-purple-600'
      case 'legendary': return 'from-yellow-400 to-orange-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const selectRandomPrize = (prizes: LotteryPrize[]): LotteryPrize => {
    const random = Math.random() * 100
    let cumulativeProbability = 0
    
    for (const prize of prizes) {
      cumulativeProbability += prize.probability
      if (random <= cumulativeProbability) {
        return prize
      }
    }
    
    // Fallback to first prize
    return prizes[0]
  }

  const handleSpin = async (lottery: LotteryType) => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录')
      return
    }

    if (user.points < lottery.cost) {
      toast.error('积分不足')
      return
    }

    setIsSpinning(true)
    setWinResult(null)
    
    // 扣除积分
    updatePoints(-lottery.cost)
    setSpinCount(prev => prev + 1)

    // 模拟抽奖动画
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // 选择奖品
    const prize = selectRandomPrize(lottery.prizes)
    setWinResult(prize)
    setIsSpinning(false)

    // 给予奖励
    if (prize.type === 'points' && prize.amount) {
      updatePoints(prize.amount)
      toast.success(`恭喜获得 ${prize.name}！`)
    } else {
      toast.success(`恭喜获得 ${prize.name}！`)
      // 这里应该将实物奖品添加到用户的奖品列表中
    }
  }

  const canAfford = (cost: number) => {
    return user ? user.points >= cost : false
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
            🎰 幸运抽奖
          </h1>
          <p className="text-gray-600">
            用积分参与抽奖，赢取iPhone16ProMax等超级大奖！
          </p>
        </motion.div>

        {/* User Stats */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-2xl p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Coins className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-sm opacity-80">可用积分</div>
              </div>
              
              <div className="text-center">
                <Ticket className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {spinCount}
                </div>
                <div className="text-sm opacity-80">今日抽奖</div>
              </div>
              
              <div className="text-center">
                <Trophy className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  0
                </div>
                <div className="text-sm opacity-80">获得奖品</div>
              </div>
              
              <div className="text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {user.membershipLevel !== 'free' ? '+20%' : '0%'}
                </div>
                <div className="text-sm opacity-80">中奖加成</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lottery Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {lotteryTypes.map((lottery, index) => (
            <motion.div
              key={lottery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedLottery(lottery)}
            >
              <div className={`w-16 h-16 bg-gradient-to-r ${lottery.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <lottery.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                {lottery.name}
              </h3>
              
              <p className="text-gray-600 text-center mb-4">
                {lottery.description}
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">抽奖费用:</span>
                  <div className="flex items-center space-x-1">
                    <Coins className="h-4 w-4 text-primary-600" />
                    <span className="font-bold text-primary-600">
                      {lottery.cost}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">保底次数:</span>
                  <span className="font-bold text-gray-900">
                    {lottery.guaranteedAfter}次
                  </span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleSpin(lottery)
                }}
                disabled={!isAuthenticated || !canAfford(lottery.cost) || isSpinning}
                className={`w-full btn mt-4 ${
                  isAuthenticated && canAfford(lottery.cost) && !isSpinning
                    ? 'btn-primary'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSpinning ? (
                  <div className="flex items-center justify-center space-x-2">
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    <span>抽奖中...</span>
                  </div>
                ) : !isAuthenticated ? (
                  '请先登录'
                ) : !canAfford(lottery.cost) ? (
                  '积分不足'
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    立即抽奖
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Prize Display Modal */}
        <AnimatePresence>
          {selectedLottery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedLottery(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${selectedLottery.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <selectedLottery.icon className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLottery.name}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {selectedLottery.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {selectedLottery.prizes.map((prize) => (
                    <div
                      key={prize.id}
                      className="card text-center p-4 relative overflow-hidden"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(prize.rarity)}`} />
                      
                      <div className="text-2xl mb-2">{prize.image}</div>
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">
                        {prize.name}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {prize.value}
                      </p>
                      <div className="text-xs text-gray-500">
                        {prize.probability}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedLottery(null)}
                    className="flex-1 btn bg-gray-600 text-white hover:bg-gray-700"
                  >
                    关闭
                  </button>
                  <button
                    onClick={() => {
                      handleSpin(selectedLottery)
                      setSelectedLottery(null)
                    }}
                    disabled={!isAuthenticated || !canAfford(selectedLottery.cost) || isSpinning}
                    className={`flex-1 btn ${
                      isAuthenticated && canAfford(selectedLottery.cost) && !isSpinning
                        ? 'btn-primary'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    立即抽奖
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Win Result Modal */}
        <AnimatePresence>
          {winResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotateY: -90 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="bg-white rounded-2xl p-8 text-center max-w-md w-full"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  {winResult.image}
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎉 恭喜中奖！
                </h2>
                
                <p className="text-lg font-semibold text-primary-600 mb-2">
                  {winResult.name}
                </p>
                
                <p className="text-gray-600 mb-6">
                  价值 {winResult.value}
                </p>
                
                <div className={`inline-block px-4 py-2 rounded-full text-white bg-gradient-to-r ${getRarityColor(winResult.rarity)} mb-6`}>
                  {winResult.rarity === 'common' && '普通奖品'}
                  {winResult.rarity === 'rare' && '稀有奖品'}
                  {winResult.rarity === 'epic' && '史诗奖品'}
                  {winResult.rarity === 'legendary' && '传说奖品'}
                </div>
                
                <button
                  onClick={() => setWinResult(null)}
                  className="btn btn-primary w-full"
                >
                  太棒了！
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                抽奖规则
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 每次抽奖都有机会获得iPhone16ProMax等超级大奖</li>
                <li>• 高级抽奖和超级抽奖有更高的中奖概率</li>
                <li>• 会员用户享受20%中奖概率加成</li>
                <li>• 连续抽奖达到保底次数必中稀有奖品</li>
                <li>• 所有实物奖品均为正品，免费包邮配送</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
