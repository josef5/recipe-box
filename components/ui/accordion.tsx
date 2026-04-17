"use client";

import React, { useState, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";

export function Accordion({
  title,
  titleNode,
  children,
  className,
  ref,
}: {
  title?: string;
  titleNode?: React.ReactNode;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement> &
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
    <div className={cn("rounded-lg border p-4", className)}>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {titleNode ? (
          titleNode
        ) : title ? (
          <h2 className="text-lg font-semibold">{title}</h2>
        ) : null}
      </button>
      {isOpen && children}
    </div>
  );
}
