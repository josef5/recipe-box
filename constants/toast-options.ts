export const TOAST_OPTIONS = {
  info: {
    duration: 4000,
  },
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
    toast:
      "!font-mono !text-foreground !bg-surface !drop-shadow-md !border-none",
    success: "[&_svg]:!text-success",
    error: "[&_svg]:!text-danger",
    info: "[&_svg]:!text-foreground",
    cancelButton:
      "!bg-surface !text-foreground !border !border-foreground !p-3",
  },
};
