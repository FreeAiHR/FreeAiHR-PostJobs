import request, { ApiResponse } from './request'

export interface OverviewData {
  totalJobs: number
  openJobs: number
  totalResumes: number
  totalCandidates: number
  todayInterviews: number
  stageDistribution: Record<string, number>
}

export interface TrendData {
  dates: string[]
  resumeCounts: number[]
  interviewCounts: number[]
  offerCounts: number[]
}

export interface FunnelItem {
  stage: string
  name: string
  count: number
}

export interface SourceItem {
  source: string
  count: number
}

export interface JobAnalysisItem {
  jobTitle: string
  applyCount: number
  interviewCount: number
  offerCount: number
  interviewRate: string
  offerRate: string
}

export const reportApi = {
  // 获取概览数据
  getOverview(): Promise<ApiResponse<OverviewData>> {
    return request.get('/report/overview')
  },

  // 获取招聘趋势
  getTrend(days?: number): Promise<ApiResponse<TrendData>> {
    return request.get('/report/trend', { params: { days: days || 7 } })
  },

  // 获取招聘漏斗
  getFunnel(jobId?: number): Promise<ApiResponse<FunnelItem[]>> {
    return request.get('/report/funnel', { params: { jobId } })
  },

  // 获取来源分析
  getSourceAnalysis(): Promise<ApiResponse<SourceItem[]>> {
    return request.get('/report/source-analysis')
  },

  // 获取职位效果分析
  getJobAnalysis(): Promise<ApiResponse<JobAnalysisItem[]>> {
    return request.get('/report/job-analysis')
  },
}

