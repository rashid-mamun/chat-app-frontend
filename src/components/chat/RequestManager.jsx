import { useState } from 'react';
import { ShieldCheck, Check, X, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import useChatStore from '../../store/chatStore';
import './RequestManager.css';

export default function RequestManager() {
  const { pendingJoinRequests, handleJoinRequest } = useChatStore();
  const [expanded, setExpanded] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  if (!pendingJoinRequests || pendingJoinRequests.length === 0) return null;

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || 'U';

  const handleAction = async (groupId, userId, action) => {
    const key = `${groupId}-${userId}-${action}`;
    setLoadingId(key);
    try {
      await handleJoinRequest(groupId, userId, action);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="req-manager">
      {/* Header */}
      <button
        className="req-manager__header"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="req-manager__header-left">
          <div className="req-manager__icon">
            <ShieldCheck size={14} />
          </div>
          <span className="req-manager__title">Join Requests</span>
          <span className="req-manager__badge">{pendingJoinRequests.length}</span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
      </button>

      {/* Request items */}
      {expanded && (
        <div className="req-manager__items">
          {pendingJoinRequests.map((req) => {
            const approveKey = `${req.groupId}-${req.userId}-approve`;
            const rejectKey  = `${req.groupId}-${req.userId}-reject`;
            const isApproving = loadingId === approveKey;
            const isRejecting = loadingId === rejectKey;
            const isLoading   = isApproving || isRejecting;

            return (
              <div key={`${req.groupId}-${req.userId}`} className="req-item">
                {/* User avatar */}
                <div className="req-item__avatar">
                  {req.userAvatar
                    ? <img src={req.userAvatar} alt={req.username} />
                    : <span>{getInitials(req.username)}</span>
                  }
                </div>

                {/* Info */}
                <div className="req-item__info">
                  <p className="req-item__user">{req.username || 'Unknown User'}</p>
                  <p className="req-item__group">
                    <Clock size={10} className="inline mr-1" />
                    wants to join <strong>{req.groupName}</strong>
                  </p>
                </div>

                {/* Actions */}
                <div className="req-item__actions">
                  <button
                    className="req-action-btn approve"
                    onClick={() => handleAction(req.groupId, req.userId, 'approve')}
                    disabled={isLoading}
                    title="Approve request"
                  >
                    {isApproving
                      ? <div className="mini-spinner" />
                      : <Check size={13} />
                    }
                  </button>
                  <button
                    className="req-action-btn reject"
                    onClick={() => handleAction(req.groupId, req.userId, 'reject')}
                    disabled={isLoading}
                    title="Reject request"
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
