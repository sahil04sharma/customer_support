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
  const titleClass = variant === 'dark' ? 'text-white' : 'text-zinc-900';
  const descClass = variant === 'dark' ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className={`text-2xl font-semibold tracking-tight ${titleClass}`}>{title}</h1>
        {description && (
          <p className={`mt-1.5 max-w-2xl text-sm leading-relaxed ${descClass}`}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
