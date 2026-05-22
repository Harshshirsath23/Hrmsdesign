import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function safeFormatDate(dateVal: any, formatStr: string = "dd MMM yyyy"): string {
  if (!dateVal) return "N/A";
  try {
    const parsed = new Date(dateVal);
    if (isNaN(parsed.getTime())) {
      return "N/A";
    }
    return format(parsed, formatStr);
  } catch (error) {
    return "N/A";
  }
}
