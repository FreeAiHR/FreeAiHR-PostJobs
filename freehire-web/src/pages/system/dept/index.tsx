import { useState, useEffect } from 'react'
import { Card, Table, Tag, Button, Space, Modal, Form, Input, InputNumber, Select, message, Popconfirm, TreeSelect } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { deptApi, DeptItem, DeptDTO } from '@/services/system'

const DeptList = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<DeptItem[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form] = Form.useForm()

  // 加载部门树
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await deptApi.getDeptTree()
      if (res.code === 200) {
        setData(res.data)
      }
    } catch (error) {
      console.error('加载部门失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // 打开新增弹窗
  const handleAdd = (parentId?: number) => {
    setEditingId(null)
    form.resetFields()
    if (parentId) {
      form.setFieldsValue({ parentId })
    }
    setModalVisible(true)
  }

  // 打开编辑弹窗
  const handleEdit = (record: DeptItem) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  // 保存部门
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const dto: DeptDTO = {
        id: editingId || undefined,
        ...values,
      }
      
      if (editingId) {
        await deptApi.updateDept(dto)
        message.success('更新成功')
      } else {
        await deptApi.createDept(dto)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error('保存失败', error)
    }
  }

  // 删除部门
  const handleDelete = async (id: number) => {
    try {
      await deptApi.deleteDept(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error('删除失败', error)
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

  const columns: ColumnsType<DeptItem> = [
    { title: '部门名称', dataIndex: 'deptName' },
    { title: '负责人', dataIndex: 'leader', render: (text) => text || '-' },
    { title: '联系电话', dataIndex: 'phone', render: (text) => text || '-' },
    { title: '邮箱', dataIndex: 'email', render: (text) => text || '-' },
    { title: '排序', dataIndex: 'sort' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'default'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ) 
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<PlusOutlined />} onClick={() => handleAdd(record.id)}>
            新增子部门
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            description="删除后不可恢复"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-gray-800">部门管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAdd()}>
          新增部门
        </Button>
      </div>
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={false}
          defaultExpandAllRows
        />
      </Card>

      <Modal
        title={editingId ? '编辑部门' : '新增部门'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="parentId" label="上级部门">
            <TreeSelect
              placeholder="请选择上级部门（不选为顶级）"
              treeData={convertDeptToTreeData(data)}
              allowClear
              treeDefaultExpandAll
            />
          </Form.Item>
          <Form.Item
            name="deptName"
            label="部门名称"
            rules={[{ required: true, message: '请输入部门名称' }]}
          >
            <Input placeholder="请输入部门名称" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="leader" label="负责人">
              <Input placeholder="请输入负责人" />
            </Form.Item>
            <Form.Item name="phone" label="联系电话">
              <Input placeholder="请输入联系电话" />
            </Form.Item>
          </div>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
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
    </div>
  )
}

export default DeptList
