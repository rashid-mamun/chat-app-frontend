import { useState, useEffect, useCallback } from 'react';
import { X, Search, Users, UserPlus } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import { userApi } from '../../api/user.api';
import Avatar from '../shared/Avatar';

export default function AddMemberModal() {
  const { closeModal } = useUiStore();
  const { activeChat, inviteGroupMember } = useChatStore();
  
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(null); // Track which user is being invited

  const fetchUsers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const res = query 
        ? await userApi.searchUsers(query) 
        : await userApi.getAllUsers();
      
      // Filter out users who are already in the group or have pending invites
      const existingMemberIds = (activeChat?.entity?.members || []).map(m => {
        if (typeof m === 'object' && m !== null) return String(m._id || m.id || '');
        return String(m || '');
      });
      const pendingInviteIds = (activeChat?.entity?.invites || [])
        .filter(i => i && i.status === 'pending')
        .map(i => {
          if (typeof i.user === 'object' && i.user !== null) return String(i.user._id || i.user.id || '');
          return String(i.user || '');
        });
      
      const filteredUsers = (res.data || []).filter(u => {
        const id = String(u._id || u.id || '');
        return id && !existingMemberIds.includes(id) && !pendingInviteIds.includes(id);
      });
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [activeChat]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const handleInviteMember = async (user) => {
    const userId = user._id || user.id;
    setInviting(userId);
    try {
      await inviteGroupMember(activeChat.id, userId);
      // Don't close modal, maybe user wants to invite more? 
      // Actually user requested "accept korle shudu join hobe", so we just send invite.
      // Filter out the invited user from local list
      setUsers(prev => prev.filter(u => (u._id || u.id) !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setInviting(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="new-chat-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="new-chat-modal__header">
          <h3>Invite Member to Group</h3>
          <button onClick={closeModal} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="new-chat-modal__search-container">
          <div className="new-chat-modal__search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search users to invite..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="new-chat-modal__content custom-scrollbar">
          <span className="section-label">Select User to Invite</span>
          
          {loading ? (
            <div className="empty-state">
              <div className="loading-spinner mb-4" />
              <p>Searching for users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <Users size={32} />
              </div>
              <p>{search ? `No results found for "${search}"` : 'All users are already members or invited'}</p>
            </div>
          ) : (
            users.map(user => (
              <div 
                key={user._id || user.id} 
                className={`user-item ${inviting === (user._id || user.id) ? 'pointer-events-none opacity-50' : ''}`}
                onClick={() => handleInviteMember(user)}
              >
                <Avatar name={user.username} size="md" online={user.isOnline} />
                <div className="user-item__info">
                  <span className="user-item__name">{user.username}</span>
                  <span className="user-item__email truncate">{user.email}</span>
                </div>
                {inviting === (user._id || user.id) ? (
                  <div className="loading-spinner small" />
                ) : (
                  <div className="flex items-center gap-1 text-accent font-semibold text-xs">
                    <UserPlus size={16} />
                    <span>Invite</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
