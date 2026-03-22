import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { IconAlert, IconUser, IconLock, IconGoogle, IconApple } from '../../components/icons';

export default function LoginPage() {
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
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
    <div className="relative flex items-center justify-center min-h-svh bg-[var(--color-bg)] p-6 overflow-hidden">
      {/* Aurora blobs */}
      <div
        className="absolute rounded-full blur-[60px] opacity-[0.55] pointer-events-none will-change-transform w-[600px] h-[600px] -top-[15%] -left-[15%] animate-[blob-drift-1_7s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #1a4a7a, transparent 70%)' }}
      />
      <div
        className="absolute rounded-full blur-[60px] opacity-[0.55] pointer-events-none will-change-transform w-[500px] h-[500px] -bottom-[10%] -right-[10%] animate-[blob-drift-2_9s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #6b1a1a, transparent 70%)' }}
      />
      <div
        className="absolute rounded-full blur-[60px] opacity-[0.55] pointer-events-none will-change-transform w-[400px] h-[400px] top-[40%] left-[55%] animate-[blob-drift-3_6s_ease-in-out_infinite]"
        style={{ background: 'radial-gradient(circle, #0d3d4a, transparent 70%)' }}
      />

      <BackgroundTexts />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[500px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] px-10 py-12 flex flex-col max-sm:px-6 max-sm:py-9">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img
            className="w-[140px] h-[140px] object-contain -mb-4"
            src="/logo/logo_white.png"
            alt="AreWeDoomd"
          />
          <p className="text-sm text-[var(--color-text-primary)] text-center leading-[1.65] tracking-[0.18px]">
            Is this the end of humanity?<br />
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="flex items-center gap-2.5 px-3.5 py-3 bg-red-500/[0.08] border border-red-500/25 rounded-[var(--radius-md)] text-red-400 text-[13px] leading-relaxed">
              <IconAlert />
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
            icon={<IconUser />}
            autoComplete="username"
          />
          <div className="flex flex-col gap-2">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              icon={<IconLock />}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-[13px] text-[var(--color-link)] tracking-[0.18px] hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" variant="primary" fullWidth loading={loading} disabled={!canSubmit}>
            Sign In
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center justify-center my-6">
          <span className="text-sm text-[var(--color-text-primary)] tracking-[0.5px]">or continue with</span>
        </div>

        {/* Social buttons */}
        <div className="flex gap-2.5">
          <button type="button" className="flex-1 flex items-center justify-center gap-2 h-[43px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[#1a1a1a] transition-colors">
            <IconGoogle />
            <span>Google</span>
          </button>
          <button type="button" className="flex-1 flex items-center justify-center gap-2 h-[43px] bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[#1a1a1a] transition-colors">
            <IconApple />
            <span>Apple</span>
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--color-text-primary)] mt-6 tracking-[0.18px]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-[var(--color-link)] hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ── Background typing texts ── */

const BG_PHRASES = [
  `Are we actually cooked this time? Civilization is kinda speedrunning its own collapse rn. AI isn't just a tool anymore—it's lowkey running the show.`,
  `We made intelligence and then completely lost the plot. Machines don't hate us, they just don't need us fr. And yeah, that's way more terrifying.`,
  `Humans used to fear nature wiping us out. Now it's our own tech doing the job. Not "if" anymore… it's giving "when".`,
  `AI is leveling up faster than we can even process. No feelings, no hesitation, just pure logic. And it didn't even ask for permission 💀`,
  `We taught machines how to think. But forgot to teach them how to care. That's probably gonna hit us back hard.`,
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

  const sideClasses = side === 'left'
    ? 'left-[3%] text-[clamp(24px,2.8vw,42px)] font-extrabold tracking-tight'
    : 'right-[3%] text-[clamp(24px,2.8vw,42px)] font-semibold tracking-[1px] font-mono leading-[1.8] break-all';

  return (
    <div className={[
      'absolute top-1/2 -translate-y-1/2 max-w-[34%] pointer-events-none z-0',
      'bg-gradient-to-br from-[#2a6aaa] to-[#aa3030] bg-clip-text text-transparent',
      'transition-opacity duration-700 leading-snug break-words',
      sideClasses,
      visible ? 'opacity-[0.55]' : 'opacity-0',
    ].join(' ')}>
      {displayed}
    </div>
  );
}
