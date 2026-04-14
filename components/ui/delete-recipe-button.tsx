"use client";

type DeleteRecipeButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  form: string;
};

export function DeleteRecipeButton({ action, form }: DeleteRecipeButtonProps) {
  return (
    <button
      type="submit"
      form={form}
      formAction={action}
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
  );
}
