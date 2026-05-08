import axiosInstance from './axiosInstance';

export const chatApi = {
  // Get all conversations (recent chats)
  getConversations: async (page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/chat/user?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get private chat messages
  getPrivateMessages: async (recipientId, page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/chat/private/${recipientId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get group chat messages
  getGroupMessages: async (groupId, page = 1, limit = 20) => {
    const response = await axiosInstance.get(`/chat/group/${groupId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Search messages in a specific chat
  searchMessages: async (query, chatType, chatId, page = 1, limit = 20) => {
    const response = await axiosInstance.get('/chat/messages/search', {
      params: { query, chatType, chatId, page, limit }
    });
    return response.data;
  },

  // Advanced global or filtered search
  advancedSearch: async (params) => {
    const response = await axiosInstance.get('/chat/messages/search/advanced', {
      params
    });
    return response.data;
  },

  // Send a private message via REST (Phase 4, before sockets)
  sendPrivateMessage: async (recipientId, text, type = 'text', fileUrl = null) => {
    const payload = { text, type, fileUrl };
    const response = await axiosInstance.post(`/chat/private/${recipientId}`, payload);
    return response.data;
  },

  // Send a group message via REST (Phase 4, before sockets)
  sendGroupMessage: async (groupId, text, type = 'text', fileUrl = null) => {
    const payload = { text, type, fileUrl };
    const response = await axiosInstance.post(`/chat/group/${groupId}`, payload);
    return response.data;
  },

  // Upload a file to the server
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete a message
  deleteMessage: async (messageId) => {
    const response = await axiosInstance.delete(`/chat/messages/${messageId}`);
    return response.data;
  },

  // Clear chat history
  clearChat: async (chatType, chatId) => {
    const response = await axiosInstance.post('/chat/clear', { chatType, chatId });
    return response.data;
  }
};
