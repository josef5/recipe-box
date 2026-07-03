"use client";

import { RecipeOutput } from "@/lib/schemas/recipe";
import React from "react";
import Header from "./header";
import { RecipeForm } from "./recipe-form";
import Sidebar from "./sidebar";
import { BackButton } from "./ui/back-button";
import { Button } from "./ui/button";
import { DeleteRecipeButton } from "./ui/delete-recipe-button";

// TODO: Add a second save button under the form

export function RecipeFormPageContent({
  title,
  description,
  recipeId,
  initialValues,
}: {
  title: string;
  description: string;
  recipeId?: string;
  initialValues?: RecipeOutput;
}) {
  const [formCanBeSubmitted, setFormCanBeSubmitted] = React.useState(false);

  return (
    <>
      <Header title={title} description={description} />
      <div className="space-y-2 sm:col-start-1 sm:row-start-2">
        <RecipeForm
          recipeId={recipeId}
          initialValues={initialValues}
          onSubmittableChange={(canSubmit) => setFormCanBeSubmitted(canSubmit)}
        />
      </div>
      <Sidebar>
        <Button
          type="submit"
          form="recipe-form"
          className="w-full"
          disabled={!formCanBeSubmitted}
        >
          Save recipe
        </Button>
        {recipeId && (
          <DeleteRecipeButton recipeId={recipeId}>
            Delete recipe
          </DeleteRecipeButton>
        )}
        <BackButton
          type="button"
          variant="secondary"
          fallbackHref="/"
          className="w-full"
        >
          Cancel
        </BackButton>
      </Sidebar>
    </>
  );
}
