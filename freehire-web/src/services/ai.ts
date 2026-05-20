import request, { ApiResponse } from './request'

// AI配置
export interface AIConfigItem {
  id: number
  provider: string
  apiKey: string
  baseUrl?: string
  model: string
  isDefault: number
  status: number
  createTime: string
  updateTime?: string
}

export interface AIConfigDTO {
  id?: number
  provider: string
  apiKey: string
  baseUrl?: string
  model: string
  isDefault?: number
  status?: number
}

export interface ProviderOption {
  value: string
  label: string
  defaultUrl: string
  defaultModel: string
  description: string
}

export const aiConfigApi = {
  // 获取所有配置
  getAllConfigs(): Promise<ApiResponse<AIConfigItem[]>> {
    return request.get('/ai/config/list')
  },

  // 获取配置详情
  getConfigById(id: number): Promise<ApiResponse<AIConfigItem>> {
    return request.get(`/ai/config/${id}`)
  },

  // 保存配置
  saveConfig(data: AIConfigDTO): Promise<ApiResponse<number>> {
    return request.post('/ai/config', data)
  },

  // 删除配置
  deleteConfig(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/ai/config/${id}`)
  },

  // 设为默认
  setDefault(id: number): Promise<ApiResponse<void>> {
    return request.post(`/ai/config/${id}/set-default`)
  },

  // 测试连接
  testConnection(id: number): Promise<ApiResponse<boolean>> {
    return request.post(`/ai/config/${id}/test`)
  },

  // 测试连接（参数）
  testConnectionByParams(params: { provider: string; apiKey: string; baseUrl?: string; model: string }): Promise<ApiResponse<boolean>> {
    return request.post('/ai/config/test', params)
  },

  // 获取支持的提供商
  getProviders(): Promise<ApiResponse<ProviderOption[]>> {
    return request.get('/ai/config/providers')
  },
}

