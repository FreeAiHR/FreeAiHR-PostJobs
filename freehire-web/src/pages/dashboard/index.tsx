import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress, List, Avatar, Spin } from 'antd'
import {
  TeamOutlined,
  SolutionOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons'
import request, { ApiResponse } from '@/services/request'
import { applicationApi, ApplicationVO } from '@/services/candidate'
import { useAuthStore } from '@/stores/authStore'
import { useNavigate } from 'react-router-dom'

interface DashboardStats {
  jobCount: number
  openJobCount: number
  resumeCount: number
  candidateCount: number
  todayInterviewCount: number
  stageCount: Record<string, number>
}

interface FunnelItem {
  stage: string
  stageName: string
  count: number
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [funnel, setFunnel] = useState<FunnelItem[]>([])
  const [recentApplications, setRecentApplications] = useState<ApplicationVO[]>([])
  const { userInfo, subscription } = useAuthStore()
  const navigate = useNavigate()

  // 加载数据
  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, funnelRes, appsRes] = await Promise.all([
        request.get('/dashboard/stats') as Promise<ApiResponse<DashboardStats>>,
        request.get('/dashboard/funnel') as Promise<ApiResponse<FunnelItem[]>>,
        applicationApi.getApplicationPage({ current: 1, size: 5 }),
      ])
      
      if (statsRes.code === 200) {
        setStats(statsRes.data)
      }
      if (funnelRes.code === 200) {
        setFunnel(funnelRes.data)
      }
      if (appsRes.code === 200) {
        setRecentApplications(appsRes.data.records)
      }
    } catch (error) {
      console.error('加载仪表盘数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getStatusTag = (stage: string) => {
    const stageMap: Record<string, { color: string; text: string }> = {
      new: { color: 'blue', text: '新投递' },
      filtered: { color: 'cyan', text: '初筛通过' },
      interview_pending: { color: 'gold', text: '待面试' },
      interviewing: { color: 'orange', text: '面试中' },
      interview_passed: { color: 'lime', text: '面试通过' },
      offer_pending: { color: 'purple', text: '待发Offer' },
      offered: { color: 'geekblue', text: '已发Offer' },
      onboarded: { color: 'green', text: '已入职' },
      rejected: { color: 'default', text: '不合适' },
    }
    const s = stageMap[stage] || { color: 'default', text: stage }
    return <Tag color={s.color}>{s.text}</Tag>
  }

  // 计算漏斗最大值
  const maxFunnelCount = Math.max(...funnel.map(f => f.count), 1)

  // 统计卡片数据
  const statsCards = stats ? [
    {
      title: '招聘中职位',
      value: stats.openJobCount,
      icon: <SolutionOutlined />,
      color: '#1677ff',
    },
    {
      title: '收到简历',
      value: stats.resumeCount,
      icon: <FileTextOutlined />,
      color: '#52c41a',
    },
    {
      title: '候选人数',
      value: stats.candidateCount,
      icon: <TeamOutlined />,
      color: '#faad14',
    },
    {
      title: '今日面试',
      value: stats.todayInterviewCount,
      icon: <CalendarOutlined />,
      color: '#722ed1',
    },
  ] : []

  // 待办事项
  const todoItems = stats ? [
    { id: 1, title: `${stats.stageCount?.['new'] || 0} 份新简历待处理`, type: 'resume' },
    { id: 2, title: `${stats.stageCount?.['interview_pending'] || 0} 位候选人待安排面试`, type: 'interview' },
    { id: 3, title: `${stats.stageCount?.['interview_passed'] || 0} 位候选人待发Offer`, type: 'offer' },
    { id: 4, title: `${stats.todayInterviewCount} 场面试今日进行`, type: 'follow' },
  ] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">工作台</h1>
        <p className="text-gray-500 mt-1">
          欢迎回来，{userInfo?.realName || userInfo?.username}
          {subscription && (
            <span className="ml-2">
              | 当前套餐：<Tag color="blue">{subscription.planName}</Tag>
            </span>
          )}
        </p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card hoverable className="hover-card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-500 text-sm mb-2">{stat.title}</div>
                  <Statistic 
                    value={stat.value}
                    valueStyle={{ color: stat.color, fontWeight: 600 }}
                  />
                </div>
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* 招聘漏斗 */}
        <Col xs={24} lg={12}>
          <Card title="招聘漏斗" hoverable>
            <div className="space-y-4">
              {funnel.map((item, index) => {
                const colors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#2f54eb', '#fa541c']
                const percent = (item.count / maxFunnelCount) * 100
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.stageName}</span>
                      <span>{item.count}</span>
                    </div>
                    <Progress 
                      percent={percent} 
                      showInfo={false} 
                      strokeColor={colors[index % colors.length]} 
                    />
                  </div>
                )
              })}
              {funnel.length === 0 && (
                <div className="text-center text-gray-400 py-8">暂无数据</div>
              )}
            </div>
          </Card>
        </Col>

        {/* 待办事项 */}
        <Col xs={24} lg={12}>
          <Card title="待办事项" hoverable>
            <List
              itemLayout="horizontal"
              dataSource={todoItems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                        <CheckCircleOutlined className="text-blue-500" />
                      </div>
                    }
                    title={<span className="text-gray-700">{item.title}</span>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 最新候选人 */}
      <Card 
        title="最新申请" 
        hoverable
        extra={<a onClick={() => navigate('/recruit/candidate')}>查看全部</a>}
      >
        <Table
          dataSource={recentApplications}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: '候选人',
              dataIndex: 'candidateName',
              render: (text) => (
                <div className="flex items-center gap-2">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span>{text || '-'}</span>
                </div>
              ),
            },
            {
              title: '应聘职位',
              dataIndex: 'jobTitle',
              render: (text) => text || '-',
            },
            {
              title: '状态',
              dataIndex: 'stage',
              render: (stage) => getStatusTag(stage),
            },
            {
              title: '匹配度',
              dataIndex: 'matchScore',
              render: (score) => score ? (
                <span className={`font-medium ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
                  {score}分
                </span>
              ) : '-',
            },
            {
              title: '投递时间',
              dataIndex: 'applyTime',
              render: (text) => text?.substring(0, 10) || '-',
            },
            {
              title: '操作',
              render: () => (
                <a className="text-blue-500" onClick={() => navigate('/recruit/candidate')}>
                  查看详情
                </a>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default Dashboard
