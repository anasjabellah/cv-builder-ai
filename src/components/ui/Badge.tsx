'use client';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'red' | 'gray';
  className?: string;
}

const colorClasses = {
  purple: 'bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/30',
  blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  green: 'bg-green-500/20 text-green-300 border-green-500/30',
  red: 'bg-red-500/20 text-red-300 border-red-500/30',
  gray: 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46]',
};

export default function Badge({
  children,
  color = 'purple',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
}
