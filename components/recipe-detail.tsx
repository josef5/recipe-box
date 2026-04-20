import { EditRecipeButton } from "./ui/edit-recipe-button";

type RecipeDetailData = {
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  ownerDisplayName: string | null;
  userId: string | null;
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

export function RecipeDetail({ recipe }: { recipe: RecipeDetailData }) {
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
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={`${recipe.title} photo`}
            className="mt-3 max-h-112 w-full rounded-md border object-cover"
          />
        ) : null}
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
      </div>
    </>
  );
}
