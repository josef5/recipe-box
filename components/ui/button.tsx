"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const buttonVariants = cva(
  "px-4 py-2 rounded-md font-bold cursor-pointer items-center justify-center text-center text-sm disabled:cursor-default disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-surface",
        secondary: "text-foreground border",
        danger: "border border-danger text-danger",
        "danger-secondary": "text-danger border border-danger",
        ghost: "bg-transparent text-foreground border-none",
      },
    },
    defaultVariants: { variant: "primary" },
  },
);

export function Button({
  label,
  href,
  variant,
  className,
  ...props
}: {
  label?: string;
  href?: string;
  variant?: "primary" | "secondary" | "danger" | "danger-secondary" | "ghost";
} & VariantProps<typeof buttonVariants> &
  React.ComponentPropsWithoutRef<"a"> &
  React.ComponentPropsWithoutRef<"button">) {
  if (!href) {
    return (
      <button className={cn(buttonVariants({ variant }), className)} {...props}>
        {label ?? props.children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    >
      {label ?? props.children}
    </Link>
  );
}
