// ===== API Response Types =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: FieldError[];
  timestamp: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ===== Auth Types =====

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string;
}

// ===== Common Types =====

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface TableParams {
  page?: number;
  size?: number;
  search?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

// ===== Role & Permission Types =====

export interface PermissionResponse {
  id: number;
  name: string;
  path: string;
  method: string;
  apiGroup: string;
  description: string;
}

export type RoleType = 'ALL' | 'CUSTOM';

export interface RoleResponse {
  id: number;
  name: string;
  description?: string;
  type: RoleType;
  isActive: boolean;
  permissions: PermissionResponse[];
  createdAt: string;
  updatedAt?: string;
}

export interface RoleRequest {
  name: string;
  description?: string;
  type: RoleType;
  permissionIds?: number[];
}

// ===== User CRUD Types =====

export interface UserCreateRequest {
  email: string;
  fullName: string;
  password?: string;
  phone?: string;
  avatarUrl?: string;
  roleIds: number[];
}

export interface UserUpdateRequest {
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roleIds: number[];
}

export interface ResetPasswordRequest {
  newPassword?: string;
}

export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

