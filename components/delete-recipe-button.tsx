"use client";

import { useFormStatus } from "react-dom";
import { deleteRecipeFromForm } from "@/actions/recipes";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Deleting..." : "Delete"}
    </button>
  );
}

export function DeleteRecipeButton({ id }: { id: string }) {
  const action = deleteRecipeFromForm.bind(null, id);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this recipe? This cannot be undone.")) {
          e.preventDefault();
        }
      }}
    >
      <DeleteButton />
    </form>
  );
}
