"use client";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { GlobalPlansContext } from "@/context/globalPlanContext";
import { TotalMacrosContext } from "@/context/TotalMacrosContext";

// Interfaces
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

interface PlanMeal {
  id: number;
  mealId: number;
  mealName: string;
  PlanMealFoods: PlanMealFood[];
}

interface Plan {
  id: number;
  name: string;
  PlanMeals: PlanMeal[];
}

const EDAMAM_APP_ID = "bd2e245b"; // Replace with your actual App ID
const EDAMAM_APP_KEY = "599af1ee3ee5ec07d0da5fff273156b1"; // Replace with your actual App Key

/**
 * Custom hook to fetch plan details and macros.
 */
export const useFetchPlan = () => {
  const { globalPlan } = useContext(GlobalPlansContext);
  const { setTotalMacros } = useContext(TotalMacrosContext);

  const [plan, setPlan] = useState<Plan | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches macros for a single food item using the Edamam API.
   * @param foodId - The ID of the food item.
   * @returns Macro information or default values in case of an error.
   */
  const fetchMacros = async (
    foodId: string
  ): Promise<{
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  }> => {
    const postData = {
      ingredients: [
        {
          quantity: 100, // grams
          measureURI: "g",
          foodId: foodId,
        },
      ],
    };

    try {
      const macroRes = await axios.post(
        "https://api.edamam.com/api/food-database/v2/nutrients",
        postData,
        {
          params: {
            app_id: EDAMAM_APP_ID,
            app_key: EDAMAM_APP_KEY,
          },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // @ts-expect-error desc
      const totalNutrients = macroRes.data?.totalNutrients || {};
      const protein = totalNutrients.PROCNT?.quantity || 0;
      const fats = totalNutrients.FAT?.quantity || 0;
      const carbs = totalNutrients.CHOCDF?.quantity || 0;

      // @ts-expect-error desc
      const calories = macroRes.data?.calories || 0;

      return { protein, fats, carbs, calories };
    } catch (error) {
      console.error(`Error fetching macros for foodId ${foodId}:`, error);
      return { protein: 0, fats: 0, carbs: 0, calories: 0 };
    }
  };

  /**
   * Fetches the plan details from the backend and enriches it with macro information.
   */
  const getData = async () => {
    if (!globalPlan) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch the plan details from your backend
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/getPlanDetails/${globalPlan.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const data = res.data as Plan;

      // Fetch macros for each food item
      const updatedPlanMeals = await Promise.all(
        data.PlanMeals.map(async (meal) => {
          const updatedPlanMealFoods = await Promise.all(
            meal.PlanMealFoods.map(async (food) => {
              const macros = await fetchMacros(food.foodId);
              return {
                ...food,
                macros,
              };
            })
          );

          return {
            ...meal,
            PlanMealFoods: updatedPlanMealFoods,
          };
        })
      );

      const updatedPlan: Plan = {
        ...data,
        PlanMeals: updatedPlanMeals,
      };

      setPlan(updatedPlan);

      // Calculate total macros for the entire plan
      const totals = calculateTotals(updatedPlan);
      setTotalMacros(totals);
    } catch (err) {
      console.error("Error fetching plan details:", err);
      setError("Failed to fetch plan details.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculates the total macros for the entire plan.
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
        totals.protein += (food.macros?.protein || 0) * food.quantity;
        totals.fats += (food.macros?.fats || 0) * food.quantity;
        totals.carbs += (food.macros?.carbs || 0) * food.quantity;
        totals.calories += (food.macros?.calories || 0) * food.quantity;
      });
    });

    return totals;
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalPlan]);

  return { plan, loading, error, getData };
};
