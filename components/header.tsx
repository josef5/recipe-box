import { cn } from "@/lib/utils";

export function Header({
  title,
  description,
  className,
  ...props
}: {
  title: string;
  description?: string;
} & React.ComponentPropsWithoutRef<"header">) {
  return (
    <header
      className={cn(
        "col-span-full mb-2 flex flex-col items-start justify-between sm:row-start-1",
        className,
      )}
      {...props}
    >
      <h1 className="font-bold">{title}</h1>
      <p className="text-sm">{description}</p>
    </header>
  );
}
