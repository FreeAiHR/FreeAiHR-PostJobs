import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Input, Modal, Form, Select, message, Popconfirm, TreeSelect } from 'antd'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { userApi, roleApi, deptApi, UserItem, UserDTO, UserQuery, RoleItem, DeptItem } from '@/services/system'

const UserList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState<UserQuery>({ current: 1, size: 10 })
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [roles, setRoles] = useState<RoleItem[]>([])
  const [depts, setDepts] = useState<DeptItem[]>([])

  // 加载用户列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await userApi.getUserPage(query)
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载用户列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载角色和部门
  const loadOptions = async () => {
    try {
      const [rolesRes, deptsRes] = await Promise.all([
        roleApi.getAllRoles(),
        deptApi.getDeptTree(),
      ])
      if (rolesRes.code === 200) {
        setRoles(rolesRes.data)
      }
      if (deptsRes.code === 200) {
        setDepts(deptsRes.data)
      }
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

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = async (record: UserItem) => {
    setEditingId(record.id)
    // 获取用户角色
    const res = await userApi.getUserRoleIds(record.id)
    form.setFieldsValue({
      ...record,
      roleIds: res.code === 200 ? res.data : [],
    })
    setModalVisible(true)
  }

  // 保存用户
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const dto: UserDTO = {
        id: editingId || undefined,
        ...values,
      }
      
      if (editingId) {
        await userApi.updateUser(dto)
        message.success('更新成功')
      } else {
        await userApi.createUser(dto)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败', error)
    }
  }

  // 删除用户
  const handleDelete = async (id: number) => {
    try {
      await userApi.deleteUser(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 重置密码
  const handleResetPassword = async (id: number) => {
    try {
      await userApi.resetPassword(id)
      message.success('密码已重置为123456')
    } catch (error) {
      console.error('重置密码失败', error)
    }
  }

  // 转换部门为树形选择数据
  const convertDeptToTreeData = (depts: DeptItem[]): any[] => {
    return depts.map(dept => ({
      title: dept.deptName,
      value: dept.id,
      children: dept.children ? convertDeptToTreeData(dept.children) : [],
    }))
  }

  const columns: ColumnsType<UserItem> = [
    { title: '用户名', dataIndex: 'username' },
    { title: '姓名', dataIndex: 'realName' },
    { title: '部门', dataIndex: 'deptName', render: (text) => text || '-' },
    { title: '手机号', dataIndex: 'phone', render: (text) => text || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', render: (text) => text?.substring(0, 10) },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定重置密码吗？"
            description="密码将重置为123456"
            onConfirm={() => handleResetPassword(record.id)}
          >
            <Button type="link" size="small" icon={<KeyOutlined />}>
              重置密码
            </Button>
          </Popconfirm>
          {record.username !== 'admin' && (
            <Popconfirm
              title="确定删除吗？"
              onConfirm={() => handleDelete(record.id)}
            >
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
        <h1 className="text-xl font-semibold text-gray-800">用户管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增用户
        </Button>
      </div>

      <Card>
        <div className="flex gap-4 mb-4">
          <Input.Search
            placeholder="搜索用户名"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            allowClear
            onSearch={(value) => setQuery(prev => ({ ...prev, username: value, current: 1 }))}
          />
          <Input.Search
            placeholder="搜索姓名"
            style={{ width: 200 }}
            allowClear
            onSearch={(value) => setQuery(prev => ({ ...prev, realName: value, current: 1 }))}
          />
          <Select
            placeholder="选择状态"
            style={{ width: 120 }}
            allowClear
            onChange={(value) => setQuery(prev => ({ ...prev, status: value, current: 1 }))}
            options={[
              { value: 1, label: '正常' },
              { value: 0, label: '禁用' },
            ]}
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

      <Modal
        title={editingId ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" disabled={!!editingId} />
            </Form.Item>
            <Form.Item
              name="realName"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </div>
          {!editingId && (
            <Form.Item
              name="password"
              label="密码"
              extra="不填则使用默认密码123456"
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="phone" label="手机号">
              <Input placeholder="请输入手机号" />
            </Form.Item>
            <Form.Item name="email" label="邮箱">
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </div>
          <Form.Item name="deptId" label="部门">
            <TreeSelect
              placeholder="请选择部门"
              treeData={convertDeptToTreeData(depts)}
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select
              mode="multiple"
              placeholder="请选择角色"
              options={roles.map(r => ({ value: r.id, label: r.roleName }))}
            />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select
              options={[
                { value: 1, label: '正常' },
                { value: 0, label: '禁用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserList
