import { navigateBackOrFallback } from "@/components/history-back-button";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("navigateBackOrFallback", () => {
  const router = {
    back: vi.fn(),
    push: vi.fn(),
  };

  beforeEach(() => {
    router.back.mockReset();
    router.push.mockReset();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "",
    });
  });

  it("goes back when the referrer is same-origin and history is available", () => {
    window.history.pushState({}, "", "/recipes/new");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "http://localhost/recipes",
    });

    navigateBackOrFallback(router, "/recipes");

    expect(router.back).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
  });

  it("pushes the fallback when the referrer is external", () => {
    window.history.pushState({}, "", "/recipes/new");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/recipes",
    });

    navigateBackOrFallback(router, "/recipes");

    expect(router.back).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/recipes");
  });

  it("pushes the fallback when there is no referrer", () => {
    navigateBackOrFallback(router, "/recipes");

    expect(router.back).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/recipes");
  });
});
