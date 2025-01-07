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
      <h1 className="text-4xl text-center font-bold text-white mb-3">
        Your Fitness Goal
      </h1>
      <div className="grid grid-cols-3 gap-9 max-w-full font-sans font-bold text-neutral-200">
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
          <span className="text-indigo-600">{goal.target_weight}</span>
          <span>Target weight</span>
        </div>
        <div>
          {goal.surplus ? (
            <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
              <span className="text-green-600">+{goal.caloric_adjustment}</span>
              <span>Surplus</span>
            </div>
          ) : (
            <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
              <span className="text-red-600">{goal.caloric_adjustment}</span>
              <span>Deficit</span>
            </div>
          )}
        </div>
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
          <span className="text-purple-600">{goal.activity_level}</span>
          <span>Activity level </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-9 max-w-full font-sans font-bold text-neutral-200 mt-4">
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
          <span className="text-blue-600">{goal.protein.toFixed(2)}</span>
          <span>Protein </span>
        </div>
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
          <span className="text-orange-600">{goal.fats.toFixed(2)}</span>
          <span>Fats</span>
        </div>
        <div className="w-48 border border-white/[0.2] px-8 py-4 flex flex-col items-center rounded-lg">
          <span className="text-yellow-600">{goal.carbs.toFixed(2)}</span>
          <span>Carbs </span>
        </div>
      </div>
    </div>
  );
}
