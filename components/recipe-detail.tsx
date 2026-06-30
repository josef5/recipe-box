import { FALLBACK_RECIPE_IMAGE_SRC } from "@/constants";
import { Recipe } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import { ScaledIngredientsList } from "./scaled-ingredients-list";
import { EditRecipeButton } from "./ui/edit-recipe-button";
import Sidebar from "./sidebar";
import Header from "./header";

// TODO: Allow add to favourites

export function RecipeDetail({
  recipePromise,
}: {
  recipePromise: Promise<Recipe | null | undefined>;
}) {
  const recipe = use(recipePromise);
  if (!recipe) notFound();

  const baseServings = recipe.servings ?? 4;

  return (
    <>
      <Header
        title={recipe.title}
        description={`By ${recipe.ownerDisplayName ?? "Unknown cook"}`}
      />
      <div className="bg-surface flex flex-col items-start gap-3 rounded-3xl p-4 pb-10 text-sm drop-shadow-lg sm:col-start-1 sm:row-start-2">
        <Image
          src={recipe.imageUrl || FALLBACK_RECIPE_IMAGE_SRC}
          alt={`${recipe.title} photo`}
          width={1600}
          height={1066}
          loading="eager"
          sizes="(max-width: 640px) 100vw, 900px"
          className="mb-2 max-h-112 w-full rounded-md border object-cover"
        />
        <div className="flex flex-col gap-3 px-1">
          {recipe.description && (
            <p className="mb-2 text-base">{recipe.description}</p>
          )}
          <section>
            <h2 className="mb-2 font-bold">Ingredients</h2>
            <ScaledIngredientsList
              recipeIngredients={recipe.recipeIngredients}
              baseServings={baseServings}
            />
          </section>
          <section>
            <h2 className="mb-2 font-bold">Steps</h2>
            <ul className="list-outside list-decimal pl-6.5">
              {recipe.steps &&
                recipe.steps.map((step) => (
                  <li key={step.id}>{step.instruction}</li>
                ))}
            </ul>
          </section>
        </div>
      </div>
      <Sidebar className="gap-2">
        <EditRecipeButton
          recipeUserId={recipe.userId ?? null}
          editHref={`/recipes/${recipe.slug}/edit`}
          className="mb-3 w-full"
        />
        <div className="flex flex-wrap gap-x-2 gap-y-0 text-sm sm:flex-col">
          <p>Serves: {baseServings}</p>
          {recipe.prepTimeMins && <p>Prep time: {recipe.prepTimeMins}m</p>}
          {recipe.cookTimeMins && <p>Cook time: {recipe.cookTimeMins}m</p>}
        </div>
        <div className="flex gap-x-2 gap-y-0.5 text-xs sm:flex-col">
          {recipe.createdAt && (
            <p>
              Created: {new Date(recipe.createdAt).toLocaleDateString("en-GB")}
            </p>
          )}
          {recipe.updatedAt && (
            <p>
              Updated: {new Date(recipe.updatedAt).toLocaleDateString("en-GB")}
            </p>
          )}
        </div>
      </Sidebar>
    </>
  );
}
