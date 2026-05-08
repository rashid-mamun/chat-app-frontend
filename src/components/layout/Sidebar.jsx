import { useState, useRef, useEffect } from 'react';
import { Search, Plus, LogOut, Settings, UserPlus, Users, Hash } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Avatar from '../shared/Avatar';
import ThemeToggle from '../shared/ThemeToggle';
import ConversationList from '../chat/ConversationList';
import NotificationCenter from './NotificationCenter';
import InviteList from '../chat/InviteList';
import RequestManager from '../chat/RequestManager';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { openModal } = useUiStore();
  
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sidebar h-full flex flex-col">

      {/* ── Header ── */}
      <header className="sidebar__header">
        {/* User profile */}
        <div
          className="sidebar__user-info"
          onClick={() => openModal('profile')}
          title="Open profile settings"
        >
          <Avatar name={user?.username} imgSrc={user?.avatar} size="md" online />
          <div className="sidebar__user-text">
            <span className="sidebar__username">
              {user?.username || 'User'}
            </span>
            <span className="sidebar__status">
              <span className="sidebar__status-dot" />
              Online
            </span>
          </div>
        </div>

        {/* Action icons */}
        <div className="sidebar__actions">
          <ThemeToggle />
          <button
            className="icon-btn"
            aria-label="Settings"
            title="Settings"
            onClick={() => openModal('profile')}
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <NotificationCenter />

      {/* ── Search Bar ── */}
      <div className="sidebar__search">
        <div
          className="search-input-wrapper"
          onClick={() => openModal('search')}
        >
          <Search size={16} className="search-input-icon" />
          <div className="search-input text-muted">
            Search conversations...
          </div>
        </div>
      </div>

      {/* ── Conversations Header ── */}
      <div className="sidebar__list-header">
        <span className="sidebar__list-label">Conversations</span>
        <div className="relative" ref={menuRef}>
          <button
            className="sidebar__new-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            title="New chat"
            aria-label="New chat"
          >
            <Plus size={16} />
          </button>

          {showMenu && (
            <div className="sidebar__dropdown">
              <button
                className="sidebar__dropdown-item"
                onClick={() => { openModal('newChat'); setShowMenu(false); }}
              >
                <UserPlus size={16} />
                New Private Chat
              </button>
              <button
                className="sidebar__dropdown-item"
                onClick={() => { openModal('newGroup'); setShowMenu(false); }}
              >
                <Users size={16} />
                New Group Chat
              </button>
              <button
                className="sidebar__dropdown-item"
                onClick={() => { openModal('joinGroup'); setShowMenu(false); }}
              >
                <Hash size={16} />
                Join Group Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Pending Invites (shown to all users) ── */}
      <InviteList />

      {/* ── Pending Join Requests (shown to admins) ── */}
      <RequestManager />

      {/* ── Chat List ── */}
      <div className="sidebar__list overflow-y-auto flex-1">
        <ConversationList />
      </div>

      {/* ── Footer ── */}
      <footer className="sidebar__footer">
        <button
          onClick={() => logout()}
          className="sidebar__signout-btn"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </footer>
    </div>
  );
}
