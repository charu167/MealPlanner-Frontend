"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
// import useLogin from "../hooks/useLogin";
import CurrentGoal from "@/components/Helper/CurrentGoal";
import useLogin from "@/hooks/useLogin";

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
              <details className="mx-8 my-5 p-5 shadow-xl bg-gradient-to-br text-neutral-200 rounded-xl from-neutral-900 to-blackrounded-xl">
                <summary className="text-xl font-medium mb-3">
                  Metabolic Info
                </summary>

                <p className="text-base">
                  BMR:{" "}
                  <span className="font-semibold text-xl">{bmr.toFixed(0)} kcal</span>
                </p>
              </details>

              {/* Current and Target Weight */}
              <details className="mx-8 my-5 p-5 shadow-xl bg-gradient-to-br text-neutral-200 rounded-xl from-neutral-900 to-blackrounded-xl">
                <summary className="text-xl font-bold  mb-3">
                  Weight Management
                </summary>
                <div className="flex justify-between items-center">
                  <p className="text-base ">
                    Current Weight:
                    <span className="font-semibold ">{user.weight} kg</span>
                  </p>
                  <label className="flex items-center">
                    <span className=" mr-2">Target weight (kg):</span>
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
                      className="p-2 w-40 border border-gray-300 bg-black rounded focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    />
                  </label>
                </div>
                {/* Activity Level */}
                <label>
                  <span className=" mr-2">Activity level:</span>
                  <select
                    className="mt-2 p-2 w-full border  bg-black border-b-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <option value="1.9">Intense exercise 6-7 times/week</option>
                    <option value="2.0">
                      Very intense exercise daily, or physical job
                    </option>
                  </select>
                </label>
              </details>

              {/* Caloric Adjustment */}
              <details className="mx-8 my-5 p-5 shadow-xl bg-gradient-to-br text-neutral-200 rounded-xl from-neutral-900 to-blackrounded-xl">
                <summary className="text-xl font-bold mb-3">
                  Caloric Adjustment
                </summary>

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
                      caloric_adjustment: Number(e.target.value),
                      surplus: Number(e.target.value) >= 0 ? true : false,
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
                <p className="text-center font-semibold ">
                  {goal.caloric_adjustment} kcal/day
                </p>

                <p className="text-base ">
                  Adjusted Total Daily Energy Expenditure:{" "}
                  <span className="font-bold">
                    {adjustedTDEE.toFixed(2)} kcal
                  </span>
                </p>
                <p className="text-base ">
                  Weekly Weight Change:
                  <span
                    className="font-bold"
                    style={{
                      color:
                        weeklyWeightChangeKg > 0
                          ? "rgba(255, 76, 76)" // Red for weight gain
                          : "rgba(76, 175, 80)", // Green for weight loss
                    }}
                  >
                    {weeklyWeightChangeKg.toFixed(2)} kg
                  </span>
                </p>
                <p className="text-base ">
                  Time to Reach Target:
                  <span className="font-bold">{displayWeeksToTarget}</span>
                </p>
              </details>

              {/* Macronutrients */}
              <details className="mx-8 my-5 p-5 shadow-xl bg-gradient-to-br text-neutral-200 rounded-xl from-neutral-900 to-blackrounded-xl">
                <summary className="text-xl font-bold mb-3">
                  Macronutrients
                </summary>
                <div className="space-y-4">
                  {/* Protein Input */}
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

                  {/* Fats Input */}
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

                  {/* Carbs Input */}
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

                  {/* Calories from Macros */}
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
              </details>

              {/* Submit Button */}
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
