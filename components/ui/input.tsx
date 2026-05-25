import React from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: React.ComponentPropsWithRef<"input">) {
  return (
    <input
      className={cn("bg-input rounded-md px-3 py-2 text-sm", className)}
      {...props}
    />
  );
}
