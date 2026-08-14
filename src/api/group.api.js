import axiosInstance from './axiosInstance';

export const groupApi = {
  // Create a new group
  createGroup: async (name, memberIds, privacy = 'public') => {
    const response = await axiosInstance.post('/group', { name, members: memberIds, privacy });
    return response.data;
  },

  // Get a single group details
  getGroup: async (groupId) => {
    const response = await axiosInstance.get(`/group/${groupId}`);
    return response.data;
  },

  // Update group details (name, etc)
  updateGroup: async (groupId, data) => {
    const response = await axiosInstance.put(`/group/${groupId}`, data);
    return response.data;
  },

  // Join a group (Direct join for public, request for private)
  joinGroup: async (groupId) => {
    const response = await axiosInstance.post('/group/join', { groupId });
    return response.data;
  },

  // Invite a member
  inviteMember: async (groupId, memberId) => {
    const response = await axiosInstance.post(`/group/${groupId}/invite`, { memberId });
    return response.data;
  },

  // Leave group
  leaveGroup: async (groupId, forceDelete = false) => {
    const response = await axiosInstance.post(`/group/${groupId}/leave${forceDelete ? '?forceDelete=true' : ''}`);
    return response.data;
  },

  // Handle join request (Admin only)
  handleJoinRequest: async (groupId, userId, action) => {
    const response = await axiosInstance.post('/group/handle-request', { groupId, userId, action });
    return response.data;
  },

  // Handle invitation (User response)
  handleInviteResponse: async (groupId, action) => {
    const response = await axiosInstance.post('/group/handle-invite', { groupId, action });
    return response.data;
  },

  // Delete group (Admin only)
  deleteGroup: async (groupId) => {
    const response = await axiosInstance.delete(`/group/${groupId}`);
    return response.data;
  },

  // Remove a member
  removeMember: async (groupId, memberId) => {
    const response = await axiosInstance.delete(`/group/${groupId}/members/${memberId}`);
    return response.data;
  },

  // Add admin
  addAdmin: async (groupId, adminId) => {
    const response = await axiosInstance.post(`/group/${groupId}/admins`, { adminId });
    return response.data;
  },

  // Remove admin
  removeAdmin: async (groupId, adminId) => {
    const response = await axiosInstance.delete(`/group/${groupId}/admins/${adminId}`);
    return response.data;
  },

  // Preview group by inviteCode or groupId (no membership needed)
  previewGroup: async (code) => {
    const response = await axiosInstance.get(`/group/preview/${code}`);
    return response.data;
  },

  // Get current user's pending invites
  getPendingInvites: async () => {
    const response = await axiosInstance.get('/group/my/pending-invites');
    return response.data;
  },

  // Get pending join requests for groups where user is admin
  getPendingRequests: async () => {
    const response = await axiosInstance.get('/group/my/pending-requests');
    return response.data;
  }
};
