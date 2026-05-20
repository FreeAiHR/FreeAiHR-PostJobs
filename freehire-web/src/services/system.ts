import request, { ApiResponse, PageResponse } from './request'

// ========== 用户相关 ==========
export interface UserQuery {
  current?: number
  size?: number
  username?: string
  realName?: string
  phone?: string
  deptId?: number
  status?: number
}

export interface UserItem {
  id: number
  username: string
  realName: string
  phone?: string
  email?: string
  avatar?: string
  deptId?: number
  deptName?: string
  status: number
  createTime: string
  roleIds?: number[]
}

export interface UserDTO {
  id?: number
  username: string
  password?: string
  realName: string
  phone?: string
  email?: string
  avatar?: string
  deptId?: number
  status?: number
  roleIds?: number[]
}

// ========== 角色相关 ==========
export interface RoleItem {
  id: number
  roleCode: string
  roleName: string
  remark?: string
  sort: number
  status: number
  createTime: string
  menuIds?: number[]
}

export interface RoleDTO {
  id?: number
  roleCode: string
  roleName: string
  remark?: string
  sort?: number
  status?: number
  menuIds?: number[]
}

// ========== 部门相关 ==========
export interface DeptItem {
  id: number
  parentId: number
  deptName: string
  leader?: string
  phone?: string
  email?: string
  sort: number
  status: number
  children?: DeptItem[]
}

export interface DeptDTO {
  id?: number
  parentId?: number
  deptName: string
  leader?: string
  phone?: string
  email?: string
  sort?: number
  status?: number
}

// ========== 菜单相关 ==========
export interface MenuItem {
  id: number
  parentId: number
  name: string
  path?: string
  component?: string
  icon?: string
  permission?: string
  type: string  // M-目录 C-菜单 F-按钮
  sort: number
  status: number
  visible: number
  children?: MenuItem[]
}

export const userApi = {
  getUserPage(params: UserQuery): Promise<ApiResponse<PageResponse<UserItem>>> {
    return request.get('/system/user/page', { params })
  },
  getUserById(id: number): Promise<ApiResponse<UserItem>> {
    return request.get(`/system/user/${id}`)
  },
  createUser(data: UserDTO): Promise<ApiResponse<number>> {
    return request.post('/system/user', data)
  },
  updateUser(data: UserDTO): Promise<ApiResponse<void>> {
    return request.put('/system/user', data)
  },
  deleteUser(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/user/${id}`)
  },
  resetPassword(id: number, password?: string): Promise<ApiResponse<void>> {
    return request.post(`/system/user/${id}/reset-password`, { password: password || '123456' })
  },
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return request.post('/system/user/change-password', { oldPassword, newPassword })
  },
  getUserRoleIds(id: number): Promise<ApiResponse<number[]>> {
    return request.get(`/system/user/${id}/roles`)
  },
  assignRoles(id: number, roleIds: number[]): Promise<ApiResponse<void>> {
    return request.post(`/system/user/${id}/roles`, roleIds)
  },
}

export const roleApi = {
  getRolePage(params: { current?: number; size?: number }): Promise<ApiResponse<PageResponse<RoleItem>>> {
    return request.get('/system/role/page', { params })
  },
  getAllRoles(): Promise<ApiResponse<RoleItem[]>> {
    return request.get('/system/role/list')
  },
  getRoleById(id: number): Promise<ApiResponse<RoleItem>> {
    return request.get(`/system/role/${id}`)
  },
  createRole(data: RoleDTO): Promise<ApiResponse<number>> {
    return request.post('/system/role', data)
  },
  updateRole(data: RoleDTO): Promise<ApiResponse<void>> {
    return request.put('/system/role', data)
  },
  deleteRole(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/role/${id}`)
  },
  getRoleMenuIds(id: number): Promise<ApiResponse<number[]>> {
    return request.get(`/system/role/${id}/menus`)
  },
  assignMenus(id: number, menuIds: number[]): Promise<ApiResponse<void>> {
    return request.post(`/system/role/${id}/menus`, menuIds)
  },
}

export const deptApi = {
  getDeptTree(): Promise<ApiResponse<DeptItem[]>> {
    return request.get('/system/dept/tree')
  },
  getDeptList(): Promise<ApiResponse<DeptItem[]>> {
    return request.get('/system/dept/list')
  },
  getDeptById(id: number): Promise<ApiResponse<DeptItem>> {
    return request.get(`/system/dept/${id}`)
  },
  createDept(data: DeptDTO): Promise<ApiResponse<number>> {
    return request.post('/system/dept', data)
  },
  updateDept(data: DeptDTO): Promise<ApiResponse<void>> {
    return request.put('/system/dept', data)
  },
  deleteDept(id: number): Promise<ApiResponse<void>> {
    return request.delete(`/system/dept/${id}`)
  },
}

export const menuApi = {
  getMenuTree(): Promise<ApiResponse<MenuItem[]>> {
    return request.get('/system/menu/tree')
  },
  getUserMenuTree(): Promise<ApiResponse<MenuItem[]>> {
    return request.get('/system/menu/user-menu')
  },
  getUserPermissions(): Promise<ApiResponse<string[]>> {
    return request.get('/system/menu/user-permissions')
  },
  getMenuById(id: number): Promise<ApiResponse<MenuItem>> {
    return request.get(`/system/menu/${id}`)
  },
}

