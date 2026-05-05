import { ReactNode } from 'react';

const variants = {
  critical: 'bg-red-500/15 text-red-400 border border-red-500/30',
  error: 'bg-red-500/10 text-red-400 border border-red-500/20',
  warning: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  info: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  default: 'bg-gray-700/50 text-gray-300 border border-gray-700',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
