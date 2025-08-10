import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  username: string
  email: string
  points: number
  membershipLevel: 'free' | 'bronze' | 'silver' | 'gold' | 'platinum'
  walletAddress?: string
  createdAt: string
  lastLogin: string
  totalEarned: number
  totalWithdrawn: number
  referralCode: string
  referredBy?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<boolean>
  logout: () => void
  updatePoints: (points: number) => void
  updateUser: (updates: Partial<User>) => void
  connectWallet: (address: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // 模拟用户数据
          const user: User = {
            id: '1',
            username: email.split('@')[0],
            email,
            points: 1000,
            membershipLevel: 'free',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            totalEarned: 1000,
            totalWithdrawn: 0,
            referralCode: generateReferralCode()
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      register: async (username: string, email: string, password: string, referralCode?: string) => {
        set({ isLoading: true })
        
        try {
          // 模拟API调用
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          const user: User = {
            id: Date.now().toString(),
            username,
            email,
            points: referralCode ? 1500 : 1000, // 推荐奖励
            membershipLevel: 'free',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            totalEarned: referralCode ? 1500 : 1000,
            totalWithdrawn: 0,
            referralCode: generateReferralCode(),
            referredBy: referralCode
          }
          
          set({ user, isAuthenticated: true, isLoading: false })
          return true
        } catch (error) {
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },

      updatePoints: (points: number) => {
        const user = get().user
        if (user) {
          set({
            user: {
              ...user,
              points: user.points + points,
              totalEarned: user.totalEarned + Math.max(0, points)
            }
          })
        }
      },

      updateUser: (updates: Partial<User>) => {
        const user = get().user
        if (user) {
          set({ user: { ...user, ...updates } })
        }
      },

      connectWallet: (address: string) => {
        const user = get().user
        if (user) {
          set({
            user: { ...user, walletAddress: address }
          })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
