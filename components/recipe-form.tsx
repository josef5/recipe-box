"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type IngredientSuggestion = {
  name: string;
  defaultUnit: string | null;
};

type IngredientField = {
  name: string;
  amount: string;
  unit: string;
  notes: string;
};

type StepField = {
  instruction: string;
};

type RecipeFormValues = {
  title: string;
  description?: string | null;
  servings?: number | null;
  prepTimeMins?: number | null;
  cookTimeMins?: number | null;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  sourceName?: string | null;
  ingredients: IngredientField[];
  steps: StepField[];
};

export function SubmitButton({
  label,
  form,
}: {
  label: string;
  form?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      form={form}
      disabled={pending}
      className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function RecipeForm({
  action,
  ingredientSuggestions,
  initialValues,
}: {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  ingredientSuggestions: IngredientSuggestion[];
  initialValues?: RecipeFormValues;
  deleteAction?: () => void | Promise<void>;
} & React.ComponentProps<"div">) {
  const [ingredients, setIngredients] = useState<IngredientField[]>(
    initialValues?.ingredients.length
      ? initialValues.ingredients
      : [{ name: "", amount: "", unit: "", notes: "" }],
  );
  const [steps, setSteps] = useState<StepField[]>(
    initialValues?.steps.length ? initialValues.steps : [{ instruction: "" }],
  );

  const ingredientDefaults = useMemo(
    () =>
      new Map(
        ingredientSuggestions.map((ingredient) => [
          ingredient.name.toLowerCase(),
          ingredient.defaultUnit ?? "",
        ]),
      ),
    [ingredientSuggestions],
  );

  function updateIngredient(
    index: number,
    field: keyof IngredientField,
    value: string,
  ) {
    setIngredients((current) => {
      const next = [...current];
      const ingredient = { ...next[index], [field]: value };

      if (field === "name" && !ingredient.unit.trim()) {
        ingredient.unit =
          ingredientDefaults.get(value.trim().toLowerCase()) ?? "";
      }

      next[index] = ingredient;
      return next;
    });
  }

  function updateStep(index: number, instruction: string) {
    setSteps((current) => {
      const next = [...current];
      next[index] = { instruction };
      return next;
    });
  }

  return (
    <>
      <form
        action={action}
        id="recipe-form"
        className="flex max-w-3xl flex-col gap-8"
      >
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={initialValues?.title ?? ""}
              className="rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={initialValues?.description ?? ""}
              className="rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="servings" className="text-sm font-medium">
                Servings
              </label>
              <input
                id="servings"
                name="servings"
                type="number"
                min="1"
                defaultValue={initialValues?.servings ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prepTimeMins" className="text-sm font-medium">
                Prep time (mins)
              </label>
              <input
                id="prepTimeMins"
                name="prepTimeMins"
                type="number"
                min="0"
                defaultValue={initialValues?.prepTimeMins ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cookTimeMins" className="text-sm font-medium">
                Cook time (mins)
              </label>
              <input
                id="cookTimeMins"
                name="cookTimeMins"
                type="number"
                min="0"
                defaultValue={initialValues?.cookTimeMins ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sourceName" className="text-sm font-medium">
                Source name
              </label>
              <input
                id="sourceName"
                name="sourceName"
                defaultValue={initialValues?.sourceName ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="sourceUrl" className="text-sm font-medium">
                Source URL
              </label>
              <input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                defaultValue={initialValues?.sourceUrl ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={initialValues?.imageUrl ?? ""}
              className="rounded-md border px-3 py-2 text-sm"
            />
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Ingredients</h2>
            <button
              type="button"
              onClick={() =>
                setIngredients((current) => [
                  ...current,
                  { name: "", amount: "", unit: "", notes: "" },
                ])
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              Add ingredient
            </button>
          </div>
          <datalist id="ingredient-suggestions">
            {ingredientSuggestions.map((ingredient) => (
              <option key={ingredient.name} value={ingredient.name} />
            ))}
          </datalist>
          <div className="flex flex-col gap-4">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="rounded-lg border p-4">
                <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Ingredient</label>
                    <input
                      name="ingredientName"
                      list="ingredient-suggestions"
                      value={ingredient.name}
                      onChange={(event) =>
                        updateIngredient(index, "name", event.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Amount</label>
                    <input
                      name="ingredientAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredient.amount}
                      onChange={(event) =>
                        updateIngredient(index, "amount", event.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Unit</label>
                    <input
                      name="ingredientUnit"
                      value={ingredient.unit}
                      onChange={(event) =>
                        updateIngredient(index, "unit", event.target.value)
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Notes</label>
                  <div className="flex gap-3">
                    <input
                      name="ingredientNotes"
                      value={ingredient.notes}
                      onChange={(event) =>
                        updateIngredient(index, "notes", event.target.value)
                      }
                      className="flex-1 rounded-md border px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setIngredients((current) =>
                          current.length === 1
                            ? [{ name: "", amount: "", unit: "", notes: "" }]
                            : current.filter(
                                (_, currentIndex) => currentIndex !== index,
                              ),
                        )
                      }
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Steps</h2>
            <button
              type="button"
              onClick={() =>
                setSteps((current) => [...current, { instruction: "" }])
              }
              className="rounded-md border px-3 py-2 text-sm"
            >
              Add step
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {steps.map((step, index) => (
              <div key={index} className="rounded-lg border p-4">
                <label className="mb-2 block text-sm font-medium">
                  Step {index + 1}
                </label>
                <div className="flex gap-3">
                  <textarea
                    name="stepInstruction"
                    rows={3}
                    value={step.instruction}
                    onChange={(event) => updateStep(index, event.target.value)}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSteps((current) =>
                        current.length === 1
                          ? [{ instruction: "" }]
                          : current.filter(
                              (_, currentIndex) => currentIndex !== index,
                            ),
                      )
                    }
                    className="h-fit rounded-md border px-3 py-2 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>
    </>
  );
}
