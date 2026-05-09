'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
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
            Welcome Back
          </h1>
          <p className="text-center text-gray-400 mb-8">Sign in to MONOPOL STUDIO</p>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
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
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 bg-gradient-to-r from-monopol-accent to-monopol-neon text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-monopol-accent/50 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-monopol-neon/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-monopol-darker text-gray-400">Or continue with</span>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-2 border border-monopol-neon/20 text-monopol-neon font-semibold rounded-lg hover:bg-monopol-neon/10 transition-all duration-300"
          >
            Google
          </motion.button>

          <p className="text-center mt-6 text-gray-400">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-monopol-neon hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </main>
  );
}
