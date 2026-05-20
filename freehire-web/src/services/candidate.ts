import request, { ApiResponse, PageResponse } from './request'

// 候选人查询参数
export interface CandidateQuery {
  current?: number
  size?: number
  name?: string
  phone?: string
  email?: string
  education?: string
  source?: string
  tags?: string
}

// 候选人信息
export interface CandidateItem {
  id: number
  name: string
  phone?: string
  email?: string
  gender?: number
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
  avatar?: string
  latestResumeId?: number
  source?: string
  sourceDetail?: string
  referrerId?: number
  referrerName?: string
  tags?: string
  remark?: string
  createTime: string
  updateTime?: string
}

// 候选人DTO
export interface CandidateDTO {
  id?: number
  name: string
  phone?: string
  email?: string
  gender?: number
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
  skills?: string[]
  source?: string
  sourceDetail?: string
  referrerId?: number
  tags?: string[]
  remark?: string
}

// 申请查询参数
export interface ApplicationQuery {
  current?: number
  size?: number
  candidateId?: number
  jobId?: number
  stage?: string
  candidateName?: string
  jobTitle?: string
  source?: string
}

// 申请信息
export interface ApplicationVO {
  id: number
  candidateId: number
  jobId: number
  resumeId?: number
  stage: string
  matchScore?: number
  matchAnalysis?: string
  hrUserId?: number
  rejectReason?: string
  source?: string
  applyTime: string
  stageUpdateTime?: string
  remark?: string
  createTime: string
  // 关联信息
  candidateName?: string
  candidatePhone?: string
  candidateEmail?: string
  candidateEducation?: string
  candidateWorkYears?: number
  candidateCurrentCompany?: string
  candidateCurrentPosition?: string
  jobTitle?: string
  jobDeptName?: string
  jobCity?: string
  hrName?: string
}

// 申请DTO
export interface ApplicationDTO {
  id?: number
  candidateId: number
  jobId: number
  resumeId?: number
  source?: string
  remark?: string
}

// 阶段变更DTO
export interface StageChangeDTO {
  applicationId: number
  targetStage: string
  rejectReason?: string
  remark?: string
}

export const candidateApi = {
  // 分页查询候选人
  getCandidatePage(params: CandidateQuery): Promise<ApiResponse<PageResponse<CandidateItem>>> {
    return request.get('/candidate/page', { params })
  },

  // 获取候选人详情
  getCandidateById(id: number): Promise<ApiResponse<CandidateItem>> {
    return request.get(`/candidate/${id}`)
  },

  // 新增候选人
  createCandidate(data: CandidateDTO): Promise<ApiResponse<number>> {
    return request.post('/candidate', data)
  },

  // 更新候选人
  updateCandidate(data: CandidateDTO): Promise<ApiResponse<void>> {
    return request.put('/candidate', data)
  },

  // 删除候选人
  deleteCandidate(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/candidate/${id}`)
  },

  // 从简历创建候选人
  createFromResume(resumeId: number): Promise<ApiResponse<CandidateItem>> {
    return request.post(`/candidate/from-resume/${resumeId}`)
  },
}

export const applicationApi = {
  // 分页查询申请
  getApplicationPage(params: ApplicationQuery): Promise<ApiResponse<PageResponse<ApplicationVO>>> {
    return request.get('/application/page', { params })
  },

  // 获取申请详情
  getApplicationById(id: number): Promise<ApiResponse<ApplicationVO>> {
    return request.get(`/application/${id}`)
  },

  // 创建申请
  createApplication(data: ApplicationDTO): Promise<ApiResponse<number>> {
    return request.post('/application', data)
  },

  // 更新申请
  updateApplication(data: ApplicationDTO): Promise<ApiResponse<void>> {
    return request.put('/application', data)
  },

  // 删除申请
  deleteApplication(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/application/${id}`)
  },

  // 变更阶段
  changeStage(data: StageChangeDTO): Promise<ApiResponse<void>> {
    return request.post('/application/change-stage', data)
  },

  // 批量变更阶段
  batchChangeStage(ids: number[], targetStage: string, reason?: string): Promise<ApiResponse<void>> {
    return request.post('/application/batch-change-stage', { ids, targetStage, reason })
  },

  // AI智能匹配
  aiMatch(id: number): Promise<ApiResponse<void>> {
    return request.post(`/application/${id}/ai-match`)
  },

  // 获取候选人的所有申请
  getApplicationsByCandidateId(candidateId: number): Promise<ApiResponse<ApplicationVO[]>> {
    return request.get(`/application/by-candidate/${candidateId}`)
  },

  // 获取职位的所有申请
  getApplicationsByJobId(jobId: number): Promise<ApiResponse<ApplicationVO[]>> {
    return request.get(`/application/by-job/${jobId}`)
  },

  // 统计各阶段数量
  countByStage(): Promise<ApiResponse<Record<string, number>>> {
    return request.get('/application/count-by-stage')
  },

  // 获取招聘漏斗数据
  getFunnelData(jobId?: number): Promise<ApiResponse<{ stage: string; stageName: string; count: number }[]>> {
    return request.get('/application/funnel', { params: { jobId } })
  },

  // 推荐候选人到职位
  recommendToJob(candidateId: number, jobId: number): Promise<ApiResponse<number>> {
    return request.post('/application/recommend', { candidateId, jobId })
  },
}

