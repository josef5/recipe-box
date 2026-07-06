import { getCloudinarySignature } from "@/actions/image-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import type { RecipeInput } from "@/lib/schemas/recipe";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/actions/image-upload", () => ({
  getCloudinarySignature: vi.fn(),
}));

const SUCCESS_IMAGE_URL =
  "https://res.cloudinary.com/demo/image/upload/v1/recipe.jpg";
const SUCCESS_IMAGE_PUBLIC_ID = "recipe-box/user-1/recipe";

// Creates a full set of defaults so react-hook-form control always has valid shape.
function createDefaultValues(overrides?: Partial<RecipeInput>): RecipeInput {
  return {
    title: "",
    description: "",
    servings: undefined,
    prepTimeMins: undefined,
    cookTimeMins: undefined,
    imageUrl: "",
    imagePublicId: "",
    ingredients: [{ name: "Sugar", amount: "1", unit: "cup", notes: "" }],
    steps: [{ instruction: "Mix.", stepNumber: 1 }],
    ...overrides,
  };
}

// Hosts ImageUpload inside a real form context.
function ImageUploadHarness({
  defaultValues,
}: {
  defaultValues?: Partial<RecipeInput>;
}) {
  const form = useForm<RecipeInput>({
    defaultValues: createDefaultValues(defaultValues),
  });

  return <ImageUpload control={form.control} />;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ImageUpload", () => {
  it("removes image preview and clears values when remove image is clicked", () => {
    const { container } = render(
      <ImageUploadHarness
        defaultValues={{
          imageUrl: SUCCESS_IMAGE_URL,
          imagePublicId: SUCCESS_IMAGE_PUBLIC_ID,
        }}
      />,
    );

    const imageUrlInput = screen.getByLabelText(
      "Image URL",
    ) as HTMLInputElement;
    const imagePublicIdInput = container.querySelector(
      'input[name="imagePublicId"]',
    ) as HTMLInputElement;

    expect(screen.getByAltText("Preview")).toHaveAttribute(
      "src",
      SUCCESS_IMAGE_URL,
    );
    expect(imageUrlInput.value).toBe(SUCCESS_IMAGE_URL);
    expect(imagePublicIdInput.value).toBe(SUCCESS_IMAGE_PUBLIC_ID);

    fireEvent.click(screen.getByRole("button", { name: "Remove image" }));

    expect(screen.queryByAltText("Preview")).toBeNull();
    expect(imageUrlInput.value).toBe("");
    expect(imagePublicIdInput.value).toBe("");
  });

  it("uploads selected file and populates image URL and public ID", async () => {
    vi.mocked(getCloudinarySignature).mockResolvedValue({
      ok: true,
      data: {
        cloudName: "demo",
        apiKey: "test-key",
        folder: "recipe-box/user-1",
        timestamp: 123,
        signature: "signed",
      },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        secure_url: SUCCESS_IMAGE_URL,
        public_id: SUCCESS_IMAGE_PUBLIC_ID,
      }),
    } as Response);

    const { container } = render(<ImageUploadHarness />);

    const fileInput = screen.getByLabelText(
      "Select image file",
    ) as HTMLInputElement;
    const imageUrlInput = screen.getByLabelText(
      "Image URL",
    ) as HTMLInputElement;
    const imagePublicIdInput = container.querySelector(
      'input[name="imagePublicId"]',
    ) as HTMLInputElement;
    const uploadButton = screen.getByRole("button", { name: "Upload image" });
    const file = new File(["binary"], "recipe.jpg", { type: "image/jpeg" });

    expect(uploadButton).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(uploadButton).toBeEnabled();

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(getCloudinarySignature).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.cloudinary.com/v1_1/demo/image/upload",
      expect.objectContaining({ method: "POST" }),
    );

    await waitFor(() => {
      expect(imageUrlInput.value).toBe(SUCCESS_IMAGE_URL);
      expect(imagePublicIdInput.value).toBe(SUCCESS_IMAGE_PUBLIC_ID);
    });

    expect(screen.getByAltText("Preview")).toHaveAttribute(
      "src",
      SUCCESS_IMAGE_URL,
    );

    await waitFor(() => {
      expect(uploadButton).toBeDisabled();
      expect(uploadButton).toHaveTextContent("Upload image");
    });
  });

  it("shows action error and avoids upload request when signature fails", async () => {
    vi.mocked(getCloudinarySignature).mockResolvedValue({
      ok: false,
      error: "Cloudinary is not configured.",
    });

    const fetchSpy = vi.spyOn(global, "fetch");

    render(<ImageUploadHarness />);

    const fileInput = screen.getByLabelText(
      "Select image file",
    ) as HTMLInputElement;
    const uploadButton = screen.getByRole("button", { name: "Upload image" });

    fireEvent.change(fileInput, {
      target: {
        files: [new File(["binary"], "recipe.jpg", { type: "image/jpeg" })],
      },
    });

    fireEvent.click(uploadButton);

    expect(
      await screen.findByText("Cloudinary is not configured."),
    ).toBeVisible();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("shows upload API error and clears error when choosing another file", async () => {
    vi.mocked(getCloudinarySignature).mockResolvedValue({
      ok: true,
      data: {
        cloudName: "demo",
        apiKey: "test-key",
        folder: "recipe-box/user-1",
        timestamp: 123,
        signature: "signed",
      },
    });

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { message: "File too large" },
      }),
    } as Response);

    render(<ImageUploadHarness />);

    const fileInput = screen.getByLabelText(
      "Select image file",
    ) as HTMLInputElement;
    const uploadButton = screen.getByRole("button", { name: "Upload image" });

    fireEvent.change(fileInput, {
      target: {
        files: [new File(["binary"], "large.jpg", { type: "image/jpeg" })],
      },
    });

    fireEvent.click(uploadButton);

    expect(await screen.findByText("File too large")).toBeVisible();

    fireEvent.change(fileInput, {
      target: {
        files: [new File(["binary"], "small.jpg", { type: "image/jpeg" })],
      },
    });

    await waitFor(() => {
      expect(screen.queryByText("File too large")).toBeNull();
    });
  });
});
