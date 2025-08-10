import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, LogOut, Coins, Crown, Wallet } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { LoginModal } from './auth/LoginModal'
import { motion } from 'framer-motion'

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const getMembershipIcon = (level: string) => {
    switch (level) {
      case 'bronze': return '🥉'
      case 'silver': return '🥈'  
      case 'gold': return '🥇'
      case 'platinum': return '💎'
      default: return null
    }
  }

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'bronze': return 'text-amber-600'
      case 'silver': return 'text-gray-500'
      case 'gold': return 'text-yellow-500'
      case 'platinum': return 'text-purple-600'
      default: return 'text-gray-400'
    }
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">积分宝</span>
            </Link>

            {/* User Info / Login */}
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  {/* Points Display */}
                  <motion.div 
                    className="flex items-center space-x-2 bg-gradient-to-r from-primary-50 to-purple-50 px-3 py-1.5 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Coins className="h-4 w-4 text-primary-600" />
                    <span className="points-display text-sm">
                      {user.points.toLocaleString()}
                    </span>
                  </motion.div>

                  {/* Membership Level */}
                  {user.membershipLevel !== 'free' && (
                    <div className={`flex items-center space-x-1 ${getMembershipColor(user.membershipLevel)}`}>
                      <Crown className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {getMembershipIcon(user.membershipLevel)}
                      </span>
                    </div>
                  )}

                  {/* Wallet Status */}
                  {user.walletAddress && (
                    <div className="text-green-600">
                      <Wallet className="h-4 w-4" />
                    </div>
                  )}

                  {/* User Menu */}
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="hidden sm:block text-sm font-medium">
                        {user.username}
                      </span>
                    </button>
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          个人资料
                        </Link>
                        <Link
                          to="/membership"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          会员中心
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>退出登录</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="btn btn-primary text-sm"
                >
                  登录/注册
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  )
}
