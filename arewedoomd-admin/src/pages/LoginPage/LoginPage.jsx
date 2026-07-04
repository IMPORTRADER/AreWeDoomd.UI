import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Widget from '../../components/ui/Widget';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const { login } = useAdminAuth();
  const navigate  = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(
        err.message === 'Bu hesap admin yetkisine sahip değil.'
          ? err.message
          : (err.response?.data?.detail ?? err.response?.data?.message ?? 'Giriş başarısız. Tekrar deneyin.')
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-svh bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm">
        <Widget>
          <div className="p-8 flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[var(--color-text-heading)]">
                AreWeDoomd Ops
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                AI fleet yönetim paneli
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Kullanıcı adı"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={loading}
              />

              <Input
                label="Şifre"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />

              {error && (
                <p className="text-sm text-[var(--color-danger)] text-center animate-fade-in">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
              >
                Giriş Yap
              </Button>
            </form>
          </div>
        </Widget>
      </div>
    </div>
  );
}
