import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

// 全局状态
let globalPoints = 1000

// 首页组件
const Home = () => {
  const [points, setPoints] = useState(globalPoints)
  
  const earnPoints = (amount: number) => {
    const newPoints = points + amount
    setPoints(newPoints)
    globalPoints = newPoints
    alert(`恭喜！获得 ${amount} 积分！`)
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">积分宝</h1>
        <p className="text-xl text-gray-600">看视频、玩游戏、赚积分、换现金</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-6 mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold">{points.toLocaleString()}</div>
          <div>可用积分</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4 text-center" onClick={() => earnPoints(10)}>
          <div className="text-3xl mb-2">📺</div>
          <h3 className="font-semibold">观看视频</h3>
          <p className="text-sm text-gray-600">+10积分</p>
          <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg">立即获取</button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 text-center" onClick={() => earnPoints(50)}>
          <div className="text-3xl mb-2">📱</div>
          <h3 className="font-semibold">下载应用</h3>
          <p className="text-sm text-gray-600">+50积分</p>
          <button className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg">立即获取</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Link to="/games" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎮</div>
            <div>
              <h3 className="font-semibold text-lg">游戏中心</h3>
              <p>8款精品游戏等你来挑战</p>
            </div>
          </div>
        </Link>
        
        <Link to="/lottery" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎰</div>
            <div>
              <h3 className="font-semibold text-lg">幸运抽奖</h3>
              <p>iPhone16ProMax等你拿</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}

// 游戏页面
const Games = () => {
  const [points, setPoints] = useState(globalPoints)
  
  const playGame = (reward: number, gameName: string) => {
    const newPoints = points + reward
    setPoints(newPoints)
    globalPoints = newPoints
    alert(`🎉 ${gameName}完成！获得 ${reward} 积分！`)
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">🎮 游戏中心</h1>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-4">🧩</div>
          <h3 className="font-semibold mb-2">拼图大师</h3>
          <p className="text-gray-600 mb-4">奖励: 20积分</p>
          <button 
            onClick={() => playGame(20, '拼图大师')}
            className="w-full bg-purple-600 text-white py-2 rounded-lg"
          >
            开始游戏
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="font-semibold mb-2">俄罗斯方块</h3>
          <p className="text-gray-600 mb-4">奖励: 40积分</p>
          <button 
            onClick={() => playGame(40, '俄罗斯方块')}
            className="w-full bg-purple-600 text-white py-2 rounded-lg"
          >
            开始游戏
          </button>
        </div>
      </div>
    </div>
  )
}

// 抽奖页面
const Lottery = () => {
  const [points, setPoints] = useState(globalPoints)
  
  const handleLottery = (cost: number) => {
    if (points >= cost) {
      const newPoints = points - cost
      setPoints(newPoints)
      globalPoints = newPoints
      
      const prizes = ['iPhone16ProMax', 'MacBook Pro', 'AirPods Pro', '100积分']
      const randomPrize = prizes[Math.floor(Math.random() * prizes.length)]
      alert(`🎰 抽奖结果：${randomPrize}！`)
    } else {
      alert('积分不足！')
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">🎰 幸运抽奖</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-4">🎫</div>
          <h3 className="text-xl font-bold mb-2">基础抽奖</h3>
          <p className="text-gray-600 mb-4">每次50积分</p>
          <button
            onClick={() => handleLottery(50)}
            className="w-full bg-blue-600 text-white py-2 rounded-lg"
          >
            立即抽奖
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-3xl mb-4">👑</div>
          <h3 className="text-xl font-bold mb-2">高级抽奖</h3>
          <p className="text-gray-600 mb-4">每次200积分</p>
          <button
            onClick={() => handleLottery(200)}
            className="w-full bg-purple-600 text-white py-2 rounded-lg"
          >
            立即抽奖
          </button>
        </div>
      </div>
    </div>
  )
}

// 导航组件
const Navigation = () => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
    <div className="flex justify-around h-16">
      <Link to="/" className="flex flex-col items-center justify-center text-blue-600">
        <div className="text-xl">🏠</div>
        <span className="text-xs">首页</span>
      </Link>
      <Link to="/games" className="flex flex-col items-center justify-center text-gray-500">
        <div className="text-xl">🎮</div>
        <span className="text-xs">游戏</span>
      </Link>
      <Link to="/lottery" className="flex flex-col items-center justify-center text-gray-500">
        <div className="text-xl">🎰</div>
        <span className="text-xs">抽奖</span>
      </Link>
    </div>
  </nav>
)

// 主应用
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/games" element={<Games />} />
          <Route path="/lottery" element={<Lottery />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  )
}

export default App
