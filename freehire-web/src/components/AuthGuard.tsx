import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const navigate = useNavigate()
  const { token, loading, fetchUserInfo } = useAuthStore()

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    // 获取用户信息
    fetchUserInfo()
  }, [token, navigate, fetchUserInfo])

  if (!token) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return <>{children}</>
}

export default AuthGuard

