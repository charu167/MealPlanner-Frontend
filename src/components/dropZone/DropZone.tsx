"use client";

import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { GlobalPlansContext } from "@/context/globalPlanContext";
import axios from "axios";
import { Meal } from "@/context/columnMealContext";
import { TotalMacrosContext } from "@/context/TotalMacrosContext";
import MealItem from "./MealItem";

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
// COMPONENT
// =========================

/**
 * DropZone Component
 *
 * Purpose:
 * - Manages the display and interaction of meal plans.
 * - Handles data fetching for plans and their associated meals and foods.
 * - Allows users to add meals to their plan via drag-and-drop.
 * - Calculates and updates total macros based on the meals in the plan.
 */
export default function DropZone() {
  // =========================
  // CONTEXT
  // =========================

  const { globalPlan } = useContext(GlobalPlansContext); // Accessing the global plan from context.
  const { setTotalMacros } = useContext(TotalMacrosContext); // Function to update total macros in context.

  // =========================
  // STATES
  // =========================

  const [plan, setPlan] = useState<Plan | undefined>(undefined); // State to store the current plan details.

  // =========================
  // DATA FETCHING
  // =========================

  /**
   * Fetches the plan details and associated macros from the backend and external API.
   */
  async function getData() {
    if (!globalPlan) {
      return; // Exit if there is no global plan selected.
    }
    try {
      // Fetch the plan details from the backend.
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/getPlanDetails/${globalPlan?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const data = res.data as Plan;

      // Iterate over each PlanMeal and PlanMealFood to fetch macros from the Edamam API.
      const updatedPlanMeals = await Promise.all(
        data.PlanMeals.map(async (meal) => {
          const updatedPlanMealFoods = await Promise.all(
            meal.PlanMealFoods.map(async (food) => {
              const postData = {
                ingredients: [
                  {
                    quantity: 100, // Quantity in grams.
                    measureURI: "g",
                    foodId: food.foodId,
                  },
                ],
              };

              try {
                // Fetch macros from Edamam API.
                const macroRes = await axios.post(
                  "https://api.edamam.com/api/food-database/v2/nutrients",
                  postData,
                  {
                    params: {
                      app_id: process.env.NEXT_PUBLIC_EDAMAM_APP_ID, // Your Edamam App ID.
                      app_key: process.env.NEXT_PUBLIC_EDAMAM_APP_KEY, // Your Edamam App Key.
                    },
                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );

                // Extract macros from the API response.
                // @ts-expect-error desc
                const totalNutrients = macroRes.data?.totalNutrients || {};
                const protein = totalNutrients.PROCNT?.quantity || 0;
                const fats = totalNutrients.FAT?.quantity || 0;
                const carbs = totalNutrients.CHOCDF?.quantity || 0;

                // @ts-expect-error desc
                const calories = macroRes.data?.calories || 0;

                // Return the food item with macros included.
                return {
                  ...food,
                  macros: { protein, fats, carbs, calories },
                };
              } catch (error) {
                console.error(
                  `Error fetching macros for foodId ${food.foodId}:`,
                  error
                );
                // Return the food item with default macro values in case of an error.
                return {
                  ...food,
                  macros: {
                    protein: 0,
                    fats: 0,
                    carbs: 0,
                    calories: 0,
                  },
                };
              }
            })
          );

          // Return the PlanMeal with updated PlanMealFoods.
          return {
            ...meal,
            PlanMealFoods: updatedPlanMealFoods,
          };
        })
      );

      // Construct the updated plan with PlanMeals containing macros.
      const updatedPlan: Plan = {
        ...data,
        PlanMeals: updatedPlanMeals,
      };

      // Update the plan state with the new data including macros.
      setPlan(updatedPlan);
    } catch (error) {
      console.error("Error fetching plan details:", error);
      // Optionally, handle the error (e.g., show a notification to the user).
    }
  }

  useEffect(() => {
    getData(); // Fetch data when the globalPlan changes.
  }, [globalPlan]);

  // =========================
  // SUBMIT HANDLERS
  // =========================

  /**
   * Handles the drop event to add a meal to the plan.
   *
   * @param event - Drag event from the drop zone.
   */
  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault(); // Prevent default behavior.
    const meal = JSON.parse(event.dataTransfer.getData("currMeal")) as Meal; // Parse the dropped meal data.
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/addSingleMeal`,
      { planId: globalPlan?.id, mealId: meal.id, mealName: meal.name },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (res.status === 200) {
      await getData(); // Refresh the plan data upon successful addition.
    } else {
      console.warn("Unexpected response status:", res.status); // Log unexpected statuses.
    }
  }

  // =========================
  // HELPERS
  // =========================

  /**
   * Calculates the total macros for the entire plan.
   *
   * @param plan - The current plan containing all meals and foods.
   * @returns An object containing total protein, fats, carbs, and calories.
   */
  const calculateTotals = (plan: Plan) => {
    const totals = {
      protein: 0,
      fats: 0,
      carbs: 0,
      calories: 0,
    };

    plan.PlanMeals.forEach((meal) => {
      meal.PlanMealFoods.forEach((food) => {
        totals.protein += (food.macros?.protein || 1) * food.quantity;
        totals.fats += (food.macros?.fats || 1) * food.quantity;
        totals.carbs += (food.macros?.carbs || 1) * food.quantity;
        totals.calories += (food.macros?.calories || 1) * food.quantity;
      });
    });

    return totals;
  };

  useEffect(() => {
    if (plan) {
      const totals = calculateTotals(plan); // Calculate total macros.
      setTotalMacros(totals); // Update the total macros in context.
    }
  }, [plan, setTotalMacros]);

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div
      className="col-span-6 bg-gray-50 border-gray-300 border rounded-lg shadow-lg p-6"
      onDrop={handleDrop} // Handle drop events.
      onDragOver={(event) => {
        event.preventDefault(); // Allow drop by preventing default behavior.
      }}
    >
      {/* Title */}
      <h1 className="text-2xl font-bold text-center text-black mb-6">
        {globalPlan ? globalPlan?.name : ""}
      </h1>

      {/* List of Meals */}
      <ul className="space-y-4">
        {plan?.PlanMeals.map((planMeal) => (
          <MealItem
            setPlan={setPlan}
            plan={plan}
            key={planMeal.id}
            meal={planMeal}
          />
        ))}
      </ul>
    </div>
  );
}
