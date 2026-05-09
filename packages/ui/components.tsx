'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
}) {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClass} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
  className?: string;
}) {
  const variants = {
    default: 'bg-monopol-neon/20 text-monopol-neon',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
  };

  return (
    <span className={`inline-block px-3 py-1 text-sm rounded-full font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-monopol-darker border border-monopol-neon/20 rounded-lg p-6 max-w-md w-full mx-4"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Spinner() {
  return (
    <div className="w-8 h-8 border-4 border-monopol-neon/30 border-t-monopol-neon rounded-full animate-spin" />
  );
}

export const components = {
  Button,
  Card,
  Badge,
  Modal,
  Spinner,
};
