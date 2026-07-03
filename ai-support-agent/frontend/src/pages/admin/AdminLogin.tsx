import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { adminApi } from '../../lib/adminApi';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAdminAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await adminApi.post('/api/admin/login', { email, password });
      setAuth(data.accessToken, data.refreshToken, {
        id: data.admin.id,
        name: data.admin.name,
        email: data.admin.email,
        role: 'ADMIN',
      });
      navigate('/admin');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <div className="hidden w-1/2 flex-col justify-between border-r border-zinc-800 p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
            <Shield className="h-5 w-5 text-violet-400" />
          </div>
          <span className="text-lg font-semibold text-white">SupportDesk Admin</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Platform operator console
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400">
            Monitor every business, track AI usage and cost, and manage tenant accounts across the
            platform.
          </p>
        </div>
        <p className="text-sm text-zinc-600">Authorized personnel only</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-violet-400" />
              <span className="font-semibold text-white">Admin</span>
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Sign in</h1>
          <p className="mt-2 text-sm text-zinc-400">Platform super-admin access</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-red-900/50 bg-red-950/50 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}
            <div>
              <label className="label text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field border-zinc-700 bg-zinc-900 text-white"
                required
              />
            </div>
            <div>
              <label className="label text-zinc-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field border-zinc-700 bg-zinc-900 text-white"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-violet-600 hover:bg-violet-700"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            <Link to="/login" className="text-zinc-400 hover:text-white">
              Business dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
