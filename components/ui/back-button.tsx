"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "./button";

type RouterLike = {
  back: () => void;
  push: (href: string) => void;
};

export function navigateBackOrFallback(
  router: RouterLike,
  fallbackHref: string,
) {
  if (typeof window === "undefined") {
    router.push(fallbackHref);
    return;
  }

  const sameOriginReferrer =
    document.referrer.length > 0 &&
    document.referrer.startsWith(window.location.origin);

  if (sameOriginReferrer && window.history.length > 1) {
    router.back();
    return;
  }

  router.push(fallbackHref);
}

export function BackButton({
  fallbackHref,
  className,
  children,
  ...props
}: {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
} & React.ComponentProps<typeof Button>) {
  const router = useRouter();

  return (
    <Button
      onClick={() => navigateBackOrFallback(router, fallbackHref)}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}
