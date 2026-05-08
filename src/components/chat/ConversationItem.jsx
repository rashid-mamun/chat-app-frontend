import { Users, BellOff } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../shared/Avatar';
import { formatConversationTime, truncateText } from '../../utils/formatters';
import './ConversationItem.css';

export default function ConversationItem({ id, name, isGroup, latestMessage, unreadCount, isActive, entity }) {
  const { setActiveChat, onlineUsers } = useChatStore();
  const { closeSidebar } = useUiStore();
  const { user } = useAuthStore();

  const isMuted = user?.mutedChats?.some(m => String(m.chatId) === String(id));

  const handleClick = () => {
    setActiveChat(isGroup ? 'group' : 'private', id, entity);
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  const timeString = latestMessage?.createdAt ? formatConversationTime(latestMessage.createdAt) : '';
  const messagePreview = latestMessage?.content || 'No messages yet';
  const isOnline = !isGroup && onlineUsers.has(id);

  return (
    <div
      className={`conv-item ${isActive ? 'conv-item--active' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      {/* Avatar with group badge */}
      <div className="relative flex-shrink-0">
        <Avatar name={name} size="md" online={isOnline} />
        {isGroup && (
          <div
            className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
            style={{
              width: 18,
              height: 18,
              background: 'var(--bg-elevated)',
              border: '2px solid var(--bg-secondary)',
              color: 'var(--accent)',
            }}
          >
            <Users size={9} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="conv-item__content">
        {/* Name + Time */}
        <div className="conv-item__name-row">
          <span className="conv-item__name">{name}</span>
          <span className="conv-item__time">{timeString}</span>
        </div>

        {/* Preview + Unread */}
        <div className="conv-item__preview-row">
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            {isMuted && <BellOff size={12} className="text-muted flex-shrink-0" />}
            <span className="conv-item__preview truncate">
              {truncateText(messagePreview, 38)}
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="conv-item__unread">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
}
