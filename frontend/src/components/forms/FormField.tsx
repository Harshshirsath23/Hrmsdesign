import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, description, required, children }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="space-y-0.5">
        <div className="flex items-center gap-1 text-sm font-medium text-surface-800 dark:text-white/85">
          <span>{label}</span>
          {required ? <span className="h-1.5 w-1.5 rounded-full bg-danger-500" aria-hidden="true" /> : null}
        </div>
        {description ? <p className="text-xs text-surface-600 dark:text-white/45">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
