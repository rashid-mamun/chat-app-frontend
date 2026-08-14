import { Check, CheckCheck, FileText, Download, Forward } from 'lucide-react';
import { formatTime } from '../../utils/formatters';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import './MessageBubble.css';

export default function MessageBubble({ message, isOwn, grouped }) {
  const timeString = message.createdAt ? formatTime(message.createdAt) : '';
  const isRead = message.readBy && message.readBy.length > 0;
  const replyTo = message.replyTo;
  const reactions = message.reactions || [];
  const { addReaction } = useChatStore();
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;
  const isDeleted = message.isDeleted;
  
  const renderFile = () => {
    if (!message.fileUrl) return null;

    const isImage = message.fileType?.startsWith('image/') || message.fileType === 'image';
    if (isImage) {
      return (
        <div className="msg-image-container">
          <img src={message.fileUrl} alt={message.fileName || 'image'} className="msg-image" />
        </div>
      );
    }

    return (
      <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="msg-file-attachment">
        <div className="msg-file-icon">
          <FileText size={20} />
        </div>
        <div className="msg-file-info">
          <span className="msg-file-name">{message.fileName}</span>
          <span className="msg-file-size">{message.fileSize ? `${(message.fileSize / 1024).toFixed(1)} KB` : ''}</span>
        </div>
        <Download size={16} className="msg-file-download" />
      </a>
    );
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, r) => {
    const emoji = r.reaction;
    if (!acc[emoji]) acc[emoji] = { count: 0, users: [] };
    acc[emoji].count++;
    acc[emoji].users.push(r.user);
    return acc;
  }, {});

  const handleReactionClick = (emoji) => {
    // Only allow reacting to others' messages
    if (!isOwn) {
      addReaction(message._id, emoji);
    }
  };

  return (
    <div id={`msg-${message._id}`} className={`msg-wrapper ${isOwn ? 'msg-wrapper--own' : ''} ${grouped ? 'msg-grouped' : ''}`}>
      {!isOwn && !grouped && message.sender && (
        <div className="msg-sender-name">
          {message.sender.username}
        </div>
      )}
      
      <div className={`msg-bubble ${isOwn ? 'msg-bubble--own' : 'msg-bubble--other'} ${isDeleted ? 'msg-bubble--deleted' : ''} ${message.isSending ? 'msg-bubble--sending' : ''}`}>
        
        {/* Forwarded Badge */}
        {message.isForwarded && !isDeleted && (
          <div className="flex items-center gap-1 text-[11px] text-muted italic mb-1 opacity-75">
            <Forward size={12} />
            <span>Forwarded</span>
          </div>
        )}

        {/* Reply Preview */}
        {replyTo && !isDeleted && (
          <div className="msg-reply-preview" onClick={() => {
            const el = document.getElementById(`msg-${replyTo._id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}>
            <div className="msg-reply-accent" />
            <div className="msg-reply-content">
              <span className="msg-reply-sender">
                {replyTo.sender?.username || 'User'}
              </span>
              <p className="msg-reply-text">
                {replyTo.content || (replyTo.fileUrl ? 'Media' : 'Message...')}
              </p>
            </div>
          </div>
        )}
        
        {isDeleted ? (
          <div className="msg-deleted">
            <span>This message was deleted</span>
          </div>
        ) : (
          <>
            {renderFile()}
            {message.content && (
              <div className="msg-content">
                {message.content}
              </div>
            )}
          </>
        )}
        
        <div className="msg-meta">
          <span className="msg-time">{timeString}</span>
          {isOwn && (
            <span className={`msg-status ${isRead ? 'msg-status--read' : ''}`}>
              {message.isSending 
                ? <Check size={14} style={{ opacity: 0.5 }} />
                : isRead ? <CheckCheck size={14} /> : <Check size={14} />
              }
            </span>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="msg-reactions">
            {Object.entries(groupedReactions).map(([emoji, data]) => {
              const iReacted = data.users.some(u => String(u) === String(currentUserId));
              return (
                <button
                  key={emoji}
                  className={`msg-reaction-pill ${iReacted ? 'msg-reaction-pill--active' : ''}`}
                  onClick={() => handleReactionClick(emoji)}
                  title={`${data.count} reaction${data.count > 1 ? 's' : ''}`}
                >
                  <span>{emoji}</span>
                  {data.count > 1 && <span className="msg-reaction-count">{data.count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
