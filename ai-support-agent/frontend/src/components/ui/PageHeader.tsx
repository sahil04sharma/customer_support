interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: 'light' | 'dark';
}

export default function PageHeader({
  title,
  description,
  action,
  variant = 'light',
}: PageHeaderProps) {
  const titleClass = variant === 'dark' ? 'text-white' : 'text-ink-900';
  const descClass = variant === 'dark' ? 'text-ink-300' : 'text-ink-500';

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className={`text-lg font-semibold ${titleClass}`}>{title}</h1>
        {description && (
          <p className={`mt-0.5 max-w-xl text-sm ${descClass}`}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
