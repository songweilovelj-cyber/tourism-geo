import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ResourceType } from '@/types/api'

// 文旅资源运营者信息
interface TourismResource {
  id: string
  phone: string
  name: string
  nickname?: string
  avatar?: string
  description?: string
  city: string
  district?: string
  scenicArea?: string
  resourceType: ResourceType
  category?: {
    id: string
    name: string
  }
  isVerified: boolean
  realName?: string
  avgRating: number
  reviewCount: number
  status: string
  isOnboarded: boolean
  geoLocation?: {
    latitude: number
    longitude: number
    fullAddress: string
  }
  distributionLinks?: Array<{
    id: string
    linkType: string
    linkUrl: string
    platform: string
    commissionRate?: number
    isActive: boolean
  }>
  platformAccounts?: Array<{
    platform: string
    status: string
  }>
}

interface AuthState {
  provider: TourismResource | null
  isAuthenticated: boolean
  setProvider: (provider: TourismResource | null) => void
  logout: () => void
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      provider: null,
      isAuthenticated: false,

      setProvider: (provider) => set({
        provider,
        isAuthenticated: !!provider
      }),

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('provider')
        set({ provider: null, isAuthenticated: false })
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ provider: state.provider })
    }
  )
)

// 从 localStorage 恢复认证状态
const storedProvider = localStorage.getItem('provider')
const storedToken = localStorage.getItem('accessToken')

if (storedProvider && storedToken) {
  try {
    const provider = JSON.parse(storedProvider)
    authStore.setState({ provider, isAuthenticated: true })
  } catch {
    localStorage.removeItem('provider')
  }
}
