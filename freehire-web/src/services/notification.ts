import request, { ApiResponse, PageResponse } from './request'

export interface NotificationItem {
  id: number
  userId: number
  type: string
  title: string
  content?: string
  bizId?: number
  bizType?: string
  link?: string
  isRead: number
  readTime?: string
  createTime: string
}

export const notificationApi = {
  // 分页查询通知
  getNotificationPage(params: { current?: number; size?: number }): Promise<ApiResponse<PageResponse<NotificationItem>>> {
    return request.get('/notification/page', { params })
  },

  // 获取未读数量
  getUnreadCount(): Promise<ApiResponse<number>> {
    return request.get('/notification/unread-count')
  },

  // 标记已读
  markRead(id: number): Promise<ApiResponse<void>> {
    return request.post(`/notification/${id}/read`)
  },

  // 全部标记已读
  markAllRead(): Promise<ApiResponse<void>> {
    return request.post('/notification/read-all')
  },

  // 删除通知
  deleteNotification(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/notification/${id}`)
  },
}

