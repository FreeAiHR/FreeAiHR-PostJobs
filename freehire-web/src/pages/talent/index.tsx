import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Input, Select, InputNumber, Modal, message, Avatar, Drawer, Descriptions } from 'antd'
import { UserOutlined, TagOutlined, PhoneOutlined, MailOutlined, SendOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { talentApi, TalentSearchParams } from '@/services/talent'
import { CandidateItem, applicationApi } from '@/services/candidate'
import { jobApi, JobItem } from '@/services/job'

const TalentPool = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CandidateItem[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<TalentSearchParams>({ current: 1, size: 10 })
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateItem | null>(null)
  const [tagModalVisible, setTagModalVisible] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [popularTags, setPopularTags] = useState<string[]>([])
  const [educations, setEducations] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  // 推荐到职位相关
  const [recommendModalVisible, setRecommendModalVisible] = useState(false)
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)
  const [recommending, setRecommending] = useState(false)

  // 加载人才列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await talentApi.searchTalent(query)
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('搜索人才失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载选项
  const loadOptions = async () => {
    try {
      const [tagsRes, eduRes, citiesRes] = await Promise.all([
        talentApi.getPopularTags(),
        talentApi.getEducationOptions(),
        talentApi.getCityOptions(),
      ])
      if (tagsRes.code === 200) setPopularTags(tagsRes.data)
      if (eduRes.code === 200) setEducations(eduRes.data)
      if (citiesRes.code === 200) setCities(citiesRes.data)
    } catch (error) {
      console.error('加载选项失败', error)
    }
  }

  useEffect(() => {
    loadData()
  }, [query])

  useEffect(() => {
    loadOptions()
  }, [])

  // 处理分页变化
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQuery(prev => ({
      ...prev,
      current: pagination.current || 1,
      size: pagination.pageSize || 10,
    }))
  }

  // 查看详情
  const handleViewDetail = (record: CandidateItem) => {
    setSelectedCandidate(record)
    setDrawerVisible(true)
  }

  // 打开标签弹窗
  const handleOpenTagModal = (record: CandidateItem) => {
    setSelectedCandidate(record)
    const tags = record.tags ? JSON.parse(record.tags) : []
    setSelectedTags(tags)
    setTagModalVisible(true)
  }

  // 保存标签
  const handleSaveTags = async () => {
    if (!selectedCandidate) return
    try {
      await talentApi.updateTags(selectedCandidate.id, JSON.stringify(selectedTags))
      message.success('标签保存成功')
      setTagModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存标签失败', error)
    }
  }

  // 搜索
  const handleSearch = () => {
    setQuery(prev => ({ ...prev, current: 1 }))
  }

  // 加载在招职位列表
  const loadJobs = async () => {
    try {
      const res = await jobApi.getJobPage({ current: 1, size: 100, status: 1 })
      if (res.code === 200) {
        setJobs(res.data.records)
      }
    } catch (error) {
      console.error('加载职位失败', error)
    }
  }

  // 打开推荐弹窗
  const handleOpenRecommend = (record: CandidateItem) => {
    setSelectedCandidate(record)
    setSelectedJobId(null)
    setRecommendModalVisible(true)
    loadJobs()
  }

  // 推荐到职位
  const handleRecommend = async () => {
    if (!selectedCandidate || !selectedJobId) {
      message.warning('请选择要推荐的职位')
      return
    }
    setRecommending(true)
    try {
      const res = await applicationApi.recommendToJob(selectedCandidate.id, selectedJobId)
      if (res.code === 200) {
        message.success('推荐成功！候选人已进入该职位的招聘流程')
        setRecommendModalVisible(false)
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || '推荐失败')
    } finally {
      setRecommending(false)
    }
  }

  const columns: ColumnsType<CandidateItem> = [
    {
      title: '人才',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.name}</div>
            <div className="text-gray-400 text-xs">
              {record.currentPosition} @ {record.currentCompany}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '学历/院校',
      render: (_, record) => (
        <div>
          <div>{record.education}</div>
          <div className="text-gray-400 text-xs">{record.school}</div>
        </div>
      ),
    },
    {
      title: '工作年限',
      dataIndex: 'workYears',
      render: (years) => years ? `${years}年` : '-',
    },
    {
      title: '城市',
      dataIndex: 'city',
      render: (text) => text || '-',
    },
    {
      title: '技能',
      dataIndex: 'skills',
      width: 200,
      render: (skills) => {
        if (!skills) return '-'
        try {
          const arr = JSON.parse(skills)
          return (
            <div className="flex flex-wrap gap-1">
              {arr.slice(0, 3).map((s: string, i: number) => (
                <Tag key={i} color="blue">{s}</Tag>
              ))}
              {arr.length > 3 && <Tag>+{arr.length - 3}</Tag>}
            </div>
          )
        } catch {
          return skills
        }
      },
    },
    {
      title: '标签',
      dataIndex: 'tags',
      width: 150,
      render: (tags) => {
        if (!tags) return '-'
        try {
          const arr = JSON.parse(tags)
          return (
            <div className="flex flex-wrap gap-1">
              {arr.slice(0, 2).map((t: string, i: number) => (
                <Tag key={i} color="orange">{t}</Tag>
              ))}
              {arr.length > 2 && <Tag>+{arr.length - 2}</Tag>}
            </div>
          )
        } catch {
          return tags
        }
      },
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<TagOutlined />} onClick={() => handleOpenTagModal(record)}>
            标签
          </Button>
          <Button type="link" size="small" icon={<SendOutlined />} onClick={() => handleOpenRecommend(record)}>
            推荐
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">人才库</h1>

      <Card>
        <div className="grid grid-cols-6 gap-4 mb-4">
          <Input.Search
            placeholder="搜索姓名/职位/公司"
            allowClear
            onSearch={(value) => setQuery(prev => ({ ...prev, keyword: value, current: 1 }))}
          />
          <Select
            placeholder="学历"
            allowClear
            onChange={(value) => setQuery(prev => ({ ...prev, education: value, current: 1 }))}
            options={educations.map(e => ({ value: e, label: e }))}
          />
          <Select
            placeholder="城市"
            allowClear
            onChange={(value) => setQuery(prev => ({ ...prev, city: value, current: 1 }))}
            options={cities.map(c => ({ value: c, label: c }))}
          />
          <InputNumber
            placeholder="最少工作年限"
            min={0}
            style={{ width: '100%' }}
            onChange={(value) => setQuery(prev => ({ ...prev, minWorkYears: value || undefined, current: 1 }))}
          />
          <Input
            placeholder="技能（逗号分隔）"
            allowClear
            onChange={(e) => setQuery(prev => ({ ...prev, skills: e.target.value || undefined }))}
            onPressEnter={handleSearch}
          />
          <Select
            mode="multiple"
            placeholder="标签筛选"
            allowClear
            onChange={(values) => setQuery(prev => ({ ...prev, tags: values?.join(',') || undefined, current: 1 }))}
            options={popularTags.map(t => ({ value: t, label: t }))}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current: query.current,
            pageSize: query.size,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="人才详情"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
      >
        {selectedCandidate && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size={64} icon={<UserOutlined />} />
              <div>
                <h2 className="text-xl font-semibold">{selectedCandidate.name}</h2>
                <p className="text-gray-500">{selectedCandidate.currentPosition} @ {selectedCandidate.currentCompany}</p>
              </div>
            </div>

            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="手机">
                <PhoneOutlined className="mr-1" />{selectedCandidate.phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <MailOutlined className="mr-1" />{selectedCandidate.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="学历">{selectedCandidate.education}</Descriptions.Item>
              <Descriptions.Item label="毕业院校">{selectedCandidate.school}</Descriptions.Item>
              <Descriptions.Item label="专业">{selectedCandidate.major}</Descriptions.Item>
              <Descriptions.Item label="工作年限">{selectedCandidate.workYears}年</Descriptions.Item>
              <Descriptions.Item label="现居城市">{selectedCandidate.city}</Descriptions.Item>
              <Descriptions.Item label="期望城市">{selectedCandidate.expectCity}</Descriptions.Item>
              <Descriptions.Item label="期望职位">{selectedCandidate.expectPosition}</Descriptions.Item>
              <Descriptions.Item label="期望薪资">
                {selectedCandidate.expectSalary ? `${selectedCandidate.expectSalary}K` : '-'}
              </Descriptions.Item>
            </Descriptions>

            {selectedCandidate.skills && (
              <div>
                <h4 className="font-medium mb-2">技能标签</h4>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selectedCandidate.skills).map((s: string, i: number) => (
                    <Tag key={i} color="blue">{s}</Tag>
                  ))}
                </div>
              </div>
            )}

            {selectedCandidate.tags && (
              <div>
                <h4 className="font-medium mb-2">人才标签</h4>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(selectedCandidate.tags).map((t: string, i: number) => (
                    <Tag key={i} color="orange">{t}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 标签编辑弹窗 */}
      <Modal
        title="编辑标签"
        open={tagModalVisible}
        onOk={handleSaveTags}
        onCancel={() => setTagModalVisible(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">当前标签</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="选择或输入标签"
              value={selectedTags}
              onChange={setSelectedTags}
              options={popularTags.map(t => ({ value: t, label: t }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">常用标签</label>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Tag
                  key={tag}
                  className="cursor-pointer"
                  color={selectedTags.includes(tag) ? 'orange' : 'default'}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag))
                    } else {
                      setSelectedTags([...selectedTags, tag])
                    }
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 推荐到职位弹窗 */}
      <Modal
        title={`推荐人才到职位 - ${selectedCandidate?.name}`}
        open={recommendModalVisible}
        onOk={handleRecommend}
        onCancel={() => setRecommendModalVisible(false)}
        confirmLoading={recommending}
        okText="确认推荐"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-500 mb-1">候选人信息</div>
            <div className="font-medium">{selectedCandidate?.name}</div>
            <div className="text-sm text-gray-600">
              {selectedCandidate?.currentPosition} @ {selectedCandidate?.currentCompany}
              {selectedCandidate?.workYears && ` · ${selectedCandidate.workYears}年经验`}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">选择目标职位 <span className="text-red-500">*</span></label>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择要推荐的职位"
              value={selectedJobId}
              onChange={setSelectedJobId}
              showSearch
              optionFilterProp="label"
              options={jobs.map(job => ({
                value: job.id,
                label: `${job.title} - ${job.deptName || '未知部门'} (${job.city})`,
              }))}
            />
          </div>

          <div className="text-sm text-gray-500">
            推荐后，候选人将进入该职位的招聘流程（候选人管理），初始状态为"待筛选"
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default TalentPool

