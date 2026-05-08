import { useState, useEffect, useCallback } from 'react';
import { X, Search, Check, Users, UserPlus } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import { userApi } from '../../api/user.api';
import Avatar from '../shared/Avatar';
import './NewGroupModal.css';

export default function NewGroupModal() {
  const { closeModal } = useUiStore();
  const { createGroup, setActiveChat } = useChatStore();
  
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [privacy, setPrivacy] = useState('public');

  const fetchUsers = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const res = query 
        ? await userApi.searchUsers(query) 
        : await userApi.getAllUsers();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchUsers]);

  const toggleUserSelection = (user) => {
    const userId = user._id || user.id;
    if (selectedUsers.some(u => (u._id || u.id) === userId)) {
      setSelectedUsers(selectedUsers.filter(u => (u._id || u.id) !== userId));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      useUiStore.getState().addToast('error', 'Group name is required');
      return;
    }
    if (selectedUsers.length === 0) {
      useUiStore.getState().addToast('error', 'Please select at least one member');
      return;
    }

    setIsSubmitting(true);
    try {
      const memberIds = selectedUsers.map(u => u._id || u.id);
      const newGroup = await createGroup(groupName, memberIds, privacy);
      setActiveChat('group', newGroup._id || newGroup.id, newGroup);
      closeModal();
    } catch (error) {
      console.error('Failed to create group', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="new-group-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="new-group-modal__header">
          <h3>Create New Group</h3>
          <button onClick={closeModal} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="new-group-modal__body">
          <div className="new-group-modal__name-input">
            <input 
              type="text" 
              placeholder="Group Subject" 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              autoFocus
              maxLength={50}
            />
          </div>

          <div className="flex items-center gap-4 mb-4 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Privacy:</span>
            <div className="flex bg-secondary/50 p-1 rounded-lg">
              <button 
                className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${privacy === 'public' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                onClick={() => setPrivacy('public')}
              >
                Public
              </button>
              <button 
                className={`px-4 py-1 rounded-md text-xs font-bold transition-all ${privacy === 'private' ? 'bg-accent text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                onClick={() => setPrivacy('private')}
              >
                Private
              </button>
            </div>
          </div>

          <div className="new-group-modal__search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search users to add..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="new-group-modal__selected-users">
              {selectedUsers.map(user => (
                <div key={user._id || user.id} className="selected-user-chip">
                  <Avatar name={user.username} size="sm" />
                  <span>{user.username}</span>
                  <button onClick={() => toggleUserSelection(user)}><X size={14} /></button>
                </div>
              ))}
            </div>
          )}

          <div className="new-group-modal__content custom-scrollbar">
            <span className="section-label">Select Members</span>
            
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
                <p>{search ? `No results found for "${search}"` : 'No users available'}</p>
              </div>
            ) : (
              users.map(user => {
                const isSelected = selectedUsers.some(u => (u._id || u.id) === (user._id || user.id));
                return (
                  <div 
                    key={user._id || user.id} 
                    className={`user-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleUserSelection(user)}
                  >
                    <div className="user-item__avatar-wrapper">
                      <Avatar name={user.username} size="md" online={user.isOnline} />
                      {isSelected && (
                        <div className="user-item__check">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="user-item__info">
                      <span className="user-item__name">{user.username}</span>
                      <span className="user-item__email truncate">{user.email}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="new-group-modal__footer">
          <button 
            className="btn-primary w-full" 
            onClick={handleCreateGroup}
            disabled={isSubmitting || !groupName.trim() || selectedUsers.length === 0}
          >
            {isSubmitting ? 'Creating...' : `Create Group (${selectedUsers.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
