import { getRecipeBySlug } from "@/actions/recipes";
import { ScaledIngredientsUnorderedList } from "@/components/scaled-ingredients-list";

export default async function PrintRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ servings?: string }>;
}) {
  const { slug } = await params;
  const { servings } = (await searchParams) ?? {};

  const parsed = Number.parseInt(servings ?? "", 10);
  const adjustedServings =
    Number.isFinite(parsed) && parsed >= 1 && parsed <= 16 ? parsed : undefined;

  const recipe = await getRecipeBySlug(slug);
  const baseServings = recipe?.servings ?? 4;
  const effectiveServings = adjustedServings ?? baseServings;

  return (
    <div className="max-w-3xl flex-1 py-8">
      <h1 className="mb-4 font-bold">{recipe?.title}</h1>
      <p className="mb-4">{recipe?.description}</p>
      {recipe?.servings && (
        <div className="mb-4">Servings: {effectiveServings}</div>
      )}
      <h2 className="mb-2 font-bold">Ingredients</h2>
      <ScaledIngredientsUnorderedList
        recipeIngredients={recipe?.recipeIngredients ?? []}
        baseServings={baseServings}
        selectedServings={effectiveServings}
        className="mb-4 list-disc pl-4"
      />
      <h2 className="mb-2 font-bold">Steps</h2>
      <ol className="list-decimal pl-8">
        {recipe?.steps.map((step) => (
          <li key={step.id}>{step.instruction}</li>
        ))}
      </ol>
      <div className="text-foreground-muted mt-4 text-sm">
        Created at: {recipe?.createdAt?.toLocaleDateString() ?? "N/A"}
      </div>
    </div>
  );
}
