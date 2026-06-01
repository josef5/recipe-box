"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";

const buttonVariants = cva(
  "rounded-md cursor-pointer items-center justify-center text-center text-sm disabled:cursor-default disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-foreground text-surface",
        secondary: "text-foreground border",
        destructive: "bg-danger text-surface",
        "destructive-secondary": "border border-danger text-danger",
        ghost: "bg-transparent text-foreground border-none",
      },
      size: {
        sm: "px-2 py-1.5 text-xs font-normal",
        md: "px-4 py-2 text-sm font-bold",
        lg: "px-5 py-3 text-base font-bold",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  label,
  href,
  variant,
  size,
  className,
  ...props
}: {
  label?: string;
  href?: string;
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "destructive-secondary"
    | "ghost";
  size?: "sm" | "md" | "lg";
} & VariantProps<typeof buttonVariants> &
  React.ComponentPropsWithoutRef<"a"> &
  React.ComponentPropsWithoutRef<"button">) {
  if (!href) {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {label ?? props.children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {label ?? props.children}
    </Link>
  );
}
