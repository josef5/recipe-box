import { createRecipe, updateRecipe } from "@/actions/recipes";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  safeParse: vi.fn(),
  requireCurrentUser: vi.fn(),
  getUserDisplayName: vi.fn(),
  userHasAdminRole: vi.fn(),
  generateSlug: vi.fn(),
  eq: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  destroyCloudinaryImage: vi.fn(),
  forbidden: vi.fn(),
}));

vi.mock("@/db", () => ({
  db: {
    query: {
      recipes: {
        findFirst: mocks.findFirst,
      },
    },
    insert: mocks.insert,
    update: mocks.update,
    delete: mocks.delete,
  },
}));

vi.mock("@/db/schema", () => ({
  ingredients: {
    name: "ingredients.name",
  },
  recipeIngredients: {
    recipeId: "recipeIngredients.recipeId",
  },
  recipes: {
    id: "recipes.id",
    title: "recipes.title",
    slug: "recipes.slug",
    userId: "recipes.userId",
  },
  steps: {
    recipeId: "steps.recipeId",
  },
}));

vi.mock("@/lib/auth/session", () => ({
  requireCurrentUser: mocks.requireCurrentUser,
  getUserDisplayName: mocks.getUserDisplayName,
  userHasAdminRole: mocks.userHasAdminRole,
}));

vi.mock("@/lib/cloudinary", () => ({
  destroyCloudinaryImage: mocks.destroyCloudinaryImage,
}));

vi.mock("@/lib/schemas/recipe", () => ({
  recipeSchema: {
    safeParse: mocks.safeParse,
  },
}));

vi.mock("@/lib/slug", () => ({
  generateSlug: mocks.generateSlug,
}));

vi.mock("drizzle-orm", () => ({
  eq: mocks.eq,
  desc: vi.fn(),
  ilike: vi.fn(),
  or: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

vi.mock("next/navigation", () => ({
  forbidden: mocks.forbidden,
}));

describe("recipe title uniqueness", () => {
  beforeEach(() => {
    mocks.findFirst.mockReset();
    mocks.insert.mockReset();
    mocks.update.mockReset();
    mocks.delete.mockReset();
    mocks.safeParse.mockReset();
    mocks.requireCurrentUser.mockReset();
    mocks.getUserDisplayName.mockReset();
    mocks.userHasAdminRole.mockReset();
    mocks.generateSlug.mockReset();
    mocks.eq.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.revalidateTag.mockReset();
    mocks.destroyCloudinaryImage.mockReset();
    mocks.forbidden.mockReset();

    mocks.eq.mockImplementation((column: string, value: string) => ({
      column,
      value,
    }));

    mocks.safeParse.mockReturnValue({
      success: true,
      data: {
        title: "Tomato Soup",
        description: "Classic",
        servings: 4,
        prepTimeMins: 10,
        cookTimeMins: 20,
        imageUrl: "",
        imagePublicId: "",
        ingredients: [{ name: "Tomato", amount: "2", unit: "pcs", notes: "" }],
        steps: [{ instruction: "Cook", stepNumber: 1 }],
      },
    });

    mocks.requireCurrentUser.mockResolvedValue({
      id: "user-1",
      name: "Chef",
      email: "chef@example.com",
    });

    mocks.userHasAdminRole.mockReturnValue(false);
  });

  it("createRecipe returns duplicate error and skips insert when title already exists", async () => {
    mocks.findFirst.mockResolvedValue({ id: "recipe-1", title: "Tomato Soup" });

    const result = await createRecipe({
      title: "Tomato Soup",
      description: "Classic",
      servings: 4,
      prepTimeMins: 10,
      cookTimeMins: 20,
      imageUrl: "",
      imagePublicId: "",
      ingredients: [{ name: "Tomato", amount: "2", unit: "pcs", notes: "" }],
      steps: [{ instruction: "Cook", stepNumber: 1 }],
    });

    expect(result).toEqual({
      ok: false,
      error: "A recipe with that title already exists.",
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("updateRecipe returns duplicate error and skips update when new title already exists", async () => {
    mocks.safeParse.mockReturnValue({
      success: true,
      data: {
        title: "New Name",
        description: "Updated",
        servings: 4,
        prepTimeMins: 10,
        cookTimeMins: 20,
        imageUrl: "",
        imagePublicId: "",
        ingredients: [{ name: "Tomato", amount: "2", unit: "pcs", notes: "" }],
        steps: [{ instruction: "Cook", stepNumber: 1 }],
      },
    });

    mocks.findFirst
      .mockResolvedValueOnce({
        id: "recipe-owned",
        userId: "user-1",
        slug: "old-slug",
        title: "Old Name",
        imagePublicId: null,
      })
      .mockResolvedValueOnce({
        id: "recipe-other",
        title: "New Name",
      });

    const result = await updateRecipe("recipe-owned", {
      title: "New Name",
      description: "Updated",
      servings: 4,
      prepTimeMins: 10,
      cookTimeMins: 20,
      imageUrl: "",
      imagePublicId: "",
      ingredients: [{ name: "Tomato", amount: "2", unit: "pcs", notes: "" }],
      steps: [{ instruction: "Cook", stepNumber: 1 }],
    });

    expect(result).toEqual({
      ok: false,
      error: "A recipe with that title already exists.",
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
