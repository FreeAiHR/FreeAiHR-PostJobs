import request, { ApiResponse } from './request'

export interface LoginParams {
  username: string
  password: string
  rememberMe?: boolean
}

// 订阅信息
export interface SubscriptionInfo {
  planCode: string
  planName: string
  description?: string
  price?: number
  billingCycle?: string
  // 功能权限
  featureAiParse: boolean
  featureAiMatch: boolean
  featureAiGenerateJd: boolean
  featureTalentPool: boolean
  featureDataReport: boolean
  featureCareerSite: boolean
  featureApiAccess: boolean
  // 用量限制
  limitJobCount: number
  limitResumeCount: number
  limitUserCount: number
  limitAiParseMonthly: number
  limitAiMatchMonthly: number
  // 当前用量
  currentJobCount: number
  currentResumeCount: number
  currentUserCount: number
  currentAiParseCount: number
  currentAiMatchCount: number
  // 订阅状态
  subscriptionStatus: number
  expiresAt?: string
}

export interface LoginResult {
  token: string
  tokenType: string
  expiresIn: number
  userId: number
  username: string
  realName: string
  avatar?: string
  roles: string[]
  permissions: string[]
  subscription?: SubscriptionInfo
}

export const authApi = {
  // 登录
  login(params: LoginParams): Promise<ApiResponse<LoginResult>> {
    return request.post('/auth/login', params)
  },

  // 退出登录
  logout(): Promise<ApiResponse<void>> {
    return request.post('/auth/logout')
  },

  // 获取当前用户信息
  getUserInfo(): Promise<ApiResponse<LoginResult>> {
    return request.get('/auth/info')
  },
}

