"use client";

import { RecipeOutput } from "@/lib/schemas/recipe";
import { Ingredient } from "@/types";
import React from "react";
import { Header } from "./header";
import { RecipeForm } from "./recipe-form";
import { Sidebar } from "./sidebar";
import { BackButton } from "./ui/back-button";
import { Button } from "./ui/button";
import { DeleteRecipeButton } from "./ui/delete-recipe-button";

export function RecipeFormPageContent({
  title,
  description,
  recipeId,
  initialValues,
  ingredientSuggestions,
}: {
  title: string;
  description: string;
  recipeId?: string;
  initialValues?: RecipeOutput;
  ingredientSuggestions?: Ingredient[];
}) {
  const [formCanBeSubmitted, setFormCanBeSubmitted] = React.useState(false);

  return (
    <>
      <Header title={title} description={description} />
      <div className="space-y-2 sm:col-start-1 sm:row-start-2">
        <RecipeForm
          recipeId={recipeId}
          initialValues={initialValues}
          ingredientSuggestions={ingredientSuggestions}
          onSubmittableChange={(canSubmit) => setFormCanBeSubmitted(canSubmit)}
        />
        <ActionButtons
          recipeId={recipeId}
          formCanBeSubmitted={formCanBeSubmitted}
        />
      </div>
      <Sidebar>
        <ActionButtons
          recipeId={recipeId}
          formCanBeSubmitted={formCanBeSubmitted}
        />
      </Sidebar>
    </>
  );
}

function ActionButtons({
  recipeId,
  formCanBeSubmitted,
}: {
  recipeId?: string;
  formCanBeSubmitted: boolean;
}) {
  return (
    <>
      <Button
        type="submit"
        form="recipe-form"
        className="w-full"
        disabled={!formCanBeSubmitted}
      >
        Save recipe
      </Button>
      <div className="flex flex-row gap-2">
        <BackButton
          type="button"
          variant="secondary"
          fallbackHref="/"
          className="flex-1"
        >
          Cancel
        </BackButton>
        {recipeId && (
          <DeleteRecipeButton recipeId={recipeId} className="flex-1">
            Delete recipe
          </DeleteRecipeButton>
        )}
      </div>
    </>
  );
}
