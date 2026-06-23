import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatStableDate(
  dateValue: Date | string | number | undefined | null,
): string {
  if (!dateValue) {
    return "Unknown";
  }

  const parsedDate =
    dateValue instanceof Date ? dateValue : new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown";
  }

  return parsedDate.toISOString().slice(0, 10);
}
