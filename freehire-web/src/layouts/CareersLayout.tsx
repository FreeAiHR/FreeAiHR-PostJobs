import { Outlet } from 'react-router-dom'

/**
 * 公开招聘页面布局（无需登录）
 * 支持移动端响应式设计
 */
const CareersLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 适配移动端的 viewport meta 已在 index.html 中设置 */}
      
      {/* 简洁的页面内容区域 */}
      <main className="pb-16">
        <Outlet />
      </main>
      
      {/* 底部版权信息 - 移动端更紧凑 */}
      <footer className="py-6 md:py-8 text-center text-gray-400 text-xs md:text-sm px-4">
        <p>Powered by FreeHR · 智能招聘管理系统</p>
      </footer>
    </div>
  )
}

export default CareersLayout

