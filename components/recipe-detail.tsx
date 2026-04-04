import { AppMenu } from "@/components/app-menu";
import type { ReactNode } from "react";

type RecipeDetailData = {
  title: string;
  description: string | null;
  prepTimeMins: number | null;
  cookTimeMins: number | null;
  servings: number | null;
  sourceName: string | null;
  sourceUrl: string | null;
  recipeIngredients: Array<{
    id: string;
    amount: string | null;
    unit: string | null;
    notes: string | null;
    ingredient: {
      name: string;
    };
  }>;
  steps: Array<{
    id: string;
    instruction: string;
  }>;
};

export function RecipeDetail({
  recipe,
  actions,
}: {
  recipe: RecipeDetailData;
  actions?: ReactNode;
}) {
  return (
    <>
      <AppMenu variant="recipe" />

      <div className="flex items-start justify-between gap-4">
        <h1>{recipe.title}</h1>
        {actions}
      </div>

      {recipe.description && <p>{recipe.description}</p>}

      <div>
        {recipe.prepTimeMins && <span>Prep: {recipe.prepTimeMins}m</span>}
        {recipe.cookTimeMins && <span>Cook: {recipe.cookTimeMins}m</span>}
        {recipe.servings && <span>Serves: {recipe.servings}</span>}
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
        <ul>
          {recipe.recipeIngredients.map((ri) => (
            <li key={ri.id}>
              {ri.amount && <span>{ri.amount}</span>}
              {ri.unit && <span>{ri.unit}</span>}
              <span>{ri.ingredient.name}</span>
              {ri.notes && <span>({ri.notes})</span>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Steps</h2>
        <ol>
          {recipe.steps.map((step) => (
            <li key={step.id}>{step.instruction}</li>
          ))}
        </ol>
      </section>
    </>
  );
}
