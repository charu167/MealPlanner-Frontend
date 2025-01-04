"use client";
import { useEffect, useContext } from "react";
import { TotalMacrosContext } from "@/context/TotalMacrosContext";

// Interfaces
interface PlanMealFood {
  quantity: number;
  macros?: {
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  };
}

interface PlanMeal {
  PlanMealFoods: PlanMealFood[];
}

interface Plan {
  PlanMeals: PlanMeal[];
}

/**
 * Custom hook to calculate and update total macros based on the plan.
 * @param plan - The current plan containing meals and foods.
 */
export const useCalculateTotals = (plan: Plan | undefined) => {
  const { setTotalMacros } = useContext(TotalMacrosContext);

  /**
   * Calculates the total macros for the entire plan.
   * @param plan - The current plan containing all meals and foods.
   * @returns An object containing total protein, fats, carbs, and calories.
   */
  const calculateTotals = (
    plan: Plan
  ): { protein: number; fats: number; carbs: number; calories: number } => {
    const totals = {
      protein: 0,
      fats: 0,
      carbs: 0,
      calories: 0,
    };

    plan.PlanMeals.forEach((meal) => {
      meal.PlanMealFoods.forEach((food) => {
        totals.protein += (food.macros?.protein || 0) * food.quantity;
        totals.fats += (food.macros?.fats || 0) * food.quantity;
        totals.carbs += (food.macros?.carbs || 0) * food.quantity;
        totals.calories += (food.macros?.calories || 0) * food.quantity;
      });
    });

    return totals;
  };

  useEffect(() => {
    if (plan) {
      const totals = calculateTotals(plan);
      setTotalMacros(totals);
    }
  }, [plan, setTotalMacros]);
};
