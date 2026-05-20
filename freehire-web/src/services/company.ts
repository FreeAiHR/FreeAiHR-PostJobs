import request, { ApiResponse } from './request'

// 公司配置
export interface CompanyConfig {
  company_name: string
  company_logo: string
  company_intro: string
  company_email: string
  company_address: string
  company_scale: string
  company_industry: string
  company_website: string
  company_benefits: string  // JSON数组字符串
  careers_page_enabled: string  // "true" 或 "false"
}

export const companyApi = {
  // 获取公司配置
  getConfig(): Promise<ApiResponse<CompanyConfig>> {
    return request.get('/system/company')
  },

  // 保存公司配置
  saveConfig(config: Partial<CompanyConfig>): Promise<ApiResponse<void>> {
    return request.post('/system/company', config)
  },

  // 获取招聘页面链接
  getCareersUrl(): Promise<ApiResponse<string>> {
    return request.get('/system/company/careers-url')
  },
}

