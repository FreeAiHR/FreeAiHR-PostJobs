import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, SubscriptionInfo } from '@/services/auth'

interface UserInfo {
  userId: number
  username: string
  realName: string
  avatar?: string
  roles: string[]
  permissions: string[]
}

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  subscription: SubscriptionInfo | null
  loading: boolean
  setToken: (token: string) => void
  setUserInfo: (userInfo: UserInfo) => void
  setSubscription: (subscription: SubscriptionInfo) => void
  fetchUserInfo: () => Promise<void>
  logout: () => void
  // 功能权限检查
  hasFeature: (featureCode: string) => boolean
  // 用量检查
  checkQuota: (quotaType: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,
      subscription: null,
      loading: false,

      setToken: (token: string) => {
        set({ token })
      },

      setUserInfo: (userInfo: UserInfo) => {
        set({ userInfo })
      },

      setSubscription: (subscription: SubscriptionInfo) => {
        set({ subscription })
      },

      fetchUserInfo: async () => {
        const { token, userInfo } = get()
        if (!token || userInfo) return

        set({ loading: true })
        try {
          const res = await authApi.getUserInfo()
          if (res.code === 200) {
            set({ 
              userInfo: {
                userId: res.data.userId,
                username: res.data.username,
                realName: res.data.realName,
                avatar: res.data.avatar,
                roles: res.data.roles,
                permissions: res.data.permissions,
              },
              subscription: res.data.subscription || null
            })
          }
        } catch (error) {
          console.error('获取用户信息失败', error)
          // 如果获取失败，可能是token过期，清除登录状态
          set({ token: null, userInfo: null, subscription: null })
        } finally {
          set({ loading: false })
        }
      },

      logout: () => {
        set({ token: null, userInfo: null, subscription: null })
        // 调用后端退出接口
        authApi.logout().catch(() => {})
      },

      hasFeature: (featureCode: string) => {
        const { subscription } = get()
        if (!subscription) return false
        
        const featureMap: Record<string, boolean> = {
          'ai_parse': subscription.featureAiParse,
          'ai_match': subscription.featureAiMatch,
          'ai_generate_jd': subscription.featureAiGenerateJd,
          'talent_pool': subscription.featureTalentPool,
          'data_report': subscription.featureDataReport,
          'career_site': subscription.featureCareerSite,
          'api_access': subscription.featureApiAccess,
        }
        return featureMap[featureCode] ?? false
      },

      checkQuota: (quotaType: string) => {
        const { subscription } = get()
        if (!subscription) return false
        
        switch (quotaType) {
          case 'job':
            return subscription.limitJobCount === -1 || subscription.currentJobCount < subscription.limitJobCount
          case 'resume':
            return subscription.limitResumeCount === -1 || subscription.currentResumeCount < subscription.limitResumeCount
          case 'user':
            return subscription.limitUserCount === -1 || subscription.currentUserCount < subscription.limitUserCount
          case 'ai_parse':
            return subscription.limitAiParseMonthly === -1 || subscription.currentAiParseCount < subscription.limitAiParseMonthly
          case 'ai_match':
            return subscription.limitAiMatchMonthly === -1 || subscription.currentAiMatchCount < subscription.limitAiMatchMonthly
          default:
            return true
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
)

