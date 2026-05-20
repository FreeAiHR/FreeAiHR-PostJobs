import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input, Select, Tag, Empty, Spin, message } from 'antd'
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined, TeamOutlined, FireOutlined } from '@ant-design/icons'
import { publicApi, CompanyInfo, JobVO } from '@/services/public'
import ApplyModal from './components/ApplyModal'

const CareersPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [jobs, setJobs] = useState<JobVO[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [keyword, setKeyword] = useState('')
  const [city, setCity] = useState<string>()
  const [jobType, setJobType] = useState<string>()
  const [applyModalVisible, setApplyModalVisible] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobVO | null>(null)

  // 加载公司信息
  const loadCompanyInfo = async () => {
    try {
      const res = await publicApi.getCompanyInfo()
      if (res.code === 200) {
        setCompanyInfo(res.data)
      }
    } catch (error) {
      console.error('加载公司信息失败', error)
    }
  }

  // 加载职位列表
  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await publicApi.getJobList({ keyword, city, jobType })
      if (res.code === 200) {
        setJobs(res.data)
      }
    } catch (error) {
      console.error('加载职位失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载城市选项
  const loadCities = async () => {
    try {
      const res = await publicApi.getCityOptions()
      if (res.code === 200) {
        setCities(res.data)
      }
    } catch (error) {
      console.error('加载城市失败', error)
    }
  }

  useEffect(() => {
    loadCompanyInfo()
    loadCities()
  }, [])

  useEffect(() => {
    loadJobs()
  }, [keyword, city, jobType])

  // 点击投递
  const handleApply = (job: JobVO) => {
    setSelectedJob(job)
    setApplyModalVisible(true)
  }

  // 投递成功
  const handleApplySuccess = () => {
    setApplyModalVisible(false)
    message.success('投递成功！我们会尽快与您联系')
    loadJobs() // 刷新列表
  }

  return (
    <div className="min-h-screen">
      {/* 顶部横幅 - 移动端优化 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-24">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 md:mb-6">
            {companyInfo?.logo && (
              <img 
                src={companyInfo.logo} 
                alt="logo" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white p-2 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">
                {companyInfo?.name || '加入我们'}
              </h1>
              <p className="text-blue-100 mt-1 text-sm md:text-base">与优秀的人一起，做有挑战的事</p>
            </div>
          </div>
          
          {companyInfo?.intro && (
            <p className="text-blue-100 max-w-2xl mb-6 md:mb-8 leading-relaxed text-sm md:text-base line-clamp-3 md:line-clamp-none">
              {companyInfo.intro}
            </p>
          )}

          {/* 公司福利标签 - 移动端滚动 */}
          {companyInfo?.benefits && companyInfo.benefits.length > 0 && (
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {companyInfo.benefits.map((benefit, index) => (
                <Tag 
                  key={index} 
                  className="px-2 md:px-3 py-1 bg-white/20 text-white border-0 rounded-full text-xs md:text-sm whitespace-nowrap"
                >
                  {benefit}
                </Tag>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 搜索区域 - 移动端优化 */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-3">
            <Input
              placeholder="搜索职位"
              prefix={<SearchOutlined className="text-gray-400" />}
              className="w-full md:w-80"
              allowClear
              size="middle"
              onChange={(e) => setKeyword(e.target.value)}
            />
            <div className="flex gap-2">
              <Select
                placeholder="城市"
                allowClear
                className="flex-1 md:w-40"
                onChange={(value) => setCity(value)}
                options={cities.map(c => ({ value: c, label: c }))}
              />
              <Select
                placeholder="类型"
                allowClear
                className="flex-1 md:w-40"
                onChange={(value) => setJobType(value)}
                options={[
                  { value: 'full_time', label: '全职' },
                  { value: 'part_time', label: '兼职' },
                  { value: 'intern', label: '实习' },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 职位列表 - 移动端优化 */}
      <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            在招职位
            <span className="text-gray-400 text-sm md:text-base font-normal ml-2">
              ({jobs.length}个)
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : jobs.length === 0 ? (
          <Empty 
            description="暂无在招职位" 
            className="py-20"
          />
        ) : (
          <div className="grid gap-3 md:gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 active:bg-gray-50"
                onClick={() => navigate(`/careers/job/${job.id}`)}
              >
                <div className="flex flex-col gap-3 md:gap-4">
                  {/* 职位标题和薪资 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      {job.urgent && (
                        <Tag color="red" className="rounded-full text-xs">
                          <FireOutlined className="mr-1" />急聘
                        </Tag>
                      )}
                    </div>
                    <span className="text-lg md:text-xl font-bold text-orange-500 whitespace-nowrap ml-2">
                      {job.salaryRange}
                    </span>
                  </div>
                  
                  {/* 职位信息 */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-500 text-xs md:text-sm">
                    {job.deptName && (
                      <span className="flex items-center gap-1">
                        <TeamOutlined /> {job.deptName}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <EnvironmentOutlined /> {job.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockCircleOutlined /> {job.experience || '不限'}
                    </span>
                    <span>{job.education || '不限'}</span>
                  </div>

                  {/* 标签和投递按钮 */}
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1 flex-1">
                      {job.tags && job.tags.slice(0, 3).map((tag, index) => (
                        <Tag key={index} className="rounded-full bg-blue-50 text-blue-600 border-0 text-xs">
                          {tag}
                        </Tag>
                      ))}
                      {job.tags && job.tags.length > 3 && (
                        <Tag className="rounded-full bg-gray-100 text-gray-500 border-0 text-xs">
                          +{job.tags.length - 3}
                        </Tag>
                      )}
                    </div>
                    <button
                      className="px-4 md:px-6 py-1.5 md:py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply(job)
                      }}
                    >
                      投递
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 投递弹窗 */}
      <ApplyModal
        visible={applyModalVisible}
        job={selectedJob}
        onClose={() => setApplyModalVisible(false)}
        onSuccess={handleApplySuccess}
      />
    </div>
  )
}

export default CareersPage

