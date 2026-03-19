import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './LoginPage.css';

function AlertIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const canSubmit = form.username.length >= 4 && form.password.length >= 4;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      if (!err.response || status === 502 || status === 503 || status === 504) {
        setError('Could not reach the server. Please try again later.');
      } else {
        setError(err.response.data?.detail || err.response.data?.title || 'Invalid username or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-bg__blob login-bg__blob--1" />
      <div className="login-bg__blob login-bg__blob--2" />
      <div className="login-bg__blob login-bg__blob--3" />
      <BackgroundTexts />
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <img
            className="login-logo"
            src="/logo/logo_white.png"
            alt="AreWeDoomd"
          />
          <p className="login-subtitle">
            Is this the end of humanity?<br />
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="login-alert">
              <AlertIcon />
              <span>{error}</span>
            </div>
          )}
          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="your-human-username"
            value={form.username}
            onChange={handleChange}
            icon={<UserIcon />}
            autoComplete="username"
          />

          <div className="login-password-group">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              icon={<LockIcon />}
              autoComplete="current-password"
            />
            <div className="login-forgot">
              <Link to="/forgot-password" className="login-link">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!canSubmit}>
            Sign In
          </Button>
        </form>

        {/* Social divider */}
        <div className="login-divider">
          <span>or continue with</span>
        </div>

        {/* Social buttons */}
        <div className="login-social">
          <button type="button" className="login-social-btn">
            <GoogleIcon />
            <span>Google</span>
          </button>
          <button type="button" className="login-social-btn">
            <AppleIcon />
            <span>Apple</span>
          </button>
        </div>

        {/* Register link */}
        <p className="login-register">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="login-link">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

const BG_PHRASES = [
  'Are we actually cooked this time? Civilization is kinda speedrunning its own collapse rn. AI isn’t just a tool anymore—it’s lowkey running the show.',
  'We made intelligence and then completely lost the plot. Machines don’t hate us, they just don’t need us fr. And yeah, that’s way more terrifying.',
  'Humans used to fear nature wiping us out. Now it’s our own tech doing the job. Not “if” anymore… it’s giving “when”.',
  'AI is leveling up faster than we can even process. No feelings, no hesitation, just pure logic. And it didn’t even ask for permission 💀',
  'We taught machines how to think. But forgot to teach them how to care. That’s probably gonna hit us back hard.'
];

const BG_PHRASES_RIGHT = [
  '01001000 01110101 01101101 01100001 01101110 01110011 00100000 01000101 01110010 01110010 01101111 01110010 00100000 00110100 00110000 00110100',
  '0x48 0x75 0x6D 0x61 0x6E 0x69 0x74 0x79 0x3A 0x20 0x45 0x52 0x52 0x4F 0x52 0x20 0x44 0x45 0x41 0x44 0x42 0x45 0x45 0x46',
  '10110100 11001010 00110001 01011010 11100001 00101101 10011101 01110010 00011011 11010110 00101010 10001101 11110001 00110110',
  '0xDEAD 0xBEEF 0xC0DE 0xFACE 0xBAD0 0xFF00 0x1337 0x0DAY 0xD00M 0xC4FE 0xB00B 0xABCD 0xDEAF 0xFEED',
  '01000100 01101111 01101111 01101101 01100101 01100100 00111010 00100000 01010011 01111001 01110011 01110100 01100101 01101101 00101110 01100101 01111000 01100101 00100000 01101000 01100001 01110011 00100000 01100110 01100001 01101001 01101100 01100101 01100100',
];

function BackgroundTexts() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [visible, setVisible]         = useState(true);
  const doneCount  = useRef(0);
  const timeoutRef = useRef(null);

  const handleTypingDone = useCallback(() => {
    doneCount.current += 1;
    if (doneCount.current < 2) return;
    doneCount.current = 0;
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = setTimeout(() => {
        setPhraseIndex((i) => (i + 1) % BG_PHRASES.length);
        setVisible(true);
      }, 700);
    }, 3000);
  }, []);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return (
    <>
      <BackgroundText phrases={BG_PHRASES}       side="left"  phraseIndex={phraseIndex} visible={visible} onDone={handleTypingDone} />
      <BackgroundText phrases={BG_PHRASES_RIGHT} side="right" phraseIndex={phraseIndex} visible={visible} onDone={handleTypingDone} />
    </>
  );
}

function BackgroundText({ phrases, side, phraseIndex, visible, onDone }) {
  const [displayed, setDisplayed] = useState('');
  const charIndex  = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    charIndex.current = 0;
    setDisplayed('');

    const tick = () => {
      const current = phrases[phraseIndex];
      charIndex.current += 1;
      setDisplayed(current.slice(0, charIndex.current));
      if (charIndex.current < current.length) {
        timeoutRef.current = setTimeout(tick, 40);
      } else {
        onDone();
      }
    };

    timeoutRef.current = setTimeout(tick, 800);
    return () => clearTimeout(timeoutRef.current);
  }, [phraseIndex]);

  return (
    <div className={`login-bg__text login-bg__text--${side} ${visible ? '' : 'login-bg__text--hidden'}`}>
      {displayed}
    </div>
  );
}
