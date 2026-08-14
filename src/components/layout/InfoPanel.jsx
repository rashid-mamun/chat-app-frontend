import { X, Bell, BellOff, Image, FileText, UserMinus, ShieldAlert, Plus, MessageSquare } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import useAuthStore from '../../store/authStore';
import Avatar from '../shared/Avatar';
import './InfoPanel.css';

export default function InfoPanel() {
  const { closeInfoPanel, openModal } = useUiStore();
  const { 
    activeChat, 
    removeGroupMember, 
    toggleMute, 
    clearChat, 
    deleteChat,
    toggleBlock,
    leaveGroup,
    handleInviteResponse
  } = useChatStore();
  const { user: currentUser } = useAuthStore();

  if (!activeChat) return null;

  const isGroup = activeChat.type === 'group';
  const chatName = isGroup ? activeChat.entity?.name : activeChat.entity?.username;
  const subtext = isGroup ? `${activeChat.entity?.members?.length || 0} members` : (activeChat.entity?.isOnline ? 'Online' : 'Offline');
  const currentUserId = currentUser?._id || currentUser?.id;
  const isAdmin = isGroup && activeChat.entity?.admins?.some(admin => String(admin._id || admin) === String(currentUserId));

  // Mute logic
  const isMuted = currentUser?.mutedChats?.some(m => 
    String(m.chatId) === String(activeChat.id) && m.chatType === activeChat.type
  );

  // Block logic
  const isBlocked = currentUser?.blockedUsers?.some(id => String(id) === String(activeChat.id));

  const handleToggleBlock = () => {
    const title = isBlocked ? 'Unblock User?' : 'Block User?';
    const message = isBlocked 
      ? `Are you sure you want to unblock ${chatName}? They will be able to message you again.`
      : `Are you sure you want to block ${chatName}? They will not be able to message you.`;
    
    openModal('confirm', {
      title,
      message,
      confirmText: isBlocked ? 'Unblock' : 'Block',
      type: isBlocked ? 'info' : 'danger',
      onConfirm: () => toggleBlock(activeChat.id)
    });
  };

  const handleLeaveGroup = async () => {
    const res = await leaveGroup(activeChat.id);
    
    if (res?.requireConfirmation) {
      openModal('confirm', {
        title: 'Last Admin Warning',
        message: 'You are the only admin. Leaving will delete the group. Do you want to delete and leave, or promote someone else first?',
        confirmText: 'Delete & Leave',
        type: 'danger',
        onConfirm: async () => {
          await leaveGroup(activeChat.id, true);
          closeInfoPanel();
        }
      });
      return;
    }

    openModal('confirm', {
      title: 'Leave Group?',
      message: 'Are you sure you want to leave this group? You will no longer receive messages from it.',
      confirmText: 'Leave Group',
      type: 'danger',
      onConfirm: async () => {
        await leaveGroup(activeChat.id);
        closeInfoPanel();
      }
    });
  };

  const handleGroupDelete = () => {
    openModal('confirm', {
      title: 'Delete Group?',
      message: 'Are you sure you want to permanently delete this group? This action cannot be undone.',
      confirmText: 'Delete Group',
      type: 'danger',
      onConfirm: async () => {
        await deleteChat('group', activeChat.id);
        closeInfoPanel();
      }
    });
  };

  const handleRemoveMember = (memberId, memberName) => {
    openModal('confirm', {
      title: 'Remove Member?',
      message: `Are you sure you want to remove ${memberName} from the group?`,
      confirmText: 'Remove',
      type: 'danger',
      onConfirm: () => removeGroupMember(activeChat.id, memberId)
    });
  };

  const handleClearChat = () => {
    openModal('confirm', {
      title: 'Clear Chat?',
      message: 'Are you sure you want to permanently clear all messages in this chat?',
      confirmText: 'Clear All',
      type: 'danger',
      onConfirm: () => clearChat(activeChat.type, activeChat.id)
    });
  };

  const handleDeleteChat = () => {
    openModal('confirm', {
      title: 'Delete Chat?',
      message: 'Are you sure you want to delete this conversation? This will remove it from your chat list.',
      confirmText: 'Delete',
      type: 'danger',
      onConfirm: () => {
        deleteChat(activeChat.type, activeChat.id);
        closeInfoPanel();
      }
    });
  };

  return (
    <div className="info-panel">
      {/* ── Header ── */}
      <header className="info-panel__header px-6 flex items-center justify-between">
        <h2 className="font-semibold text-lg tracking-wide">{isGroup ? 'Group Info' : 'Contact Info'}</h2>
        <button 
          className="info-panel__close-btn shadow-sm" 
          onClick={closeInfoPanel}
          aria-label="Close info panel"
        >
          <X size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* ── Profile Section ── */}
        <section className="info-profile-section">
          <div className="info-profile-avatar">
            <Avatar name={chatName} imgSrc={activeChat.entity?.avatar} size="xl" />
          </div>
          <h3 className="text-2xl font-bold mb-1 tracking-tight text-primary">{chatName}</h3>
          <p className="text-muted text-sm font-medium">{subtext}</p>
        </section>

        {/* ── Actions ── */}
        <section className="info-panel-section">
          <button 
            className={`info-panel__action-btn ${isMuted ? 'active' : ''}`}
            onClick={() => toggleMute(activeChat.id, activeChat.type)}
          >
            {isMuted ? <BellOff size={18} className="text-accent" /> : <Bell size={18} className="text-accent" />}
            <span>{isMuted ? 'Unmute Notifications' : 'Mute Notifications'}</span>
          </button>
        </section>

        {/* ── Media & Links ── */}
        <section className="info-panel-section">
          <h4 className="section-title">Media, Links, and Docs</h4>
          <div className="media-item shadow-sm">
            <div className="media-icon photos shadow-md">
              <Image size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Photos & Videos</p>
              <p className="text-xs text-muted font-medium mt-0.5">0 items</p>
            </div>
          </div>
          <div className="media-item shadow-sm">
            <div className="media-icon docs shadow-md">
              <FileText size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-primary">Documents</p>
              <p className="text-xs text-muted font-medium mt-0.5">0 items</p>
            </div>
          </div>
        </section>

        {/* ── Group Members Section ── */}
        {isGroup && (
          <section className="info-panel-section">
            <div className="flex items-center justify-between mb-4">
              <h4 className="section-title !mb-0">
                {activeChat.entity?.members?.length || 0} Members
              </h4>
              <button 
                className="add-member-btn"
                onClick={() => openModal('addMember')}
              >
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {activeChat.entity?.members?.map((member, index) => {
                const memberId = typeof member === 'string' ? member : (member._id || member.id);
                const isMe = String(memberId) === String(currentUserId);
                const isMemberAdmin = activeChat.entity?.admins?.some(admin => 
                  String(typeof admin === 'string' ? admin : (admin._id || admin)) === String(memberId)
                );
                
                const username = typeof member === 'object' ? member.username : `User ${String(memberId).slice(-4)}`;
                const avatar = typeof member === 'object' ? member.avatar : null;
                const isOnline = typeof member === 'object' ? member.isOnline : false;

                return (
                  <div key={memberId || index} className="member-list-item shadow-sm">
                    <div className="flex items-center gap-3">
                      <Avatar 
                        name={username || 'User'} 
                        imgSrc={avatar} 
                        size="sm" 
                        online={isOnline} 
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-primary">
                          {isMe ? 'You' : (username || 'User')}
                        </span>
                        {isMemberAdmin && <span className="text-[10px] text-accent font-bold uppercase tracking-wider">Admin</span>}
                      </div>
                    </div>
                    {isAdmin && !isMe && (
                      <button 
                        className="member-remove-btn"
                        onClick={() => handleRemoveMember(memberId, username)}
                        title="Remove member"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Danger Zone ── */}
        <section className="info-panel-section border-b-0 pb-10">
          <div className="flex flex-col gap-2">
            {!isGroup && (
              <button 
                className={`info-panel__action-btn danger ${isBlocked ? 'active' : ''}`}
                onClick={handleToggleBlock}
              >
                <ShieldAlert size={18} />
                <span>{isBlocked ? 'Unblock User' : 'Block User'}</span>
              </button>
            )}
            <button 
              className="info-panel__action-btn danger"
              onClick={handleClearChat}
            >
              <MessageSquare size={18} />
              <span>Clear Chat</span>
            </button>
            <button 
              className="info-panel__action-btn danger"
              onClick={isGroup ? handleLeaveGroup : handleDeleteChat}
            >
              <UserMinus size={18} />
              <span>{isGroup ? 'Leave Group' : 'Delete Chat'}</span>
            </button>
            {isGroup && isAdmin && (
              <button 
                className="info-panel__action-btn danger"
                onClick={handleGroupDelete}
              >
                <ShieldAlert size={18} />
                <span>Delete Group</span>
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
