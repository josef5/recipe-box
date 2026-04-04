import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import {
  createElement,
  type AnchorHTMLAttributes,
  type ReactNode,
} from "react";
import { afterEach, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    scroll: _scroll,
    replace: _replace,
    prefetch: _prefetch,
    shallow: _shallow,
    locale: _locale,
    onNavigate: _onNavigate,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string | { pathname?: string };
    children: ReactNode;
    scroll?: boolean;
    replace?: boolean;
    prefetch?: boolean | null;
    shallow?: boolean;
    locale?: string | false;
    onNavigate?: unknown;
  }) =>
    createElement(
      "a",
      {
        href: typeof href === "string" ? href : href.pathname ?? "",
        ...props,
      },
      children,
    ),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
