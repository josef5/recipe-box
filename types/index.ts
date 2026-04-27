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
  recipeIngredients?: RecipeIngredient[];
  steps?: Step[];
};

export type Ingredient = {
  id: string;
  amount: string | null;
  unit: string | null;
  notes: string | null;
  ingredient: {
    name: string;
  };
};

export type RecipeIngredient = {
  id: string;
  amount: string | null;
  unit: string | null;
  notes: string | null;
  ingredient: {
    name: string;
  };
};

/* export type RecipeIngredient = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  recipeId: string;
  ingredientId: string;
  amount?: number | null;
  unit?: string | null;
  notes?: string | null;
}; */

export type Step = {
  id: string;
  recipeId: string;
  instruction: string;
  stepNumber: number;
  createdAt?: Date;
  updatedAt?: Date;
};
