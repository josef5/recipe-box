import React from "react";
import { cn } from "@/lib/utils";

export function FieldErrorMessage({
  text,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p"> & { text?: string }) {
  if (!text) return null;

  return (
    <p className={cn("text-danger text-xs", className)} {...props}>
      {text}
    </p>
  );
}
