import React from "react";
import { cn } from "@/lib/utils";

export default function Sidebar({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"aside">) {
  return (
    <aside
      className={cn(
        "row-start-2 flex flex-col gap-2 sm:col-start-2 sm:row-start-2",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}
