import axios from 'axios';
import useAuthStore from '../store/authStore';

// Base instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
axiosInstance.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 & Auto-Refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If the error is from the refresh-token endpoint itself, force logout
      if (originalRequest.url.includes('/auth/refresh-token')) {
        useAuthStore.getState().logout(true); // true = force logout
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken: currentRefreshToken } = useAuthStore.getState();
        if (!currentRefreshToken) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint directly (not using instance to avoid loops)
        const refreshResponse = await axios.post(
          `${axiosInstance.defaults.baseURL}/auth/refresh-token`,
          { refreshToken: currentRefreshToken }
        );

        const newTokens = refreshResponse.data.data.tokens;
        
        // Update store with new tokens
        useAuthStore.getState().setTokens(newTokens.accessToken, newTokens.refreshToken);

        processQueue(null, newTokens.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout(true); // Refresh failed, force user to login
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Pass through other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
