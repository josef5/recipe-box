import { TOAST_OPTIONS } from "@/constants/toast-options";
import { FlashToast } from "@/components/ui/flash-toast";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  pathname: "/",
  search: "",
  replace: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mockState.pathname,
  useRouter: () => ({
    replace: mockState.replace,
  }),
  useSearchParams: () => new URLSearchParams(mockState.search),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockState.success,
    error: mockState.error,
    info: mockState.info,
  },
}));

describe("FlashToast", () => {
  beforeEach(() => {
    mockState.pathname = "/";
    mockState.search = "";
    mockState.replace.mockReset();
    mockState.success.mockReset();
    mockState.error.mockReset();
    mockState.info.mockReset();
  });

  it("shows a success toast and removes the toast query param", async () => {
    mockState.pathname = "/recipes/chili";
    mockState.search = "toast=recipe-saved";

    render(
      <FlashToast
        configByValue={{
          "recipe-saved": { message: "Recipe saved.", variant: "success" },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockState.success).toHaveBeenCalledWith(
        "Recipe saved.",
        TOAST_OPTIONS.success,
      );
    });

    expect(mockState.replace).toHaveBeenCalledWith("/recipes/chili", {
      scroll: false,
    });
  });

  it("preserves other query params after cleaning the toast param", async () => {
    mockState.pathname = "/recipes";
    mockState.search = "toast=recipe-saved&view=mine";

    render(
      <FlashToast
        configByValue={{
          "recipe-saved": { message: "Recipe saved." },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockState.success).toHaveBeenCalledTimes(1);
    });

    expect(mockState.replace).toHaveBeenCalledWith("/recipes?view=mine", {
      scroll: false,
    });
  });

  it("shows an error toast when configured", async () => {
    mockState.pathname = "/recipes/new";
    mockState.search = "toast=recipe-error";

    render(
      <FlashToast
        configByValue={{
          "recipe-error": {
            message: "Could not save recipe.",
            variant: "error",
          },
        }}
      />,
    );

    await waitFor(() => {
      expect(mockState.error).toHaveBeenCalledWith(
        "Could not save recipe.",
        TOAST_OPTIONS.error,
      );
    });

    expect(mockState.replace).toHaveBeenCalledWith("/recipes/new", {
      scroll: false,
    });
  });

  it("does not show a toast when the value is unknown", async () => {
    mockState.pathname = "/recipes";
    mockState.search = "toast=unknown-value";

    render(<FlashToast configByValue={{}} />);

    await waitFor(() => {
      expect(mockState.replace).toHaveBeenCalledWith("/recipes", {
        scroll: false,
      });
    });

    expect(mockState.success).not.toHaveBeenCalled();
    expect(mockState.error).not.toHaveBeenCalled();
    expect(mockState.info).not.toHaveBeenCalled();
  });
});
