import { useEffect, useRef, useState } from 'react';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import MessageBubble from './MessageBubble';
import DateSeparator from './DateSeparator';
import MessageContextMenu from './MessageContextMenu';
import ForwardModal from './ForwardModal';
import './MessageList.css';

export default function MessageList() {
  const { messages, loadingMessages, activeChat, setReplyingTo, addReaction, deleteMessage, targetMessageId, setTargetMessageId } = useChatStore();
  const { user } = useAuthStore();
  const { addToast } = useUiStore();
  const bottomRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [forwardMsg, setForwardMsg] = useState(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (targetMessageId) {
      // Find the message in DOM
      const targetEl = document.getElementById(`msg-${targetMessageId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedMsgId(targetMessageId);
        
        // Clear target so user can scroll freely afterwards
        setTargetMessageId(null);
        
        // Remove highlight after animation completes
        setTimeout(() => setHighlightedMsgId(null), 3000);
      }
    } else {
      // Normal auto-scroll to bottom if not targeting a specific message
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, activeChat, targetMessageId, setTargetMessageId]);

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message
    });
  };

  const handleMenuAction = (action, data = null) => {
    const { message } = contextMenu;
    setContextMenu(null);

    switch (action) {
      case 'reply':
        setReplyingTo(message);
        break;
      case 'copy':
        if (message.content) {
          navigator.clipboard.writeText(message.content);
          addToast('success', 'Message copied!');
        }
        break;
      case 'react':
        addReaction(message._id, data.emoji);
        break;
      case 'delete': {
        const currentUserId = user?._id || user?.id;
        const senderId = message.sender?._id || message.sender;
        if (String(senderId) !== String(currentUserId)) {
          addToast('error', 'You can only delete your own messages');
          return;
        }
        deleteMessage(message._id);
        break;
      }
      case 'forward':
        setForwardMsg(message);
        break;
      default:
        break;
    }
  };

  if (!activeChat) return null;

  if (loadingMessages && messages.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-4 h-full justify-end">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
            <div className={`skeleton h-12 w-48 rounded-xl ${i % 2 === 0 ? 'rounded-tr-none' : 'rounded-tl-none'}`} />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="m-auto text-center">
        <p className="text-muted bg-elevated px-4 py-2 rounded-lg text-sm shadow-sm inline-block">
          No messages yet. Say hello!
        </p>
      </div>
    );
  }

  let lastDate = null;

  return (
    <div className="message-list flex flex-col pb-4 pt-4 px-4 overflow-x-hidden">
      {messages.map((msg, index) => {
        const currentUserId = user?._id || user?.id;
        const senderId = msg.sender?._id || msg.sender?.id || msg.sender;
        const isOwn = String(senderId) === String(currentUserId);
        const msgDate = new Date(msg.createdAt).toDateString();
        const showSeparator = msgDate !== lastDate;
        lastDate = msgDate;

        const prevMsg = messages[index - 1];
        let grouped = false;
        if (prevMsg && prevMsg.sender?._id === msg.sender?._id && !showSeparator) {
            const diff = new Date(msg.createdAt) - new Date(prevMsg.createdAt);
            if (diff < 5 * 60 * 1000) {
                grouped = true;
            }
        }

        return (
          <div 
            key={msg._id || index} 
            id={`msg-${msg._id}`}
            className={`flex flex-col w-full transition-all duration-700 rounded-lg ${highlightedMsgId === msg._id ? 'bg-accent/30 shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)] ring-1 ring-accent/50 scale-[1.02] z-10' : ''}`} 
            onContextMenu={(e) => handleContextMenu(e, msg)}
          >
            {showSeparator && <DateSeparator date={msg.createdAt} />}
            <MessageBubble message={msg} isOwn={isOwn} grouped={grouped} />
          </div>
        );
      })}
      <div ref={bottomRef} />
      {contextMenu && (
        <MessageContextMenu 
          x={contextMenu.x} 
          y={contextMenu.y} 
          message={contextMenu.message}
          isOwn={(() => {
            const currentUserId = user?._id || user?.id;
            const senderId = contextMenu.message?.sender?._id || contextMenu.message?.sender;
            return String(senderId) === String(currentUserId);
          })()}
          onAction={handleMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
      {forwardMsg && (
        <ForwardModal
          message={forwardMsg}
          onClose={() => setForwardMsg(null)}
        />
      )}
    </div>
  );
}
