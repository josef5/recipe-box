"use client";

import { createRecipe, updateRecipe } from "@/actions/recipes";
import { TOAST_OPTIONS } from "@/constants/toast-options";
import { RecipeInput, RecipeOutput, recipeSchema } from "@/lib/schemas/recipe";
import { cn } from "@/lib/utils";
import { Ingredient } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { FieldErrorMessage } from "./ui/field-error-mesage";
import { ImageUpload } from "./ui/image-upload";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type IngredientComboboxProps = {
  id: string;
  value: string;
  suggestions: Ingredient[];
  inputRef?: React.Ref<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onChange: (value: string) => void;
  onSelect?: (ingredient: Ingredient) => void;
  className?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
};

// Headless combobox for ingredient name entry with filtering and keyboard support.
function IngredientCombobox({
  id,
  value,
  suggestions,
  inputRef,
  onBlur,
  onChange,
  onSelect,
  className,
  ariaDescribedBy,
  ariaInvalid,
}: IngredientComboboxProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const activeOption = suggestions[highlightedIndex];

  // Open the popup only when there are suggestions to show.
  function openSuggestions() {
    if (suggestions.length === 0) {
      return;
    }

    setHighlightedIndex(0);
    setIsOpen(true);
  }

  // Close the popup and reset highlight so reopening starts from the top.
  function closeSuggestions() {
    setIsOpen(false);
    setHighlightedIndex(0);
  }

  // Selecting a suggestion updates the input and lets the parent apply related fields.
  function selectSuggestion(ingredient: Ingredient) {
    onChange(ingredient.name);
    onSelect?.(ingredient);
    closeSuggestions();
  }

  // Keep the popup open while navigating and commit a highlighted suggestion on Enter.
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!isOpen) {
        openSuggestions();
        return;
      }

      setHighlightedIndex((currentIndex) => {
        if (suggestions.length === 0) {
          return 0;
        }

        return (currentIndex + 1) % suggestions.length;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!isOpen) {
        openSuggestions();
        return;
      }

      setHighlightedIndex((currentIndex) => {
        if (suggestions.length === 0) {
          return 0;
        }

        return (currentIndex - 1 + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key === "Enter" && isOpen && activeOption) {
      event.preventDefault();
      selectSuggestion(activeOption);
      return;
    }

    if (event.key === "Escape") {
      closeSuggestions();
    }
  }

  // Close the popup when focus leaves the combobox container.
  function handleContainerBlur(event: React.FocusEvent<HTMLDivElement>) {
    if (containerRef.current?.contains(event.relatedTarget)) {
      return;
    }

    closeSuggestions();
  }

  return (
    <div ref={containerRef} className="relative" onBlur={handleContainerBlur}>
      <Input
        id={id}
        ref={inputRef}
        value={value}
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-activedescendant={
          isOpen && activeOption
            ? `${listboxId}-${highlightedIndex}`
            : undefined
        }
        aria-invalid={ariaInvalid}
        onBlur={onBlur}
        onFocus={openSuggestions}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        className={className}
      />
      {isOpen && suggestions.length > 0 ? (
        <div
          id={listboxId}
          role="listbox"
          className="bg-surface absolute z-20 mt-3 max-h-64 w-full overflow-y-auto rounded-md border p-1 shadow-lg"
        >
          {suggestions.map((ingredient, index) => (
            <button
              type="button"
              key={ingredient.id}
              id={`${listboxId}-${index}`}
              role="option"
              tabIndex={-1}
              aria-selected={highlightedIndex === index}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-sm px-3 py-2 text-left text-sm",
                highlightedIndex === index && "bg-input",
              )}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectSuggestion(ingredient)}
            >
              <span>{ingredient.name}</span>
              {ingredient.defaultUnit ? (
                <span className="text-muted-foreground text-xs uppercase">
                  {ingredient.defaultUnit}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function RecipeForm({
  recipeId,
  initialValues,
  ingredientSuggestions,
  onSubmittableChange,
}: {
  recipeId?: string;
  initialValues?: RecipeOutput;
  ingredientSuggestions?: Ingredient[];
  onSubmittableChange?: (isSubmittable: boolean) => void;
} & React.ComponentProps<"div">) {
  // Normalize initial values to ensure the form has consistent default values
  const normalizedDefaults: RecipeInput = {
    title: initialValues?.title ?? "",
    description: initialValues?.description ?? "",
    servings: initialValues?.servings ?? undefined,
    prepTimeMins: initialValues?.prepTimeMins ?? undefined,
    cookTimeMins: initialValues?.cookTimeMins ?? undefined,
    imageUrl: initialValues?.imageUrl ?? "",
    imagePublicId: initialValues?.imagePublicId ?? "",
    ingredients: initialValues?.ingredients?.length
      ? initialValues.ingredients
      : [{ name: "", amount: "", unit: "", notes: "" }],
    steps: initialValues?.steps?.length
      ? initialValues.steps
      : [{ instruction: "", stepNumber: 1 }],
  };

  const {
    register,
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isValid, isSubmitting },
  } = useForm<RecipeInput, unknown, RecipeOutput>({
    resolver: zodResolver(recipeSchema),
    mode: "onChange",
    defaultValues: normalizedDefaults,
  });

  const router = useRouter();
  const mode = initialValues ? "edit" : "create";
  const canSubmit = isValid && (mode === "create" || isDirty) && !isSubmitting;

  useEffect(() => {
    onSubmittableChange?.(canSubmit);
  }, [canSubmit, onSubmittableChange]);

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: "ingredients" });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({ control, name: "steps" });

  async function onSubmit({
    title,
    description,
    servings,
    prepTimeMins,
    cookTimeMins,
    imageUrl,
    imagePublicId,
    ingredients,
    steps,
  }: RecipeOutput) {
    const payload = {
      title,
      description,
      servings,
      prepTimeMins,
      cookTimeMins,
      imageUrl,
      imagePublicId,
      ingredients,
      steps,
    };

    try {
      if (mode === "edit" && !recipeId) {
        throw new Error("Recipe ID is required for editing.");
      }

      const result =
        mode === "edit" && recipeId
          ? await updateRecipe(recipeId, payload)
          : await createRecipe(payload);

      if (!result.ok) {
        throw new Error(result.error);
      }

      toast.success(
        mode === "edit"
          ? "Recipe updated successfully!"
          : "Recipe created successfully!",
        TOAST_OPTIONS,
      );

      reset();

      router.replace(`/recipes/${result.slug}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : mode === "edit"
            ? "Unable to update recipe."
            : "Unable to create recipe.",
        TOAST_OPTIONS,
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      id="recipe-form"
      noValidate
      className="bg-surface flex max-w-3xl flex-col gap-8 rounded-lg p-4"
    >
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register("title")}
            aria-describedby={errors.title ? "title-error" : undefined}
            aria-invalid={errors.title ? true : undefined}
          />
          <FieldErrorMessage text={errors.title?.message} id="title-error" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            {...register("description")}
            rows={4}
            className="bg-input rounded-md p-3 text-sm"
          />
          <FieldErrorMessage
            text={errors.description?.message}
            id="description-error"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              {...register("servings", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              type="number"
              aria-describedby={errors.servings ? "servings-error" : undefined}
              aria-invalid={errors.servings ? true : undefined}
            />
            <FieldErrorMessage
              text={errors.servings?.message}
              id="servings-error"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="prepTimeMins"
              className="truncate text-sm font-medium"
            >
              Prep time (mins)
            </Label>
            <Input
              id="prepTimeMins"
              type="number"
              {...register("prepTimeMins", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              aria-describedby={
                errors.prepTimeMins ? "prep-time-error" : undefined
              }
              aria-invalid={errors.prepTimeMins ? true : undefined}
            />
            <FieldErrorMessage
              text={errors.prepTimeMins?.message}
              id="prep-time-error"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cookTimeMins" className="truncate">
              Cook time (mins)
            </Label>
            <Input
              id="cookTimeMins"
              {...register("cookTimeMins", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
              type="number"
              aria-describedby={
                errors.cookTimeMins ? "cook-time-error" : undefined
              }
              aria-invalid={errors.cookTimeMins ? true : undefined}
            />
            <FieldErrorMessage
              text={errors.cookTimeMins?.message}
              id="cook-time-error"
            />
          </div>
        </div>
        <ImageUpload
          control={control}
          name="imageUrl"
          publicIdName="imagePublicId"
          label="Image URL"
          accept="image/*"
        />
        <FieldErrorMessage
          text={errors.imageUrl?.message}
          id="image-url-error"
        />
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Ingredients</h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              appendIngredient({
                name: "",
                amount: "",
                unit: "",
                notes: "",
              })
            }
          >
            Add ingredient
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {ingredientFields.map((ingredient, index) => (
            <div key={ingredient.id} className="">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-full flex flex-col gap-1.5">
                  <Label htmlFor={`ingredient-name-${index}`}>Ingredient</Label>
                  <Controller
                    control={control}
                    name={`ingredients.${index}.name`}
                    render={({ field }) => (
                      <IngredientCombobox
                        id={`ingredient-name-${index}`}
                        value={field.value ?? ""}
                        suggestions={ingredientSuggestions ?? []}
                        inputRef={field.ref}
                        onBlur={field.onBlur}
                        onChange={field.onChange}
                        ariaDescribedBy={
                          errors.ingredients?.[index]?.name
                            ? `ingredient-name-${index}-error`
                            : undefined
                        }
                        ariaInvalid={Boolean(errors.ingredients?.[index]?.name)}
                        onSelect={(selectedIngredient) => {
                          const unitField =
                            `ingredients.${index}.unit` as const;
                          const currentUnit = getValues(unitField)?.trim();

                          if (currentUnit || !selectedIngredient.defaultUnit) {
                            return;
                          }

                          setValue(unitField, selectedIngredient.defaultUnit, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className="w-full"
                      />
                    )}
                  />
                  <FieldErrorMessage
                    text={errors.ingredients?.[index]?.name?.message}
                    id={`ingredient-name-${index}-error`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ingredient-amount-${index}`}>Amount</Label>
                  <Input
                    id={`ingredient-amount-${index}`}
                    type="number"
                    {...register(`ingredients.${index}.amount`)}
                  />
                  <FieldErrorMessage
                    text={errors.ingredients?.[index]?.amount?.message}
                    id={`ingredient-amount-${index}-error`}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`ingredient-unit-${index}`}>Unit</Label>
                  <Input
                    id={`ingredient-unit-${index}`}
                    {...register(`ingredients.${index}.unit`)}
                  />
                  <FieldErrorMessage
                    text={errors.ingredients?.[index]?.unit?.message}
                    id={`ingredient-unit-${index}-error`}
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-1.5">
                <Label htmlFor={`ingredient-notes-${index}`}>Notes</Label>
                <div className="flex gap-3">
                  <Input
                    id={`ingredient-notes-${index}`}
                    {...register(`ingredients.${index}.notes`)}
                    className="w-full"
                  />
                  <FieldErrorMessage
                    text={errors.ingredients?.[index]?.notes?.message}
                    id={`ingredient-notes-${index}-error`}
                  />
                  <Button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredientFields.length === 1}
                    aria-label={`Remove ingredient ${index + 1}`}
                    variant="destructive-secondary"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <FieldErrorMessage
          text={errors.ingredients?.root?.message}
          id="ingredients-error"
        />
      </section>
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-semibold">Steps</h2>
          <Button
            type="button"
            onClick={() =>
              appendStep({
                instruction: "",
                stepNumber: stepFields.length + 1,
              })
            }
            variant="secondary"
          >
            Add step
          </Button>
        </div>
        <div className="flex flex-col gap-4">
          {stepFields.map((step, index) => (
            <div key={step.id} className="">
              <Label
                htmlFor={`step-instruction-${index}`}
                className="mb-2 block"
              >
                Step {index + 1}
              </Label>
              <div className="flex items-start gap-3">
                <textarea
                  id={`step-instruction-${index}`}
                  rows={3}
                  {...register(`steps.${index}.instruction`)}
                  className="bg-input flex-1 rounded-md px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  variant="destructive-secondary"
                  disabled={stepFields.length === 1}
                  onClick={() => removeStep(index)}
                  aria-label={`Remove step ${index + 1}`}
                >
                  Remove
                </Button>
              </div>
              {/* TODO: Fix vertical spacings - field error messages */}
              <FieldErrorMessage
                text={errors.steps?.[index]?.instruction?.message}
                id={`step-instruction-${index}-error`}
              />
              <FieldErrorMessage
                text={errors.steps?.root?.message}
                id={`step-instruction-${index}-error`}
              />
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
