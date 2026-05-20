import { useState } from 'react'
import { Modal, Form, Input, Upload, Button, message } from 'antd'
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import { publicApi, JobVO } from '@/services/public'

interface ApplyModalProps {
  visible: boolean
  job: JobVO | null
  onClose: () => void
  onSuccess: () => void
}

const ApplyModal = ({ visible, job, onClose, onSuccess }: ApplyModalProps) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [uploadedFile, setUploadedFile] = useState<{ path: string; fileName: string } | null>(null)

  // 处理文件上传
  const handleUpload = async (file: File) => {
    try {
      const res = await publicApi.uploadResume(file)
      if (res.code === 200) {
        setUploadedFile(res.data)
        message.success('简历上传成功')
        return true
      }
      return false
    } catch (error) {
      message.error('简历上传失败')
      return false
    }
  }

  // 提交投递
  const handleSubmit = async () => {
    if (!job) return

    try {
      const values = await form.validateFields()
      
      if (!uploadedFile) {
        message.warning('请上传简历')
        return
      }

      setLoading(true)
      
      const res = await publicApi.apply({
        jobId: job.id,
        name: values.name,
        phone: values.phone,
        email: values.email,
        resumePath: uploadedFile.path,
        resumeFileName: uploadedFile.fileName,
        message: values.message,
      })

      if (res.code === 200) {
        onSuccess()
        form.resetFields()
        setFileList([])
        setUploadedFile(null)
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || '投递失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 关闭弹窗时重置状态
  const handleClose = () => {
    form.resetFields()
    setFileList([])
    setUploadedFile(null)
    onClose()
  }

  return (
    <Modal
      title={
        <div>
          <div className="text-lg font-semibold">投递简历</div>
          {job && (
            <div className="text-sm text-gray-500 font-normal mt-1">
              {job.title} · {job.city}
            </div>
          )}
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-6"
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '请输入姓名' }]}
        >
          <Input placeholder="请输入您的姓名" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            { required: true, message: '请输入手机号' },
            { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
          ]}
        >
          <Input placeholder="请输入您的手机号" />
        </Form.Item>

        <Form.Item
          name="email"
          label="邮箱"
          rules={[
            { type: 'email', message: '请输入正确的邮箱' },
          ]}
        >
          <Input placeholder="请输入您的邮箱（选填）" />
        </Form.Item>

        <Form.Item
          label="上传简历"
          required
          extra="支持 PDF、DOC、DOCX 格式，不超过 10MB"
        >
          <Upload
            accept=".pdf,.doc,.docx"
            maxCount={1}
            fileList={fileList}
            beforeUpload={async (file) => {
              // 检查文件大小
              if (file.size > 10 * 1024 * 1024) {
                message.error('文件大小不能超过 10MB')
                return false
              }
              
              const success = await handleUpload(file)
              if (success) {
                setFileList([{
                  uid: '-1',
                  name: file.name,
                  status: 'done',
                }])
              }
              return false // 阻止默认上传行为
            }}
            onRemove={() => {
              setFileList([])
              setUploadedFile(null)
            }}
          >
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
          
          {uploadedFile && (
            <div className="flex items-center gap-2 mt-2 text-green-600">
              <FileTextOutlined />
              <span>{uploadedFile.fileName}</span>
            </div>
          )}
        </Form.Item>

        <Form.Item
          name="message"
          label="求职留言"
        >
          <Input.TextArea 
            rows={3} 
            placeholder="向 HR 介绍一下自己吧（选填）" 
            maxLength={500}
            showCount
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={handleClose}>取消</Button>
          <Button 
            type="primary" 
            onClick={handleSubmit}
            loading={loading}
          >
            确认投递
          </Button>
        </div>
      </Form>
    </Modal>
  )
}

export default ApplyModal

