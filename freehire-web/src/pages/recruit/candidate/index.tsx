import { useState, useEffect } from 'react'
import { Card, Table, Tag, Avatar, Space, Button, Input, Select, Modal, message, Drawer, Descriptions } from 'antd'
import { UserOutlined, SearchOutlined, PhoneOutlined, RobotOutlined, ArrowRightOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { applicationApi, ApplicationVO, ApplicationQuery, StageChangeDTO } from '@/services/candidate'
import { useAuthStore } from '@/stores/authStore'

const stageMap: Record<string, { color: string; text: string }> = {
  new: { color: 'blue', text: '待筛选' },
  filtered: { color: 'cyan', text: '初筛通过' },
  interview_pending: { color: 'gold', text: '待安排面试' },
  interviewing: { color: 'orange', text: '面试中' },
  interview_passed: { color: 'lime', text: '面试通过' },
  offer_pending: { color: 'purple', text: '待发Offer' },
  offered: { color: 'geekblue', text: '已发Offer' },
  onboarded: { color: 'green', text: '已入职' },
  rejected: { color: 'default', text: '不合适' },
  withdrawn: { color: 'default', text: '候选人放弃' },
}

const stageOptions = Object.entries(stageMap).map(([key, value]) => ({
  value: key,
  label: value.text,
}))

// 来源映射
const sourceMap: Record<string, string> = {
  upload: 'HR上传',
  website: '官网投递',
  email: '邮件投递',
  referral: '内推',
  recommend: '人才库推荐',
  other: '其他',
}

const CandidateList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ApplicationVO[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<ApplicationQuery>({ current: 1, size: 10 })
  const [selectedApp, setSelectedApp] = useState<ApplicationVO | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [stageModalVisible, setStageModalVisible] = useState(false)
  const [targetStage, setTargetStage] = useState<string>('')
  const [rejectReason, setRejectReason] = useState<string>('')
  const { hasFeature, checkQuota } = useAuthStore()

  // 加载申请列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await applicationApi.getApplicationPage(query)
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载候选人列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [query])

  // 处理分页变化
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setQuery(prev => ({
      ...prev,
      current: pagination.current || 1,
      size: pagination.pageSize || 10,
    }))
  }

  // 处理搜索
  const handleSearch = (field: string, value: any) => {
    setQuery(prev => ({
      ...prev,
      [field]: value,
      current: 1,
    }))
  }

  // 查看详情
  const handleViewDetail = (record: ApplicationVO) => {
    setSelectedApp(record)
    setDrawerVisible(true)
  }

  // 打开阶段变更弹窗
  const handleOpenStageModal = (record: ApplicationVO) => {
    setSelectedApp(record)
    setTargetStage('')
    setRejectReason('')
    setStageModalVisible(true)
  }

  // 变更阶段
  const handleChangeStage = async () => {
    if (!selectedApp || !targetStage) {
      message.warning('请选择目标阶段')
      return
    }

    if (targetStage === 'rejected' && !rejectReason) {
      message.warning('请填写淘汰原因')
      return
    }

    try {
      const dto: StageChangeDTO = {
        applicationId: selectedApp.id,
        targetStage,
        rejectReason: targetStage === 'rejected' ? rejectReason : undefined,
      }
      await applicationApi.changeStage(dto)
      message.success('阶段变更成功')
      setStageModalVisible(false)
      loadData()
    } catch (error) {
      console.error('阶段变更失败', error)
    }
  }

  // AI智能匹配
  const handleAiMatch = async (id: number) => {
    if (!hasFeature('ai_match')) {
      message.warning('当前套餐不支持AI智能匹配功能，请升级套餐')
      return
    }
    if (!checkQuota('ai_match')) {
      message.warning('本月AI匹配次数已达上限，请升级套餐')
      return
    }

    try {
      message.loading({ content: 'AI匹配中...', key: 'match' })
      await applicationApi.aiMatch(id)
      message.success({ content: '匹配完成', key: 'match' })
      loadData()
    } catch (error) {
      message.error({ content: '匹配失败', key: 'match' })
    }
  }

  const columns: ColumnsType<ApplicationVO> = [
    {
      title: '候选人',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} />
          <div>
            <div className="font-medium">{record.candidateName || '-'}</div>
            <div className="text-gray-400 text-xs space-x-2">
              <span><PhoneOutlined /> {record.candidatePhone || '-'}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '应聘职位',
      dataIndex: 'jobTitle',
      render: (text) => text || '-',
    },
    {
      title: '当前阶段',
      dataIndex: 'stage',
      render: (stage) => {
        const s = stageMap[stage] || { color: 'default', text: stage }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: 'AI匹配度',
      dataIndex: 'matchScore',
      render: (score) => score ? (
        <span className={`font-medium ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-orange-500' : 'text-red-500'}`}>
          {score}分
        </span>
      ) : '-',
    },
    {
      title: '来源',
      dataIndex: 'source',
      render: (source) => source ? <Tag>{sourceMap[source] || source}</Tag> : '-',
    },
    {
      title: '投递时间',
      dataIndex: 'applyTime',
      render: (time) => time ? time.substring(0, 10) : '-',
    },
    {
      title: '操作',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" onClick={() => handleOpenStageModal(record)}>
            推进
          </Button>
          <Button 
            type="link" 
            size="small" 
            icon={<RobotOutlined />}
            onClick={() => handleAiMatch(record.id)}
          >
            AI匹配
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">候选人管理</h1>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input.Search
            placeholder="搜索候选人姓名"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            allowClear
            onSearch={(value) => handleSearch('candidateName', value)}
          />
          <Select
            placeholder="选择阶段"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleSearch('stage', value)}
            options={stageOptions}
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
        title="候选人详情"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
      >
        {selectedApp && (
          <div className="space-y-6">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="姓名">{selectedApp.candidateName}</Descriptions.Item>
              <Descriptions.Item label="手机">{selectedApp.candidatePhone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedApp.candidateEmail}</Descriptions.Item>
              <Descriptions.Item label="学历">{selectedApp.candidateEducation}</Descriptions.Item>
              <Descriptions.Item label="工作年限">{selectedApp.candidateWorkYears}年</Descriptions.Item>
              <Descriptions.Item label="当前公司">{selectedApp.candidateCurrentCompany}</Descriptions.Item>
              <Descriptions.Item label="当前职位">{selectedApp.candidateCurrentPosition}</Descriptions.Item>
              <Descriptions.Item label="应聘职位">{selectedApp.jobTitle}</Descriptions.Item>
              <Descriptions.Item label="当前阶段">
                <Tag color={stageMap[selectedApp.stage]?.color}>
                  {stageMap[selectedApp.stage]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="AI匹配度">
                {selectedApp.matchScore ? `${selectedApp.matchScore}分` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="来源">{selectedApp.source ? (sourceMap[selectedApp.source] || selectedApp.source) : '-'}</Descriptions.Item>
              <Descriptions.Item label="投递时间">{selectedApp.applyTime}</Descriptions.Item>
            </Descriptions>

            {selectedApp.matchAnalysis && (
              <div>
                <h4 className="font-medium mb-2">AI匹配分析</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedApp.matchAnalysis}</p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* 阶段变更弹窗 */}
      <Modal
        title="推进流程"
        open={stageModalVisible}
        onOk={handleChangeStage}
        onCancel={() => setStageModalVisible(false)}
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-2">当前阶段</label>
            <Tag color={stageMap[selectedApp?.stage || '']?.color}>
              {stageMap[selectedApp?.stage || '']?.text}
            </Tag>
            <ArrowRightOutlined className="mx-4" />
            <Select
              placeholder="选择目标阶段"
              style={{ width: 150 }}
              value={targetStage || undefined}
              onChange={setTargetStage}
              options={stageOptions}
            />
          </div>

          {targetStage === 'rejected' && (
            <div>
              <label className="block text-sm font-medium mb-2">淘汰原因</label>
              <Input.TextArea
                rows={3}
                placeholder="请输入淘汰原因"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CandidateList
