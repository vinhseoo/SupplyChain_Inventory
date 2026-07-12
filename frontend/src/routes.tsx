import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Spin } from 'antd';
import { AppLayout } from './components/layout/AppLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'));
const UsersPage = lazy(() => import('./features/auth/pages/UsersPage'));
const ProfilePage = lazy(() => import('./features/auth/pages/ProfilePage'));
const SupplierListPage = lazy(() => import('./features/supplier/pages/SupplierListPage'));
const WarehouseListPage = lazy(() => import('./features/warehouse/pages/WarehouseListPage'));
const ProductListPage = lazy(() => import('./features/product/pages/ProductListPage'));
const TransactionListPage = lazy(() => import('./features/inventory/pages/TransactionListPage'));
const TransactionFormPage = lazy(() => import('./features/inventory/pages/TransactionFormPage'));
const StockLevelListPage = lazy(() => import('./features/inventory/pages/StockLevelListPage'));
const StockCardPage = lazy(() => import('./features/inventory/pages/StockCardPage'));

const StocktakeListPage = lazy(() => import('./features/stocktake/pages/StocktakeListPage'));
const StocktakeSessionPage = lazy(() => import('./features/stocktake/pages/StocktakeSessionPage'));
const StockAdjustmentListPage = lazy(() => import('./features/stocktake/pages/StockAdjustmentListPage'));
const BatchQrPrintPage = lazy(() => import('./features/stocktake/pages/BatchQrPrintPage'));

const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50">
    <Spin size="large" tip="Đang tải hệ thống..." />
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/suppliers" element={<SupplierListPage />} />
          <Route path="/warehouses" element={<WarehouseListPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/inventory/transactions" element={<TransactionListPage />} />
          <Route path="/inventory/transactions/new" element={<TransactionFormPage />} />
          <Route path="/inventory/transactions/edit/:id" element={<TransactionFormPage />} />
          <Route path="/inventory/stock-levels" element={<StockLevelListPage />} />
          <Route path="/inventory/stock-card" element={<StockCardPage />} />
          
          <Route path="/stocktake/sessions" element={<StocktakeListPage />} />
          <Route path="/stocktake/sessions/:id" element={<StocktakeSessionPage />} />
          <Route path="/stocktake/adjustments" element={<StockAdjustmentListPage />} />
          <Route path="/stocktake/qr-print" element={<BatchQrPrintPage />} />
          {/* Default redirect inside AppLayout */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
