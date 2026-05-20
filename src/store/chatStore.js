import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { chatApi } from '../api/chat.api';
import { groupApi } from '../api/group.api';
import { userApi } from '../api/user.api';
import socketService from '../api/socket.service';
import useAuthStore from './authStore';
import useUiStore from './uiStore';

const useChatStore = create(
  persist(
    (set, get) => ({
  conversations: [],
  onlineUsers: new Set(),
  sessionUserId: null,
  activeChat: null, // { type: 'private' | 'group', id: string, entity: User | Group }
  messages: [],
  replyingTo: null, // message object
  typingUsers: {}, // { chatId: [username1, username2] }
  targetMessageId: null,
  
  
  loadingConversations: false,
  loadingMessages: false,
  pendingInvites: [], // { groupId, groupName, inviterName }
  pendingJoinRequests: [], // { groupId, groupName, userId, username }

  // Search State
  searchResults: [],
  isSearching: false,
  searchQuery: '',
  advancedSearchResults: [],
  isAdvancedSearching: false,

  // Action to fetch recent conversations
  fetchConversations: async () => {
    set({ loadingConversations: true });
    try {
      const res = await chatApi.getConversations();
      // Backend returns { success: true, data: { privateChats, groupChats } }
      const { privateChats = [], groupChats = [] } = res.data || {};
      
      // Combine into a single list for unified rendering
      const combined = [
        ...privateChats.map(chat => ({ 
          ...chat, 
          _id: chat._id || chat.user?._id || chat.user?.id, 
          isGroup: false 
        })),
        ...groupChats.map(chat => ({ 
          ...chat, 
          _id: chat._id || chat.id, 
          isGroup: true 
        }))
      ];

      const currentActive = get().activeChat;
      const hasActiveInConversationList = currentActive && combined.some((chat) => {
        if (!chat?._id) return false;
        const sameId = String(chat._id) === String(currentActive.id);
        const sameType = currentActive.type === (chat.isGroup ? 'group' : 'private');
        return sameId && sameType;
      });

      if (currentActive && !hasActiveInConversationList) {
        set({ conversations: combined, activeChat: null, messages: [], replyingTo: null });
      } else {
        set({ conversations: combined });
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      set({ loadingConversations: false });
    }
  },

  ensureSessionForUser: (userId) => {
    if (!userId) return;
    set((state) => {
      const currentSessionUserId = state.sessionUserId ? String(state.sessionUserId) : null;
      const nextUserId = String(userId);

      if (currentSessionUserId === nextUserId) {
        return state;
      }

      return {
        sessionUserId: nextUserId,
        activeChat: null,
        messages: [],
        conversations: [],
        replyingTo: null,
        typingUsers: {},
        targetMessageId: null,
        searchResults: [],
        advancedSearchResults: [],
        pendingInvites: [],
        pendingJoinRequests: [],
      };
    });
  },

  // Group Management Actions
  createGroup: async (name, memberIds) => {
    try {
      const res = await groupApi.createGroup(name, memberIds);
      if (res.success) {
        get().fetchConversations();
        useUiStore.getState().addToast('success', 'Group created successfully!');
        return res.data;
      }
    } catch (error) {
      console.error('Failed to create group', error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to create group');
      throw error;
    }
  },

  inviteGroupMember: async (groupId, memberId) => {
    try {
      const res = await groupApi.inviteMember(groupId, memberId);
      if (res.success) {
        socketService.socket?.emit('groupAction', {
          type: 'invite',
          groupId,
          targetUserId: memberId,
          details: { groupName: get().activeChat?.entity?.name }
        });
        useUiStore.getState().addToast('success', 'Invitation sent!');
      }
    } catch (error) {
      console.error('Failed to invite member', error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to invite member');
    }
  },

  joinGroup: async (groupId) => {
    try {
      const res = await groupApi.joinGroup(groupId);
      if (res.success) {
        if (res.data) {
          // Public group joined directly
          get().fetchConversations();
          useUiStore.getState().addToast('success', 'Joined group!');
        } else {
          // Private group request sent
          socketService.socket?.emit('groupAction', {
            type: 'joinRequest',
            groupId,
            details: { username: useAuthStore.getState().user?.username }
          });
          useUiStore.getState().addToast('success', 'Join request sent!');
        }
      }
    } catch (error) {
      console.error('Failed to join group', error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to join group');
    }
  },

  leaveGroup: async (groupId, forceDelete = false) => {
    try {
      const res = await groupApi.leaveGroup(groupId, forceDelete);
      if (res.success) {
        if (res.requireConfirmation) {
          return res; // Signal UI to show confirmation
        }
        set({ activeChat: null, messages: [] });
        get().fetchConversations();
        useUiStore.getState().addToast('success', res.message || 'Left group');
      }
    } catch (error) {
      console.error('Failed to leave group', error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to leave group');
    }
  },

  handleJoinRequest: async (groupId, userId, action) => {
    try {
      const res = await groupApi.handleJoinRequest(groupId, userId, action);
      if (res.success) {
        if (action === 'approve') {
          socketService.socket?.emit('groupAction', {
            type: 'memberUpdate',
            groupId,
            targetUserId: userId,
            details: { action: 'joined' }
          });
        }
        useUiStore.getState().addToast('success', `Request ${action}d`);
        
        // Remove from pending list
        set(state => ({
          pendingJoinRequests: state.pendingJoinRequests.filter(r => r.groupId !== groupId || r.userId !== userId)
        }));

        // Refresh active chat to see new members
        const currentActive = get().activeChat;
        if (currentActive && currentActive.id === groupId) {
          const groupRes = await groupApi.getGroup(groupId);
          set({ activeChat: { ...currentActive, entity: groupRes.data } });
        }
      }
    } catch (error) {
      console.error('Failed to handle join request', error);
    }
  },

  handleInviteResponse: async (groupId, action) => {
    try {
      const res = await groupApi.handleInviteResponse(groupId, action);
      if (res.success) {
        if (action === 'accept') {
          get().fetchConversations();
          socketService.socket?.emit('groupAction', {
            type: 'memberUpdate',
            groupId,
            targetUserId: useAuthStore.getState().user?._id,
            details: { action: 'joined' }
          });
        }
        useUiStore.getState().addToast('success', `Invitation ${action}ed`);

        // Remove from pending list
        set(state => ({
          pendingInvites: state.pendingInvites.filter(i => i.groupId !== groupId)
        }));
      }
    } catch (error) {
      console.error('Failed to handle invite response', error);
    }
  },

  handleNewGroupInvite: (invite) => {
    set(state => ({
      pendingInvites: [
        ...state.pendingInvites.filter(i => i.groupId !== (invite.groupId || invite.details?.groupId)),
        {
          groupId: invite.groupId,
          groupName: invite.details?.groupName || 'A Group',
          inviterName: invite.details?.inviterName || 'Someone',
        }
      ]
    }));
  },

  handleNewJoinRequest: (request) => {
    set(state => ({
      pendingJoinRequests: [
        ...state.pendingJoinRequests.filter(
          r => !(r.groupId === request.groupId && r.userId === request.userId)
        ),
        {
          groupId: request.groupId,
          groupName: request.details?.groupName || 'A Group',
          userId: request.userId,
          username: request.details?.username || 'Someone',
        }
      ]
    }));
  },

  fetchPendingInvites: async () => {
    try {
      const res = await groupApi.getPendingInvites();
      if (res.success) {
        set({ pendingInvites: res.data });
      }
    } catch (error) {
      console.error('Failed to fetch pending invites:', error);
    }
  },

  fetchPendingRequests: async () => {
    try {
      const res = await groupApi.getPendingRequests();
      if (res.success) {
        set({ pendingJoinRequests: res.data });
      }
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    }
  },

  handleGroupMemberUpdate: async ({ groupId, action, userId }) => {
    // If the active chat is this group, refresh it
    const currentActive = get().activeChat;
    if (currentActive && currentActive.id === groupId) {
      const groupRes = await groupApi.getGroup(groupId);
      set({ activeChat: { ...currentActive, entity: groupRes.data } });
    }
    // Also fetch conversations to update sidebar (member count etc)
    get().fetchConversations();
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      const res = await groupApi.removeMember(groupId, memberId);
      if (res.success) {
        const currentActive = get().activeChat;
        if (currentActive && currentActive.id === groupId) {
          set({ activeChat: { ...currentActive, entity: res.data } });
        }
        useUiStore.getState().addToast('success', 'Member removed successfully!');
      }
    } catch (error) {
      console.error('Failed to remove member', error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to remove member');
    }
  },

  // Set the currently active chat
  setActiveChat: (type, id, entity) => {
    set({ activeChat: { type, id, entity }, messages: [], replyingTo: null });
    
    // Join the room via socket
    if (type === 'private') {
      socketService.emit('joinPrivateChat', { recipientId: id });
    } else {
      socketService.emit('joinGroupChat', { groupId: id });
    }

    get().fetchMessages(type, id);
  },

  clearActiveChat: () => {
    set({ activeChat: null, messages: [], replyingTo: null });
  },

  // Fetch messages for the active chat
  fetchMessages: async (type, id, page = 1) => {
    set({ loadingMessages: true });
    try {
      let res;
      if (type === 'private') {
        res = await chatApi.getPrivateMessages(id, page);
      } else {
        res = await chatApi.getGroupMessages(id, page);
      }
      
      const newMessages = res.data || [];
      
      set((state) => ({
        messages: page === 1 ? [...newMessages].reverse() : [...[...newMessages].reverse(), ...state.messages],
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      set({ loadingMessages: false });
    }
  },

  // Search Actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchResults: [], searchQuery: '', isSearching: false }),

  searchMessages: async (query, chatType, chatId) => {
    if (!query.trim()) {
      get().clearSearch();
      return;
    }
    set({ isSearching: true, searchQuery: query });
    try {
      const res = await chatApi.searchMessages(query, chatType, chatId);
      set({ searchResults: res.data || [] });
    } catch (error) {
      console.error('Search failed:', error);
      useUiStore.getState().addToast('error', 'Search failed');
    } finally {
      set({ isSearching: false });
    }
  },

  advancedSearch: async (params) => {
    set({ isAdvancedSearching: true });
    try {
      const res = await chatApi.advancedSearch(params);
      set({ advancedSearchResults: res.data || [] });
    } catch (error) {
      console.error('Advanced Search failed:', error);
      useUiStore.getState().addToast('error', 'Advanced search failed');
    } finally {
      set({ isAdvancedSearching: false });
    }
  },
  clearAdvancedSearch: () => set({ advancedSearchResults: [], isAdvancedSearching: false }),

  // Send a message via Socket.IO
  sendMessage: (content, fileData = null) => {
    const { activeChat, replyingTo } = get();
    if (!activeChat) return;

    const currentUserId = useAuthStore.getState().user?._id || useAuthStore.getState().user?.id;
    const tempId = `temp-${Date.now()}`;

    // Prepare optimistic message
    const optimisticMsg = {
      _id: tempId,
      sender: {
        _id: currentUserId,
        username: useAuthStore.getState().user?.username,
        avatar: useAuthStore.getState().user?.avatar
      },
      content: content,
      ...fileData,
      replyTo: replyingTo ? {
        _id: replyingTo._id,
        content: replyingTo.content,
        sender: replyingTo.sender,
        fileUrl: replyingTo.fileUrl,
        isCompressed: replyingTo.isCompressed
      } : null,
      createdAt: new Date().toISOString(),
      isSending: true
    };

    // Add to UI immediately
    set((state) => ({
      messages: [...state.messages, optimisticMsg],
      replyingTo: null
    }));

    const payload = {
      content,
      ...fileData,
      replyTo: replyingTo?._id || replyingTo?.id
    };

    if (activeChat.type === 'private') {
      socketService.emit('sendPrivateMessage', {
        recipientId: activeChat.id,
        ...payload
      });
    } else {
      socketService.emit('sendGroupMessage', {
        groupId: activeChat.id,
        ...payload
      });
    }
  },

  setReplyingTo: (message) => set({ replyingTo: message }),
  
  setTargetMessageId: (id) => set({ targetMessageId: id }),
  clearReplyingTo: () => set({ replyingTo: null }),

  addReaction: (messageId, emoji) => {
    const currentUserId = useAuthStore.getState().user?._id || useAuthStore.getState().user?.id;

    // Find the message to check if it's ours
    const message = get().messages.find(m => String(m._id) === String(messageId));
    if (message && String(message.sender?._id || message.sender) === String(currentUserId)) {
      useUiStore.getState().addToast('info', 'You cannot react to your own message');
      return;
    }

    // Optimistic update: update reactions locally right away
    set((state) => ({
      messages: state.messages.map(m => {
        if (String(m._id) !== String(messageId)) return m;
        const reactions = [...(m.reactions || [])];
        const existingIdx = reactions.findIndex(r => String(r.user) === String(currentUserId));
        if (existingIdx > -1) {
          if (reactions[existingIdx].reaction === emoji) {
            reactions.splice(existingIdx, 1); // toggle off
          } else {
            reactions[existingIdx] = { ...reactions[existingIdx], reaction: emoji }; // change
          }
        } else {
          reactions.push({ user: currentUserId, reaction: emoji }); // add new
        }
        return { ...m, reactions };
      })
    }));

    // Also emit to backend to persist
    socketService.emit('addReaction', { messageId, reaction: emoji });
  },

  deleteMessage: async (messageId) => {
    const { addToast } = useUiStore.getState();
    // Optimistic: mark as deleted in UI
    set((state) => ({
      messages: state.messages.map(m =>
        m._id === messageId ? { ...m, isDeleted: true, content: 'This message was deleted' } : m
      )
    }));
    try {
      await chatApi.deleteMessage(messageId);
      addToast('success', 'Message deleted');
    } catch (err) {
      // Revert on failure
      addToast('error', 'Failed to delete message');
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? { ...m, isDeleted: false, content: m._originalContent || m.content } : m
        )
      }));
    }
  },

  handleReactionUpdate: ({ messageId, reactions }) => {
    set((state) => ({
      messages: state.messages.map(msg =>
        String(msg._id) === String(messageId) ? { ...msg, reactions } : msg
      )
    }));
  },

  handleMessageDeleted: (messageId) => {
    set((state) => ({
      messages: state.messages.map(m =>
        String(m._id) === String(messageId)
          ? { ...m, isDeleted: true, content: 'This message was deleted' }
          : m
      )
    }));
  },

  uploadAndSendFile: async (file) => {
    const { addToast, removeToast } = useUiStore.getState();
    const tid = addToast('info', 'Uploading file...', 0);
    
    try {
      const res = await chatApi.uploadFile(file);
      removeToast(tid);

      if (res.success) {
        // Send via socket - the socket listener will handle the UI update
        get().sendMessage('', res.data);
      } else {
        addToast('error', res.message || 'File upload failed');
      }
    } catch (error) {
      removeToast(tid);
      console.error('File upload failed:', error);
      const msg = error.response?.data?.message || 'File upload failed. Check connection or file type.';
      addToast('error', msg);
    }
  },

  // Real-time update handler
  handleIncomingMessage: (message) => {
    const { activeChat, conversations } = get();
    
    // 1. If it's for the active chat, append to messages
    const currentUserId = String(useAuthStore.getState().user?._id || useAuthStore.getState().user?.id || '');
    const senderId = String(message.sender?._id || message.sender?.id || message.sender || '');
    const recipientId = String(message.recipient?._id || message.recipient?.id || message.recipient || '');
    const groupId = String(message.group?._id || message.group?.id || message.group || '');
    const activeChatId = String(activeChat?.id || '');

    const isForActiveChat = activeChat && (
      (activeChat.type === 'private' && (
        senderId === activeChatId || 
        recipientId === activeChatId
      )) ||
      (activeChat.type === 'group' && groupId === activeChatId)
    );

    if (isForActiveChat) {
      set((state) => {
        // 1. Check if this is a real version of an optimistic message we sent
        if (senderId === currentUserId) {
          const tempIdx = state.messages.findIndex(m => 
            m._id.toString().startsWith('temp-') && 
            (m.content === message.content || (m.fileUrl && m.fileUrl === message.fileUrl))
          );
          
          if (tempIdx > -1) {
            const newMessages = [...state.messages];
            newMessages[tempIdx] = message; // Replace temp with real
            return { messages: newMessages };
          }
        }

        // 2. Prevent duplicates (for real messages)
        if (state.messages.some(m => m._id === message._id)) return state;
        
        // 3. Add new message
        return {
          messages: [...state.messages, message]
        };
      });
    }

    // 2. Update the conversation list's last message
    const updatedConversations = conversations.map(chat => {
      const isMatch = chat.isGroup 
        ? chat._id === message.group 
        : chat._id === message.sender._id || chat._id === message.recipient;
      
      if (isMatch) {
        return { ...chat, lastMessage: message.content };
      }
      return chat;
    });

    set({ conversations: updatedConversations });
  },

  setTyping: (chatId, username) => {
    set((state) => {
      const current = state.typingUsers[chatId] || [];
      if (current.includes(username)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: [...current, username]
        }
      };
    });
  },

  removeTyping: (chatId, userId) => {
    // Note: backend sends userId in userStoppedTyping, so we might need a map or just check if it's the active chat
    set((state) => {
      const current = state.typingUsers[chatId] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [chatId]: [] // Simple version: clear it
        }
      };
    });
  },

  handleChatCleared: ({ chatId, chatType }) => {
    const { activeChat } = get();
    if (activeChat && String(activeChat.id) === String(chatId) && activeChat.type === chatType) {
      set({ messages: [] });
    }
    get().fetchConversations();
  },
  setOnlineStatus: (userId, isOnline) => {
    set((state) => {
      const newOnline = new Set(state.onlineUsers);
      if (isOnline) newOnline.add(userId);
      else newOnline.delete(userId);
      return { onlineUsers: newOnline };
    });
  },

  clearChat: async (chatType, chatId) => {
    const { addToast } = useUiStore.getState();
    console.log('chatStore.clearChat called with:', { chatType, chatId });
    try {
      const res = await chatApi.clearChat(chatType, chatId);
      console.log('chatApi.clearChat response:', res);
      if (res.success) {
        const { activeChat } = get();
        if (activeChat && String(activeChat.id) === String(chatId) && activeChat.type === chatType) {
          set({ messages: [] });
        }
        get().fetchConversations();
        addToast('success', 'Chat cleared');
      }
    } catch (err) {
      console.error('Clear chat failed in store:', err);
      addToast('error', err.response?.data?.message || 'Failed to clear chat');
    }
  },

  deleteChat: async (chatType, chatId) => {
    const { addToast } = useUiStore.getState();
    console.log('chatStore.deleteChat called with:', { chatType, chatId });
    try {
      const res = await chatApi.clearChat(chatType, chatId); 
      console.log('chatApi.clearChat (for delete) response:', res);
      if (res.success) {
        const { activeChat } = get();
        if (activeChat && String(activeChat.id) === String(chatId) && activeChat.type === chatType) {
          set({ activeChat: null, messages: [] });
        }
        get().fetchConversations();
        addToast('success', 'Chat deleted');
      }
    } catch (err) {
      console.error('Delete chat failed in store:', err);
      addToast('error', err.response?.data?.message || 'Failed to delete chat');
    }
  },

  toggleMute: async (chatId, chatType) => {
    const { addToast } = useUiStore.getState();
    const { updateUser, user } = useAuthStore.getState();
    try {
      const res = await userApi.toggleMute(chatId, chatType);
      if (res.success) {
        // Update user state in authStore
        const mutedChats = [...(user.mutedChats || [])];
        const index = mutedChats.findIndex(m => m.chatId === chatId && m.chatType === chatType);
        
        if (index > -1) {
          mutedChats.splice(index, 1);
        } else {
          mutedChats.push({ chatId, chatType });
        }
        
        updateUser({ mutedChats });
        addToast('success', res.message);
      }
    } catch (err) {
      console.error('Mute failed:', err);
      addToast('error', 'Failed to toggle mute');
    }
  },

  toggleBlock: async (targetUserId) => {
    const { addToast } = useUiStore.getState();
    const { updateUser, user } = useAuthStore.getState();
    try {
      const res = await userApi.toggleBlock(targetUserId);
      if (res.success) {
        // Update user state in authStore
        const blockedUsers = [...(user.blockedUsers || [])];
        const index = blockedUsers.indexOf(targetUserId);
        
        if (index > -1) {
          blockedUsers.splice(index, 1);
        } else {
          blockedUsers.push(targetUserId);
        }
        
        updateUser({ blockedUsers });
        addToast('success', res.message);
      }
    } catch (err) {
      console.error('Block failed:', err);
      addToast('error', err.response?.data?.message || 'Failed to toggle block');
    }
  }
}), {
  name: 'chat-storage',
  partialize: (state) => ({ 
    activeChat: state.activeChat,
    sessionUserId: state.sessionUserId
  }),
}));

export default useChatStore;
