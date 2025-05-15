import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const { toast } = useToast();

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast({
          description: "Welcome back to Kama Ayurveda.",
          title: "Login successful"
        });
      } else {
        await register(form.name, form.email, form.password);
        toast({
          description: "Welcome to Kama Ayurveda.",
          title: "Registration successful"
        });
      }
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Something went wrong.');
      toast({
        variant: "destructive",
        title: mode === 'login' ? "Login failed" : "Registration failed",
        description: err?.message || (mode === 'login' ? "Invalid email or password." : "Could not create your account.")
      });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-2 p-6 relative animate-slideup">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-xl text-neutral-gray hover:text-primary"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-full bg-primary bg-opacity-10 p-3">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7c3aed" fillOpacity=".15"/><path d="M12 13a5 5 0 100-10 5 5 0 000 10zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z" fill="#7c3aed"/></svg>
          </div>
        </div>
        <h2 className="text-center text-2xl font-heading text-primary mb-2">
          {mode === 'login' ? 'Login to your account' : 'Create an account'}
        </h2>
        <p className="text-center text-neutral-gray mb-6">
          {mode === 'login' ? 'Welcome back! Please login to continue.' : 'Sign up to enjoy a seamless checkout experience.'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <Input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          )}
          <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          <Input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required minLength={6} />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold" disabled={loading}>
            {loading ? (mode === 'login' ? 'Logging in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
          </Button>
        </form>
        <div className="text-center mt-4">
          {mode === 'login' ? (
            <span className="text-sm">Don't have an account?{' '}
              <button className="text-primary hover:underline font-semibold" type="button" onClick={() => setMode('register')}>
                Register
              </button>
            </span>
          ) : (
            <span className="text-sm">Already have an account?{' '}
              <button className="text-primary hover:underline font-semibold" type="button" onClick={() => setMode('login')}>
                Login
              </button>
            </span>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideup {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideup { animation: slideup 0.4s cubic-bezier(.4,2,.6,1) both; }
      `}</style>
    </div>
  );
}
