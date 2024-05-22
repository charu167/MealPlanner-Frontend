import React, { useEffect, useState } from "react";
import axios from "axios";
import useLogin from "../hooks/useLogin";
import useCalculateBMR from "../hooks/useCalculateBMR";
import CurrentGoal from "../components/Helper/CurrentGoal";

// Interfaces
interface User {
  date_of_birth: string;
  gender: string;
  height: number;
  username: string;
  weight: number;
}

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

interface RecommendedMacros {
  protein: number;
  fats: number;
  carbs: number;
}

// Main function
export default function GoalSetting() {
  // Login Check
  useLogin();

  // States
  const [user, setUser] = useState<User>({
    date_of_birth: "",
    gender: "male",
    height: 0,
    weight: 0,
    username: "",
  });

  const [goal, setGoal] = useState<Goal>({
    activity_level: 1.2,
    caloric_adjustment: 0,
    carbs: 0,
    fats: 0,
    id: 1,
    protein: 0,
    surplus: true,
    target_weight: 0,
  });

  const [recommendedMacros, setRecommendedMacros] = useState<RecommendedMacros>(
    { protein: 0, fats: 0, carbs: 0 }
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Change handlers
  function handleActivityLevelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setGoal((prev) => ({
      ...prev,
      ["activity_level"]: parseFloat(e.target.value),
    }));
  }

  const handleMacronutrientChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "protein" | "fats" | "carbs"
  ) => {
    const value = Number(event.target.value);
    if (type === "protein")
      setGoal((prev) => ({ ...prev, ["protein"]: value }));
    if (type === "fats") setGoal((prev) => ({ ...prev, ["fats"]: value }));
    if (type === "carbs") setGoal((prev) => ({ ...prev, ["carbs"]: value }));
  };

  // Helpers
  const bmr = useCalculateBMR(user);
  const tdee = bmr * goal.activity_level; // Calculate TDEE based on activity level
  const adjustedTDEE = tdee + goal.caloric_adjustment; // Applying the caloric adjustment
  const weeklyWeightChangeKg =
    ((goal.caloric_adjustment * 7) / 3500) * 0.453592; // Converting weekly weight change to kg
  const weeksToTarget =
    weeklyWeightChangeKg !== 0
      ? Math.abs((user.weight - goal.target_weight) / weeklyWeightChangeKg)
      : "Indeterminate"; // Handle zero division

  const displayWeeksToTarget =
    typeof weeksToTarget === "number"
      ? weeksToTarget.toFixed(2) + " weeks"
      : weeksToTarget; // Will display "Indeterminate" if not a number

  // get Data
  useEffect(() => {
    async function getUserData() {
      try {
        const result = await axios.get("http://100.28.28.31:3000/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        const goal = await axios.get("http://100.28.28.31:3000/goal", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setUser(result.data);
        setGoal(goal.data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to load profile data");
        setIsLoading(false);
      }
    }
    getUserData();
  }, []);

  useEffect(() => {
    if (user) {
      const proteinGrams = 2 * user.weight; // 2 grams per kg of body weight
      const fatsCalories = adjustedTDEE * 0.25; // 25% of BMR for fats
      const fatsGrams = fatsCalories / 9; // 9 calories per gram
      const proteinCalories = proteinGrams * 4; // 4 calories per gram
      const carbsCalories = adjustedTDEE - (fatsCalories + proteinCalories);
      const carbsGrams = carbsCalories / 4; // 4 calories per gram

      setRecommendedMacros((prev) => ({ ...prev, ["protein"]: proteinGrams }));
      setRecommendedMacros((prev) => ({ ...prev, ["fats"]: fatsGrams }));
      setRecommendedMacros((prev) => ({ ...prev, ["carbs"]: carbsGrams }));

      setGoal((prev) => ({ ...prev, ["protein"]: proteinGrams }));
      setGoal((prev) => ({ ...prev, ["fats"]: fatsGrams }));
      setGoal((prev) => ({ ...prev, ["carbs"]: carbsGrams }));
    }
  }, [user, adjustedTDEE]);

  // Submit handlers
  async function handleSubmit() {
    try {
      const result = await axios.put("http://100.28.28.31:3000/goal", goal, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  }

  // JSX
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-gray-100 p-6">
      {/* Current Goal */}
      <CurrentGoal goal={goal} />

      {/* Goal Setting Start */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Goal Setting
        </h1>

        {/* All inputs are here -> */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-4">
              {/* BMR Display */}
              <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Metabolic Info
                </h2>
                <p className="text-base text-gray-700">
                  Basal Metabolic Rate (BMR):
                  <span className="font-semibold text-gray-700">
                    {bmr.toFixed(2)} kcal
                  </span>
                </p>
              </div>

              {/* Current and Target Weight */}
              <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Weight Management
                </h2>
                <div className="flex justify-between items-center">
                  <p className="text-base text-gray-700">
                    Current Weight:
                    <span className="font-semibold text-gray-700">
                      {user.weight} kg
                    </span>
                  </p>
                  <label className="flex items-center">
                    <span className="text-gray-700 mr-2">
                      Target weight (kg):
                    </span>
                    <input
                      type="number"
                      placeholder="Enter target weight"
                      value={goal.target_weight}
                      onChange={(e) =>
                        setGoal((prev) => ({
                          ...prev,
                          target_weight: Number(e.target.value),
                        }))
                      }
                      className="p-2 w-40 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </label>
                </div>
              </div>

              {/* Activity Level */}
              <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Activity Level
                </h2>
                <select
                  className="mt-2 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={goal.activity_level}
                  onChange={handleActivityLevelChange}
                >
                  <option value="1.2">Sedentary: little or no exercise</option>
                  <option value="1.375">Exercise 1-3 times/week</option>
                  <option value="1.55">Exercise 4-5 times/week</option>
                  <option value="1.725">
                    Daily or intense exercise 3-4 times/week
                  </option>
                  <option value="1.9">Intense exercise 6-7 times/week</option>
                  <option value="2.0">
                    Very intense exercise daily, or physical job
                  </option>
                </select>
              </div>

              {/* Surplus/Deficit adjustment */}
              <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Dietary Adjustment
                </h2>
                <label
                  htmlFor="caloricAdjustment"
                  className="block text-gray-700 text-base"
                >
                  Caloric Adjustment (kcal/day):
                </label>
                <input
                  id="caloricAdjustment"
                  type="range"
                  min="-1000"
                  max="1000"
                  step="100"
                  value={goal.caloric_adjustment}
                  onChange={(e) =>
                    setGoal((prev) => ({
                      ...prev,
                      ["caloric_adjustment"]: Number(e.target.value),
                      ["surplus"]: Number(e.target.value) >= 0 ? true : false,
                    }))
                  }
                  className="w-full mt-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background:
                      goal.caloric_adjustment < 0
                        ? `rgba(255, 76, 76, ${
                            1 + goal.caloric_adjustment / 1000
                          })` // More negative, more intense red
                        : `rgba(76, 175, 80, ${
                            1 - goal.caloric_adjustment / 1000
                          })`, // More positive, more intense green
                  }}
                />
                <p className="text-center font-semibold text-gray-700">
                  {goal.caloric_adjustment} kcal/day
                </p>

                <p className="text-base text-gray-700">
                  Adjusted Total Daily Energy Expenditure:{" "}
                  <span className="font-bold">
                    {adjustedTDEE.toFixed(2)} kcal
                  </span>
                </p>
              </div>

              {/* ETA */}
              <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">ETA</h2>

                <p className="text-base text-gray-700">
                  Weekly Weight Change:
                  <span
                    className="font-bold"
                    style={{
                      color:
                        weeklyWeightChangeKg > 0
                          ? "rgba(255, 76, 76)"
                          : "rgba(76, 175, 80)", // Red for weight gain, green for weight loss
                    }}
                  >
                    {weeklyWeightChangeKg.toFixed(2)} kg
                  </span>
                </p>
                <p className="text-base text-gray-700">
                  Time to Reach Target:
                  <span className="font-bold">{displayWeeksToTarget}</span>
                </p>
              </div>

              {/* Macronutrients */}
              <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Macronutrients
                </h2>
                <div className="space-y-4">
                  <label className="block text-gray-700 text-base">
                    Protein (g):
                    <span className="block font-normal text-gray-600">
                      Recommended: {recommendedMacros.protein.toFixed(2)}
                    </span>
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={goal.protein.toFixed(2)}
                      onChange={(e) => handleMacronutrientChange(e, "protein")}
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </label>
                  <label className="block text-gray-700 text-base">
                    Fats (g):
                    <span className="block font-normal text-gray-600">
                      Recommended: {recommendedMacros.fats.toFixed(2)}
                    </span>
                    <input
                      type="number"
                      placeholder="Fats (g)"
                      value={goal.fats.toFixed(2)}
                      onChange={(e) => handleMacronutrientChange(e, "fats")}
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </label>
                  <label className="block text-gray-700 text-base">
                    Carbs (g):
                    <span className="block font-normal text-gray-600">
                      Recommended: {recommendedMacros.carbs.toFixed(2)}
                    </span>
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={goal.carbs.toFixed(2)}
                      onChange={(e) => handleMacronutrientChange(e, "carbs")}
                      className="mt-1 p-2 w-full border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </label>
                  <h2 className="text-base font-semibold text-gray-900">
                    Calories calculated from macros:
                    <span className="font-bold">
                      {(
                        goal.protein * 4 +
                        goal.carbs * 4 +
                        goal.fats * 9
                      ).toFixed(2)}
                    </span>
                  </h2>
                </div>
              </div>

              {/* Submit button */}
              <div className="col-span-2 text-center mt-6">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white font-bold py-2 px-6 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Goal Setting End */}
    </div>
  );
}
