import axios from 'axios';

// Tạo axios instance tái sử dụng (DRY)
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URL mặc định
  withCredentials: true, // Gửi HTTP-Only cookies tự động
});

// Interceptor xử lý response chung (KISS)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi chung (VD: 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      console.error('Lỗi xác thực. Có thể token đã hết hạn.');
    }
    return Promise.reject(error);
  }
);

export default api;
