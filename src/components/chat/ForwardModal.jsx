import { useState } from 'react';
import { X, Search, Send } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Avatar from '../shared/Avatar';
import './ForwardModal.css';

export default function ForwardModal({ message, onClose }) {
  const { conversations, setActiveChat, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = conversations.filter(chat => {
    const name = chat.isGroup ? chat.name : chat.user?.username;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleForward = () => {
    if (!selected) return;

    const currentId = user?._id || user?.id;
    const type = selected.isGroup ? 'group' : 'private';
    const id = selected._id;

    // Switch to that chat and send the forwarded message
    setActiveChat(type, id, selected.isGroup ? selected : selected.user);

    setTimeout(() => {
      sendMessage(message.content, message.fileUrl ? {
        fileUrl: message.fileUrl,
        fileName: message.fileName,
        fileType: message.fileType,
        fileSize: message.fileSize
      } : null);
      addToast('success', 'Message forwarded!');
      onClose();
    }, 300);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="forward-modal" onClick={e => e.stopPropagation()}>
        <div className="forward-modal__header">
          <h3>Forward Message</h3>
          <button className="close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Message preview */}
        <div className="forward-modal__preview">
          <p className="forward-modal__preview-label">Forwarding:</p>
          <p className="forward-modal__preview-text">
            {message.content || (message.fileUrl ? `File: ${message.fileName}` : '')}
          </p>
        </div>

        {/* Search */}
        <div className="forward-modal__search">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Conversation list */}
        <div className="forward-modal__list">
          {filtered.length === 0 ? (
            <p className="forward-modal__empty">No conversations found</p>
          ) : (
            filtered.map(chat => {
              const name = chat.isGroup ? chat.name : chat.user?.username;
              const isSelected = selected?._id === chat._id;
              return (
                <div
                  key={chat._id}
                  className={`forward-modal__item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelected(chat)}
                >
                  <Avatar name={name} size="sm" />
                  <span>{name}</span>
                  {isSelected && <div className="forward-modal__check">✓</div>}
                </div>
              );
            })
          )}
        </div>

        <button
          className="forward-modal__send"
          onClick={handleForward}
          disabled={!selected}
        >
          <Send size={16} />
          Forward
        </button>
      </div>
    </div>
  );
}
