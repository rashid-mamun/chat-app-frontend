import { useState } from 'react';
import { X, Hash, Users, ArrowRight, ShieldCheck, Lock, Globe, Search, UserCheck, Clock } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useChatStore from '../../store/chatStore';
import { groupApi } from '../../api/group.api';
import './JoinGroupModal.css';

export default function JoinGroupModal() {
  const { closeModal } = useUiStore();
  const { joinGroup } = useChatStore();

  const [step, setStep] = useState(1); // 1 = enter code, 2 = preview
  const [code, setCode] = useState('');
  const [groupPreview, setGroupPreview] = useState(null);
  const [looking, setLooking] = useState(false);
  const [joining, setJoining] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLooking(true);
    setLookupError('');
    try {
      const res = await groupApi.previewGroup(code.trim());
      if (res.success) {
        setGroupPreview(res.data);
        setStep(2);
      }
    } catch (error) {
      setLookupError(error.response?.data?.message || 'Group not found. Check the code.');
    } finally {
      setLooking(false);
    }
  };

  const handleJoin = async () => {
    if (!groupPreview) return;
    setJoining(true);
    try {
      await joinGroup(groupPreview._id);
      closeModal();
    } catch (error) {
      console.error('Join failed:', error);
    } finally {
      setJoining(false);
    }
  };

  const isPublic = groupPreview?.privacy === 'public';
  const isMember = groupPreview?.isMember;
  const hasPendingRequest = groupPreview?.hasPendingRequest;
  const hasPendingInvite = groupPreview?.hasPendingInvite;

  const getJoinButtonLabel = () => {
    if (isMember) return { label: 'Already a Member', icon: <UserCheck size={17} />, disabled: true };
    if (hasPendingRequest) return { label: 'Request Pending…', icon: <Clock size={17} />, disabled: true };
    if (hasPendingInvite) return { label: 'Accept Invite Instead', icon: <UserCheck size={17} />, disabled: false };
    if (isPublic) return { label: 'Join Now', icon: <ArrowRight size={17} />, disabled: false };
    return { label: 'Send Join Request', icon: <ArrowRight size={17} />, disabled: false };
  };

  const btnInfo = groupPreview ? getJoinButtonLabel() : null;

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || 'G';

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="new-chat-modal join-group-card" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="new-chat-modal__header">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg text-accent">
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Join a Group</h3>
              {step === 2 && (
                <p className="text-xs text-muted mt-0.5">Group found — review before joining</p>
              )}
            </div>
          </div>
          <button onClick={closeModal} className="close-btn"><X size={18} /></button>
        </div>

        <div className="jgm-body">

          {/* ── STEP 1: Enter Code ── */}
          {step === 1 && (
            <form onSubmit={handleLookup} className="jgm-step">
              <p className="text-sm text-secondary leading-relaxed mb-5">
                Enter a <span className="text-accent font-bold">Group ID</span> or{' '}
                <span className="text-accent2 font-bold">Invite Code</span> to find a community.
              </p>

              <div className={`join-group-input-wrapper ${lookupError ? 'error' : ''}`}>
                <Hash size={20} className="text-accent" />
                <input
                  type="text"
                  placeholder="Paste code here (e.g. 8XC29N1)"
                  value={code}
                  onChange={e => { setCode(e.target.value); setLookupError(''); }}
                  autoFocus
                />
              </div>

              {lookupError && (
                <p className="jgm-error-msg">{lookupError}</p>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <button
                  type="submit"
                  className="premium-join-btn"
                  disabled={looking || !code.trim()}
                >
                  {looking ? (
                    <><div className="loading-spinner small !border-white/30 !border-t-white" /><span>Looking up…</span></>
                  ) : (
                    <><Search size={17} /><span>Find Group</span></>
                  )}
                </button>
                <button type="button" onClick={closeModal} className="cancel-btn-subtle">Cancel</button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Group Preview ── */}
          {step === 2 && groupPreview && (
            <div className="jgm-step">
              {/* Group Card */}
              <div className="jgm-preview-card">
                {/* Avatar */}
                <div className="jgm-preview-avatar">
                  {groupPreview.avatar
                    ? <img src={groupPreview.avatar} alt={groupPreview.name} />
                    : <span>{getInitials(groupPreview.name)}</span>
                  }
                </div>

                {/* Info */}
                <div className="jgm-preview-info">
                  <h4 className="font-bold text-primary text-lg leading-tight">{groupPreview.name}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="jgm-member-count">
                      <Users size={13} />
                      {groupPreview.memberCount} members
                    </span>
                    <span className={`jgm-privacy-badge ${isPublic ? 'public' : 'private'}`}>
                      {isPublic ? <><Globe size={12} /> Public</> : <><Lock size={12} /> Private</>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Privacy hint */}
              <div className={`jgm-hint ${isPublic ? 'hint-public' : 'hint-private'}`}>
                <div className="jgm-hint-icon">
                  {isPublic ? <Globe size={16} /> : <Lock size={16} />}
                </div>
                <p className="text-xs" style={{ lineHeight: 1.5 }}>
                  {isPublic
                    ? 'This is a public group. You will join instantly.'
                    : 'This is a private group. An admin must approve your request before you can join.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-5">
                <button
                  className={`premium-join-btn ${!isPublic && !isMember && !hasPendingRequest ? 'private-req' : ''}`}
                  onClick={handleJoin}
                  disabled={joining || btnInfo?.disabled}
                >
                  {joining ? (
                    <><div className="loading-spinner small !border-white/30 !border-t-white" /><span>Processing…</span></>
                  ) : (
                    <>{btnInfo?.icon}<span>{btnInfo?.label}</span></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setGroupPreview(null); setLookupError(''); }}
                  className="cancel-btn-subtle"
                >
                  ← Try another code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="join-info-section">
          <div className="flex items-start gap-4">
            <div className="join-info-icon"><ShieldCheck size={20} /></div>
            <div>
              <h4 className="text-sm font-bold text-primary mb-1">Privacy Protected</h4>
              <p className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
                Private groups need admin approval. Public groups let you in instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
