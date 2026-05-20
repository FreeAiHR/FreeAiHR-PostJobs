import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, DatePicker, Modal, Form, Select, message, Drawer, Descriptions, InputNumber, Input, Spin } from 'antd'
import { PlusOutlined, RobotOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs, { Dayjs } from 'dayjs'
import { interviewApi, InterviewItem, InterviewQuery, InterviewDTO, InterviewFeedbackDTO } from '@/services/interview'
import { applicationApi, ApplicationVO } from '@/services/candidate'

const statusMap: Record<string, { color: string; text: string }> = {
  scheduled: { color: 'blue', text: '已安排' },
  ongoing: { color: 'orange', text: '进行中' },
  completed: { color: 'green', text: '已完成' },
  cancelled: { color: 'default', text: '已取消' },
}

const typeMap: Record<string, string> = {
  onsite: '现场面试',
  phone: '电话面试',
  video: '视频面试',
}

const resultMap: Record<string, { color: string; text: string }> = {
  pass: { color: 'green', text: '通过' },
  fail: { color: 'red', text: '不通过' },
  pending: { color: 'gold', text: '待定' },
}

const InterviewList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<InterviewItem[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<InterviewQuery>({ current: 1, size: 10 })
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null)
  const [form] = Form.useForm()
  const [feedbackForm] = Form.useForm()
  const [applications, setApplications] = useState<ApplicationVO[]>([])
  const [appLoading, setAppLoading] = useState(false)
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])

  // 加载面试列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await interviewApi.getInterviewPage(query)
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载面试列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载待面试的申请
  const loadApplications = async () => {
    setAppLoading(true)
    try {
      const res = await applicationApi.getApplicationPage({ current: 1, size: 100, stage: 'interview_pending' })
      if (res.code === 200) {
        setApplications(res.data.records)
      }
    } catch (error) {
      console.error('加载申请列表失败', error)
    } finally {
      setAppLoading(false)
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

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates || [null, null])
    setQuery(prev => ({
      ...prev,
      startDate: dates?.[0]?.format('YYYY-MM-DD'),
      endDate: dates?.[1]?.format('YYYY-MM-DD'),
      current: 1,
    }))
  }

  // 处理状态筛选
  const handleStatusChange = (value: string | undefined) => {
    setQuery(prev => ({
      ...prev,
      status: value,
      current: 1,
    }))
  }

  // 打开新建面试弹窗
  const handleOpenCreateModal = () => {
    form.resetFields()
    loadApplications()
    setCreateModalVisible(true)
  }

  // 创建面试
  const handleCreateInterview = async () => {
    try {
      const values = await form.validateFields()
      const dto: InterviewDTO = {
        applicationId: values.applicationId,
        round: values.round,
        interviewType: values.interviewType,
        interviewTime: values.interviewTime.format('YYYY-MM-DD HH:mm:ss'),
        duration: values.duration,
        location: values.location,
        meetingLink: values.meetingLink,
        remark: values.remark,
      }
      await interviewApi.createInterview(dto)
      message.success('面试安排成功')
      setCreateModalVisible(false)
      loadData()
    } catch (error) {
      console.error('创建面试失败', error)
    }
  }

  // 查看详情
  const handleViewDetail = (record: InterviewItem) => {
    setSelectedInterview(record)
    setAiQuestions([])
    setDrawerVisible(true)
  }

  // 打开反馈弹窗
  const handleOpenFeedbackModal = (record: InterviewItem) => {
    setSelectedInterview(record)
    feedbackForm.setFieldsValue({
      score: record.score,
      result: record.result,
      feedback: record.feedback,
    })
    setFeedbackModalVisible(true)
  }

  // 提交反馈
  const handleSubmitFeedback = async () => {
    if (!selectedInterview) return
    
    try {
      const values = await feedbackForm.validateFields()
      const dto: InterviewFeedbackDTO = {
        interviewId: selectedInterview.id,
        score: values.score,
        result: values.result,
        feedback: values.feedback,
      }
      await interviewApi.submitFeedback(dto)
      message.success('反馈提交成功')
      setFeedbackModalVisible(false)
      loadData()
    } catch (error) {
      console.error('提交反馈失败', error)
    }
  }

  // 取消面试
  const handleCancelInterview = async (id: number) => {
    try {
      await interviewApi.cancelInterview(id)
      message.success('面试已取消')
      loadData()
    } catch (error) {
      console.error('取消面试失败', error)
    }
  }

  // AI生成面试问题
  const handleGenerateQuestions = async () => {
    if (!selectedInterview) return
    
    setAiLoading(true)
    try {
      const res = await interviewApi.generateInterviewQuestions(selectedInterview.id)
      if (res.code === 200) {
        setAiQuestions(res.data)
      }
    } catch (error) {
      message.error('生成面试问题失败')
    } finally {
      setAiLoading(false)
    }
  }

  const columns: ColumnsType<InterviewItem> = [
    {
      title: '候选人',
      dataIndex: 'candidateName',
      render: (text: string) => <span className="font-medium">{text || '-'}</span>,
    },
    {
      title: '应聘职位',
      dataIndex: 'jobTitle',
      render: (text) => text || '-',
    },
    {
      title: '面试轮次',
      dataIndex: 'round',
      render: (round: number) => round ? `第${round}轮` : '-',
    },
    {
      title: '面试形式',
      dataIndex: 'interviewType',
      render: (type: string) => typeMap[type] || type || '-',
    },
    {
      title: '面试时间',
      dataIndex: 'interviewTime',
      render: (time: string) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => {
        const s = statusMap[status] || { color: 'default', text: status }
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '结果',
      dataIndex: 'result',
      render: (result: string) => {
        if (!result) return '-'
        const r = resultMap[result] || { color: 'default', text: result }
        return <Tag color={r.color}>{r.text}</Tag>
      },
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleViewDetail(record)}>
            查看
          </Button>
          {record.status === 'scheduled' && (
            <>
              <Button type="link" size="small" onClick={() => handleOpenFeedbackModal(record)}>
                录入反馈
              </Button>
              <Button 
                type="link" 
                size="small" 
                danger
                onClick={() => handleCancelInterview(record.id)}
              >
                取消
              </Button>
            </>
          )}
          {record.status === 'completed' && !record.result && (
            <Button type="link" size="small" onClick={() => handleOpenFeedbackModal(record)}>
              录入反馈
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">面试管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
          安排面试
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <DatePicker.RangePicker 
            placeholder={['开始日期', '结束日期']} 
            value={dateRange}
            onChange={handleDateRangeChange}
          />
          <Select
            placeholder="面试状态"
            style={{ width: 120 }}
            allowClear
            onChange={handleStatusChange}
            options={Object.entries(statusMap).map(([key, value]) => ({
              value: key,
              label: value.text,
            }))}
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

      {/* 创建面试弹窗 */}
      <Modal
        title="安排面试"
        open={createModalVisible}
        onOk={handleCreateInterview}
        onCancel={() => setCreateModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="applicationId"
            label="选择候选人"
            rules={[{ required: true, message: '请选择候选人' }]}
          >
            <Select
              placeholder="选择待面试的候选人"
              loading={appLoading}
              showSearch
              optionFilterProp="children"
            >
              {applications.map(app => (
                <Select.Option key={app.id} value={app.id}>
                  {app.candidateName} - {app.jobTitle}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="round"
              label="面试轮次"
            >
              <InputNumber min={1} placeholder="轮次" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="interviewType"
              label="面试形式"
              initialValue="onsite"
            >
              <Select>
                <Select.Option value="onsite">现场面试</Select.Option>
                <Select.Option value="phone">电话面试</Select.Option>
                <Select.Option value="video">视频面试</Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="interviewTime"
              label="面试时间"
              rules={[{ required: true, message: '请选择面试时间' }]}
            >
              <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="duration"
              label="预计时长(分钟)"
              initialValue={60}
            >
              <InputNumber min={15} step={15} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item
            name="location"
            label="面试地点"
          >
            <Input placeholder="请输入面试地点" />
          </Form.Item>
          <Form.Item
            name="meetingLink"
            label="会议链接"
          >
            <Input placeholder="视频面试请填写会议链接" />
          </Form.Item>
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={2} placeholder="其他说明" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 反馈弹窗 */}
      <Modal
        title="录入面试反馈"
        open={feedbackModalVisible}
        onOk={handleSubmitFeedback}
        onCancel={() => setFeedbackModalVisible(false)}
        width={500}
      >
        <Form form={feedbackForm} layout="vertical">
          <Form.Item
            name="score"
            label="综合评分"
          >
            <InputNumber min={0} max={100} style={{ width: 120 }} addonAfter="分" />
          </Form.Item>
          <Form.Item
            name="result"
            label="面试结果"
            rules={[{ required: true, message: '请选择面试结果' }]}
          >
            <Select placeholder="选择面试结果">
              <Select.Option value="pass">通过</Select.Option>
              <Select.Option value="fail">不通过</Select.Option>
              <Select.Option value="pending">待定</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="feedback"
            label="详细反馈"
          >
            <Input.TextArea rows={4} placeholder="请填写面试评价和反馈" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="面试详情"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
      >
        {selectedInterview && (
          <div className="space-y-6">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="候选人">{selectedInterview.candidateName}</Descriptions.Item>
              <Descriptions.Item label="应聘职位">{selectedInterview.jobTitle}</Descriptions.Item>
              <Descriptions.Item label="面试轮次">第{selectedInterview.round}轮</Descriptions.Item>
              <Descriptions.Item label="面试形式">{typeMap[selectedInterview.interviewType]}</Descriptions.Item>
              <Descriptions.Item label="面试时间">
                {dayjs(selectedInterview.interviewTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="预计时长">{selectedInterview.duration}分钟</Descriptions.Item>
              <Descriptions.Item label="面试地点" span={2}>{selectedInterview.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="会议链接" span={2}>
                {selectedInterview.meetingLink ? (
                  <a href={selectedInterview.meetingLink} target="_blank" rel="noreferrer">
                    {selectedInterview.meetingLink}
                  </a>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusMap[selectedInterview.status]?.color}>
                  {statusMap[selectedInterview.status]?.text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="结果">
                {selectedInterview.result ? (
                  <Tag color={resultMap[selectedInterview.result]?.color}>
                    {resultMap[selectedInterview.result]?.text}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="评分">{selectedInterview.score ? `${selectedInterview.score}分` : '-'}</Descriptions.Item>
            </Descriptions>

            {selectedInterview.feedback && (
              <div>
                <h4 className="font-medium mb-2">面试反馈</h4>
                <p className="text-gray-600 bg-gray-50 p-3 rounded">{selectedInterview.feedback}</p>
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">AI面试问题建议</h4>
                <Button 
                  type="primary" 
                  icon={<RobotOutlined />} 
                  size="small"
                  loading={aiLoading}
                  onClick={handleGenerateQuestions}
                >
                  生成问题
                </Button>
              </div>
              {aiLoading ? (
                <div className="text-center py-4">
                  <Spin tip="AI正在生成面试问题..." />
                </div>
              ) : aiQuestions.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2 bg-blue-50 p-4 rounded">
                  {aiQuestions.map((q, index) => (
                    <li key={index} className="text-gray-700">{q}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-400 text-center py-4">点击按钮生成AI面试问题建议</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default InterviewList
