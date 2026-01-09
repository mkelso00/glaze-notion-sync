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
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Gradient Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-screen pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-full blur-3xl opacity-60"></div>
      </div>
      <div className="absolute bottom-0 left-0 w-1/2 h-screen pointer-events-none overflow-hidden">
        <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200 via-purple-200 to-pink-200 rounded-full blur-3xl opacity-40"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-light tracking-[0.2em] text-black text-center mb-2">
            GLAZE
          </h1>
          <p className="text-gray-500 text-center mb-2">
            {clientName}
          </p>
          <p className="text-gray-400 text-center mb-8 text-sm">
            Enter your password to view the dashboard
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'View Dashboard'}
            </button>
          </form>
        </div>

        <p className="text-gray-400 text-sm text-center mt-6">
          Contact your project manager if you forgot your password.
        </p>
      </div>
    </div>
  );
}
