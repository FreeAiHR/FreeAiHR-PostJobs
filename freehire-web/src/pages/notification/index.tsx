import { useState, useEffect } from 'react'
import { Card, List, Tag, Button, Empty, message, Popconfirm, Spin } from 'antd'
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons'
import { notificationApi, NotificationItem } from '@/services/notification'
import { useNavigate } from 'react-router-dom'

const typeMap: Record<string, { color: string; text: string }> = {
  system: { color: 'blue', text: '系统通知' },
  resume: { color: 'green', text: '简历通知' },
  interview: { color: 'orange', text: '面试提醒' },
  offer: { color: 'purple', text: 'Offer通知' },
  application: { color: 'cyan', text: '申请通知' },
}

const NotificationPage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<NotificationItem[]>([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const navigate = useNavigate()

  // 加载通知列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await notificationApi.getNotificationPage({ current, size: 20 })
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载通知失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [current])

  // 标记已读
  const handleMarkRead = async (id: number) => {
    try {
      await notificationApi.markRead(id)
      setData(data.map(item => item.id === id ? { ...item, isRead: 1 } : item))
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }

  // 全部标记已读
  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead()
      setData(data.map(item => ({ ...item, isRead: 1 })))
      message.success('已全部标记为已读')
    } catch (error) {
      console.error('标记已读失败', error)
    }
  }

  // 删除通知
  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id)
      setData(data.filter(item => item.id !== id))
      message.success('删除成功')
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 点击跳转
  const handleClick = async (item: NotificationItem) => {
    if (item.isRead === 0) {
      await handleMarkRead(item.id)
    }
    if (item.link) {
      navigate(item.link)
    }
  }

  const unreadCount = data.filter(item => item.isRead === 0).length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">消息中心</h1>
        {unreadCount > 0 && (
          <Button icon={<CheckOutlined />} onClick={handleMarkAllRead}>
            全部标记已读 ({unreadCount})
          </Button>
        )}
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" />
          </div>
        ) : data.length > 0 ? (
          <List
            dataSource={data}
            pagination={{
              current,
              total,
              pageSize: 20,
              onChange: setCurrent,
              showTotal: (total) => `共 ${total} 条`,
            }}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer hover:bg-gray-50 ${item.isRead === 0 ? 'bg-blue-50' : ''}`}
                actions={[
                  item.isRead === 0 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(item.id) }}
                    >
                      标记已读
                    </Button>
                  ),
                  <Popconfirm
                    title="确定删除吗？"
                    onConfirm={(e) => { e?.stopPropagation(); handleDelete(item.id) }}
                    onCancel={(e) => e?.stopPropagation()}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    >
                      删除
                    </Button>
                  </Popconfirm>,
                ].filter(Boolean)}
                onClick={() => handleClick(item)}
              >
                <List.Item.Meta
                  avatar={
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      item.isRead === 0 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <BellOutlined className="text-lg" />
                    </div>
                  }
                  title={
                    <div className="flex items-center gap-2">
                      <span className={item.isRead === 0 ? 'font-semibold' : ''}>{item.title}</span>
                      <Tag color={typeMap[item.type]?.color || 'default'}>
                        {typeMap[item.type]?.text || item.type}
                      </Tag>
                      {item.isRead === 0 && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-gray-500">{item.content}</p>
                      <p className="text-gray-400 text-xs mt-1">{item.createTime}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无消息" className="py-16" />
        )}
      </Card>
    </div>
  )
}

export default NotificationPage

