import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Input from '../shared/Input';
import Button from '../shared/Button';

export default function LoginForm({ onRequire2FA, onForgotPassword }) {
  const { setAuthData } = useAuthStore();
  const { addToast } = useUiStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authApi.login(formData);
      
      // Check if 2FA is required
      if (response.data?.twoFactorRequired) {
        onRequire2FA(formData.email, formData.password);
        return;
      }

      const user = response.data?.user;
      const tokens = response.data?.tokens;

      if (user && tokens) {
        setAuthData(user, tokens);
        addToast('success', 'Logged in successfully!');
      } else {
        throw new Error('Invalid credentials or response');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      addToast('error', message);
      
      // If rate limited
      if (error.response?.status === 429) {
        setErrors({ email: 'Too many attempts. Try again later.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-in">
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        leftIcon={<Mail size={18} />}
        placeholder="you@example.com"
        autoComplete="email"
      />
      
      <Input
        label="Password"
        name="password"
        type={showPassword ? "text" : "password"}
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        leftIcon={<Lock size={18} />}
        rightIcon={showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        onRightIconClick={() => setShowPassword(!showPassword)}
        placeholder="Enter your password"
        autoComplete="current-password"
      />

      <div className="flex justify-end mt-[-8px]">
        <button type="button" className="auth-link" onClick={onForgotPassword}>
          Forgot Password?
        </button>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
        Sign In
      </Button>
    </form>
  );
}
