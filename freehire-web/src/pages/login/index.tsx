import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { authApi, LoginParams } from '@/services/auth'
import { useAuthStore } from '@/stores/authStore'

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setToken, setUserInfo, setSubscription } = useAuthStore()

  const onFinish = async (values: LoginParams) => {
    setLoading(true)
    try {
      const res = await authApi.login(values)
      if (res.code === 200) {
        setToken(res.data.token)
        setUserInfo({
          userId: res.data.userId,
          username: res.data.username,
          realName: res.data.realName,
          avatar: res.data.avatar,
          roles: res.data.roles,
          permissions: res.data.permissions,
        })
        // 保存订阅信息
        if (res.data.subscription) {
          setSubscription(res.data.subscription)
        }
        message.success('登录成功')
        navigate('/', { replace: true })
      }
    } catch (error) {
      // 错误已在拦截器中处理
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左侧背景 */}
      <div 
        className="hidden lg:flex lg:w-1/2 items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="text-center text-white px-12">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold">F</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">FreeHire</h1>
            <p className="text-xl opacity-90">智能招聘系统</p>
          </div>
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <div className="font-semibold">AI智能解析</div>
                <div className="text-sm opacity-80">自动解析简历，提取关键信息</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <div>
                <div className="font-semibold">智能匹配</div>
                <div className="text-sm opacity-80">AI精准匹配人才与职位</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-lg">📊</span>
              </div>
              <div>
                <div className="font-semibold">全流程管理</div>
                <div className="text-sm opacity-80">从投递到入职，一站式管理</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">F</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">FreeHire</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">欢迎回来</h2>
            <p className="text-gray-500">请登录您的账号</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <Form
              name="login"
              initialValues={{ rememberMe: true }}
              onFinish={onFinish}
              size="large"
              layout="vertical"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="密码"
                />
              </Form.Item>

              <Form.Item>
                <div className="flex items-center justify-between">
                  <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                    <Checkbox>记住我</Checkbox>
                  </Form.Item>
                  <a className="text-blue-500 hover:text-blue-600" href="#">
                    忘记密码？
                  </a>
                </div>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="h-12"
                >
                  登 录
                </Button>
              </Form.Item>
            </Form>

            <div className="mt-4 text-center text-gray-400 text-sm">
              <p>演示账号: admin / admin123</p>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>© 2024 FreeHire. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

