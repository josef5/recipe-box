"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  type RecipeFormState,
  validateRecipeFormData,
} from "@/lib/validation/recipes";

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

export function RecipeForm({
  action,
  ingredientSuggestions,
  initialValues,
}: {
  action: (
    prevState: RecipeFormState,
    formData: FormData,
  ) => Promise<RecipeFormState>;
  ingredientSuggestions: IngredientSuggestion[];
  initialValues?: RecipeFormValues;
  deleteAction?: () => void | Promise<void>;
} & React.ComponentProps<"div">) {
  const [state, formAction] = useActionState(action, null);
  const formRef = useRef<HTMLFormElement>(null);
  const [isClientValid, setIsClientValid] = useState(false);
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

  function syncClientValidity() {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const validated = validateRecipeFormData(new FormData(form));
    const nextIsValid = validated.success;

    setIsClientValid(nextIsValid);
    form.dataset.clientValid = nextIsValid ? "true" : "false";
  }

  function scheduleClientValiditySync() {
    if (typeof window === "undefined") {
      return;
    }

    window.requestAnimationFrame(() => {
      syncClientValidity();
    });
  }

  useEffect(() => {
    syncClientValidity();
  }, [ingredients, steps]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        id="recipe-form"
        noValidate
        data-client-valid={isClientValid ? "true" : "false"}
        onInput={scheduleClientValiditySync}
        className="flex max-w-3xl flex-col gap-8"
      >
        {state?.errors._form && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {state.errors._form}
          </p>
        )}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              defaultValue={initialValues?.title ?? ""}
              className="rounded-md border px-3 py-2 text-sm"
            />
            {state?.errors.title && (
              <p className="text-sm text-red-600">{state.errors.title}</p>
            )}
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
                defaultValue={initialValues?.servings ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
              {state?.errors.servings && (
                <p className="text-sm text-red-600">{state.errors.servings}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="prepTimeMins" className="text-sm font-medium">
                Prep time (mins)
              </label>
              <input
                id="prepTimeMins"
                name="prepTimeMins"
                type="number"
                defaultValue={initialValues?.prepTimeMins ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
              {state?.errors.prepTimeMins && (
                <p className="text-sm text-red-600">
                  {state.errors.prepTimeMins}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cookTimeMins" className="text-sm font-medium">
                Cook time (mins)
              </label>
              <input
                id="cookTimeMins"
                name="cookTimeMins"
                type="number"
                defaultValue={initialValues?.cookTimeMins ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
              />
              {state?.errors.cookTimeMins && (
                <p className="text-sm text-red-600">
                  {state.errors.cookTimeMins}
                </p>
              )}
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
              {state?.errors.sourceUrl && (
                <p className="text-sm text-red-600">{state.errors.sourceUrl}</p>
              )}
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
            {state?.errors.imageUrl && (
              <p className="text-sm text-red-600">{state.errors.imageUrl}</p>
            )}
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

export function SubmitButton({
  label,
  form,
  disabled = false,
}: {
  label: string;
  form?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  const [isFormValid, setIsFormValid] = useState(!form);

  useEffect(() => {
    if (!form) {
      return;
    }

    const formElement = document.getElementById(form);

    if (!(formElement instanceof HTMLFormElement)) {
      return;
    }

    const updateFormValidity = () => {
      setIsFormValid(formElement.dataset.clientValid === "true");
    };

    queueMicrotask(updateFormValidity);

    const observer = new MutationObserver(updateFormValidity);
    observer.observe(formElement, {
      attributes: true,
      attributeFilter: ["data-client-valid"],
    });

    return () => {
      observer.disconnect();
    };
  }, [form]);

  const isDisabled = pending || disabled || (form ? !isFormValid : false);

  return (
    <button
      type="submit"
      form={form}
      disabled={isDisabled}
      className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function DeleteButton({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        formNoValidate
        onClick={(event) => {
          if (!window.confirm("Delete this recipe? This cannot be undone.")) {
            event.preventDefault();
          }
        }}
        className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
