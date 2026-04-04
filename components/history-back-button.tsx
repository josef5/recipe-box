"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

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

export function HistoryBackButton({
  fallbackHref,
  className,
  children,
}: {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => navigateBackOrFallback(router, fallbackHref)}
      className={className}
    >
      {children}
    </button>
  );
}
