"use client";

import { IconChevronDown, IconChevronUp, IconX } from "@tabler/icons-react";
import { SetStateAction, useState } from "react";
import axios from "axios";

// =========================
// INTERFACES
// =========================

/**
 * Interface representing the structure of a food item within a plan meal.
 */
interface PlanMealFood {
  id: number;
  planMealId: number;
  foodName: string;
  foodId: string;
  quantity: number;
  macros?: {
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  };
}

/**
 * Interface representing the structure of a meal within a plan.
 */
interface PlanMeal {
  id: number;
  mealId: number;
  mealName: string;
  PlanMealFoods: PlanMealFood[];
}

/**
 * Interface representing the structure of a user's plan.
 */
interface Plan {
  id: number;
  name: string;
  PlanMeals: PlanMeal[];
}

// =========================
// MEAL ITEM COMPONENT
// =========================

/**
 * Props for the MealItem component.
 */
interface MealItemProps {
  meal: PlanMeal;
  setPlan: React.Dispatch<SetStateAction<Plan | undefined>>;
}

/**
 * MealItem Component
 *
 * Purpose:
 * - Represents an individual meal within the plan.
 * - Displays meal details and allows toggling of detailed food information.
 * - Provides functionality to remove a meal from the plan.
 * - Allows updating the quantity of each food item.
 */
export default function MealItem({ meal, setPlan }: MealItemProps) {
  // =========================
  // STATES
  // =========================

  const [isTableVisible, setIsTableVisible] = useState<boolean>(false); // State to toggle the visibility of the meal's food table.

  // =========================
  // MACRO CALCULATIONS
  // =========================

  /**
   * Calculates the total macros for the current meal based on its foods.
   */
  const totalMacros = meal.PlanMealFoods.reduce(
    (totals, food) => {
      if (food.macros) {
        const multiplier = food.quantity / 100; // Adjust macros based on quantity.
        totals.protein += food.macros.protein * multiplier;
        totals.fats += food.macros.fats * multiplier;
        totals.carbs += food.macros.carbs * multiplier;
        totals.calories += food.macros.calories * multiplier;
      }
      return totals;
    },
    { protein: 0, fats: 0, carbs: 0, calories: 0 }
  );

  // Format totals to two decimal places for display.
  const formattedTotals = {
    protein: totalMacros.protein.toFixed(2),
    fats: totalMacros.fats.toFixed(2),
    carbs: totalMacros.carbs.toFixed(2),
    calories: totalMacros.calories.toFixed(2),
  };

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <li className="flex flex-col bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-md space-y-4">
      {/* Meal Header */}
      <div className="flex items-center justify-between px-4 py-2 text-neutral-700">
        <div>
          <span className="text-base font-semibold">{meal.mealName}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Toggle Table Visibility */}
          <button
            className="text-blue-700 hover:text-blue-800"
            onClick={() => setIsTableVisible(!isTableVisible)} // Toggle the visibility state.
          >
            {isTableVisible ? (
              <IconChevronUp size={20} />
            ) : (
              <IconChevronDown size={20} />
            )}
          </button>

          {/* Remove Meal Button */}
          <button
            onClick={async () => {
              await axios.delete(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/deleteMealFromPlan/${meal.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "access_token"
                    )}`,
                  },
                }
              );

              // Update the plan state by removing the deleted meal.
              setPlan((prevPlan) => {
                if (!prevPlan) return prevPlan;

                const updatedPlanMeals = prevPlan.PlanMeals.filter(
                  (planMeal) => planMeal.id !== meal.id
                );

                return { ...prevPlan, PlanMeals: updatedPlanMeals };
              });
            }}
            className="text-red-500 hover:text-red-700"
          >
            <IconX size={20} />
          </button>
        </div>
      </div>

      {/* Meal Info Table (conditionally rendered) */}
      {isTableVisible && (
        <div className="px-4 pb-2">
          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              {/* Table Header */}
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Food Name
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Quantity (g)
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Protein (g)
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Fats (g)
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Carbs (g)
                  </th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Calories (kcal)
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {meal.PlanMealFoods.map((food) => {
                  // Calculate actual macros based on quantity.
                  const multiplier = food.quantity / 100;

                  // Safeguard: Ensure macros exist.
                  const protein = food.macros
                    ? (food.macros.protein * multiplier).toFixed(2)
                    : "0.00";
                  const fats = food.macros
                    ? (food.macros.fats * multiplier).toFixed(2)
                    : "0.00";
                  const carbs = food.macros
                    ? (food.macros.carbs * multiplier).toFixed(2)
                    : "0.00";
                  const calories = food.macros
                    ? (food.macros.calories * multiplier).toFixed(2)
                    : "0.00";

                  return (
                    <tr key={food.id} className="hover:bg-gray-100">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {food.foodName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        <input
                          className="w-24 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-center text-sm"
                          type="number"
                          onChange={(event) => {
                            const newQuantity = Number(event.target.value);

                            console.log("Before Update:", {
                              protein: food.macros?.protein,
                              quantity: food.quantity,
                            });

                            // Update the quantity of the food item in the plan.
                            setPlan((prevPlan) => {
                              if (!prevPlan) return prevPlan;

                              const updatedPlanMeals = prevPlan.PlanMeals.map(
                                (prevMeal) => {
                                  if (prevMeal.id !== meal.id) return prevMeal;

                                  const updatedPlanMealFoods =
                                    prevMeal.PlanMealFoods.map((prevFood) => {
                                      if (prevFood.foodId !== food.foodId)
                                        return prevFood;

                                      return {
                                        ...prevFood,
                                        quantity: newQuantity,
                                      };
                                    });

                                  return {
                                    ...prevMeal,
                                    PlanMealFoods: updatedPlanMealFoods,
                                  };
                                }
                              );

                              return {
                                ...prevPlan,
                                PlanMeals: updatedPlanMeals,
                              };
                            });

                            console.log("After Update:", {
                              protein: food.macros?.protein,
                              quantity: newQuantity,
                            });
                          }}
                          value={food.quantity}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {protein}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {fats}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {carbs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {calories}
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                <tr className="bg-gray-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                    {/* Optionally, leave this cell empty or show total quantity */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.protein}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.fats}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.carbs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.calories}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </li>
  );
}
