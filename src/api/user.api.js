import axiosInstance from './axiosInstance';

export const userApi = {
  searchUsers: async (query) => {
    const response = await axiosInstance.get(`/users/search?query=${query}`);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await axiosInstance.get('/users/all');
    return response.data;
  },
  toggleMute: async (chatId, chatType) => {
    const response = await axiosInstance.post('/users/toggle-mute', { chatId, chatType });
    return response.data;
  },
  toggleBlock: async (targetUserId) => {
    const response = await axiosInstance.post('/users/toggle-block', { targetUserId });
    return response.data;
  }
};
