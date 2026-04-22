export function Dialog({
  title,
  onConfirm,
  confirmButtonText = "Confirm",
  dialogRef,
}: {
  title: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  dialogRef: React.RefObject<HTMLDialogElement | null>;
}) {
  return (
    <dialog
      ref={dialogRef}
      className="backdrop:bg-opacity-70 m-auto rounded-md border p-6 backdrop:bg-gray-900 backdrop:opacity-70"
    >
      <h2>{title}</h2>
      <div className="mt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => dialogRef?.current?.close()}
          className="rounded-md border px-4 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
        >
          {confirmButtonText}
        </button>
      </div>
    </dialog>
  );
}
