import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, MessageSquare, ArrowLeft } from 'lucide-react';
import { authApi } from '../api/auth.api';
import useUiStore from '../store/uiStore';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import ThemeToggle from '../components/shared/ThemeToggle';
import './AuthPage.css'; // Reuse AuthPage styles

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useUiStore();
  
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!newPassword) newErrors.newPassword = 'Password is required';
    else if (newPassword.length < 8) newErrors.newPassword = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(newPassword)) {
      newErrors.newPassword = 'Must include upper, lower, number, and special character';
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authApi.resetPassword(token, newPassword);
      setSuccess(true);
      addToast('success', res.message || 'Password reset successful');
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout surface-primary">
      {/* Decorative Animated Orbs */}
      <div className="auth-orb auth-orb-1"></div>
      <div className="auth-orb auth-orb-2"></div>
      <div className="auth-orb auth-orb-3"></div>

      <div className="auth-header">
        <div className="auth-logo">
          <div className="auth-logo__icon">
            <MessageSquare size={20} color="white" strokeWidth={2.5} />
          </div>
          <span className="auth-logo__text">ChatApp</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-container">
        <div className="auth-card surface-secondary border-default shadow-lg">
          
          {success ? (
            <div className="flex flex-col gap-5 animate-fade-in text-center py-4">
              <div className="mx-auto w-16 h-16 bg-success-bg rounded-full flex items-center justify-center text-success mb-2">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold">Password Reset Complete</h3>
              <p className="text-muted text-sm">
                Your password has been successfully reset.
              </p>
              <Button variant="primary" onClick={() => navigate('/auth')} className="mt-4">
                Proceed to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-in">
              <div className="mb-2 text-center">
                <h3 className="text-2xl font-bold mb-2">Create New Password</h3>
                <p className="text-muted text-sm">
                  Please enter a strong password for your account.
                </p>
              </div>

              <Input
                label="New Password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setError({}); }}
                error={error.newPassword}
                leftIcon={<Lock size={18} />}
                rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onRightIconClick={() => setShowPassword(!showPassword)}
                placeholder="••••••••"
                autoFocus
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setError({}); }}
                error={error.confirmPassword}
                leftIcon={<Lock size={18} />}
                rightIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                placeholder="••••••••"
              />

              <div className="flex flex-col gap-3 mt-4">
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Reset Password
                </Button>
                <Button type="button" variant="ghost" fullWidth onClick={() => navigate('/auth')} disabled={loading}>
                  <ArrowLeft size={16} className="mr-2" /> Back to Sign In
                </Button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
