const variants = {
  success: 'bg-accent-50 text-accent-800 ring-accent-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  error: 'bg-red-50 text-red-800 ring-red-200',
  neutral: 'bg-ink-50 text-ink-600 ring-ink-200',
  info: 'bg-blue-50 text-blue-700 ring-blue-200',
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
