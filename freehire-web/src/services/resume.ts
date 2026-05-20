import request, { ApiResponse, PageResponse } from './request'

// 简历查询参数
export interface ResumeQuery {
  current?: number
  size?: number
  name?: string
  phone?: string
  email?: string
  parseStatus?: string
  source?: string
  education?: string
}

// 简历信息
export interface ResumeItem {
  id: number
  candidateId?: number
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  parsed: number
  parseStatus: string
  parsedContent?: string
  rawText?: string
  name?: string
  phone?: string
  email?: string
  gender?: string
  birthDate?: string
  age?: number
  city?: string
  education?: string
  school?: string
  major?: string
  workYears?: number
  currentCompany?: string
  currentPosition?: string
  expectPosition?: string
  expectCity?: string
  expectSalary?: number
  skills?: string
  source: string
  sourceDetail?: string
  createTime: string
  updateTime?: string
}

export const resumeApi = {
  // 分页查询简历
  getResumePage(params: ResumeQuery): Promise<ApiResponse<PageResponse<ResumeItem>>> {
    return request.get('/resume/page', { params })
  },

  // 获取简历详情
  getResumeById(id: number): Promise<ApiResponse<ResumeItem>> {
    return request.get(`/resume/${id}`)
  },

  // 上传简历
  uploadResume(file: File, source?: string): Promise<ApiResponse<ResumeItem>> {
    const formData = new FormData()
    formData.append('file', file)
    if (source) {
      formData.append('source', source)
    }
    return request.post('/resume/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // 删除简历
  deleteResume(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/resume/${id}`)
  },

  // AI解析简历
  parseResume(id: number): Promise<ApiResponse<ResumeItem>> {
    return request.post(`/resume/${id}/parse`)
  },

  // 获取简历下载链接
  getResumeDownloadUrl(id: number): Promise<ApiResponse<string>> {
    return request.get(`/resume/${id}/download-url`)
  },

  // 从简历创建候选人（加入人才库）
  createCandidate(resumeId: number): Promise<ApiResponse<any>> {
    return request.post(`/candidate/from-resume/${resumeId}`)
  },
}

