import { Check, X, Users, UserPlus } from 'lucide-react';
import useChatStore from '../../store/chatStore';

export default function NotificationCenter() {
  const { 
    pendingInvites, 
    pendingJoinRequests, 
    handleInviteResponse, 
    handleJoinRequest 
  } = useChatStore();

  if (pendingInvites.length === 0 && pendingJoinRequests.length === 0) {
    return null;
  }

  return (
    <div className="notification-center px-2 py-3 border-b flex flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-2">Notifications</span>
      
      {/* Group Invites */}
      {pendingInvites.map((invite) => (
        <div key={invite.groupId} className="notification-item bg-accent/5 border border-accent/10 rounded-xl p-3 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <UserPlus size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">Group Invitation</p>
              <p className="text-[11px] text-muted truncate">
                <span className="font-bold text-accent">{invite.inviterName}</span> invited you to <span className="font-bold">{invite.groupName}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  className="flex-1 py-1 bg-accent text-white text-[10px] font-bold rounded-md hover:brightness-110 transition-all"
                  onClick={() => handleInviteResponse(invite.groupId, 'accept')}
                >
                  Accept
                </button>
                <button 
                  className="flex-1 py-1 bg-secondary text-primary text-[10px] font-bold rounded-md hover:bg-default transition-all"
                  onClick={() => handleInviteResponse(invite.groupId, 'reject')}
                >
                  Ignore
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Join Requests (Admin) */}
      {pendingJoinRequests.map((request) => (
        <div key={`${request.groupId}-${request.userId}`} className="notification-item bg-primary/5 border border-primary/10 rounded-xl p-3 animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">Join Request</p>
              <p className="text-[11px] text-muted truncate">
                <span className="font-bold">{request.username}</span> wants to join <span className="font-bold">{request.groupName}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button 
                  className="p-1 px-3 bg-primary text-white text-[10px] font-bold rounded-md hover:brightness-110 transition-all flex items-center gap-1"
                  onClick={() => handleJoinRequest(request.groupId, request.userId, 'approve')}
                >
                  <Check size={10} /> Approve
                </button>
                <button 
                  className="p-1 px-3 bg-secondary text-primary text-[10px] font-bold rounded-md hover:bg-default transition-all flex items-center gap-1"
                  onClick={() => handleJoinRequest(request.groupId, request.userId, 'reject')}
                >
                  <X size={10} /> Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
