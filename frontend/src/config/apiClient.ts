import axios from 'axios';
import { message, modal } from '@/utils/antd';

let isForbiddenModalOpen = false;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    // Dynamic import to avoid circular dependency
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap ApiResponse & handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap: backend returns { success, message, data, ... }
    // We return the whole ApiResponse so hooks can access .data, .message, etc.
    return response.data;
  },
  async (error) => {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi';

    switch (status) {
      case 401:
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          message.error('Phiên đăng nhập đã hết hạn');
          window.location.href = '/login';
        }
        break;
      case 403:
        if (!isForbiddenModalOpen) {
          isForbiddenModalOpen = true;
          modal.error({
            title: 'Truy cập bị từ chối',
            content: 'Bạn không có quyền thực hiện thao tác này. Vui lòng liên hệ quản trị viên để được cấp quyền.',
            okText: 'Đồng ý',
            onOk: () => {
              isForbiddenModalOpen = false;
            },
            onCancel: () => {
              isForbiddenModalOpen = false;
            }
          });
        }
        break;
      case 400:
        message.error(errorMessage);
        break;
      case 409:
        message.error(errorMessage);
        break;
      case 422:
        message.error(errorMessage);
        break;
      case 500:
        message.error('Lỗi hệ thống. Vui lòng thử lại sau.');
        break;
      default:
        if (!status) {
          message.error('Không thể kết nối đến server');
        }
    }

    return Promise.reject(error);
  }
);
