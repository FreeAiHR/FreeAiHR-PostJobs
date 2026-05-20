import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Switch, Tag, message, Space, Divider, Alert } from 'antd'
import { PlusOutlined, CopyOutlined, EyeOutlined } from '@ant-design/icons'
import { companyApi, CompanyConfig } from '@/services/company'

const CompanySettings = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [benefits, setBenefits] = useState<string[]>([])
  const [benefitInput, setBenefitInput] = useState('')
  const [careersEnabled, setCareersEnabled] = useState(false)
  const [careersUrl, setCareersUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  // 加载配置
  const loadConfig = async () => {
    setLoading(true)
    try {
      const res = await companyApi.getConfig()
      if (res.code === 200) {
        const config = res.data
        form.setFieldsValue({
          company_name: config.company_name,
          company_intro: config.company_intro,
          company_email: config.company_email,
          company_address: config.company_address,
          company_scale: config.company_scale,
          company_industry: config.company_industry,
          company_website: config.company_website,
        })
        
        setLogoUrl(config.company_logo || '')
        setCareersEnabled(config.careers_page_enabled === 'true')
        
        // 解析福利标签
        try {
          const benefitsArr = JSON.parse(config.company_benefits || '[]')
          setBenefits(benefitsArr)
        } catch {
          setBenefits([])
        }
      }

      // 获取招聘页面链接
      const urlRes = await companyApi.getCareersUrl()
      if (urlRes.code === 200) {
        setCareersUrl(window.location.origin + urlRes.data)
      }
    } catch (error) {
      console.error('加载配置失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  // 保存配置
  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const config: Partial<CompanyConfig> = {
        ...values,
        company_logo: logoUrl,
        company_benefits: JSON.stringify(benefits),
        careers_page_enabled: careersEnabled ? 'true' : 'false',
      }

      const res = await companyApi.saveConfig(config)
      if (res.code === 200) {
        message.success('保存成功')
      }
    } catch (error) {
      console.error('保存失败', error)
    } finally {
      setSaving(false)
    }
  }

  // 添加福利标签
  const handleAddBenefit = () => {
    if (benefitInput && !benefits.includes(benefitInput)) {
      setBenefits([...benefits, benefitInput])
      setBenefitInput('')
    }
  }

  // 删除福利标签
  const handleRemoveBenefit = (benefit: string) => {
    setBenefits(benefits.filter(b => b !== benefit))
  }

  // 复制链接
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(careersUrl)
    message.success('链接已复制')
  }

  // 预览
  const handlePreview = () => {
    window.open('/careers', '_blank')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-800">公司设置</h1>

      {/* 招聘页面设置 */}
      <Card title="招聘页面" loading={loading}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium">启用公开招聘页面</div>
            <div className="text-gray-400 text-sm">开启后，求职者可通过链接访问招聘页面并投递简历</div>
          </div>
          <Switch
            checked={careersEnabled}
            onChange={setCareersEnabled}
          />
        </div>

        {careersEnabled && (
          <Alert
            type="info"
            showIcon
            message="招聘页面已启用"
            description={
              <div className="mt-2">
                <div className="text-gray-600 mb-2">分享以下链接给求职者：</div>
                <div className="flex items-center gap-2">
                  <Input 
                    value={careersUrl} 
                    readOnly 
                    className="flex-1"
                  />
                  <Button icon={<CopyOutlined />} onClick={handleCopyUrl}>
                    复制
                  </Button>
                  <Button icon={<EyeOutlined />} onClick={handlePreview}>
                    预览
                  </Button>
                </div>
              </div>
            }
          />
        )}
      </Card>

      {/* 公司信息 */}
      <Card title="公司信息" loading={loading}>
        <Form
          form={form}
          layout="vertical"
          className="max-w-2xl"
        >
          <Form.Item
            name="company_name"
            label="公司名称"
            rules={[{ required: true, message: '请输入公司名称' }]}
          >
            <Input placeholder="请输入公司名称" />
          </Form.Item>

          <Form.Item label="公司Logo">
            <div className="flex items-center gap-4">
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt="logo" 
                  className="w-16 h-16 object-contain rounded border"
                />
              )}
              <Input 
                placeholder="Logo图片URL" 
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="flex-1"
              />
            </div>
          </Form.Item>

          <Form.Item
            name="company_intro"
            label="公司简介"
          >
            <Input.TextArea 
              rows={4} 
              placeholder="简要介绍公司情况，将展示在招聘页面"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item label="公司福利">
            <div className="flex flex-wrap gap-2 mb-2">
              {benefits.map((benefit) => (
                <Tag 
                  key={benefit} 
                  closable 
                  onClose={() => handleRemoveBenefit(benefit)}
                  color="blue"
                >
                  {benefit}
                </Tag>
              ))}
            </div>
            <Space.Compact className="w-full max-w-xs">
              <Input 
                placeholder="输入福利标签"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onPressEnter={handleAddBenefit}
              />
              <Button icon={<PlusOutlined />} onClick={handleAddBenefit}>
                添加
              </Button>
            </Space.Compact>
          </Form.Item>

          <Divider />

          <Form.Item
            name="company_industry"
            label="所属行业"
          >
            <Input placeholder="如：互联网/软件/金融" />
          </Form.Item>

          <Form.Item
            name="company_scale"
            label="公司规模"
          >
            <Input placeholder="如：100-500人" />
          </Form.Item>

          <Form.Item
            name="company_address"
            label="公司地址"
          >
            <Input placeholder="请输入公司地址" />
          </Form.Item>

          <Form.Item
            name="company_email"
            label="联系邮箱"
          >
            <Input placeholder="HR联系邮箱" />
          </Form.Item>

          <Form.Item
            name="company_website"
            label="公司官网"
          >
            <Input placeholder="https://..." />
          </Form.Item>
        </Form>

        <div className="mt-6">
          <Button 
            type="primary" 
            onClick={handleSave}
            loading={saving}
          >
            保存设置
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CompanySettings

