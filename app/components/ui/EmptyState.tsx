import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-16 ${className}`}
    >
      {icon && (
        <div className="mb-5 w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-400">
          {icon}
        </div>
      )}
      <h3 className="font-display text-[19px] sm:text-[21px] text-ink-800 tracking-[-0.02em] leading-[1.4] mb-2.5 max-w-[420px] break-keep">
        {title}
      </h3>
      {description && (
        <p className="text-[13.5px] text-ink-500 leading-[1.7] max-w-[400px] mb-6 break-keep">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
