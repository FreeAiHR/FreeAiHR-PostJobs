import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Tag, message, Empty } from 'antd'
import { 
  ArrowLeftOutlined, 
  EnvironmentOutlined, 
  ClockCircleOutlined, 
  TeamOutlined,
  BookOutlined,
  UserOutlined,
  FireOutlined
} from '@ant-design/icons'
import { publicApi, JobVO } from '@/services/public'
import ApplyModal from '../components/ApplyModal'

const JobDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [job, setJob] = useState<JobVO | null>(null)
  const [applyModalVisible, setApplyModalVisible] = useState(false)

  // 加载职位详情
  const loadJobDetail = async () => {
    if (!id) return
    
    setLoading(true)
    try {
      const res = await publicApi.getJobDetail(parseInt(id))
      if (res.code === 200) {
        setJob(res.data)
      }
    } catch (error) {
      console.error('加载职位详情失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadJobDetail()
  }, [id])

  // 投递成功
  const handleApplySuccess = () => {
    setApplyModalVisible(false)
    message.success('投递成功！我们会尽快与您联系')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Empty description="职位不存在或已关闭" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            onClick={() => navigate('/careers')}
          >
            <ArrowLeftOutlined />
            <span>返回职位列表</span>
          </button>
        </div>
      </div>

      {/* 职位头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">{job.title}</h1>
                {job.urgent && (
                  <Tag color="red" className="rounded-full">
                    <FireOutlined className="mr-1" />急聘
                  </Tag>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-blue-100">
                {job.deptName && (
                  <span className="flex items-center gap-1">
                    <TeamOutlined /> {job.deptName}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <EnvironmentOutlined /> {job.city}
                </span>
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined /> {job.experience || '经验不限'}
                </span>
                <span className="flex items-center gap-1">
                  <BookOutlined /> {job.education || '学历不限'}
                </span>
                {job.hrName && (
                  <span className="flex items-center gap-1">
                    <UserOutlined /> {job.hrName}
                  </span>
                )}
              </div>

              {job.tags && job.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.tags.map((tag, index) => (
                    <Tag 
                      key={index} 
                      className="px-3 py-1 bg-white/20 text-white border-0 rounded-full"
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-end gap-3">
              <span className="text-3xl font-bold text-yellow-300">
                {job.salaryRange}
              </span>
              {job.headcount && (
                <span className="text-blue-100">
                  招聘 {job.headcount} 人
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 职位详情 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* 职位描述 */}
          {job.description && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">职位描述</h2>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </div>
            </div>
          )}

          {/* 任职要求 */}
          {job.requirements && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">任职要求</h2>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {job.requirements}
              </div>
            </div>
          )}

          {/* 职位亮点 */}
          {job.highlights && (
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">职位亮点</h2>
              <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {job.highlights}
              </div>
            </div>
          )}

          {/* 工作地址 */}
          {job.address && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">工作地点</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <EnvironmentOutlined />
                <span>{job.city} · {job.address}</span>
              </div>
            </div>
          )}
        </div>

        {/* 底部投递按钮 */}
        <div className="mt-8 flex justify-center">
          <button
            className="px-12 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            onClick={() => setApplyModalVisible(true)}
          >
            立即投递
          </button>
        </div>

        {/* 发布时间 */}
        {job.publishDate && (
          <div className="mt-6 text-center text-gray-400 text-sm">
            发布于 {job.publishDate}
          </div>
        )}
      </div>

      {/* 投递弹窗 */}
      <ApplyModal
        visible={applyModalVisible}
        job={job}
        onClose={() => setApplyModalVisible(false)}
        onSuccess={handleApplySuccess}
      />
    </div>
  )
}

export default JobDetailPage

