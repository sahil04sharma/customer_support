const variants = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  error: 'bg-red-50 text-red-700 ring-red-600/20',
  neutral: 'bg-zinc-100 text-zinc-600 ring-zinc-500/10',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
} as const;

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof variants;
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
