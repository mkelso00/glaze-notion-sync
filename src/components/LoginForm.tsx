'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginFormProps {
  clientName: string;
  onSuccess: () => void;
}

export function LoginForm({ clientName, onSuccess }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, password }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'Invalid password');
      }
    } catch {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-zinc-900" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            {clientName}
          </h1>
          <p className="text-zinc-400 text-center mb-8">
            Enter your password to view the dashboard
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm text-zinc-400 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-500 text-zinc-900 font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'View Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-zinc-500 text-sm text-center mt-6">
          Contact your project manager if you forgot your password.
        </p>
      </div>
    </div>
  );
}
