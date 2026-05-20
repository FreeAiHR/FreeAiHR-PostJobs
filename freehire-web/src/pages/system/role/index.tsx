import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Tree } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { roleApi, menuApi, RoleItem, RoleDTO, MenuItem } from '@/services/system'

const RoleList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<RoleItem[]>([])
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalVisible, setModalVisible] = useState(false)
  const [menuModalVisible, setMenuModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()
  const [menus, setMenus] = useState<MenuItem[]>([])
  const [checkedMenuIds, setCheckedMenuIds] = useState<number[]>([])
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null)

  // 加载角色列表
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await roleApi.getRolePage({ current, size: pageSize })
      if (res.code === 200) {
        setData(res.data.records)
        setTotal(res.data.total)
      }
    } catch (error) {
      console.error('加载角色列表失败', error)
    } finally {
      setLoading(false)
    }
  }

  // 加载菜单树
  const loadMenus = async () => {
    try {
      const res = await menuApi.getMenuTree()
      if (res.code === 200) {
        setMenus(res.data)
      }
    } catch (error) {
      console.error('加载菜单失败', error)
    }
  }

  useEffect(() => {
    loadData()
    loadMenus()
  }, [current, pageSize])

  // 处理分页变化
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrent(pagination.current || 1)
    setPageSize(pagination.pageSize || 10)
  }

  // 打开新增弹窗
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (record: RoleItem) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  // 保存角色
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const dto: RoleDTO = {
        id: editingId || undefined,
        ...values,
      }
      
      if (editingId) {
        await roleApi.updateRole(dto)
        message.success('更新成功')
      } else {
        await roleApi.createRole(dto)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败', error)
    }
  }

  // 删除角色
  const handleDelete = async (id: number) => {
    try {
      await roleApi.deleteRole(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
    }
  }

  // 打开菜单分配弹窗
  const handleOpenMenuModal = async (record: RoleItem) => {
    setSelectedRole(record)
    const res = await roleApi.getRoleMenuIds(record.id)
    if (res.code === 200) {
      setCheckedMenuIds(res.data)
    }
    setMenuModalVisible(true)
  }

  // 保存菜单分配
  const handleSaveMenus = async () => {
    if (!selectedRole) return
    try {
      await roleApi.assignMenus(selectedRole.id, checkedMenuIds)
      message.success('菜单分配成功')
      setMenuModalVisible(false)
    } catch (error) {
      console.error('菜单分配失败', error)
    }
  }

  // 转换菜单为树形数据
  const convertMenuToTreeData = (menus: MenuItem[]): any[] => {
    return menus.map(menu => ({
      key: menu.id,
      title: menu.name,
      children: menu.children ? convertMenuToTreeData(menu.children) : [],
    }))
  }

  const columns: ColumnsType<RoleItem> = [
    { title: '角色编码', dataIndex: 'roleCode' },
    { title: '角色名称', dataIndex: 'roleName' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ) 
    },
    { title: '备注', dataIndex: 'remark', render: (text) => text || '-' },
    { title: '排序', dataIndex: 'sort' },
    { title: '创建时间', dataIndex: 'createTime', render: (text) => text?.substring(0, 10) },
    {
      title: '操作',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" icon={<SettingOutlined />} onClick={() => handleOpenMenuModal(record)}>
            权限
          </Button>
          {record.roleCode !== 'super_admin' && (
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
        <h1 className="text-xl font-semibold text-gray-800">角色管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增角色
        </Button>
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onChange={handleTableChange}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 角色编辑弹窗 */}
      <Modal
        title={editingId ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" disabled={!!editingId} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="sort" label="排序" initialValue={0}>
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态" initialValue={1}>
              <Select
                options={[
                  { value: 1, label: '正常' },
                  { value: 0, label: '禁用' },
                ]}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* 菜单分配弹窗 */}
      <Modal
        title={`分配权限 - ${selectedRole?.roleName}`}
        open={menuModalVisible}
        onOk={handleSaveMenus}
        onCancel={() => setMenuModalVisible(false)}
        width={500}
      >
        <Tree
          checkable
          defaultExpandAll
          treeData={convertMenuToTreeData(menus)}
          checkedKeys={checkedMenuIds}
          onCheck={(checked) => setCheckedMenuIds(checked as number[])}
        />
      </Modal>
    </div>
  )
}

export default RoleList
