import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  DollarSign, 
  ArrowRight, 
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Bitcoin,
  Coins
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

interface CryptoCurrency {
  id: string
  name: string
  symbol: string
  icon: string
  network: string
  minWithdraw: number
  exchangeRate: number // points per 1 unit
  fees: number
  processingTime: string
  color: string
}

interface WithdrawalHistory {
  id: string
  currency: string
  amount: number
  pointsUsed: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  txHash?: string
  createdAt: string
  estimatedCompletion: string
}

export const Withdraw: React.FC = () => {
  const { user, isAuthenticated, updatePoints } = useAuthStore()
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw')

  const cryptoCurrencies: CryptoCurrency[] = [
    {
      id: 'usdt',
      name: 'Tether',
      symbol: 'USDT',
      icon: '₮',
      network: 'TRC20',
      minWithdraw: 10,
      exchangeRate: 100, // 100 points = 1 USDT
      fees: 1,
      processingTime: '5-10分钟',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'usdc',
      name: 'USD Coin',
      symbol: 'USDC',
      icon: '$',
      network: 'ERC20',
      minWithdraw: 10,
      exchangeRate: 100, // 100 points = 1 USDC
      fees: 2,
      processingTime: '10-30分钟',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: '₿',
      network: 'Bitcoin',
      minWithdraw: 0.001,
      exchangeRate: 6500000, // 6,500,000 points = 1 BTC (at $65k)
      fees: 0.0001,
      processingTime: '30-60分钟',
      color: 'from-orange-500 to-yellow-600'
    },
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'Ξ',
      network: 'Ethereum',
      minWithdraw: 0.01,
      exchangeRate: 350000, // 350,000 points = 1 ETH (at $3.5k)
      fees: 0.002,
      processingTime: '10-20分钟',
      color: 'from-purple-500 to-indigo-600'
    }
  ]

  const [withdrawalHistory] = useState<WithdrawalHistory[]>([
    {
      id: '1',
      currency: 'USDT',
      amount: 50,
      pointsUsed: 5000,
      status: 'completed',
      txHash: '0x1234...5678',
      createdAt: '2024-01-15T10:30:00Z',
      estimatedCompletion: '2024-01-15T10:45:00Z'
    },
    {
      id: '2',
      currency: 'USDC',
      amount: 25,
      pointsUsed: 2500,
      status: 'processing',
      createdAt: '2024-01-16T14:20:00Z',
      estimatedCompletion: '2024-01-16T14:50:00Z'
    }
  ])

  const calculatePointsNeeded = (amount: number, currency: CryptoCurrency) => {
    return Math.ceil(amount * currency.exchangeRate)
  }

  const calculateReceiveAmount = (amount: number, currency: CryptoCurrency) => {
    return Math.max(0, amount - currency.fees)
  }

  const canAfford = (pointsNeeded: number) => {
    return user ? user.points >= pointsNeeded : false
  }

  const handleWithdraw = async () => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录')
      return
    }

    if (!selectedCurrency) {
      toast.error('请选择提现货币')
      return
    }

    const amount = parseFloat(withdrawAmount)
    if (!amount || amount < selectedCurrency.minWithdraw) {
      toast.error(`最小提现金额为 ${selectedCurrency.minWithdraw} ${selectedCurrency.symbol}`)
      return
    }

    if (!walletAddress) {
      toast.error('请输入钱包地址')
      return
    }

    const pointsNeeded = calculatePointsNeeded(amount, selectedCurrency)
    if (!canAfford(pointsNeeded)) {
      toast.error('积分不足')
      return
    }

    setIsProcessing(true)

    try {
      // 模拟提现处理
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 扣除积分
      updatePoints(-pointsNeeded)
      
      toast.success(`提现申请已提交！预计 ${selectedCurrency.processingTime} 内到账`)
      
      // 重置表单
      setWithdrawAmount('')
      setWalletAddress('')
      setSelectedCurrency(null)
      
    } catch (error) {
      toast.error('提现失败，请重试')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('地址已复制')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'processing': return 'text-blue-600 bg-blue-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'failed': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'processing': return '处理中'
      case 'pending': return '待处理'
      case 'failed': return '失败'
      default: return '未知'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'processing': return Clock
      case 'pending': return Clock
      case 'failed': return AlertCircle
      default: return Clock
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            💰 加密货币提现
          </h1>
          <p className="text-gray-600">
            将积分兑换为USDT、BTC、ETH等主流加密货币
          </p>
        </motion.div>

        {/* User Balance */}
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
                <DollarSign className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  ${(user.points / 100).toFixed(2)}
                </div>
                <div className="text-sm opacity-80">估值(USDT)</div>
              </div>
              
              <div className="text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {user.totalWithdrawn.toLocaleString()}
                </div>
                <div className="text-sm opacity-80">累计提现</div>
              </div>
              
              <div className="text-center">
                <Wallet className="h-6 w-6 mx-auto mb-1" />
                <div className="text-2xl font-bold">
                  {user.walletAddress ? '已连接' : '未连接'}
                </div>
                <div className="text-sm opacity-80">钱包状态</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'withdraw', label: '提现', icon: Wallet },
              { id: 'history', label: '提现记录', icon: Clock }
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

          <div className="p-6">
            {activeTab === 'withdraw' && (
              <div className="space-y-6">
                {/* Currency Selection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">选择提现货币</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {cryptoCurrencies.map((currency) => (
                      <motion.div
                        key={currency.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`card cursor-pointer transition-all duration-200 ${
                          selectedCurrency?.id === currency.id
                            ? 'ring-2 ring-primary-500 bg-primary-50'
                            : 'hover:shadow-lg'
                        }`}
                        onClick={() => setSelectedCurrency(currency)}
                      >
                        <div className={`w-12 h-12 bg-gradient-to-r ${currency.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <span className="text-white text-xl font-bold">
                            {currency.icon}
                          </span>
                        </div>
                        <h4 className="font-semibold text-center mb-1">
                          {currency.symbol}
                        </h4>
                        <p className="text-sm text-gray-600 text-center mb-2">
                          {currency.name}
                        </p>
                        <div className="text-xs text-gray-500 text-center">
                          最小: {currency.minWithdraw} {currency.symbol}
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          手续费: {currency.fees} {currency.symbol}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Withdrawal Form */}
                {selectedCurrency && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold mb-2">
                        {selectedCurrency.name} ({selectedCurrency.symbol})
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">网络:</span>
                          <span className="ml-2 font-medium">{selectedCurrency.network}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">兑换率:</span>
                          <span className="ml-2 font-medium">
                            {selectedCurrency.exchangeRate.toLocaleString()} 积分 = 1 {selectedCurrency.symbol}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">处理时间:</span>
                          <span className="ml-2 font-medium">{selectedCurrency.processingTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">手续费:</span>
                          <span className="ml-2 font-medium">
                            {selectedCurrency.fees} {selectedCurrency.symbol}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        提现金额 ({selectedCurrency.symbol})
                      </label>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder={`最小金额: ${selectedCurrency.minWithdraw} ${selectedCurrency.symbol}`}
                        min={selectedCurrency.minWithdraw}
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {withdrawAmount && (
                        <div className="mt-2 text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600">需要积分:</span>
                            <span className="font-medium">
                              {calculatePointsNeeded(parseFloat(withdrawAmount), selectedCurrency).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">手续费:</span>
                            <span className="font-medium">
                              {selectedCurrency.fees} {selectedCurrency.symbol}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="text-gray-600">实际到账:</span>
                            <span className="font-bold text-green-600">
                              {calculateReceiveAmount(parseFloat(withdrawAmount), selectedCurrency).toFixed(8)} {selectedCurrency.symbol}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        接收地址 ({selectedCurrency.network})
                      </label>
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={`输入 ${selectedCurrency.symbol} 钱包地址`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <div className="mt-2 flex items-start space-x-2">
                        <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-xs text-gray-600">
                          请确保地址正确且支持 {selectedCurrency.network} 网络，错误的地址可能导致资产丢失
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={
                        !withdrawAmount || 
                        !walletAddress || 
                        isProcessing ||
                        !canAfford(calculatePointsNeeded(parseFloat(withdrawAmount) || 0, selectedCurrency))
                      }
                      className={`w-full btn py-3 text-base font-medium ${
                        withdrawAmount && walletAddress && !isProcessing &&
                        canAfford(calculatePointsNeeded(parseFloat(withdrawAmount) || 0, selectedCurrency))
                          ? 'btn-primary'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>处理中...</span>
                        </div>
                      ) : (
                        <>
                          <Zap className="h-5 w-5 mr-2" />
                          立即提现
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">提现记录</h3>
                {withdrawalHistory.length > 0 ? (
                  <div className="space-y-4">
                    {withdrawalHistory.map((record) => {
                      const StatusIcon = getStatusIcon(record.status)
                      return (
                        <div key={record.id} className="card">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-primary-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">
                                  {record.amount} {record.currency}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  使用 {record.pointsUsed.toLocaleString()} 积分
                                </p>
                              </div>
                            </div>
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                              <StatusIcon className="h-4 w-4" />
                              <span>{getStatusText(record.status)}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">申请时间:</span>
                              <span className="ml-2">
                                {new Date(record.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">预计完成:</span>
                              <span className="ml-2">
                                {new Date(record.estimatedCompletion).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          
                          {record.txHash && (
                            <div className="mt-3 flex items-center space-x-2">
                              <span className="text-sm text-gray-600">交易哈希:</span>
                              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                {record.txHash}
                              </code>
                              <button
                                onClick={() => copyAddress(record.txHash!)}
                                className="p-1 hover:bg-gray-100 rounded"
                              >
                                <Copy className="h-4 w-4 text-gray-400" />
                              </button>
                              <button className="p-1 hover:bg-gray-100 rounded">
                                <ExternalLink className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">暂无提现记录</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                重要提醒
              </h3>
              <ul className="space-y-1 text-sm text-amber-800">
                <li>• 请确保钱包地址正确，错误地址导致的损失无法找回</li>
                <li>• 提现需要支付网络手续费，具体金额因网络拥堵程度而异</li>
                <li>• 首次提现建议小额测试，确认无误后再进行大额操作</li>
                <li>• 提现处理时间因网络状况而异，请耐心等待</li>
                <li>• 如遇问题请及时联系客服，我们将为您提供专业支持</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
