import { useState, useEffect, useCallback } from 'react';
import { X, Search, UserPlus, Users } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import { userApi } from '../../api/user.api';
import Avatar from '../shared/Avatar';
import './NewChatModal.css';

export default function NewChatModal() {
  const { closeModal } = useUiStore();
  const { setActiveChat } = useChatStore();
  
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const startChat = (user) => {
    const userId = user._id || user.id;
    setActiveChat('private', userId, user);
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="new-chat-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="new-chat-modal__header">
          <h3>Start New Chat</h3>
          <button onClick={closeModal} className="close-btn">
            <X size={18} />
          </button>
        </div>

        <div className="new-chat-modal__search-container">
          <div className="new-chat-modal__search">
            <Search size={18} className="text-muted" />
            <input 
              type="text" 
              placeholder="Search by username or email..." 
              value={search}
              onChange={handleSearch}
              autoFocus
            />
          </div>
        </div>

        <div className="new-chat-modal__content custom-scrollbar">
          <span className="section-label">{search ? 'Search Results' : 'Suggested Users'}</span>
          
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
              <p>{search ? `No results found for "${search}"` : 'No users available to chat with'}</p>
            </div>
          ) : (
            users.map(user => (
              <div 
                key={user._id || user.id} 
                className="user-item"
                onClick={() => startChat(user)}
              >
                <Avatar name={user.username} size="md" online={user.isOnline} />
                <div className="user-item__info">
                  <span className="user-item__name">{user.username}</span>
                  <span className="user-item__email truncate">{user.email}</span>
                </div>
                <UserPlus size={18} className="user-item__icon" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
