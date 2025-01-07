import { cn } from "@/lib/utils";

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-8",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 p-4 bg-black border-white/[0.2] border justify-between flex flex-col space-y-4",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-2 transition duration-200 flex items-center space-x-4">

        {/* Icon on the Left */}
        <div className="flex-shrink-0">{icon}</div>

        {/* Title and Description on the Right */}
        <div>
          <div className="font-sans font-bold text-neutral-200 mb-2">
            {title}
          </div>
          <div className="font-sans font-normal text-xs text-neutral-300">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};
