import { useEffect } from 'react';
import { MessageSquare, UserPlus } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import ConversationItem from './ConversationItem';

export default function ConversationList() {
  const { conversations, loadingConversations, fetchConversations, activeChat } = useChatStore();
  const { user } = useAuthStore();
  const { openModal } = useUiStore();

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  if (loadingConversations && conversations.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="w-10 h-10 rounded-full skeleton flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="h-4 w-24 skeleton rounded" />
              <div className="h-3 w-40 skeleton rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="conv-empty-state">
        <div className="conv-empty-state__icon">
          <MessageSquare size={24} />
        </div>
        <div className="conv-empty-state__title">No conversations yet</div>
        <p className="conv-empty-state__sub">Start a private chat or create a group when you are ready.</p>
        <button className="conv-empty-state__action" onClick={() => openModal('newChat')}>
          <UserPlus size={16} />
          New chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((chat) => {
        if (!chat) return null;
        const isGroup = Boolean(chat.isGroup);
        const name = isGroup ? chat.name : (chat.user?.username || 'Unknown User');
        const rawLastMsg = chat.lastMessage;
        const latestMessage = typeof rawLastMsg === 'object' && rawLastMsg !== null
          ? rawLastMsg
          : rawLastMsg ? { content: rawLastMsg } : null;
        const isActive = activeChat?.id === chat._id;
        
        return (
          <ConversationItem
            key={chat._id}
            id={chat._id}
            name={name}
            isGroup={isGroup}
            latestMessage={latestMessage}
            unreadCount={0} 
            isActive={isActive}
            entity={isGroup ? chat : chat.user}
          />
        );
      })}
    </div>
  );
}
