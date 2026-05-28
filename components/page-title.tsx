import { cn } from "@/lib/utils";

export default function PageTitle({
  title,
  description,
  className,
  ...props
}: {
  title: string;
  description?: string;
} & React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "col-span-full mb-2 flex flex-col items-start justify-between sm:row-start-1",
        className,
      )}
      {...props}
    >
      <h1 className="font-bold">{title}</h1>
      <p className="text-sm">{description}</p>
    </div>
  );
}
