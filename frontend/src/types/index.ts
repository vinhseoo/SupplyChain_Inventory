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

// ===== Supplier Types =====

export interface SupplierRequest {
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  address?: string;
  note?: string;
  isActive?: boolean;
}

export interface SupplierResponse {
  id: number;
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  taxCode?: string;
  address?: string;
  note?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== Warehouse & Location Types =====

export interface WarehouseRequest {
  code: string;
  name: string;
  address?: string;
  description?: string;
  isActive?: boolean;
}

export interface WarehouseResponse {
  id: number;
  code: string;
  name: string;
  address?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LocationRequest {
  code: string;
  name: string;
  warehouseId: number;
  parentId?: number;
  type: string;
  description?: string;
  isActive?: boolean;
}

export interface LocationResponse {
  id: number;
  code: string;
  name: string;
  warehouseId: number;
  warehouseName: string;
  parentId?: number;
  parentName?: string;
  type: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface LocationNodeResponse {
  id: number;
  code: string;
  name: string;
  type: string;
  parentId?: number;
  description?: string;
  isActive: boolean;
  children: LocationNodeResponse[];
}

// ===== Category & UOM Types =====

export interface CategoryRequest {
  code: string;
  name: string;
  parentId?: number;
  description?: string;
  isActive?: boolean;
}

export interface CategoryResponse {
  id: number;
  code: string;
  name: string;
  parentId?: number;
  parentName?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UnitOfMeasureRequest {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UnitOfMeasureResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// ===== Product Types =====

export interface ProductRequest {
  code: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  uomId?: number;
  description?: string;
  minimumStock: number;
  maximumStock: number;
  price: number;
  properties?: Record<string, any>;
  isActive?: boolean;
}

export interface ProductResponse {
  id: number;
  code: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId?: number;
  categoryName?: string;
  uomId?: number;
  uomName?: string;
  description?: string;
  minimumStock: number;
  maximumStock: number;
  price: number;
  properties?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductImportSummary {
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  errorDetails: string[];
}

// ===== Inventory Transactions & Stock Levels =====

export type TransactionType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER';
export type TransactionStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
export type StockMovementType = 'INBOUND' | 'OUTBOUND' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'ADJUSTMENT';

export interface TransactionItemRequest {
  productId: number;
  quantity: number;
  price: number;
  sourceLocationId?: number;
  destinationLocationId?: number;
  batchNumber?: string;
  productionDate?: string;
  expiryDate?: string;
  note?: string;
}

export interface TransactionItemResponse {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  productSku: string;
  uomName: string;
  quantity: number;
  price: number;
  sourceLocationId?: number;
  sourceLocationName?: string;
  sourceLocationCode?: string;
  destinationLocationId?: number;
  destinationLocationName?: string;
  destinationLocationCode?: string;
  batchNumber?: string;
  productionDate?: string;
  expiryDate?: string;
  note?: string;
}

export interface InventoryTransactionRequest {
  code: string;
  type: TransactionType;
  sourceWarehouseId?: number;
  destinationWarehouseId?: number;
  supplierId?: number;
  transactionDate?: string;
  note?: string;
  items: TransactionItemRequest[];
}

export interface InventoryTransactionResponse {
  id: number;
  code: string;
  type: TransactionType;
  status: TransactionStatus;
  sourceWarehouseId?: number;
  sourceWarehouseName?: string;
  sourceWarehouseCode?: string;
  destinationWarehouseId?: number;
  destinationWarehouseName?: string;
  destinationWarehouseCode?: string;
  supplierId?: number;
  supplierName?: string;
  supplierCode?: string;
  totalAmount: number;
  transactionDate: string;
  note?: string;
  items: TransactionItemResponse[];
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  version: number;
}

export interface StockLevelResponse {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  productSku: string;
  productBarcode?: string;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  locationId: number;
  locationCode: string;
  locationName: string;
  batchId?: number;
  batchNumber?: string;
  expiryDate?: string;
  quantity: number;
  reservedQuantity: number;
  uomName: string;
}

export interface StockMovementResponse {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  productSku: string;
  uomName: string;
  warehouseId: number;
  warehouseName: string;
  warehouseCode: string;
  locationId: number;
  locationCode: string;
  locationName: string;
  batchId?: number;
  batchNumber?: string;
  transactionId?: number;
  transactionCode?: string;
  type: StockMovementType;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
  createdBy: string;
}



