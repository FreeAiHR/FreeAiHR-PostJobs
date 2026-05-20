import request, { ApiResponse, PageResponse } from './request'

// 职位查询参数
export interface JobQuery {
  current?: number
  size?: number
  title?: string
  deptId?: number
  city?: string
  status?: number
  urgent?: number
}

// 职位信息
export interface JobItem {
  id: number
  title: string
  deptId?: number
  deptName?: string
  jobType: string
  city: string
  address?: string
  salaryMin?: number
  salaryMax?: number
  salaryMonth?: number
  education?: string
  experience?: string
  headcount?: number
  description?: string
  requirements?: string
  highlights?: string
  status: number
  urgent: number
  publishDate?: string
  deadline?: string
  hrUserId?: number
  hrName?: string
  viewCount: number
  applyCount: number
  tags?: string
  tagList?: string[]
  createTime: string
  updateTime?: string
}

// 新增/编辑职位参数
export interface JobDTO {
  id?: number
  title: string
  deptId?: number
  jobType?: string
  city?: string
  address?: string
  salaryMin?: number
  salaryMax?: number
  salaryMonth?: number
  education?: string
  experience?: string
  headcount?: number
  description?: string
  requirements?: string
  highlights?: string
  urgent?: number
  deadline?: string
  hrUserId?: number
  tags?: string[]
}

export const jobApi = {
  // 分页查询职位
  getJobPage(params: JobQuery): Promise<ApiResponse<PageResponse<JobItem>>> {
    return request.get('/job/page', { params })
  },

  // 获取职位详情
  getJobById(id: number): Promise<ApiResponse<JobItem>> {
    return request.get(`/job/${id}`)
  },

  // 新增职位
  createJob(data: JobDTO): Promise<ApiResponse<number>> {
    return request.post('/job', data)
  },

  // 更新职位
  updateJob(data: JobDTO): Promise<ApiResponse<void>> {
    return request.put('/job', data)
  },

  // 删除职位
  deleteJob(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/job/${id}`)
  },

  // 发布职位
  publishJob(id: number): Promise<ApiResponse<void>> {
    return request.post(`/job/${id}/publish`)
  },

  // 关闭职位
  closeJob(id: number): Promise<ApiResponse<void>> {
    return request.post(`/job/${id}/close`)
  },

  // 暂停职位
  pauseJob(id: number): Promise<ApiResponse<void>> {
    return request.post(`/job/${id}/pause`)
  },
}

