import { useState } from 'react';
import { authApi } from '../../api/auth.api';
import useUiStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { ShieldCheck, ShieldAlert, Key } from 'lucide-react';

export default function TwoFactorSetup() {
  const { user, updateUser } = useAuthStore();
  const { addToast } = useUiStore();
  
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Backend usually returns user.twoFactorEnabled boolean
  const is2FAEnabled = user?.twoFactorEnabled || user?.is2FAEnabled || false;

  const handleSetupInit = async () => {
    setIsSettingUp(true);
    try {
      const res = await authApi.setup2FA();
      if (res.success && res.data) {
        setQrCodeUrl(res.data.qrCode);
        setSecret(res.data.secret);
      }
    } catch (error) {
      addToast('error', error.response?.data?.message || 'Failed to initialize 2FA setup');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      addToast('warning', 'Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await authApi.verify2FA(otp);
      if (res.success) {
        addToast('success', 'Two-Factor Authentication enabled successfully!');
        updateUser({ ...user, twoFactorEnabled: true, is2FAEnabled: true });
        setQrCodeUrl('');
        setSecret('');
        setIsSettingUp(false);
      }
    } catch (error) {
      addToast('error', error.response?.data?.message || 'Invalid OTP code');
    } finally {
      setIsVerifying(false);
    }
  };

  if (is2FAEnabled) {
    return (
      <div className="two-factor-setup p-4 border border-success rounded-lg mt-6" style={{ background: 'rgba(74, 222, 128, 0.05)' }}>
        <div className="flex items-center gap-3 text-success mb-2">
          <ShieldCheck size={24} />
          <h4 className="font-semibold m-0">Two-Factor Authentication is Enabled</h4>
        </div>
        <p className="text-sm text-muted m-0">
          Your account is protected with an extra layer of security.
        </p>
      </div>
    );
  }

  return (
    <div className="two-factor-setup p-4 border border-default rounded-lg mt-6 bg-secondary">
      <div className="flex items-center gap-3 mb-2 text-primary">
        <ShieldAlert size={24} className="text-warning" />
        <h4 className="font-semibold m-0">Two-Factor Authentication (2FA)</h4>
      </div>
      <p className="text-sm text-muted mb-4">
        Add an extra layer of security to your account. You'll need to enter a code from an authenticator app when you log in.
      </p>

      {!isSettingUp && !qrCodeUrl && (
        <button 
          onClick={handleSetupInit} 
          className="btn-secondary text-sm"
          disabled={isSettingUp}
        >
          {isSettingUp ? 'Initializing...' : 'Enable 2FA'}
        </button>
      )}

      {qrCodeUrl && (
        <div className="mt-4 p-4 bg-elevated rounded-lg animate-slide-up border border-default">
          <h5 className="font-medium text-sm mb-2 text-primary">1. Scan this QR Code</h5>
          <p className="text-xs text-muted mb-3">Use Google Authenticator, Authy, or any standard TOTP app.</p>
          <div className="bg-white p-2 rounded inline-block mb-3">
            <img src={qrCodeUrl} alt="2FA QR Code" className="w-32 h-32" />
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-muted mb-1">Or enter this secret manually:</p>
            <code className="text-xs bg-secondary border border-default p-1.5 rounded font-mono text-accent block break-all">
              {secret}
            </code>
          </div>

          <h5 className="font-medium text-sm mb-2 text-primary">2. Verify Code</h5>
          <form onSubmit={handleVerify} className="flex gap-2">
            <div className="flex-1 relative">
              <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-primary border border-default rounded py-2 pl-9 pr-3 text-sm focus:border-accent outline-none text-primary"
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary text-sm whitespace-nowrap"
              disabled={isVerifying || otp.length < 6}
            >
              {isVerifying ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          
          <button 
            onClick={() => { setQrCodeUrl(''); setIsSettingUp(false); setOtp(''); }}
            className="text-xs text-muted hover:text-danger mt-3 transition-colors"
          >
            Cancel Setup
          </button>
        </div>
      )}
    </div>
  );
}
