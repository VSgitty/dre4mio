'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      router.push('/auth/verify?email=' + encodeURIComponent(email));
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-monopol-darker via-monopol-dark to-monopol-darker flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-monopol-darker/50 backdrop-blur-md border border-monopol-neon/20 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-monopol-neon">
            Join MONOPOL
          </h1>
          <p className="text-center text-gray-400 mb-8">Start creating cinematic content</p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-monopol-dark border border-monopol-neon/20 rounded-lg focus:outline-none focus:border-monopol-neon text-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-monopol-dark border border-monopol-neon/20 rounded-lg focus:outline-none focus:border-monopol-neon text-white"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-monopol-dark border border-monopol-neon/20 rounded-lg focus:outline-none focus:border-monopol-neon text-white"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-monopol-accent/50 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>

          <p className="text-center mt-6 text-gray-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-monopol-neon hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
