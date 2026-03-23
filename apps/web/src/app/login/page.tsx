'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ROLE_ROUTES: Record<string, string> = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  RECEPTIONIST: '/kiosk',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please enter your email and password.');
      setLoading(false);
      return;
    }

    try {
      // Authenticate against our PostgreSQL-backed API
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign in failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      const { user, token } = data;

      // Store session token and basic user info for subsequent API calls
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('sb_user_id', user.id);
        sessionStorage.setItem('sb_role', user.role);
        sessionStorage.setItem('sb_email', user.email);
        localStorage.setItem('user', JSON.stringify(user));
      }

      // Redirect based on role
      const route = ROLE_ROUTES[user.role];
      if (!route) {
        setError(`Unknown role "${user.role}". Contact your administrator.`);
        setLoading(false);
        return;
      }

      router.push(route);
    } catch (err) {
      setError('Network error — please check your connection.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center p-4">

      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-brand-50 rounded-full opacity-60 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-200">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="4" y="8" width="24" height="18" rx="3" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M10 17h12M16 11v12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SmartQ</h1>
          <p className="text-slate-500 text-sm mt-1">Hospital Queue Management</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Staff sign in</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900
                           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400
                           focus:border-transparent transition-all"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Patient? Visit the{' '}
            <a href="/kiosk" className="text-brand-600 hover:underline font-medium">kiosk terminal</a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          SmartQ v1.0 · Secured with Supabase Auth
        </p>
      </div>
    </div>
  );
}
