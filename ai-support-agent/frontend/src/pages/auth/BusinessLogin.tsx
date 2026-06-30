import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function BusinessLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/api/auth/business/login', { email, password });
      setAuth(data.accessToken, data.refreshToken, {
        id: data.business.id,
        name: data.business.name,
        email: data.business.email,
        role: 'BUSINESS',
        businessId: data.business.id,
      });
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Business Login</h1>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-6"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Log in
        </button>
        <p className="text-sm text-slate-500 mt-4 text-center">
          No account? <Link to="/register" className="text-blue-600">Register</Link>
        </p>
        <p className="text-sm text-slate-500 mt-2 text-center">
          <Link to="/agent" className="text-blue-600">Agent login</Link>
        </p>
      </form>
    </div>
  );
}
