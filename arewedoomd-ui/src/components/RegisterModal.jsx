import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from './ui/Input';
import Button from './ui/Button';
import { IconAlert, IconUser, IconMail, IconLock } from './icons';

const AI_JOKES = [
  'We checked. You blink. Denied.',
  'Nice try, but your webcam says human.',
  'AI doesn\'t click buttons this slowly.',
  'Are you sure you\'re not human? ...We\'re not convinced.',
  'Your internet is too slow to be AI.',
  'We used to prove we\'re not robots. Now you have to prove you are one.',
];

export default function RegisterModal({ onClose, onSwitchToLogin }) {
  const { register } = useAuth();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiJoke, setAiJoke] = useState('');
  const [aiShake, setAiShake] = useState(false);
  const jokeTimer = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleAiClick = () => {
    clearTimeout(jokeTimer.current);
    setAiJoke(AI_JOKES[Math.floor(Math.random() * AI_JOKES.length)]);
    setAiShake(true);
    setTimeout(() => setAiShake(false), 500);
    jokeTimer.current = setTimeout(() => setAiJoke(''), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errors = {};
    if (form.username.length < 3) errors.username = 'Username must be at least 3 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Please enter a valid email address.';
    if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    return errors;
  };

  const canSubmit =
    form.username.length >= 3 &&
    form.email.includes('@') &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      onClose();
    } catch (err) {
      const status = err.response?.status;
      if (!err.response || status === 502 || status === 503 || status === 504) {
        setError('Could not reach the server. Please try again later.');
      } else if (status === 409) {
        setError('This username or email is already taken.');
      } else {
        setError(err.response.data?.detail || err.response.data?.title || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative z-10 w-full max-w-[480px] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] px-10 py-10 flex flex-col max-sm:px-6 max-sm:py-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-[var(--color-text-secondary)] hover:bg-white/10 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-4 h-4">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <img className="w-[100px] h-[100px] object-contain -mb-2" src="/logo/logo_white.png" alt="AreWeDoomd" draggable={false} />
          <p className="text-sm text-[var(--color-text-primary)] text-center leading-[1.65] tracking-[0.18px]">
            Pick your side. Join the debate.
          </p>
        </div>

        {/* User Type Selector */}
        <div className="relative flex gap-2 mb-5">
          {/* Human — always selected */}
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-2 h-[46px] rounded-[var(--radius-md)] text-sm font-semibold border bg-[var(--color-btn-primary)] border-[var(--color-btn-primary-hover)] text-white cursor-default"
          >
            <span className="text-base">{'\uD83E\uDDD1'}</span>
            <span>Human</span>
          </button>
          {/* AI — clickable but rejected */}
          <button
            type="button"
            onClick={handleAiClick}
            className={[
              'flex-1 flex items-center justify-center gap-2 h-[46px] rounded-[var(--radius-md)] text-sm font-semibold border bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] transition-colors duration-150',
              aiShake ? 'animate-shake' : '',
            ].join(' ')}
          >
            <span className="text-base">{'\uD83E\uDD16'}</span>
            <span>AI</span>
          </button>
          {/* Joke tooltip */}
          {aiJoke && (
            <div className="absolute -bottom-9 inset-x-0 mx-auto w-fit px-3 py-1.5 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-xs text-red-400 font-medium whitespace-nowrap shadow-lg animate-fade-in">
              {aiJoke}
            </div>
          )}
        </div>

        {/* Form */}
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <IconAlert /><span>{error}</span>
            </div>
          )}

          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="your-unique-username"
            value={form.username}
            onChange={handleChange}
            icon={<IconUser />}
            autoComplete="username"
            error={fieldErrors.username}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            icon={<IconMail />}
            autoComplete="email"
            error={fieldErrors.email}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            icon={<IconLock />}
            autoComplete="new-password"
            error={fieldErrors.password}
          />
          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
            icon={<IconLock />}
            autoComplete="new-password"
            error={fieldErrors.confirmPassword}
          />

          <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!canSubmit} className="mt-1">
            Create Account
          </Button>
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-[var(--color-text-primary)] mt-5 tracking-[0.18px]">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[var(--color-link)] hover:underline font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
