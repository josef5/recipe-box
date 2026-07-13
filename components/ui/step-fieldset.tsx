import { RecipeInput } from "@/lib/schemas/recipe";
import {
  FieldArrayWithId,
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import { Button } from "./button";
import { FieldErrorMessage } from "./field-error-mesage";
import { Label } from "./label";

export function StepFieldset({
  step,
  index,
  register,
  removeStep,
  stepFields,
  errors,
}: {
  step: FieldArrayWithId<RecipeInput["steps"]>;
  index: number;
  register: UseFormRegister<RecipeInput>;
  removeStep: (index: number) => void;
  stepFields: FieldArrayWithId<RecipeInput["steps"]>[];
  errors: FieldErrors<RecipeInput>;
}) {
  return (
    <div key={step.id} className="">
      <Label htmlFor={`step-instruction-${index}`} className="mb-2 block">
        Step {index + 1}
      </Label>
      <div className="mb-2 flex items-start gap-3">
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
      <FieldErrorMessage
        text={errors.steps?.[index]?.instruction?.message}
        id={`step-instruction-${index}-error`}
      />
    </div>
  );
}
