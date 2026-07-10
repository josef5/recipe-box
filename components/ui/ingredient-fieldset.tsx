"use client";

import { RecipeInput } from "@/lib/schemas/recipe";
import { Ingredient } from "@/types";
import {
  Controller,
  FieldArrayWithId,
  type UseFormRegister,
  type Control,
  type FieldErrors,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";
import { Button } from "./button";
import { FieldErrorMessage } from "./field-error-mesage";
import { IngredientCombobox } from "./ingredient-combobox";
import { Input } from "./input";
import { Label } from "./label";

export function IngredientFieldset({
  ingredient,
  ingredientSuggestions,
  index,
  control,
  errors,
  getValues,
  setValue,
  register,
  removeIngredient,
  ingredientFields,
}: {
  ingredient: FieldArrayWithId<Ingredient>;
  ingredientSuggestions: Ingredient[];
  index: number;
  control: Control<RecipeInput>;
  errors: FieldErrors<RecipeInput>;
  getValues: UseFormGetValues<RecipeInput>;
  setValue: UseFormSetValue<RecipeInput>;
  register: UseFormRegister<RecipeInput>;
  removeIngredient: (index: number) => void;
  ingredientFields: FieldArrayWithId<Ingredient>[];
}) {
  return (
    <div key={ingredient.id}>
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
                  const unitField = `ingredients.${index}.unit` as const;
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
  );
}
