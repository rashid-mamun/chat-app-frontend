import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../../api/auth.api';
import useUiStore from '../../store/uiStore';
import Input from '../shared/Input';
import Button from '../shared/Button';

export default function ForgotPasswordForm({ onBack }) {
  const { addToast } = useUiStore();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSuccess(true);
      addToast('success', res.message || 'Reset link sent');
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-5 animate-fade-in text-center py-4">
        <div className="mx-auto w-16 h-16 bg-accent-ultra rounded-full flex items-center justify-center text-accent mb-2">
          <Mail size={32} />
        </div>
        <h3 className="text-xl font-bold">Check your email</h3>
        <p className="text-muted text-sm">
          We've sent a password reset link to <br/>
          <span className="text-primary font-medium">{email}</span>
        </p>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-fade-in">


      <Input
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(''); }}
        error={error}
        leftIcon={<Mail size={18} />}
        placeholder="you@example.com"
        autoComplete="email"
        autoFocus
      />

      <div className="flex flex-col gap-3 mt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Send Reset Link
        </Button>
        <Button type="button" variant="ghost" fullWidth onClick={onBack} disabled={loading}>
          <ArrowLeft size={16} className="mr-2" /> Back to Sign In
        </Button>
      </div>
    </form>
  );
}
