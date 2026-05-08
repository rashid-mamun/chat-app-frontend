import { useState } from 'react';
import { Users, Check, X, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import './InviteList.css';

export default function InviteList() {
  const { pendingInvites, handleInviteResponse } = useChatStore();
  const [expanded, setExpanded] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  if (!pendingInvites || pendingInvites.length === 0) return null;

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || 'G';

  const handleAction = async (groupId, action) => {
    setLoadingId(`${groupId}-${action}`);
    try {
      await handleInviteResponse(groupId, action);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="invite-list">
      {/* Header */}
      <button
        className="invite-list__header"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="invite-list__header-left">
          <div className="invite-list__bell">
            <Bell size={14} />
          </div>
          <span className="invite-list__title">Group Invites</span>
          <span className="invite-list__badge">{pendingInvites.length}</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
      </button>

      {/* Invite items */}
      {expanded && (
        <div className="invite-list__items">
          {pendingInvites.map((invite) => {
            const isAccepting = loadingId === `${invite.groupId}-accept`;
            const isRejecting = loadingId === `${invite.groupId}-reject`;
            const isLoading   = isAccepting || isRejecting;

            return (
              <div key={invite.groupId} className="invite-item">
                {/* Group avatar */}
                <div className="invite-item__avatar">
                  {invite.groupAvatar
                    ? <img src={invite.groupAvatar} alt={invite.groupName} />
                    : <span>{getInitials(invite.groupName)}</span>
                  }
                </div>

                {/* Info */}
                <div className="invite-item__info">
                  <p className="invite-item__name">{invite.groupName}</p>
                  <p className="invite-item__meta">
                    Invited by <strong>{invite.inviterName}</strong>
                  </p>
                </div>

                {/* Actions */}
                <div className="invite-item__actions">
                  <button
                    className="invite-action-btn accept"
                    onClick={() => handleAction(invite.groupId, 'accept')}
                    disabled={isLoading}
                    title="Accept invite"
                  >
                    {isAccepting
                      ? <div className="mini-spinner" />
                      : <Check size={13} />
                    }
                  </button>
                  <button
                    className="invite-action-btn reject"
                    onClick={() => handleAction(invite.groupId, 'reject')}
                    disabled={isLoading}
                    title="Decline invite"
                  >
                    {isRejecting
                      ? <div className="mini-spinner" />
                      : <X size={13} />
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
