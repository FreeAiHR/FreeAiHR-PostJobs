import { useState, useEffect } from 'react'
import { Badge, Popover, List, Button, Empty, Spin, message } from 'antd'
import { BellOutlined, CheckOutlined } from '@ant-design/icons'
import { notificationApi, NotificationItem } from '@/services/notification'
import { useNavigate } from 'react-router-dom'

const NotificationBell = () => {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  // 加载通知
  const loadNotifications = async () => {
    setLoading(true)
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getNotificationPage({ current: 1, size: 5 }),
        notificationApi.getUnreadCount(),
      ])
      if (listRes.code === 200) {
        setNotifications(listRes.data.records)
      }
      if (countRes.code === 200) {
        setUnreadCount(countRes.data)
      }
    } catch (error) {
      console.error('加载通知失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // 定时刷新未读数量
    const timer = setInterval(async () => {
      try {
        const res = await notificationApi.getUnreadCount()
        if (res.code === 200) {
          setUnreadCount(res.data)
        }
      } catch {
        // 忽略错误
      }
    }, 60000) // 每分钟刷新

    return () => clearInterval(timer)
  }, [])

  // 点击通知
  const handleClickNotification = async (item: NotificationItem) => {
    if (item.isRead === 0) {
      await notificationApi.markRead(item.id)
      setUnreadCount(Math.max(0, unreadCount - 1))
    }
    if (item.link) {
      navigate(item.link)
    }
    setVisible(false)
  }

  // 全部标记已读
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setUnreadCount(0)
      setNotifications(notifications.map(n => ({ ...n, isRead: 1 })))
      message.success('已全部标记为已读')
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }

  // 查看全部
  const handleViewAll = () => {
    navigate('/notification')
    setVisible(false)
  }

  const getTypeIcon = (type: string) => {
    const colors: Record<string, string> = {
      system: 'bg-blue-100 text-blue-600',
      resume: 'bg-green-100 text-green-600',
      interview: 'bg-orange-100 text-orange-600',
      offer: 'bg-purple-100 text-purple-600',
      application: 'bg-cyan-100 text-cyan-600',
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  const content = (
    <div className="w-80">
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <span className="font-medium">消息通知</span>
        {unreadCount > 0 && (
          <Button type="link" size="small" icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            全部已读
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Spin />
        </div>
      ) : notifications.length > 0 ? (
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              className={`cursor-pointer hover:bg-gray-50 px-2 rounded ${item.isRead === 0 ? 'bg-blue-50' : ''}`}
              onClick={() => handleClickNotification(item)}
            >
              <div className="flex gap-3 w-full">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeIcon(item.type)}`}>
                  <BellOutlined />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{item.title}</div>
                  <div className="text-gray-400 text-xs truncate">{item.content}</div>
                  <div className="text-gray-300 text-xs mt-1">
                    {item.createTime?.substring(5, 16)}
                  </div>
                </div>
                {item.isRead === 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                )}
              </div>
            </List.Item>
          )}
        />
      ) : (
        <Empty description="暂无消息" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}

      <div className="border-t pt-2 mt-2 text-center">
        <Button type="link" onClick={handleViewAll}>
          查看全部消息
        </Button>
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={(v) => {
        setVisible(v)
        if (v) loadNotifications()
      }}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <div className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer">
          <BellOutlined className="text-lg text-gray-600" />
        </div>
      </Badge>
    </Popover>
  )
}

export default NotificationBell

