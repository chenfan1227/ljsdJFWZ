import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  Star, 
  Clock, 
  Trophy, 
  Zap,
  Target,
  Gamepad2,
  Gift,
  CheckCircle,
  Lock
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useAdStore } from '../stores/adStore'
import toast from 'react-hot-toast'

interface Game {
  id: string
  title: string
  description: string
  image: string
  difficulty: 'easy' | 'medium' | 'hard'
  baseReward: number
  bonusReward: number
  estimatedTime: number
  category: string
  unlocked: boolean
  completed: boolean
}

export const Games: React.FC = () => {
  const { user, isAuthenticated, updatePoints } = useAuthStore()
  const { showRewardedAd, isAdLoaded, isAdPlaying } = useAdStore()
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const games: Game[] = [
    {
      id: 'puzzle-master',
      title: '拼图大师',
      description: '完成拼图挑战，训练观察力',
      image: '🧩',
      difficulty: 'easy',
      baseReward: 20,
      bonusReward: 30,
      estimatedTime: 5,
      category: '益智',
      unlocked: true,
      completed: false
    },
    {
      id: 'number-rush',
      title: '数字冲刺',
      description: '快速计算数学题目',
      image: '🔢',
      difficulty: 'medium',
      baseReward: 30,
      bonusReward: 50,
      estimatedTime: 8,
      category: '益智',
      unlocked: true,
      completed: false
    },
    {
      id: 'memory-card',
      title: '记忆卡片',
      description: '挑战你的记忆力极限',
      image: '🃏',
      difficulty: 'medium',
      baseReward: 25,
      bonusReward: 40,
      estimatedTime: 10,
      category: '记忆',
      unlocked: true,
      completed: false
    },
    {
      id: 'snake-classic',
      title: '经典贪吃蛇',
      description: '重温经典游戏乐趣',
      image: '🐍',
      difficulty: 'easy',
      baseReward: 15,
      bonusReward: 25,
      estimatedTime: 12,
      category: '休闲',
      unlocked: true,
      completed: false
    },
    {
      id: 'tetris-blast',
      title: '俄罗斯方块',
      description: '经典方块消除游戏',
      image: '🎮',
      difficulty: 'hard',
      baseReward: 40,
      bonusReward: 70,
      estimatedTime: 15,
      category: '休闲',
      unlocked: user?.points ? user.points >= 100 : false,
      completed: false
    },
    {
      id: 'word-finder',
      title: '单词查找',
      description: '在字母网格中找到单词',
      image: '📝',
      difficulty: 'medium',
      baseReward: 35,
      bonusReward: 60,
      estimatedTime: 10,
      category: '文字',
      unlocked: user?.points ? user.points >= 200 : false,
      completed: false
    },
    {
      id: 'space-shooter',
      title: '太空射击',
      description: '消灭外星入侵者',
      image: '🚀',
      difficulty: 'hard',
      baseReward: 50,
      bonusReward: 100,
      estimatedTime: 20,
      category: '动作',
      unlocked: user?.points ? user.points >= 500 : false,
      completed: false
    },
    {
      id: 'crypto-quiz',
      title: '加密货币测验',
      description: '测试你的区块链知识',
      image: '₿',
      difficulty: 'hard',
      baseReward: 60,
      bonusReward: 120,
      estimatedTime: 15,
      category: '知识',
      unlocked: user?.membershipLevel !== 'free',
      completed: false
    }
  ]

  const categories = ['all', '益智', '记忆', '休闲', '文字', '动作', '知识']

  const filteredGames = activeCategory === 'all' 
    ? games 
    : games.filter(game => game.category === activeCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '简单'
      case 'medium': return '中等'
      case 'hard': return '困难'
      default: return '未知'
    }
  }

  const playGame = async (game: Game) => {
    if (!isAuthenticated) {
      toast.error('请先登录')
      return
    }

    if (!game.unlocked) {
      toast.error('请先解锁此游戏')
      return
    }

    setSelectedGame(game)
    
    // 模拟游戏过程
    toast.loading('游戏进行中...', { duration: 3000 })
    
    setTimeout(async () => {
      // 游戏完成，给予基础奖励
      updatePoints(game.baseReward)
      toast.success(`游戏完成！获得 ${game.baseReward} 积分！`)
      
      // 提示观看激励视频获得额外奖励
      setTimeout(() => {
        toast((t) => (
          <div className="flex flex-col space-y-2">
            <span>观看视频广告可获得额外 {game.bonusReward} 积分！</span>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  toast.dismiss(t.id)
                  const success = await showRewardedAd()
                  if (success) {
                    updatePoints(game.bonusReward)
                    toast.success(`额外奖励！获得 ${game.bonusReward} 积分！`)
                  }
                }}
                className="bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700"
                disabled={isAdPlaying || !isAdLoaded}
              >
                {isAdPlaying ? '播放中...' : '观看视频'}
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
              >
                跳过
              </button>
            </div>
          </div>
        ), { duration: 10000 })
      }, 1000)
      
      setSelectedGame(null)
    }, 3000)
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
            游戏中心
          </h1>
          <p className="text-gray-600">
            玩游戏赚积分，看广告获得额外奖励
          </p>
        </motion.div>

        {/* User Progress */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="h-6 w-6 text-primary-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {games.filter(g => g.completed).length}
                </div>
                <div className="text-sm text-gray-600">已完成游戏</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {games.filter(g => g.unlocked).length}
                </div>
                <div className="text-sm text-gray-600">可玩游戏</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {user.points}
                </div>
                <div className="text-sm text-gray-600">当前积分</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.floor(user.totalEarned * 0.3)}
                </div>
                <div className="text-sm text-gray-600">游戏积分</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card hover:shadow-xl transition-all duration-300 ${
                game.unlocked ? 'cursor-pointer' : 'opacity-60'
              }`}
              onClick={() => game.unlocked && playGame(game)}
            >
              {/* Game Image */}
              <div className="text-4xl mb-4 text-center">
                {game.image}
              </div>

              {/* Game Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {game.title}
                  </h3>
                  {game.completed && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {!game.unlocked && (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600">
                  {game.description}
                </p>

                {/* Difficulty */}
                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                  {getDifficultyText(game.difficulty)}
                </div>

                {/* Rewards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">基础奖励:</span>
                    <span className="font-semibold text-green-600">
                      {game.baseReward} 积分
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">视频奖励:</span>
                    <span className="font-semibold text-purple-600">
                      +{game.bonusReward} 积分
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>约 {game.estimatedTime} 分钟</span>
                </div>

                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (game.unlocked) {
                      playGame(game)
                    }
                  }}
                  disabled={!game.unlocked || (selectedGame?.id === game.id)}
                  className={`w-full btn ${
                    game.unlocked 
                      ? 'btn-primary' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } text-sm`}
                >
                  {selectedGame?.id === game.id ? (
                    '游戏中...'
                  ) : game.unlocked ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      开始游戏
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      未解锁
                    </>
                  )}
                </button>

                {!game.unlocked && (
                  <div className="text-xs text-gray-500 text-center">
                    {game.id === 'tetris-blast' && '需要100积分解锁'}
                    {game.id === 'word-finder' && '需要200积分解锁'}
                    {game.id === 'space-shooter' && '需要500积分解锁'}
                    {game.id === 'crypto-quiz' && '需要会员等级解锁'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                游戏奖励提示
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 完成游戏即可获得基础积分奖励</li>
                <li>• 观看激励视频广告可获得额外奖励</li>
                <li>• 游戏难度越高，奖励越丰富</li>
                <li>• 升级会员可解锁更多高级游戏</li>
                <li>• 每日首次完成游戏有额外积分加成</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
