import axiosInstance from './axiosInstance';

export const authApi = {
  register: async (data) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  },

  verify2FA: async (token) => {
    const response = await axiosInstance.post('/auth/2fa/verify', { token });
    return response.data;
  },

  setup2FA: async () => {
    const response = await axiosInstance.post('/auth/2fa/setup');
    return response.data;
  },

  getProfile: async () => {
    const response = await axiosInstance.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await axiosInstance.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data) => {
    const response = await axiosInstance.put('/auth/change-password', data);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
    return response.data;
  }
};
