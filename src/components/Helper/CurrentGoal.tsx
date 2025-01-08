import {
  IconArrowBigDownFilled,
  IconArrowBigUpFilled,
  IconRun,
  IconScaleOutline,
} from "@tabler/icons-react";

interface Goal {
  activity_level: number;
  caloric_adjustment: number;
  carbs: number;
  fats: number;
  id: number;
  protein: number;
  surplus: boolean;
  target_weight: number;
}

export default function CurrentGoal({ goal }: { goal: Goal }) {
  return (
    <div className=" mx-8 my-5 p-5 flex flex-col items-center space-y-9 justify-between shadow-xl bg-gradient-to-br from-neutral-900 to-black rounded-xl ">
      <h1 className="text-4xl text-center font-bold text-neutral-100 mb-3">
        Your Fitness Goal
      </h1>
      <div className="grid grid-cols-3 gap-9 max-w-full font-sans text-neutral-400">
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg space-y-2">
          {/* Target weight value */}
          <span className="text-neutral-200 font-semibold text-lg">
            {goal.target_weight}
          </span>

          {/* Icon and label */}
          <span className="flex items-center space-x-2 text-sm text-neutral-400">
            <IconScaleOutline className="w-5 h-5" />
            <span>Target weight</span>
          </span>
        </div>

        <div>
          {goal.surplus ? (
            <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg space-y-2">
              {/* Caloric adjustment value */}
              <span className="text-neutral-200 font-semibold text-lg">
                +{goal.caloric_adjustment}
              </span>

              {/* Icon and label */}
              <span className="flex items-center space-x-2 text-sm text-neutral-400">
                <IconArrowBigUpFilled className="w-5 h-5" />
                <span>Caloric Surplus</span>
              </span>
            </div>
          ) : (
            <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg space-y-2">
              {/* Caloric adjustment value */}
              <span className="text-neutral-200 font-semibold text-lg">
                {goal.caloric_adjustment}
              </span>

              {/* Icon and label */}
              <span className="flex items-center space-x-2 text-sm text-neutral-400">
                <IconArrowBigDownFilled className="w-5 h-5" />
                <span>Caloric Deficit</span>
              </span>
            </div>
          )}
        </div>
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg space-y-2">
          {/* Activity level value */}
          <span className="text-neutral-200 font-semibold text-lg">
            {goal.activity_level}
          </span>

          {/* Icon and label */}
          <span className="flex items-center space-x-2 text-sm text-neutral-400">
            <IconRun className="w-5 h-5" />
            <span>Activity level</span>
          </span>
        </div>
      </div>

      {/* Devider */}
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[2px] w-full" />

      <div>
        {/* <h1 className="text-neutral-300 text-center text-xl font-semibold">
          Nutrients
        </h1> */}
        <div className="grid grid-cols-3 gap-3 max-w-full font-sans text-neutral-400 mt-4">
          <div className="w-36 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
            <span className="text-neutral-200 font-semibold">
              {goal.protein.toFixed(2)}
            </span>
            <span>Protein </span>
          </div>
          <div className="w-36 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
            <span className="text-neutral-200 font-semibold">
              {goal.fats.toFixed(2)}
            </span>
            <span>Fats</span>
          </div>
          <div className="w-36 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
            <span className="text-neutral-200 font-semibold">
              {goal.carbs.toFixed(2)}
            </span>
            <span>Carbs </span>
          </div>
        </div>
      </div>
    </div>
  );
}
