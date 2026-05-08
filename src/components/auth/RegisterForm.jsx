import { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import useUiStore from '../../store/uiStore';
import Input from '../shared/Input';
import Button from '../shared/Button';

export default function RegisterForm() {
  const { setAuthData } = useAuthStore();
  const { addToast } = useUiStore();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Must be at least 3 characters';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/.test(formData.password)) {
      newErrors.password = 'Must include upper, lower, number, and special character';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authApi.register(registerData);
      
      const user = response.data?.user || response.data;
      const tokens = response.data?.tokens;

      if (user && tokens) {
        setAuthData(user, tokens);
        addToast('success', 'Account created successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      addToast('error', message);
      
      // Handle mongoose duplicate key errors for email/username if provided nicely by backend
      if (message.toLowerCase().includes('email') && message.toLowerCase().includes('already')) {
        setErrors({ email: 'Email is already taken' });
      } else if (message.toLowerCase().includes('username') && message.toLowerCase().includes('already')) {
        setErrors({ username: 'Username is already taken' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
          leftIcon={<User size={18} />}
          placeholder="johndoe"
          autoComplete="username"
        />

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
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          placeholder="••••••••"
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock size={18} />}
          rightIcon={showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} className="mt-2">
        Create Account
      </Button>
    </form>
  );
}
