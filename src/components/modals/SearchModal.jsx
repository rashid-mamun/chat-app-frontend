import { useState } from 'react';
import { X, Search, Calendar, FileType, MessageSquare, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import Input from '../shared/Input';
import Button from '../shared/Button';
import './SearchModal.css';

export default function SearchModal() {
  const { closeModal } = useUiStore();
  const { user } = useAuthStore();
  const { advancedSearch, advancedSearchResults, isAdvancedSearching, clearAdvancedSearch, setActiveChat, setTargetMessageId } = useChatStore();
  
  const [query, setQuery] = useState('');
  const [chatType, setChatType] = useState('');
  const [fileType, setFileType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() && !fileType && !startDate && !endDate) {
      useUiStore.getState().addToast('warning', 'Please enter at least one search criteria');
      return;
    }

    setHasSearched(true);
    await advancedSearch({
      query,
      chatType: chatType || undefined,
      fileType: fileType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
  };

  const handleClose = () => {
    clearAdvancedSearch();
    closeModal();
  };

  const formatMessageTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return '';
    }
  };

  const handleResultClick = (msg) => {
    const type = msg.chatType;
    let chatId;
    let entity;

    if (type === 'private') {
      const currentUserId = user?._id || user?.id;
      const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
      const isSender = String(senderId) === String(currentUserId);
      
      const recipientId = msg.recipient?._id || msg.recipient?.id || msg.recipient;
      chatId = isSender ? recipientId : senderId;
      entity = isSender ? msg.recipient : msg.sender;
    } else {
      chatId = msg.group?._id || msg.group?.id || msg.group;
      entity = msg.group;
    }

    setActiveChat(type, chatId, entity);
    setTargetMessageId(msg._id);
    closeModal();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="search-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="search-modal__header">
          <h3>Advanced Search</h3>
          <button onClick={handleClose} className="icon-btn">
            <X size={18} />
          </button>
        </div>

        <div className="search-modal__content">
          <form onSubmit={handleSearch} className="search-modal__form">
            <Input 
              label="Keywords"
              name="query"
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search messages..."
              leftIcon={<Search size={16} />}
            />

            <div className="search-modal__filters">
              <div className="search-select-wrap">
                <label className="search-select-label"><MessageSquare size={14} /> Chat Type</label>
                <div className="search-select-container">
                  <MessageSquare size={16} className="search-select-icon" />
                  <select className="search-select" value={chatType} onChange={(e) => setChatType(e.target.value)}>
                    <option value="">All Chats</option>
                    <option value="private">Private</option>
                    <option value="group">Group</option>
                  </select>
                  <ChevronDown size={16} className="search-select-arrow" />
                </div>
              </div>

              <div className="search-select-wrap">
                <label className="search-select-label"><FileType size={14} /> File Type</label>
                <div className="search-select-container">
                  <FileType size={16} className="search-select-icon" />
                  <select className="search-select" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                    <option value="">Any</option>
                    <option value="image">Images</option>
                    <option value="video">Videos</option>
                    <option value="document">Documents</option>
                  </select>
                  <ChevronDown size={16} className="search-select-arrow" />
                </div>
              </div>

              <Input 
                label="Start Date"
                name="startDate"
                type="date"
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                leftIcon={<Calendar size={16} />}
              />

              <Input 
                label="End Date"
                name="endDate"
                type="date"
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                leftIcon={<Calendar size={16} />}
              />
            </div>

            <Button type="submit" variant="primary" size="md" fullWidth loading={isAdvancedSearching} className="mt-6">
              Search Messages
            </Button>
          </form>

          {/* Results Area */}
          <div className="search-modal__results custom-scrollbar">
            {!hasSearched ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted gap-4">
                <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-2">
                  <Search size={24} className="text-secondary" />
                </div>
                <p>Enter criteria and search to find messages<br/>across all your conversations.</p>
              </div>
            ) : isAdvancedSearching ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
                <div className="spinner w-8 h-8 border-accent border-2 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching your messages...</span>
              </div>
            ) : (() => {
              const results = !Array.isArray(advancedSearchResults) ? (advancedSearchResults?.messages || []) : advancedSearchResults;
              if (results.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted gap-4">
                    <div className="w-16 h-16 rounded-full bg-elevated flex items-center justify-center mb-2">
                      <MessageSquare size={24} className="text-secondary opacity-50" />
                    </div>
                    <p>No messages found matching your criteria.</p>
                  </div>
                );
              }

              return (
                <div className="search-results-list flex flex-col gap-3">
                  <div className="sticky top-0 bg-primary/95 backdrop-blur-sm z-10 pb-3 pt-1">
                    <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success"></div>
                      Found {results.length} result{results.length !== 1 ? 's' : ''}
                    </h4>
                  </div>
                  
                  {results.map((msg, idx) => (
                    <div 
                      key={msg._id} 
                      onClick={() => handleResultClick(msg)}
                      className="group p-4 rounded-2xl bg-elevated border border-border hover:border-accent/50 hover:bg-hover transition-all duration-300 animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                            {msg.sender?.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="font-semibold text-sm text-primary">{msg.sender?.username}</span>
                          {msg.chatType === 'group' && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-secondary">
                              {msg.group?.name || 'Group'}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-muted bg-white/5 px-2 py-1 rounded-lg">
                          {formatMessageTime(msg.createdAt)}
                        </span>
                      </div>
                      
                      <div className="pl-8">
                        <p className="text-sm text-secondary leading-relaxed whitespace-pre-wrap break-words">
                          {msg.content || (
                            <span className="flex items-center gap-2 text-accent italic">
                              <FileType size={14} /> Media attachment
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
