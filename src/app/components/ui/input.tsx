import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 dark:text-white dark:placeholder:text-muted-foreground border-input dark:border-slate-700 flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base bg-input-background dark:bg-slate-900 transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring dark:focus-visible:border-slate-500 focus-visible:ring-ring/50 dark:focus-visible:ring-slate-500/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-red-600",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
