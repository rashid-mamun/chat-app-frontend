import { useState, useRef } from 'react';
import { X, Camera, Lock, User, Info, Save, ShieldCheck } from 'lucide-react';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { authApi } from '../../api/auth.api';
import { uploadApi } from '../../api/upload.api';
import Avatar from '../shared/Avatar';
import TwoFactorSetup from '../auth/TwoFactorSetup';
import './ProfileModal.css';

export default function ProfileModal() {
  const { closeModal } = useUiStore();
  const { user, updateUser } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'
  
  // Profile State
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        useUiStore.getState().addToast('error', 'File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      useUiStore.getState().addToast('error', 'Username cannot be empty');
      return;
    }

    setIsSavingProfile(true);
    try {
      let finalAvatarUrl = user?.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        const uploadRes = await uploadApi.uploadFile(avatarFile);
        if (uploadRes.success) {
          finalAvatarUrl = uploadRes.data.fileUrl;
        }
      }

      // Update Profile
      const res = await authApi.updateProfile({
        username,
        bio,
        avatar: finalAvatarUrl
      });

      if (res.success) {
        updateUser({ username, bio, avatar: finalAvatarUrl });
        useUiStore.getState().addToast('success', 'Profile updated successfully!');
      }
    } catch (error) {
      console.error(error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      useUiStore.getState().addToast('error', 'New passwords do not match');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        useUiStore.getState().addToast('success', 'Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error(error);
      useUiStore.getState().addToast('error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="profile-modal animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="profile-modal__header">
          <h3>Settings</h3>
          <button onClick={closeModal} className="close-btn">
            <X size={18} />
          </button>
        </div>

        {/* Sidebar / Tabs inside Modal */}
        <div className="profile-modal__layout">
          <div className="profile-modal__tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <User size={18} /> Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <ShieldCheck size={18} /> Security
            </button>
          </div>

          <div className="profile-modal__content custom-scrollbar">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="profile-form">
                
                <div className="avatar-upload-section">
                  <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="avatar-preview-img" />
                    ) : (
                      <Avatar name={user?.username} size="xl" />
                    )}
                    <div className="avatar-overlay">
                      <Camera size={24} />
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    hidden 
                  />
                  <p className="text-muted text-xs mt-2 text-center">Click to change picture</p>
                </div>

                <div className="form-group mt-6">
                  <label><User size={14} /> Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="Enter your username"
                  />
                </div>

                <div className="form-group">
                  <label><Info size={14} /> Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="Write a short bio about yourself..."
                    maxLength={150}
                    rows={3}
                  />
                  <span className="char-count">{bio.length}/150</span>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
                  disabled={isSavingProfile}
                >
                  <Save size={16} /> {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="security-tab-content">
                <form onSubmit={handlePasswordSubmit} className="security-form">
              <h4 className="security-section-title">Change Password</h4>
                
                <div className="form-group">
                  <label><Lock size={14} /> Current Password</label>
                  <input 
                    type="password" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Lock size={14} /> New Password</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    required
                  />
                </div>

                <div className="form-group">
                  <label><Lock size={14} /> Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full mt-4"
                  disabled={isSavingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {isSavingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </form>
              
              <hr className="my-6 border-default" />
              
              <TwoFactorSetup />
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
