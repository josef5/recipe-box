export const TOAST_OPTIONS = {
  success: {
    duration: 4000,
  },
  error: {
    duration: 10000,
    cancel: {
      label: "Dismiss",
      onClick: () => {},
    },
  },
  classNames: {
    success:
      "!font-mono !text-foreground bg-surface [&_svg]:!text-success !drop-shadow-md",
    error:
      "!font-mono !text-foreground bg-surface [&_svg]:!text-danger !drop-shadow-md",
    cancelButton:
      "!bg-surface !text-foreground !border !border-foreground !p-3",
  },
};
