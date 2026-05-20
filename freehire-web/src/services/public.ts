import request, { ApiResponse } from './request'

// 公司信息
export interface CompanyInfo {
  name: string
  logo: string
  intro: string
  benefits: string[]
  contactEmail: string
  address: string
  scale: string
  industry: string
  website: string
}

// 职位信息
export interface JobVO {
  id: number
  title: string
  deptName: string
  jobType: string
  jobTypeName: string
  city: string
  address: string
  salaryRange: string
  education: string
  experience: string
  headcount: number
  description: string
  requirements: string
  highlights: string
  tags: string[]
  urgent: boolean
  publishDate: string
  hrName: string
}

// 投递DTO
export interface ApplyDTO {
  jobId: number
  name: string
  phone: string
  email?: string
  resumePath?: string
  resumeFileName?: string
  message?: string
}

export const publicApi = {
  // 获取公司信息
  getCompanyInfo(): Promise<ApiResponse<CompanyInfo>> {
    return request.get('/public/company')
  },

  // 获取职位列表
  getJobList(params?: {
    keyword?: string
    city?: string
    jobType?: string
  }): Promise<ApiResponse<JobVO[]>> {
    return request.get('/public/jobs', { params })
  },

  // 获取职位详情
  getJobDetail(id: number): Promise<ApiResponse<JobVO>> {
    return request.get(`/public/jobs/${id}`)
  },

  // 获取城市选项
  getCityOptions(): Promise<ApiResponse<string[]>> {
    return request.get('/public/cities')
  },

  // 上传简历
  uploadResume(file: File): Promise<ApiResponse<{ path: string; fileName: string }>> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/public/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 投递简历
  apply(data: ApplyDTO): Promise<ApiResponse<number>> {
    return request.post('/public/apply', data)
  },

  // 检查是否已投递
  checkApplied(jobId: number, phone: string): Promise<ApiResponse<boolean>> {
    return request.get('/public/check-applied', { params: { jobId, phone } })
  },
}

