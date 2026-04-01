import { getRecipeBySlug } from "@/actions/recipes";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppMenu } from "@/components/app-menu";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) notFound();

  return (
    <main>
      <AppMenu variant="recipe" editHref={`/recipes/${slug}/edit`} />

      <h1>{recipe.title}</h1>

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
    </main>
  );
}
