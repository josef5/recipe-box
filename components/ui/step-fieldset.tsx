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
  moveStep,
  stepFields,
  errors,
}: {
  step: FieldArrayWithId<RecipeInput["steps"]>;
  index: number;
  register: UseFormRegister<RecipeInput>;
  removeStep: (index: number) => void;
  moveStep: (from: number, to: number) => void;
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
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={index === 0}
              onClick={() => moveStep(index, index - 1)}
              className="flex-1"
            >
              ↑
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={index === stepFields.length - 1}
              onClick={() => moveStep(index, index + 1)}
              className="flex-1"
            >
              ↓
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive-secondary"
            size="sm"
            disabled={stepFields.length === 1}
            onClick={() => removeStep(index)}
            aria-label={`Remove step ${index + 1}`}
          >
            Delete
          </Button>
        </div>
      </div>
      <FieldErrorMessage
        text={errors.steps?.[index]?.instruction?.message}
        id={`step-instruction-${index}-error`}
      />
    </div>
  );
}
