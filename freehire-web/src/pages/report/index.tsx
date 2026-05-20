import { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Select, Spin, Progress, Table } from 'antd'
import {
  SolutionOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { reportApi, OverviewData, TrendData, FunnelItem, SourceItem, JobAnalysisItem } from '@/services/report'

const ReportPage = () => {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [trend, setTrend] = useState<TrendData | null>(null)
  const [funnel, setFunnel] = useState<FunnelItem[]>([])
  const [sourceAnalysis, setSourceAnalysis] = useState<SourceItem[]>([])
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisItem[]>([])
  const [trendDays, setTrendDays] = useState(7)

  // 加载数据
  const loadData = async () => {
    setLoading(true)
    try {
      const [overviewRes, trendRes, funnelRes, sourceRes, jobRes] = await Promise.all([
        reportApi.getOverview(),
        reportApi.getTrend(trendDays),
        reportApi.getFunnel(),
        reportApi.getSourceAnalysis(),
        reportApi.getJobAnalysis(),
      ])
      
      if (overviewRes.code === 200) setOverview(overviewRes.data)
      if (trendRes.code === 200) setTrend(trendRes.data)
      if (funnelRes.code === 200) setFunnel(funnelRes.data)
      if (sourceRes.code === 200) setSourceAnalysis(sourceRes.data)
      if (jobRes.code === 200) setJobAnalysis(jobRes.data)
    } catch (error) {
      console.error('加载报表数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [trendDays])

  // 计算漏斗最大值
  const maxFunnelCount = Math.max(...funnel.map(f => f.count), 1)
  const funnelColors = ['#1677ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#13c2c2', '#2f54eb']

  // 计算来源最大值
  const maxSourceCount = Math.max(...sourceAnalysis.map(s => s.count), 1)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">数据报表</h1>

      {/* 核心指标 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="在招职位"
              value={overview?.openJobs || 0}
              suffix={<span className="text-gray-400 text-sm">/ {overview?.totalJobs || 0}</span>}
              prefix={<SolutionOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="收到简历"
              value={overview?.totalResumes || 0}
              prefix={<FileTextOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="人才库"
              value={overview?.totalCandidates || 0}
              prefix={<TeamOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="今日面试"
              value={overview?.todayInterviews || 0}
              prefix={<CalendarOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 招聘趋势 */}
        <Col xs={24} lg={16}>
          <Card 
            title="招聘趋势" 
            hoverable
            extra={
              <Select
                value={trendDays}
                onChange={setTrendDays}
                options={[
                  { value: 7, label: '近7天' },
                  { value: 14, label: '近14天' },
                  { value: 30, label: '近30天' },
                ]}
                style={{ width: 100 }}
              />
            }
          >
            <div className="h-64">
              {trend && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 px-4">
                    {trend.dates.map((date, i) => (
                      <span key={i}>{date}</span>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-sm text-gray-500">简历</span>
                      <div className="flex-1 flex items-center gap-1">
                        {trend.resumeCounts.map((count, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-blue-500 rounded-t"
                              style={{ height: Math.max(count * 3, 4) }}
                            />
                            <span className="text-xs mt-1">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-sm text-gray-500">面试</span>
                      <div className="flex-1 flex items-center gap-1">
                        {trend.interviewCounts.map((count, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-orange-500 rounded-t"
                              style={{ height: Math.max(count * 3, 4) }}
                            />
                            <span className="text-xs mt-1">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-16 text-sm text-gray-500">Offer</span>
                      <div className="flex-1 flex items-center gap-1">
                        {trend.offerCounts.map((count, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center">
                            <div 
                              className="w-full bg-green-500 rounded-t"
                              style={{ height: Math.max(count * 3, 4) }}
                            />
                            <span className="text-xs mt-1">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded" /> 简历</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-500 rounded" /> 面试</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> Offer</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* 来源分析 */}
        <Col xs={24} lg={8}>
          <Card title="来源分析" hoverable>
            <div className="space-y-3">
              {sourceAnalysis.slice(0, 6).map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.source}</span>
                    <span>{item.count}</span>
                  </div>
                  <Progress 
                    percent={(item.count / maxSourceCount) * 100} 
                    showInfo={false}
                    strokeColor={funnelColors[index % funnelColors.length]}
                    size="small"
                  />
                </div>
              ))}
              {sourceAnalysis.length === 0 && (
                <div className="text-center text-gray-400 py-8">暂无数据</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 招聘漏斗 */}
        <Col xs={24} lg={12}>
          <Card title="招聘漏斗" hoverable>
            <div className="space-y-4">
              {funnel.map((item, index) => {
                const percent = (item.count / maxFunnelCount) * 100
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span>{item.count} 人</span>
                    </div>
                    <Progress 
                      percent={percent} 
                      showInfo={false}
                      strokeColor={funnelColors[index % funnelColors.length]}
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

        {/* 职位效果 */}
        <Col xs={24} lg={12}>
          <Card title="招聘效果分析" hoverable>
            <Table
              dataSource={jobAnalysis}
              rowKey="jobTitle"
              pagination={false}
              size="small"
              columns={[
                { title: '职位', dataIndex: 'jobTitle' },
                { title: '投递数', dataIndex: 'applyCount', align: 'center' },
                { title: '面试数', dataIndex: 'interviewCount', align: 'center' },
                { title: 'Offer数', dataIndex: 'offerCount', align: 'center' },
                { title: '面试率', dataIndex: 'interviewRate', align: 'center' },
                { title: 'Offer率', dataIndex: 'offerRate', align: 'center' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReportPage

