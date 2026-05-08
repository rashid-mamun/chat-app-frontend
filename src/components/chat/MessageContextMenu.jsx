import React, { useEffect, useRef, useState } from 'react';
import { Reply, Forward, Copy, Trash2 } from 'lucide-react';
import './MessageContextMenu.css';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

const MessageContextMenu = ({ x, y, message, isOwn, onAction, onClose }) => {
  const menuRef = useRef(null);
  const [pos, setPos] = useState({ top: y, left: x });

  // Calculate position after render (we know actual size)
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    
    let left = x;
    let top = y;

    // Flip left if would overflow right edge
    if (x + rect.width > vw - 12) {
      left = x - rect.width;
    }
    // Keep left >= 8
    if (left < 8) left = 8;

    // Flip up if would overflow bottom
    if (y + rect.height > vh - 12) {
      top = y - rect.height;
    }
    if (top < 8) top = 8;

    setPos({ top, left });
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const isDeleted = message.isDeleted;

  return (
    <div
      ref={menuRef}
      className={`msg-ctx-menu ${isOwn ? 'msg-ctx-menu--own' : ''}`}
      style={{ top: pos.top, left: pos.left }}
    >
      {/* Emoji reactions — only for others' non-deleted messages */}
      {!isOwn && !isDeleted && (
        <div className="msg-ctx-reactions">
          {EMOJI_LIST.map(emoji => (
            <button
              key={emoji}
              className="msg-ctx-reaction-btn"
              onClick={() => onAction('react', { emoji })}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="msg-ctx-actions">
        {/* Reply — hidden for deleted messages */}
        {!isDeleted && (
          <button className="msg-ctx-item" onClick={() => onAction('reply')}>
            <Reply size={15} />
            <span>Reply</span>
          </button>
        )}

        {/* Copy — only if has text content */}
        {!isDeleted && message.content && (
          <button className="msg-ctx-item" onClick={() => onAction('copy')}>
            <Copy size={15} />
            <span>Copy Text</span>
          </button>
        )}

        {/* Forward — hidden for deleted messages */}
        {!isDeleted && (
          <button className="msg-ctx-item" onClick={() => onAction('forward')}>
            <Forward size={15} />
            <span>Forward</span>
          </button>
        )}

        {/* Delete — only own messages, not already deleted */}
        {isOwn && !isDeleted && (
          <button className="msg-ctx-item msg-ctx-item--danger" onClick={() => onAction('delete')}>
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageContextMenu;
