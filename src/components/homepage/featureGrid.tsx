import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import {
  IconClipboardCopy,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";

export function BentoGridDemo() {
  return (
    <BentoGrid className="max-w-full mt-28 mx-auto gap-12 p-12">
      {items.map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className="md:col-span-1"
        />
      ))}
    </BentoGrid>
  );
}

const items = [
  {
    title: "Effortless Macro Tracking",
    description:
      "Effortlessly calculate your BMR and personalized macros to align with your fitness goals.",
    header: (
      <div className="flex items-center justify-center w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-900 to-black">
        <h1 className="text-white text-3xl font-bold italic">
          Calculate Your Macros
        </h1>
      </div>
    ),
    icon: <IconClipboardCopy className="h-16 w-16 text-gray-400" />,
  },
  {
    title: "Plan Meals with Ease",
    description:
      "Plan meals for the week with ease using drag-and-drop functionality and custom templates.",
    header: (
      <div className="flex items-center justify-center w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-gray-900 to-black">
        <h1 className="text-white text-3xl font-bold italic">
          Build Your Weekly Menu
        </h1>
      </div>
    ),
    icon: <IconTableColumn className="h-16 w-16 text-gray-400" />,
  },
  {
    title: "Customize Your Goals",
    description:
      "Set calorie and macro goals, and customize them to perfectly match your lifestyle.",
    header: (
      <div className="flex items-center justify-center w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-black">
        <h1 className="text-white text-3xl font-bold italic">
          Personalize Your Nutrition
        </h1>
      </div>
    ),
    icon: <IconSignature className="h-16 w-16 text-gray-400" />,
  },
];
