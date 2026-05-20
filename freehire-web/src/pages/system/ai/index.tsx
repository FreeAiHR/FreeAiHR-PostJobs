import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Alert } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ApiOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { aiConfigApi, AIConfigItem, AIConfigDTO, ProviderOption } from '@/services/ai'

const AIConfigPage = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AIConfigItem[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [providers, setProviders] = useState<ProviderOption[]>([])
  const [testing, setTesting] = useState(false)

  // 加载配置列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await aiConfigApi.getAllConfigs()
      if (res.code === 200) {
        setData(res.data)
      }
    } catch (error) {
      console.error('加载AI配置失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载提供商列表
  const loadProviders = async () => {
    try {
      const res = await aiConfigApi.getProviders()
      if (res.code === 200) {
        setProviders(res.data)
      }
    } catch (error) {
      console.error('加载提供商失败', error)
    }
  }

  useEffect(() => {
    loadData()
    loadProviders()
  }, [])

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (record: AIConfigItem) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const dto: AIConfigDTO = {
        id: editingId || undefined,
        ...values,
      }
      await aiConfigApi.saveConfig(dto)
      message.success(editingId ? '更新成功' : '创建成功')
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败', error)
    }
  }

  // 删除配置
  const handleDelete = async (id: number) => {
    try {
      await aiConfigApi.deleteConfig(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 设为默认
  const handleSetDefault = async (id: number) => {
    try {
      await aiConfigApi.setDefault(id)
      message.success('已设为默认')
      loadData()
    } catch (error) {
      console.error('设置失败', error)
    }
  }

  // 测试连接
  const handleTestConnection = async (id: number) => {
    setTesting(true)
    try {
      const res = await aiConfigApi.testConnection(id)
      if (res.code === 200 && res.data) {
        message.success('连接成功！')
      } else {
        message.error('连接失败，请检查配置')
      }
    } catch (error) {
      message.error('连接测试失败')
    } finally {
      setTesting(false)
    }
  }

  // 提供商选择变化
  const handleProviderChange = (provider: string) => {
    const selected = providers.find(p => p.value === provider)
    if (selected) {
      form.setFieldsValue({
        baseUrl: selected.defaultUrl,
        model: selected.defaultModel,
      })
    }
  }

  const columns: ColumnsType<AIConfigItem> = [
    {
      title: '提供商',
      dataIndex: 'provider',
      render: (provider) => {
        const p = providers.find(item => item.value === provider)
        return p?.label || provider
      },
    },
    {
      title: '模型',
      dataIndex: 'model',
    },
    {
      title: 'API地址',
      dataIndex: 'baseUrl',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '默认',
      dataIndex: 'isDefault',
      render: (isDefault) => isDefault === 1 ? (
        <Tag color="blue" icon={<CheckCircleOutlined />}>默认</Tag>
      ) : null,
    },
    {
      title: '操作',
      width: 280,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<ApiOutlined />}
            loading={testing}
            onClick={() => handleTestConnection(record.id)}
          >
            测试
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.isDefault !== 1 && (
            <Button type="link" size="small" onClick={() => handleSetDefault(record.id)}>
              设为默认
            </Button>
          )}
          {record.isDefault !== 1 && (
            <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
              <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">AI服务配置</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增配置
        </Button>
      </div>

      {data.length === 0 && !loading && (
        <Alert
          message="未配置AI服务"
          description={
            <div>
              <p>请先添加AI服务配置，配置完成后即可使用以下功能：</p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>AI简历解析 - 自动提取简历中的关键信息</li>
                <li>智能人岗匹配 - AI分析候选人与职位的匹配度</li>
                <li>JD智能生成 - 根据要求自动生成职位描述</li>
                <li>面试问题建议 - 根据简历生成针对性面试问题</li>
              </ul>
              <p className="mt-2 text-blue-600">推荐使用：Kimi（月之暗面）、DeepSeek、通义千问，国内可直接访问</p>
            </div>
          }
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {data.length > 0 && (
        <Alert
          message="AI服务已配置"
          description="系统已可使用AI功能，包括简历解析、智能匹配、JD生成等。如需更换服务商，请点击「设为默认」按钮。"
          type="success"
          showIcon
          className="mb-4"
        />
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingId ? '编辑AI配置' : '新增AI配置'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="provider"
            label="AI服务商"
            rules={[{ required: true, message: '请选择AI服务商' }]}
          >
            <Select
              placeholder="请选择AI服务商"
              onChange={handleProviderChange}
              optionLabelProp="label"
            >
              {providers.map(p => (
                <Select.Option key={p.value} value={p.value} label={p.label}>
                  <div>
                    <div className="font-medium">{p.label}</div>
                    <div className="text-xs text-gray-400">{p.description}</div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="apiKey"
            label="API密钥"
            rules={[{ required: true, message: '请输入API密钥' }]}
          >
            <Input.Password placeholder="请输入API密钥" />
          </Form.Item>
          <Form.Item
            name="baseUrl"
            label="API地址"
            extra="可选，不填则使用默认地址"
          >
            <Input placeholder="请输入API地址" />
          </Form.Item>
          <Form.Item
            name="model"
            label="模型名称"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="请输入模型名称" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '启用' },
                { value: 0, label: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AIConfigPage
