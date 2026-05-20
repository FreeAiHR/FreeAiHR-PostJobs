import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Spin } from 'antd'
import MainLayout from '@/layouts/MainLayout'
import CareersLayout from '@/layouts/CareersLayout'
import AuthGuard from '@/components/AuthGuard'

// 懒加载页面组件
const Login = lazy(() => import('@/pages/login'))
const Dashboard = lazy(() => import('@/pages/dashboard'))
const JobList = lazy(() => import('@/pages/recruit/job'))
const ResumeList = lazy(() => import('@/pages/recruit/resume'))
const CandidateList = lazy(() => import('@/pages/recruit/candidate'))
const InterviewList = lazy(() => import('@/pages/recruit/interview'))
const TalentPool = lazy(() => import('@/pages/talent'))
const ReportPage = lazy(() => import('@/pages/report'))
const NotificationPage = lazy(() => import('@/pages/notification'))
const UserList = lazy(() => import('@/pages/system/user'))
const RoleList = lazy(() => import('@/pages/system/role'))
const DeptList = lazy(() => import('@/pages/system/dept'))
const AIConfig = lazy(() => import('@/pages/system/ai'))
const CompanySettings = lazy(() => import('@/pages/system/company'))

// 公开招聘页面（无需登录）
const CareersPage = lazy(() => import('@/pages/careers'))
const JobDetailPage = lazy(() => import('@/pages/careers/job'))

// 加载状态组件
const Loading = () => (
  <div className="flex items-center justify-center h-full">
    <Spin size="large" tip="加载中..." />
  </div>
)

const Router = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* 登录页 */}
        <Route path="/login" element={<Login />} />
        
        {/* 公开招聘页面（无需登录） */}
        <Route path="/careers" element={<CareersLayout />}>
          <Route index element={<CareersPage />} />
          <Route path="job/:id" element={<JobDetailPage />} />
        </Route>
        
        {/* 需要认证的路由 */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <MainLayout />
            </AuthGuard>
          }
        >
          {/* 默认重定向到工作台 */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          
          {/* 工作台 */}
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* 招聘管理 */}
          <Route path="recruit">
            <Route path="job" element={<JobList />} />
            <Route path="resume" element={<ResumeList />} />
            <Route path="candidate" element={<CandidateList />} />
            <Route path="interview" element={<InterviewList />} />
          </Route>
          
          {/* 人才库 */}
          <Route path="talent" element={<TalentPool />} />
          
          {/* 数据报表 */}
          <Route path="report" element={<ReportPage />} />
          
          {/* 消息中心 */}
          <Route path="notification" element={<NotificationPage />} />
          
          {/* 系统管理 */}
          <Route path="system">
            <Route path="user" element={<UserList />} />
            <Route path="role" element={<RoleList />} />
            <Route path="dept" element={<DeptList />} />
            <Route path="ai" element={<AIConfig />} />
            <Route path="company" element={<CompanySettings />} />
          </Route>
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}

export default Router
