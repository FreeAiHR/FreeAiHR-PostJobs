import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Input, Select, Modal, Form, InputNumber, message, Popconfirm } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, SendOutlined, PauseOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { jobApi, JobItem, JobDTO, JobQuery } from '@/services/job'
import { useAuthStore } from '@/stores/authStore'

const JobList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<JobItem[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<JobQuery>({ current: 1, size: 10 })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingJob, setEditingJob] = useState<JobItem | null>(null)
  const [form] = Form.useForm()
  const { checkQuota } = useAuthStore()

  // 加载职位列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await jobApi.getJobPage(query)
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载职位列表失败', error)
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
      current: 1, // 重置到第一页
    }))
  }

  const columns: ColumnsType<JobItem> = [
    {
      title: '职位名称',
      dataIndex: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800">{text}</div>
          <div className="text-gray-400 text-sm">{record.deptName || '-'}</div>
        </div>
      ),
    },
    {
      title: '工作地点',
      dataIndex: 'city',
      render: (city) => city || '-',
    },
    {
      title: '薪资范围',
      render: (_, record) => (
        record.salaryMin && record.salaryMax ? (
          <span className="text-orange-500 font-medium">
            {record.salaryMin}-{record.salaryMax}K
          </span>
        ) : '-'
      ),
    },
    {
      title: '学历/经验',
      render: (_, record) => (
        <span>{record.education || '不限'} / {record.experience || '不限'}</span>
      ),
    },
    {
      title: '投递数',
      dataIndex: 'applyCount',
      render: (count) => <span className="text-blue-500">{count || 0}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        const statusMap: Record<number, { color: string; text: string }> = {
          0: { color: 'default', text: '已关闭' },
          1: { color: 'green', text: '招聘中' },
          2: { color: 'orange', text: '已暂停' },
        }
        const s = statusMap[status] || statusMap[0]
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (time) => time ? time.substring(0, 10) : '-',
    },
    {
      title: '操作',
      width: 280,
      render: (_, record) => (
        <Space>
          {record.status !== 1 && (
            <Button 
              type="link" 
              size="small" 
              icon={<SendOutlined />}
              onClick={() => handlePublish(record.id)}
            >
              发布
            </Button>
          )}
          {record.status === 1 && (
            <Button 
              type="link" 
              size="small" 
              icon={<PauseOutlined />}
              onClick={() => handlePause(record.id)}
            >
              暂停
            </Button>
          )}
          <Button 
            type="link" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该职位吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 新增职位
  const handleAdd = () => {
    // 检查用量
    if (!checkQuota('job')) {
      message.warning('职位数量已达上限，请升级套餐')
      return
    }
    setEditingJob(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 编辑职位
  const handleEdit = (job: JobItem) => {
    setEditingJob(job)
    form.setFieldsValue({
      ...job,
      tags: job.tagList || [],
    })
    setModalVisible(true)
  }

  // 删除职位
  const handleDelete = async (id: number) => {
    try {
      await jobApi.deleteJob(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 发布职位
  const handlePublish = async (id: number) => {
    try {
      await jobApi.publishJob(id)
      message.success('发布成功')
      loadData()
    } catch (error) {
      console.error('发布失败', error)
    }
  }

  // 暂停职位
  const handlePause = async (id: number) => {
    try {
      await jobApi.pauseJob(id)
      message.success('已暂停')
      loadData()
    } catch (error) {
      console.error('暂停失败', error)
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const dto: JobDTO = {
        ...values,
        id: editingJob?.id,
      }
      
      if (editingJob) {
        await jobApi.updateJob(dto)
        message.success('更新成功')
      } else {
        await jobApi.createJob(dto)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">职位管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          发布职位
        </Button>
      </div>

      <Card>
        {/* 搜索栏 */}
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="搜索职位名称"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            allowClear
            onPressEnter={(e) => handleSearch('title', (e.target as HTMLInputElement).value)}
            onChange={(e) => !e.target.value && handleSearch('title', '')}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            onChange={(value) => handleSearch('status', value)}
            options={[
              { value: 1, label: '招聘中' },
              { value: 0, label: '已关闭' },
              { value: 2, label: '已暂停' },
            ]}
          />
          <Input
            placeholder="工作城市"
            style={{ width: 150 }}
            allowClear
            onPressEnter={(e) => handleSearch('city', (e.target as HTMLInputElement).value)}
            onChange={(e) => !e.target.value && handleSearch('city', '')}
          />
        </div>

        {/* 表格 */}
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
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingJob ? '编辑职位' : '发布职位'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="职位名称"
            rules={[{ required: true, message: '请输入职位名称' }]}
          >
            <Input placeholder="请输入职位名称" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="deptId" label="所属部门">
              <Select
                placeholder="请选择部门"
                options={[
                  { value: 1, label: '技术部' },
                  { value: 2, label: '产品部' },
                ]}
              />
            </Form.Item>
            <Form.Item name="city" label="工作城市">
              <Input placeholder="请输入工作城市" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Form.Item name="salaryMin" label="最低薪资(K)">
              <InputNumber min={0} placeholder="最低" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="salaryMax" label="最高薪资(K)">
              <InputNumber min={0} placeholder="最高" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="education" label="学历要求">
              <Select
                placeholder="请选择"
                options={[
                  { value: '不限', label: '不限' },
                  { value: '大专', label: '大专' },
                  { value: '本科', label: '本科' },
                  { value: '硕士', label: '硕士' },
                ]}
              />
            </Form.Item>
            <Form.Item name="experience" label="经验要求">
              <Select
                placeholder="请选择"
                options={[
                  { value: '不限', label: '不限' },
                  { value: '1年以下', label: '1年以下' },
                  { value: '1-3年', label: '1-3年' },
                  { value: '3-5年', label: '3-5年' },
                  { value: '5年以上', label: '5年以上' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item name="description" label="职位描述">
            <Input.TextArea rows={4} placeholder="请输入职位描述" />
          </Form.Item>
          <Form.Item name="requirements" label="任职要求">
            <Input.TextArea rows={4} placeholder="请输入任职要求" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default JobList

