import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function BusinessRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeDataProcessing, setAgreeDataProcessing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const canSubmit = agreeTerms && agreePrivacy && agreeDataProcessing;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      setError('Please accept all required agreements to create an account.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/business/register', {
        name,
        email,
        password,
      });
      setAuth(data.accessToken, data.refreshToken, {
        id: data.business.id,
        name: data.business.name,
        email: data.business.email,
        role: 'BUSINESS',
        businessId: data.business.id,
      });
      navigate('/dashboard');
    } catch {
      setError('Could not create account. This email may already be registered.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start supporting customers with AI in minutes">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="alert-error">{error}</div>}
        <div>
          <label htmlFor="name" className="label">Company name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Acme Inc."
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="label">Work email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@company.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="At least 8 characters"
            minLength={8}
            required
          />
        </div>

        <fieldset className="space-y-3 rounded-lg border border-ink-200 bg-ink-50/40 p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wider text-ink-500">
            Required agreements
          </legend>
          <label className="flex cursor-pointer gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-ink-300"
            />
            <span>
              I agree to the{' '}
              <Link to="/terms" target="_blank" className="font-medium text-accent-700 hover:underline">
                Terms of Service
              </Link>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-0.5 rounded border-ink-300"
            />
            <span>
              I have read the{' '}
              <Link to="/privacy" target="_blank" className="font-medium text-accent-700 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </label>
          <label className="flex cursor-pointer gap-3 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={agreeDataProcessing}
              onChange={(e) => setAgreeDataProcessing(e.target.checked)}
              className="mt-0.5 rounded border-ink-300"
            />
            <span>
              I understand how customer chat data is processed when I embed the widget (
              <Link to="/data" target="_blank" className="font-medium text-accent-700 hover:underline">
                data & consent
              </Link>
              )
            </span>
          </label>
        </fieldset>

        <button type="submit" disabled={loading || !canSubmit} className="btn-primary w-full">
          {loading ? 'Creating account…' : 'Create account'}
        </button>
        <p className="text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-ink-900 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
