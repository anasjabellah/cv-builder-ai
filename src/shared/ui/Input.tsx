'use client';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-[#A1A1AA]">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-[#1A1A1A] border border-[#27272A] rounded-lg px-3 py-2 text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/50 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
