import request, { ApiResponse, PageResponse } from './request'
import { CandidateItem } from './candidate'

export interface TalentSearchParams {
  current?: number
  size?: number
  keyword?: string
  education?: string
  minWorkYears?: number
  maxWorkYears?: number
  city?: string
  skills?: string
  tags?: string
}

export const talentApi = {
  // 人才搜索
  searchTalent(params: TalentSearchParams): Promise<ApiResponse<PageResponse<CandidateItem>>> {
    return request.get('/talent/search', { params })
  },

  // 更新标签
  updateTags(id: number, tags: string): Promise<ApiResponse<void>> {
    return request.post(`/talent/${id}/tags`, { tags })
  },

  // 获取常用标签
  getPopularTags(): Promise<ApiResponse<string[]>> {
    return request.get('/talent/tags')
  },

  // 获取学历选项
  getEducationOptions(): Promise<ApiResponse<string[]>> {
    return request.get('/talent/educations')
  },

  // 获取城市选项
  getCityOptions(): Promise<ApiResponse<string[]>> {
    return request.get('/talent/cities')
  },
}

