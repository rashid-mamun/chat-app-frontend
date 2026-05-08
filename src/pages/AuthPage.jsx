import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useUiStore from '../store/uiStore';
import { authApi } from '../api/auth.api';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import TwoFactorInput from '../components/auth/TwoFactorInput';
import ThemeToggle from '../components/shared/ThemeToggle';
import './AuthPage.css';

export default function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuthData } = useAuthStore();
  const { addToast } = useUiStore();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'

  // 2FA State
  const [require2FA, setRequire2FA] = useState(false);
  const [tempCredentials, setTempCredentials] = useState(null);
  const [loading2FA, setLoading2FA] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRequire2FA = (email, password) => {
    setTempCredentials({ email, password });
    setRequire2FA(true);
  };

  const handleVerify2FA = async (token) => {
    setLoading2FA(true);
    try {
      const response = await authApi.login({
        ...tempCredentials,
        twoFactorToken: token
      });

      setAuthData(response.data.user, response.data.tokens);
      addToast('success', 'Logged in successfully!');
      navigate('/');
    } catch (error) {
      addToast('error', error.response?.data?.message || 'Invalid code. Try again.');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleCancel2FA = () => {
    setRequire2FA(false);
    setTempCredentials(null);
  };

  const getFormTitle = () => {
    if (require2FA) return { title: 'Two-Factor Auth', sub: 'Enter the 6-digit code from your authenticator app' };
    if (activeTab === 'forgot-password') return { title: 'Reset Password', sub: 'Enter your email to receive reset instructions' };
    if (activeTab === 'login') return { title: 'Welcome back 👋', sub: 'Sign in to continue to your account' };
    return { title: 'Create Account ✨', sub: 'Join thousands of people already chatting' };
  };

  const { title, sub } = getFormTitle();

  return (
    <div className="auth-layout">
      {/* Background Elements */}
      <div className="auth-bg-elements">
        <div className="auth-ambient"></div>
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
      </div>

      {/* Theme Toggle Top Right */}
      <div className="auth-header-actions">
        <ThemeToggle />
      </div>

      {/* Centered Glass Card */}
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand__icon">
            <MessageSquare size={26} color="white" strokeWidth={2} />
          </div>
          <span className="auth-brand__name">ChatApp</span>
        </div>

        {require2FA ? (
          <TwoFactorInput
            loading={loading2FA}
            onSubmit={handleVerify2FA}
            onCancel={handleCancel2FA}
          />
        ) : (
          <>
            {/* Tabs */}
            {activeTab !== 'forgot-password' && (
              <div className="auth-tabs">
                <button
                  id="login-tab"
                  className={`auth-tab ${activeTab === 'login' ? 'auth-tab--active' : ''}`}
                  onClick={() => setActiveTab('login')}
                >
                  Sign In
                </button>
                <button
                  id="register-tab"
                  className={`auth-tab ${activeTab === 'register' ? 'auth-tab--active' : ''}`}
                  onClick={() => setActiveTab('register')}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Form Heading */}
            <h2 className="auth-form-heading">{title}</h2>
            <p className="auth-form-subheading">{sub}</p>

            {/* Form Content */}
            <div className="auth-content">
              {activeTab === 'forgot-password' ? (
                <ForgotPasswordForm onBack={() => setActiveTab('login')} />
              ) : activeTab === 'login' ? (
                <LoginForm
                  onRequire2FA={handleRequire2FA}
                  onForgotPassword={() => setActiveTab('forgot-password')}
                />
              ) : (
                <RegisterForm />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
