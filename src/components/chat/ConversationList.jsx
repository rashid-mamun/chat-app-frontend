import { useEffect } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import ConversationItem from './ConversationItem';

export default function ConversationList() {
  const { conversations, loadingConversations, fetchConversations, activeChat } = useChatStore();
  const { user } = useAuthStore();

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
      <div className="p-4 text-center text-muted text-sm border border-dashed border-default rounded-lg m-2">
        No chats yet. Click + to start a conversation.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((chat) => {
        if (!chat) return null;
        const isGroup = chat.isGroup;
        const name = isGroup ? chat.name : chat.user?.username;
        const latestMessage = isGroup ? null : { content: chat.lastMessage }; 
        const isActive = activeChat?.id === chat._id;
        
        return (
          <ConversationItem
            key={chat._id}
            id={chat._id}
            name={name || 'Unknown User'}
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
