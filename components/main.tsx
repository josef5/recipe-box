// TODO: Convert all components to named exports

export default function Main({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return (
    <main
      id="main-content"
      className="grid flex-1 grid-cols-1 grid-rows-[auto_auto_1fr] items-start gap-y-4 sm:grid-cols-[3fr_1fr] sm:grid-rows-[auto_1fr] sm:gap-x-6"
      {...props}
    >
      {children}
    </main>
  );
}
