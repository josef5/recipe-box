export default function Main({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return (
    <main
      id="main-content"
      className="grid grid-cols-1 gap-y-4 sm:grid-cols-[3fr_1fr] sm:gap-x-6"
      {...props}
    >
      {children}
    </main>
  );
}
