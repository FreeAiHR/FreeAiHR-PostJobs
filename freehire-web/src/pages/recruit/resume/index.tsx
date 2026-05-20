import { useState, useEffect } from 'react'
import { Card, Table, Button, Space, Tag, Input, Upload, message, Modal, Descriptions, Popconfirm } from 'antd'
import { UploadOutlined, SearchOutlined, EyeOutlined, RobotOutlined, DeleteOutlined, DownloadOutlined, UserAddOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import type { UploadProps } from 'antd'
import { resumeApi, ResumeItem, ResumeQuery } from '@/services/resume'
import { useAuthStore } from '@/stores/authStore'

// 来源映射
const SOURCE_MAP: Record<string, string> = {
  upload: 'HR上传',
  website: '官网投递',
  email: '邮件投递',
  referral: '内推',
}

const ResumeList = () => {
  const [data, setData] = useState<ResumeItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState<ResumeQuery>({ current: 1, size: 10 })
  const [previewVisible, setPreviewVisible] = useState(false)
  const [currentResume, setCurrentResume] = useState<ResumeItem | null>(null)
  const { hasFeature, checkQuota } = useAuthStore()

  // 加载简历列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await resumeApi.getResumePage(query)
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载简历列表失败', error)
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
  const handleSearch = (value: string) => {
    setQuery(prev => ({
      ...prev,
      name: value,
      current: 1,
    }))
  }

  // AI解析简历
  const handleParse = async (id: number) => {
    if (!hasFeature('ai_parse')) {
      message.warning('当前套餐不支持AI简历解析功能，请升级套餐')
      return
    }
    if (!checkQuota('ai_parse')) {
      message.warning('本月AI解析次数已达上限，请升级套餐')
      return
    }
    
    try {
      message.loading({ content: 'AI解析中...', key: 'parse' })
      await resumeApi.parseResume(id)
      message.success({ content: '解析成功', key: 'parse' })
      loadData()
    } catch (error) {
      message.error({ content: '解析失败', key: 'parse' })
    }
  }

  // 删除简历
  const handleDelete = async (id: number) => {
    try {
      await resumeApi.deleteResume(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 下载简历
  const handleDownload = async (id: number) => {
    try {
      const res = await resumeApi.getResumeDownloadUrl(id)
      if (res.code === 200 && res.data) {
        // 如果是相对路径，拼接后端地址
        let url = res.data
        if (url.startsWith('/api')) {
          // 开发环境使用后端地址，生产环境保持相对路径
          const backendUrl = import.meta.env.DEV ? 'http://localhost:8080' : ''
          url = backendUrl + url
        }
        window.open(url, '_blank')
      }
    } catch (error) {
      message.error('获取下载链接失败')
    }
  }

  // 加入人才库（从简历创建候选人）
  const handleCreateCandidate = async (record: ResumeItem) => {
    if (record.parseStatus !== 'success') {
      message.warning('请先解析简历再加入人才库')
      return
    }
    if (record.candidateId) {
      message.info('该简历已关联候选人')
      return
    }
    try {
      const res = await resumeApi.createCandidate(record.id)
      if (res.code === 200) {
        message.success('已成功加入人才库')
        loadData()
      }
    } catch (error) {
      message.error('加入人才库失败')
    }
  }

  const columns: ColumnsType<ResumeItem> = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (text, record) => (
        <span className="font-medium">{text || record.fileName}</span>
      ),
    },
    {
      title: '联系方式',
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.phone || '-'}</div>
          <div className="text-gray-400">{record.email || '-'}</div>
        </div>
      ),
    },
    {
      title: '学历/院校',
      render: (_, record) => (
        <div>
          <div>{record.education || '-'}</div>
          <div className="text-gray-400 text-sm">{record.school || '-'}</div>
        </div>
      ),
    },
    {
      title: '工作经验',
      dataIndex: 'workYears',
      render: (years) => years ? `${years}年` : '-',
    },
    {
      title: '当前职位',
      render: (_, record) => (
        <div>
          <div>{record.currentPosition || '-'}</div>
          <div className="text-gray-400 text-sm">{record.currentCompany || '-'}</div>
        </div>
      ),
    },
    {
      title: '解析状态',
      dataIndex: 'parseStatus',
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'default', text: '待解析' },
          processing: { color: 'processing', text: '解析中' },
          success: { color: 'success', text: '已解析' },
          failed: { color: 'error', text: '解析失败' },
        }
        const s = statusMap[status] || statusMap['pending']
        return <Tag color={s.color}>{s.text}</Tag>
      },
    },
    {
      title: '来源',
      dataIndex: 'source',
      render: (source) => <Tag>{SOURCE_MAP[source] || source || '其他'}</Tag>,
    },
    {
      title: '上传时间',
      dataIndex: 'createTime',
      render: (time) => time ? time.substring(0, 16) : '-',
    },
    {
      title: '操作',
      width: 320,
      render: (_, record) => (
        <Space wrap>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentResume(record)
              setPreviewVisible(true)
            }}
          >
            查看
          </Button>
          {record.parseStatus !== 'success' && (
            <Button 
              type="link" 
              size="small" 
              icon={<RobotOutlined />}
              onClick={() => handleParse(record.id)}
              disabled={record.parseStatus === 'processing'}
            >
              AI解析
            </Button>
          )}
          {record.parseStatus === 'success' && !record.candidateId && (
            <Button 
              type="link" 
              size="small" 
              icon={<UserAddOutlined />}
              onClick={() => handleCreateCandidate(record)}
            >
              加入人才库
            </Button>
          )}
          {record.candidateId && (
            <Tag color="green">已入库</Tag>
          )}
          <Button 
            type="link" 
            size="small" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id)}
          >
            下载
          </Button>
          <Popconfirm
            title="确定删除该简历吗？"
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

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    multiple: true,
    showUploadList: false,
    beforeUpload: () => {
      // 检查用量
      if (!checkQuota('resume')) {
        message.warning('简历数量已达上限，请升级套餐')
        return false
      }
      return true
    },
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const res = await resumeApi.uploadResume(file as File, 'upload')
        if (res.code === 200) {
          message.success(`${(file as File).name} 上传成功`)
          onSuccess?.(res)
          loadData()
        } else {
          onError?.(new Error(res.message))
        }
      } catch (error: any) {
        message.error(`${(file as File).name} 上传失败`)
        onError?.(error)
      }
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">简历管理</h1>
        <Upload {...uploadProps}>
          <Button type="primary" icon={<UploadOutlined />}>
            上传简历
          </Button>
        </Upload>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input.Search
            placeholder="搜索姓名"
            prefix={<SearchOutlined />}
            style={{ width: 240 }}
            allowClear
            onSearch={handleSearch}
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

      {/* 简历预览弹窗 */}
      <Modal
        title="简历详情"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={700}
      >
        {currentResume && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="姓名">{currentResume.name}</Descriptions.Item>
            <Descriptions.Item label="手机">{currentResume.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{currentResume.email}</Descriptions.Item>
            <Descriptions.Item label="学历">{currentResume.education}</Descriptions.Item>
            <Descriptions.Item label="毕业院校">{currentResume.school}</Descriptions.Item>
            <Descriptions.Item label="工作年限">{currentResume.workYears}年</Descriptions.Item>
            <Descriptions.Item label="当前公司">{currentResume.currentCompany}</Descriptions.Item>
            <Descriptions.Item label="当前职位">{currentResume.currentPosition}</Descriptions.Item>
            <Descriptions.Item label="来源">{SOURCE_MAP[currentResume.source] || currentResume.source || '其他'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ResumeList

