import { Menu, Search, MoreVertical, Paperclip, Smile, Send, Info, X, MessageSquare, Bell, BellOff, UserMinus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../shared/Avatar';
import MessageList from '../chat/MessageList';
import socketService from '../../api/socket.service';
import './ChatWindow.css';

export default function ChatWindow() {
  const { openSidebar, toggleInfoPanel, openModal } = useUiStore();
  const { user } = useAuthStore();
  const {
    activeChat,
    sendMessage,
    uploadAndSendFile,
    typingUsers,
    onlineUsers,
    replyingTo,
    clearReplyingTo,
    searchMessages,
    searchResults,
    isSearching,
    clearSearch,
    toggleMute,
    clearChat,
    deleteChat
  } = useChatStore();

  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const emojiPickerRef = useRef(null);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Join room when active chat changes
  useEffect(() => {
    if (activeChat) {
      if (activeChat.type === 'private') {
        socketService.emit('joinPrivateChat', { recipientId: activeChat.id });
      } else {
        socketService.emit('joinGroupChat', { groupId: activeChat.id });
      }
    }
  }, [activeChat]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isChatActive = !!activeChat;
  const chatName = activeChat?.type === 'group'
    ? activeChat.entity?.name
    : activeChat?.entity?.username;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadAndSendFile(file);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const handleSearchToggle = () => {
    if (showSearchBar) {
      setShowSearchBar(false);
      setLocalSearchQuery('');
      clearSearch();
    } else {
      setShowSearchBar(true);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (localSearchQuery.trim() && activeChat) {
        searchMessages(localSearchQuery.trim(), activeChat.type, activeChat.id);
      }
    }
  };

  const formatMessageTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch (e) {
      return '';
    }
  };

  const isMuted = user?.mutedChats?.some(m => String(m.chatId) === String(activeChat?.id));

  return (
    <div className="chat-window h-full flex flex-col">
      {/* ── Header ── */}
      <header className="chat-window__header">
        <div className="flex items-center gap-3">
          <button
            className="chat-window__menu-btn lg:hidden"
            onClick={openSidebar}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {isChatActive ? (
            <div className="flex items-center gap-3">
              <Avatar name={chatName} size="md" online={activeChat.type === 'private' ? onlineUsers.has(activeChat.id) : true} />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="chat-window__title">{chatName}</span>
                  {isMuted && <BellOff size={14} className="text-muted" />}
                </div>
                <span className={`chat-window__subtitle ${typingUsers[activeChat.id]?.length > 0 ? 'text-accent' : 'text-success'}`} style={{ fontSize: '12px', fontWeight: 500 }}>
                  {typingUsers[activeChat.id]?.length > 0
                    ? `${typingUsers[activeChat.id].join(', ')} is typing...`
                    : (activeChat.type === 'private' && !onlineUsers.has(activeChat.id) ? 'Offline' : 'Online')}
                </span>
              </div>
            </div>
          ) : (
            <span className="chat-window__title">ChatApp</span>
          )}
        </div>

        {isChatActive && (
          <div className="flex items-center gap-1">
            <button className="chat-window__icon-btn" title="Search messages" onClick={handleSearchToggle}>
              <Search size={18} />
            </button>
            <button className="chat-window__icon-btn" title="Chat info" onClick={toggleInfoPanel}>
              <Info size={18} />
            </button>

            <div className="relative" ref={moreMenuRef}>
              <button
                className={`chat-window__icon-btn ${showMoreMenu ? 'text-primary bg-elevated' : ''}`}
                title="More options"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <MoreVertical size={18} />
              </button>

              {showMoreMenu && (
                <div className="chat-window__more-menu animate-scale-in origin-top-right">
                  <button className="chat-window__menu-item" onClick={() => {
                    toggleInfoPanel();
                    setShowMoreMenu(false);
                  }}>
                    <Info size={16} />
                    <span>Chat Info</span>
                  </button>
                  <button className="chat-window__menu-item" onClick={() => {
                    toggleMute(activeChat.id, activeChat.type);
                    setShowMoreMenu(false);
                  }}>
                    <Bell size={16} />
                    <span>
                      {user?.mutedChats?.some(m => String(m.chatId) === String(activeChat.id))
                        ? 'Unmute Notifications'
                        : 'Mute Notifications'}
                    </span>
                  </button>
                  <div className="chat-window__menu-divider" />
                  <button className="chat-window__menu-item danger" onClick={() => {
                    openModal('confirm', {
                      title: 'Clear Chat?',
                      message: 'Are you sure you want to permanently clear all messages in this chat? This action cannot be undone.',
                      confirmText: 'Clear All',
                      type: 'danger',
                      onConfirm: () => clearChat(activeChat.type, activeChat.id)
                    });
                    setShowMoreMenu(false);
                  }}>
                    <X size={16} />
                    <span>Clear Chat</span>
                  </button>
                  <button className="chat-window__menu-item danger" onClick={() => {
                    openModal('confirm', {
                      title: 'Delete Chat?',
                      message: 'Are you sure you want to delete this conversation? This will remove it from your chat list.',
                      confirmText: 'Delete',
                      type: 'danger',
                      onConfirm: () => deleteChat(activeChat.type, activeChat.id)
                    });
                    setShowMoreMenu(false);
                  }}>
                    <UserMinus size={16} />
                    <span>Delete Chat</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Search Bar (Conditionally Rendered) ── */}
      {showSearchBar && isChatActive && (
        <div className="chat-window__search-bar">
          <div className="chat-window__search-wrapper">
            <Search size={15} className="chat-window__search-icon-left" />
            <input
              type="text"
              className="chat-window__search-input"
              placeholder="Search in conversation... (Press Enter)"
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
              autoFocus
            />
          </div>
          <button className="chat-window__search-close" onClick={handleSearchToggle}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ── Messages Area or Search Results ── */}
      <div className="chat-window__messages flex-1 overflow-y-auto bg-chat-pattern">
        {!isChatActive ? (
          <div className="chat-window__welcome">
            <div className="chat-window__welcome-icon">
              <MessageSquare size={36} strokeWidth={1.5} />
            </div>
            <h2>Welcome to ChatApp</h2>
            <p>
              Select a conversation from the sidebar or start a new one to begin messaging.
            </p>
          </div>
        ) : showSearchBar && localSearchQuery && (isSearching || searchResults.length > 0) ? (
          <div className="chat-window__search-results">
            <h3 className="text-sm font-semibold text-muted mb-4">
              {isSearching ? 'Searching...' : `Found ${searchResults.length} results for "${localSearchQuery}"`}
            </h3>
            {searchResults.map(msg => (
              <div key={msg._id} className="chat-window__search-result-item" onClick={() => {
                handleSearchToggle();
              }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm text-primary">{msg.sender?.username}</span>
                  <span className="search-result-time">{formatMessageTime(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-muted truncate">{msg.content || (msg.fileUrl ? 'Media file' : '')}</p>
              </div>
            ))}
          </div>
        ) : (
          <MessageList />
        )}
      </div>

      {/* ── Input Area ── */}
      {isChatActive && (
        <>
          {/* Reply Preview */}
          {replyingTo && (
            <div className="reply-preview-bar px-4 py-2 surface-secondary border-t border-default flex items-center gap-3 animate-slide-up">
              <div className="reply-preview-bar__accent" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary">Replying to {replyingTo.sender?.username || 'User'}</p>
                <p className="text-sm text-muted truncate">{replyingTo.content || (replyingTo.fileUrl ? 'Media' : '')}</p>
              </div>
              <button onClick={clearReplyingTo} className="text-muted hover:text-primary transition-colors p-1">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="chat-window__input-area p-4 border-t border-default surface-primary">
            <div className="chat-window__input-wrapper">
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="chat-window__input-action text-muted hover:text-primary transition-colors cursor-pointer"
                title="Attach a file"
              >
                <Paperclip size={20} />
              </label>

              <textarea
                className="chat-window__textarea"
                placeholder="Write a message..."
                rows={1}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (!isTyping && e.target.value) {
                    setIsTyping(true);
                    socketService.emit('typing', {
                      chatType: activeChat.type,
                      recipientId: activeChat.type === 'private' ? activeChat.id : null,
                      groupId: activeChat.type === 'group' ? activeChat.id : null
                    });
                  } else if (isTyping && !e.target.value) {
                    setIsTyping(false);
                    socketService.emit('stopTyping', {
                      chatType: activeChat.type,
                      recipientId: activeChat.type === 'private' ? activeChat.id : null,
                      groupId: activeChat.type === 'group' ? activeChat.id : null
                    });
                  }
                }}
                onBlur={() => {
                  if (isTyping) {
                    setIsTyping(false);
                    socketService.emit('stopTyping', {
                      chatType: activeChat.type,
                      recipientId: activeChat.type === 'private' ? activeChat.id : null,
                      groupId: activeChat.type === 'group' ? activeChat.id : null
                    });
                  }
                }}
                onKeyDown={handleKeyDown}
              />

              <div className="relative" ref={emojiPickerRef}>
                <button
                  className="chat-window__input-action text-muted hover:text-primary transition-colors"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile size={20} />
                </button>

                {showEmojiPicker && (
                  <div className="chat-window__emoji-popover animate-fade-in-up origin-bottom-right">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      lazyLoadEmojis={true}
                      searchDisabled={false}
                      skinTonesDisabled={false}
                      width={320}
                      height={400}
                      searchPlaceholder="Search emojis..."
                    />
                  </div>
                )}
              </div>

              <button
                className="chat-window__send-btn animate-scale-in"
                onClick={handleSend}
                disabled={!text.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
