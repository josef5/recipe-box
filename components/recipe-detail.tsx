import { FALLBACK_RECIPE_IMAGE_SRC } from "@/constants";
import { Recipe } from "@/types";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use } from "react";
import { ScaledIngredientsList } from "./scaled-ingredients-list";
import { EditRecipeButton } from "./ui/edit-recipe-button";

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
      <aside className="sm:col-start-2 sm:row-start-1">
        <EditRecipeButton
          recipeUserId={recipe.userId}
          editHref={`/recipes/${recipe.slug}/edit`}
        />
        <p>By {recipe.ownerDisplayName ?? "Unknown cook"}</p>
      </aside>
      <div className="flex flex-col items-start justify-between sm:col-start-1 sm:row-start-1">
        <h1>{recipe.title}</h1>
        <Image
          src={recipe.imageUrl ?? FALLBACK_RECIPE_IMAGE_SRC}
          alt={`${recipe.title} photo`}
          width={1600}
          height={1066}
          sizes="(max-width: 640px) 100vw, 900px"
          className="mt-3 max-h-112 w-full rounded-md border object-cover"
        />
        {recipe.description && <p>{recipe.description}</p>}
        <div>
          {recipe.prepTimeMins && <span>Prep: {recipe.prepTimeMins}m</span>}
          {recipe.cookTimeMins && <span>Cook: {recipe.cookTimeMins}m</span>}
          <span>Serves: {baseServings}</span>
        </div>
        {recipe.sourceName && (
          <p>
            Source:{" "}
            {recipe.sourceUrl ? (
              <a
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {recipe.sourceName}
              </a>
            ) : (
              recipe.sourceName
            )}
          </p>
        )}
        <section>
          <h2>Ingredients</h2>
          <ScaledIngredientsList
            recipeIngredients={recipe.recipeIngredients}
            baseServings={recipe.servings}
          />
        </section>
        <section>
          <h2>Steps</h2>
          <ol>
            {recipe.steps &&
              recipe.steps.map((step) => (
                <li key={step.id}>{step.instruction}</li>
              ))}
          </ol>
        </section>
      </div>
    </>
  );
}
