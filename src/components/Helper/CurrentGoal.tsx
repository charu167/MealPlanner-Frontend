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
    <div className=" mx-8 my-5 p-5 shadow-xl bg-gray-50 rounded-xl">
      <h1 className="text-xl font-bold text-gray-900 mb-3">Current Goal</h1>
      <div className="flex items-center space-x-6 text-base">
        <span className="text-gray-700">
          Target weight:{" "}
          <span className="font-semibold text-indigo-600">
            {goal.target_weight}
          </span>
        </span>
        <span>
          {goal.surplus ? (
            <span className="font-semibold text-green-600">
              Surplus: {goal.caloric_adjustment}
            </span>
          ) : (
            <span className="font-semibold text-red-600">
              Deficit: {goal.caloric_adjustment}
            </span>
          )}
        </span>
        <span>
          Protein:{" "}
          <span className="font-semibold text-blue-600">
            {goal.protein.toFixed(2)}
          </span>
        </span>
        <span>
          Fats:{" "}
          <span className="font-semibold text-orange-600">
            {goal.fats.toFixed(2)}
          </span>
        </span>
        <span>
          Carbs:{" "}
          <span className="font-semibold text-yellow-600">
            {goal.carbs.toFixed(2)}
          </span>
        </span>
        <span>
          Activity level:{" "}
          <span className="font-semibold text-purple-600">
            {goal.activity_level}
          </span>
        </span>
      </div>
    </div>
  );
}
