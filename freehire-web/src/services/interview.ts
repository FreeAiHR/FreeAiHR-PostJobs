import request, { ApiResponse, PageResponse } from './request'

// 面试查询参数
export interface InterviewQuery {
  current?: number
  size?: number
  applicationId?: number
  candidateId?: number
  jobId?: number
  interviewType?: string
  status?: string
  result?: string
  startDate?: string
  endDate?: string
  interviewerId?: number
}

// 面试信息
export interface InterviewItem {
  id: number
  applicationId: number
  candidateId: number
  jobId: number
  round: number
  interviewType: string
  interviewTime: string
  duration: number
  location?: string
  meetingLink?: string
  interviewerIds?: string
  status: string
  feedback?: string
  score?: number
  result?: string
  remark?: string
  createTime: string
  updateTime?: string
  // 关联信息
  candidateName?: string
  jobTitle?: string
  interviewerNames?: string[]
}

// 面试DTO
export interface InterviewDTO {
  id?: number
  applicationId: number
  round?: number
  interviewType?: string
  interviewTime: string
  duration?: number
  location?: string
  meetingLink?: string
  interviewerIds?: number[]
  remark?: string
}

// 面试反馈DTO
export interface InterviewFeedbackDTO {
  interviewId: number
  score?: number
  result: string
  feedback?: string
  remark?: string
}

export const interviewApi = {
  // 分页查询面试
  getInterviewPage(params: InterviewQuery): Promise<ApiResponse<PageResponse<InterviewItem>>> {
    return request.get('/interview/page', { params })
  },

  // 获取面试详情
  getInterviewById(id: number): Promise<ApiResponse<InterviewItem>> {
    return request.get(`/interview/${id}`)
  },

  // 创建面试
  createInterview(data: InterviewDTO): Promise<ApiResponse<number>> {
    return request.post('/interview', data)
  },

  // 更新面试
  updateInterview(data: InterviewDTO): Promise<ApiResponse<void>> {
    return request.put('/interview', data)
  },

  // 取消面试
  cancelInterview(id: number, reason?: string): Promise<ApiResponse<void>> {
    return request.post(`/interview/${id}/cancel`, null, { params: { reason } })
  },

  // 提交面试反馈
  submitFeedback(data: InterviewFeedbackDTO): Promise<ApiResponse<void>> {
    return request.post('/interview/feedback', data)
  },

  // 获取申请的所有面试
  getInterviewsByApplicationId(applicationId: number): Promise<ApiResponse<InterviewItem[]>> {
    return request.get(`/interview/by-application/${applicationId}`)
  },

  // 获取日期范围内的面试
  getInterviewsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<InterviewItem[]>> {
    return request.get('/interview/by-date-range', { params: { startDate, endDate } })
  },

  // 获取面试官的面试安排
  getInterviewsByInterviewerId(interviewerId: number): Promise<ApiResponse<InterviewItem[]>> {
    return request.get(`/interview/by-interviewer/${interviewerId}`)
  },

  // 统计今日面试数量
  countTodayInterviews(): Promise<ApiResponse<number>> {
    return request.get('/interview/count-today')
  },

  // AI生成面试问题
  generateInterviewQuestions(id: number): Promise<ApiResponse<string[]>> {
    return request.get(`/interview/${id}/generate-questions`)
  },
}

