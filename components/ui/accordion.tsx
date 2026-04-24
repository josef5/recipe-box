"use client";

import React, {
  useState,
  useImperativeHandle,
  ComponentPropsWithoutRef,
} from "react";
import { cn } from "@/lib/utils";

export function Accordion({
  heading,
  headingNode,
  children,
  className,
  ref,
  ...props
}: {
  heading?: string;
  headingNode?: React.ReactNode;
  children: React.ReactNode;
} & ComponentPropsWithoutRef<"div"> &
  React.RefAttributes<{
    open: () => void;
    close: () => void;
  }>) {
  const [isOpen, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  }));

  return (
    <div className={cn("rounded-lg border p-4", className)} {...props}>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {headingNode ? (
          headingNode
        ) : heading ? (
          <h2 className="text-lg font-semibold">{heading}</h2>
        ) : null}
      </button>
      {isOpen && children}
    </div>
  );
}
