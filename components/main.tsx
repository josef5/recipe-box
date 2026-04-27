export default function Main({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  return (
    <main
      id="main-content"
      className="grid grid-cols-1 gap-8 sm:grid-cols-[3fr_1fr]"
      {...props}
    >
      {children}
    </main>
  );
}
