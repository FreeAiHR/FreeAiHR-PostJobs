import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd'
import type { MenuProps } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  SolutionOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  SettingOutlined,
  SafetyOutlined,
  ApartmentOutlined,
  RobotOutlined,
  BankOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/stores/authStore'
import NotificationBell from '@/components/NotificationBell'

const { Header, Sider, Content } = Layout

// 菜单配置
const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '工作台',
  },
  {
    key: '/recruit',
    icon: <TeamOutlined />,
    label: '招聘管理',
    children: [
      { key: '/recruit/job', icon: <SolutionOutlined />, label: '职位管理' },
      { key: '/recruit/resume', icon: <FileTextOutlined />, label: '简历管理' },
      { key: '/recruit/candidate', icon: <UserOutlined />, label: '候选人管理' },
      { key: '/recruit/interview', icon: <CalendarOutlined />, label: '面试管理' },
    ],
  },
  {
    key: '/talent',
    icon: <DatabaseOutlined />,
    label: '人才库',
  },
  {
    key: '/report',
    icon: <BarChartOutlined />,
    label: '数据报表',
  },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '系统管理',
    children: [
      { key: '/system/user', icon: <UserOutlined />, label: '用户管理' },
      { key: '/system/role', icon: <SafetyOutlined />, label: '角色管理' },
      { key: '/system/dept', icon: <ApartmentOutlined />, label: '部门管理' },
      { key: '/system/ai', icon: <RobotOutlined />, label: 'AI配置' },
      { key: '/system/company', icon: <BankOutlined />, label: '公司设置' },
    ],
  },
]

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuthStore()
  const { token } = theme.useToken()

  // 获取当前选中的菜单
  const selectedKeys = [location.pathname]
  
  // 获取展开的菜单
  const getOpenKeys = () => {
    const path = location.pathname
    const keys: string[] = []
    menuItems?.forEach((item: any) => {
      if (item.children) {
        item.children.forEach((child: any) => {
          if (path.startsWith(child.key)) {
            keys.push(item.key)
          }
        })
      }
    })
    return keys
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  return (
    <Layout className="h-full">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        style={{
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            {!collapsed && (
              <span className="text-lg font-semibold text-gray-800">FreeHire</span>
            )}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header 
          className="flex items-center justify-between px-4"
          style={{ 
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            padding: '0 24px',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />} 
                  src={userInfo?.avatar}
                />
                <span className="text-gray-700">{userInfo?.realName || userInfo?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content 
          className="m-4 p-6 rounded-lg overflow-auto"
          style={{ background: token.colorBgContainer }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
