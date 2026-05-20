import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { message } from 'antd'
import { useAuthStore } from '@/stores/authStore'

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果返回的是文件流，直接返回
    if (response.config.responseType === 'blob') {
      return response
    }
    
    // 业务错误处理
    if (res.code !== 200) {
      message.error(res.message || '请求失败')
      
      // 401 未登录
      if (res.code === 401) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    
    return res
  },
  (error) => {
    // HTTP错误处理
    let errorMessage = '网络错误，请稍后再试'
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          errorMessage = '登录已过期，请重新登录'
          useAuthStore.getState().logout()
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '没有权限访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = error.response.data?.message || '请求失败'
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = '请求超时，请稍后再试'
    }
    
    message.error(errorMessage)
    return Promise.reject(error)
  }
)

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}

// 分页响应类型
export interface PageResponse<T = any> {
  current: number
  size: number
  total: number
  pages: number
  records: T[]
}

export default request

