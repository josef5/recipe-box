export type User = {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  email: string;
  emailVerified?: boolean;
  name: string;
  image?: string | null | undefined;
  role?: string | string[];
};

export type Recipe = {
  id: string;
  userId: string | null;
  slug: string;
  title: string;
  ownerDisplayName?: string | null;
  description?: string | null;
  servings?: number | null;
  prepTimeMins?: number | null;
  cookTimeMins?: number | null;
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  isPublic?: boolean | null;
  authorId?: string | null;
  /**
   * List of ingredients for this recipe, always an array (never null/undefined).
   * Each RecipeIngredient includes quantity, unit, notes, and a reference to the canonical Ingredient.
   */
  recipeIngredients: RecipeIngredient[];
  /**
   * List of steps for this recipe, always an array (never null/undefined).
   */
  steps: Step[];
};

/**
 * Ingredient: Global/canonical ingredient (e.g., "flour").
 * Used for suggestions and normalization. Does not include quantity/unit.
 */
export type Ingredient = {
  id: string;
  name: string;
  defaultUnit?: string | null;
};

/**
 * RecipeIngredient: Per-recipe usage of an ingredient, includes quantity/unit/notes and reference to Ingredient.
 */
export type RecipeIngredient = {
  id: string;
  amount: string | null;
  unit: string | null;
  notes: string | null;
  ingredient: {
    name: string;
  };
};

export type Step = {
  id: string;
  recipeId: string;
  instruction: string;
  stepNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
};
