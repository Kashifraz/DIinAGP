export type UserRole = 'admin' | 'manager' | 'cashier'

export interface User {
  id: number
  email: string
  name: string
  phone?: string
  role: UserRole
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  token: string
  user: User
}

