import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Gamepad2, Gift, Ticket, Wallet, User } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/games', icon: Gamepad2, label: '游戏' },
  { to: '/rewards', icon: Gift, label: '奖品' },
  { to: '/lottery', icon: Ticket, label: '抽奖' },
  { to: '/withdraw', icon: Wallet, label: '提现' },
  { to: '/profile', icon: User, label: '我的' },
]

export const BottomNavigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-primary-50' : ''
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-current'
                  }`} />
                </motion.div>
                <span className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-primary-600' : 'text-current'
                }`}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
