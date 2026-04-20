import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import {
  createElement,
  type AnchorHTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import { afterEach, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string } | URL;
    children: ReactNode;
  }) => {
    const resolvedHref =
      typeof href === "string"
        ? href
        : ((href as { pathname?: string } | null | undefined)?.pathname ?? "");

    return createElement(
      "a",
      {
        href: resolvedHref,
        ...props,
      },
      children,
    );
  },
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    unoptimized: _unoptimized,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    src: string | { src: string };
    alt: string;
    unoptimized?: boolean;
  }) => {
    void _unoptimized;

    return createElement("img", {
      src: typeof src === "string" ? src : src.src,
      alt,
      ...props,
    });
  },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
