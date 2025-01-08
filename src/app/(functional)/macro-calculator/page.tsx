"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
// import useLogin from "../hooks/useLogin";
import CurrentGoal from "@/components/Helper/CurrentGoal";
import useLogin from "@/hooks/useLogin";
import { IconChevronRight } from "@tabler/icons-react";

// =========================
// INTERFACES
// =========================

/**
 * Interface representing the structure of a User object.
 */
interface User {
  date_of_birth: string;
  gender: string;
  height: number;
  username: string;
  weight: number;
}

/**
 * Interface representing the structure of a Goal object.
 */
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

/**
 * Interface representing the structure of Recommended Macros.
 */
interface RecommendedMacros {
  protein: number;
  fats: number;
  carbs: number;
}

// =========================
// COMPONENT
// =========================

/**
 * GoalSetting Component
 *
 * Purpose:
 * - Allows users to set and update their nutritional goals.
 * - Fetches user data and goal from the backend.
 * - Calculates recommended macros based on user data.
 */
export default function MacroCalculator() {
  // Login Check
  useLogin();

  // =========================
  // STATES
  // =========================

  // Local state to store the user's information fetched from the backend.
  const [user, setUser] = useState<User>({
    date_of_birth: "",
    gender: "male",
    height: 0,
    weight: 0,
    username: "",
  });

  // Local state to store the user's goal data fetched from the backend.
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

  // Local state to store the recommended macronutrients based on user data.
  const [recommendedMacros, setRecommendedMacros] = useState<RecommendedMacros>(
    {
      protein: 0,
      fats: 0,
      carbs: 0,
    }
  );

  // Local state to manage the loading state of data fetching.
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Local state to store any error messages during data fetching.
  const [error, setError] = useState<string>("");

  // =========================
  // CHANGE HANDLERS
  // =========================

  /**
   * Handles changes to the activity level select input.
   * Updates the activity_level in the goal state.
   *
   * @param e - Change event from the select element.
   */
  function handleActivityLevelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setGoal((prev) => ({
      ...prev,
      activity_level: parseFloat(e.target.value),
    }));
  }

  /**
   * Handles changes to the macronutrient input fields.
   * Updates the corresponding macronutrient in the goal state.
   *
   * @param event - Change event from the input element.
   * @param type - The type of macronutrient being updated ("protein", "fats", or "carbs").
   */
  const handleMacronutrientChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "protein" | "fats" | "carbs"
  ) => {
    const value = Number(event.target.value);
    if (type === "protein") setGoal((prev) => ({ ...prev, protein: value }));
    if (type === "fats") setGoal((prev) => ({ ...prev, fats: value }));
    if (type === "carbs") setGoal((prev) => ({ ...prev, carbs: value }));
  };

  // =========================
  // HELPERS
  // =========================

  const bmr = 1789; // Basal Metabolic Rate (example value)
  const tdee = bmr * goal.activity_level; // Calculate Total Daily Energy Expenditure based on activity level
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

  // =========================
  // FETCH DATA
  // =========================

  /**
   * Fetches the user's data and goal from the backend API.
   * Updates the corresponding states with the fetched data.
   */
  useEffect(() => {
    async function getUserData() {
      try {
        const result = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        const goalResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/goal`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        setUser(result.data as User); // Updating user state with fetched data
        setGoal(goalResponse.data as Goal); // Updating goal state with fetched data
        setIsLoading(false); // Data fetching complete
      } catch (error) {
        console.error(error); // Logging error for debugging
        setError("Failed to load profile data"); // Setting error message
        setIsLoading(false); // Data fetching complete with error
      }
    }
    getUserData();
  }, []);

  // =========================
  // CALCULATE MACRONUTRIENTS
  // =========================

  /**
   * Calculates the recommended macronutrients based on user data and updates the state.
   * Also updates the goal state with the recommended macronutrient values.
   */
  useEffect(() => {
    if (user) {
      const proteinGrams = 2 * user.weight; // 2 grams per kg of body weight
      const fatsCalories = adjustedTDEE * 0.25; // 25% of TDEE for fats
      const fatsGrams = fatsCalories / 9; // 9 calories per gram of fat
      const proteinCalories = proteinGrams * 4; // 4 calories per gram of protein
      const carbsCalories = adjustedTDEE - (fatsCalories + proteinCalories); // Remaining calories for carbs
      const carbsGrams = carbsCalories / 4; // 4 calories per gram of carbohydrates

      setRecommendedMacros({
        protein: proteinGrams,
        fats: fatsGrams,
        carbs: carbsGrams,
      }); // Updating recommended macros

      setGoal((prev) => ({
        ...prev,
        protein: proteinGrams,
        fats: fatsGrams,
        carbs: carbsGrams,
      })); // Updating goal with recommended macros
    }
  }, [user, adjustedTDEE]);

  // =========================
  // SUBMIT HANDLER
  // =========================

  /**
   * Handles the submission of the goal form.
   * Sends a PUT request to update the goal in the backend.
   */
  async function handleSubmit() {
    try {
      const result = await axios.put("http://localhost:3001/goal", goal, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      console.log(result.data); // Logging the response data
    } catch (error) {
      console.log(error); // Logging any errors
    }
  }

  // =========================
  // JSX RENDERING
  // =========================

  // Conditional rendering based on loading and error states
  if (isLoading)
    return (
      <p className="bg-black text-white text-center my-auto">Loading...</p>
    );
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col min-h-screen justify-center items-center bg-black p-6">
      {/* Goal Setting Start */}
      <div className="w-full max-w-4xl rounded-lg shadow-md p-6">
        {/* Current Goal */}
        <CurrentGoal goal={goal} />

        {/* All inputs are here */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-4">
              {/* BMR Display */}
              <details className="rounded-xl mx-8 my-5 p-5 text-neutral-400 group border border-white/[0.2]">
                <summary className="text-xl font-medium mb-3 flex items-center cursor-pointer">
                  <IconChevronRight className="mr-2 w-5 h-5 transition-transform duration-200 ease-in-out group-open:rotate-90" />
                  Metabolic Info
                </summary>

                <p className="text-sm px-7">
                  <span className="block mb-2">
                    Your BMR:{" "}
                    <span className="font-semibold text-xl text-neutral-200">
                      {bmr.toFixed(0)}
                    </span>{" "}
                    kcal
                  </span>

                  <span className="block mb-2">
                    <strong>BMR (Basal Metabolic Rate):</strong> The number of
                    calories your body needs to perform basic life-sustaining
                    functions while at rest.
                  </span>

                  <span className="block">
                    <strong>Basically,</strong> it’s the energy your body burns
                    to stay alive, even if you do nothing all day.
                  </span>
                </p>
              </details>

              {/* Weight Management */}
              <details className="rounded-xl mx-8 my-5 p-5 text-neutral-400 group border border-white/[0.2]">
                <summary className="text-xl font-medium mb-4 flex items-center cursor-pointer">
                  <IconChevronRight className="mr-2 w-5 h-5 transition-transform duration-200 ease-in-out group-open:rotate-90" />
                  Weight Management
                </summary>

                <div className="flex justify-center text-sm items-center px-7 mb-4">
                  <p className=" flex-1">
                    Current Weight:{" "}
                    <span className="text-neutral-200 text-lg font-semibold">
                      {user.weight}
                    </span>{" "}
                    kg
                  </p>
                  <label className="flex items-center">
                    <span className="mr-2 ">Target weight (kg):</span>
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
                      className=" w-24 border-b border-neutral-400 bg-black text-center text-neutral-200 text-lg font-semibold rounded-none focus:outline-none focus:border-b-2 focus:border-neutral-300 appearance-none"
                    />
                  </label>
                </div>
              </details>

              {/* Activity Level */}
              <details className="rounded-xl mx-8 my-5 p-5 text-neutral-400 group border border-white/[0.2]">
                <summary className="text-xl font-medium mb-4 flex items-center cursor-pointer">
                  <IconChevronRight className="mr-2 w-5 h-5 transition-transform duration-200 ease-in-out group-open:rotate-90" />
                  Activity Level
                </summary>

                <div className="px-7 text-sm flex flex-col gap-6">
                  <label className="flex items-center justify-start">
                    <span>Your activity: </span>
                    <select
                      className="text-neutral-200 text-lg font-semibold w-1/2 border-b border-neutral-400 bg-black rounded-none focus:outline-none focus:border-b-2 focus:ring-0 focus:border-neutral-300"
                      value={goal.activity_level}
                      onChange={handleActivityLevelChange}
                    >
                      <option value="1.2">
                        Sedentary: little or no exercise
                      </option>
                      <option value="1.375">Exercise 1-3 times/week</option>
                      <option value="1.55">Exercise 4-5 times/week</option>
                      <option value="1.725">
                        Daily or intense exercise 3-4 times/week
                      </option>
                      <option value="1.9">
                        Intense exercise 6-7 times/week
                      </option>
                      <option value="2.0">
                        Very intense exercise daily, or physical job
                      </option>
                    </select>
                  </label>

                  <span>
                    Total Daily Energy Expenditure:{" "}
                    <span className="text-neutral-200 text-xl font-semibold">
                      {tdee.toFixed(0)} calories
                    </span>
                  </span>

                  <p className="text-neutral-400">
                    <strong>TDEE (Total Daily Energy Expenditure):</strong> This
                    is the number of calories your body needs in a day to
                    maintain your current weight, factoring in your daily
                    activity level.
                  </p>
                </div>
              </details>

              {/* Caloric Adjustment */}
              <details className="rounded-xl mx-8 my-5 p-5 text-neutral-400 group border border-white/[0.2]">
                <summary className="text-xl font-medium mb-4 flex items-center cursor-pointer">
                  <IconChevronRight className="mr-2 w-5 h-5 transition-transform duration-200 ease-in-out group-open:rotate-90" />
                  Caloric Adjustment
                </summary>

                <div className="px-7 text-sm flex flex-col gap-y-7 items-start">
                  <label className="flex w-full items-center">
                    <input
                      id="caloricAdjustment"
                      type="range"
                      min="-1000"
                      max="1000"
                      step="50"
                      value={goal.caloric_adjustment}
                      onChange={(e) =>
                        setGoal((prev) => ({
                          ...prev,
                          caloric_adjustment: Number(e.target.value),
                          surplus: Number(e.target.value) >= 0,
                        }))
                      }
                      className="w-3/4 mt-1 appearance-none cursor-pointer"
                    />

                    <p className="w-1/4 text-center">
                      <span className="text-neutral-200 text-lg font-semibold">
                        {goal.caloric_adjustment}
                      </span>{" "}
                      kcal/day
                    </p>
                  </label>

                  <p className=" ">
                    You should aim to eat around{" "}
                    <span className="text-neutral-200 text-xl font-semibold">
                      {adjustedTDEE.toFixed(0)} calories
                    </span>{" "}
                    per day.
                  </p>

                  <p className=" ">
                    You will {weeklyWeightChangeKg > 0 ? "gain" : "lose"}{" "}
                    <span className="font-semibold">
                      {Math.abs(weeklyWeightChangeKg).toFixed(2)} kg
                    </span>{" "}
                    per week, reaching your target in{" "}
                    <span className="text-neutral-200 text-xl font-semibold">
                      {displayWeeksToTarget}
                    </span>
                    .
                  </p>
                </div>
              </details>

              {/* Macronutrients */}
              <details className="rounded-xl mx-8 my-5 p-5 text-neutral-400 group border border-white/[0.2]">
                <summary className="text-xl font-medium mb-4 flex items-center cursor-pointer">
                  <IconChevronRight className="mr-2 w-5 h-5 transition-transform duration-200 ease-in-out group-open:rotate-90" />
                  Macro Nutrients
                </summary>
                <div className="px-7 text-sm flex flex-col items-start gap-y-6">
                  {/* Protein Input */}
                  <label className="flex gap-4 items-center">
                    <span className="text-sm text-neutral-400 w-20">
                      Protein:
                    </span>
                    <input
                      type="number"
                      placeholder="Protein (g)"
                      value={goal.protein.toFixed(0)}
                      onChange={(e) => handleMacronutrientChange(e, "protein")}
                      className=" w-24 border-b border-neutral-400 bg-black text-center text-neutral-200 text-lg font-semibold rounded-none focus:outline-none focus:border-b-2 focus:border-neutral-300 appearance-none"
                    />
                    <span className="text-sm text-neutral-400">
                      (Recommended: {recommendedMacros.protein.toFixed(0)} g)
                    </span>
                  </label>

                  {/* Fats Input */}
                  <label className="flex gap-4 items-center">
                    <span className="text-sm text-neutral-400 w-20">Fats:</span>
                    <input
                      type="number"
                      placeholder="Fats (g)"
                      value={goal.fats.toFixed(0)}
                      onChange={(e) => handleMacronutrientChange(e, "fats")}
                      className=" w-24 border-b border-neutral-400 bg-black text-center text-neutral-200 text-lg font-semibold rounded-none focus:outline-none focus:border-b-2 focus:border-neutral-300 appearance-none"
                    />
                    <span className="text-sm text-neutral-400">
                      (Recommended: {recommendedMacros.fats.toFixed(0)} g)
                    </span>
                  </label>

                  {/* Carbs Input */}
                  <label className="flex gap-4 items-center">
                    <span className="text-sm text-neutral-400 w-20">
                      Carbs:
                    </span>
                    <input
                      type="number"
                      placeholder="Carbs (g)"
                      value={goal.carbs.toFixed(0)}
                      onChange={(e) => handleMacronutrientChange(e, "carbs")}
                      className=" w-24 border-b border-neutral-400 bg-black text-center text-neutral-200 text-lg font-semibold rounded-none focus:outline-none focus:border-b-2 focus:border-neutral-300 appearance-none"
                    />
                    <span className="text-sm text-neutral-400">
                      (Recommended: {recommendedMacros.carbs.toFixed(0)} g)
                    </span>
                  </label>

                  {/* Calories from Macros */}
                  <span className="">
                    Your total calorie intake based on macros:{" "}
                    <span className="text-neutral-200 text-xl font-semibold">
                      {(
                        goal.protein * 4 +
                        goal.carbs * 4 +
                        goal.fats * 9
                      ).toFixed(0)}{" "}
                      kcal
                    </span>{" "}
                    (Recommended: {adjustedTDEE.toFixed(0)} kcal)
                  </span>
                </div>
              </details>

              {/* Submit Button */}
              <div className="col-span-2 text-center mt-6">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className=" bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 bg-zinc-800 w-1/2 text-neutral-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] hover:from-zinc-700 hover:to-zinc-700 transition duration-200 ease-in-out"
                >
                  Save Changes &rarr;
                  <BottomGradient /> {/* Decorative gradient effect */}
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

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};
