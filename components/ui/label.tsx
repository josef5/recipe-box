import React from "react";
import { cn } from "@/lib/utils";

export function Label({
  text,
  htmlFor,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"label"> & { text?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("text-sm font-medium", className)}
      {...props}
    >
      {text ?? children}
    </label>
  );
}
