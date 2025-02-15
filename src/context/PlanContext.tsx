"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { GlobalPlansContext } from "@/context/globalPlanContext";
import { TotalMacrosContext } from "@/context/TotalMacrosContext";

// Define interfaces
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

interface PlanContextType {
  plan: Plan | undefined;
  loading: boolean;
  error: string | null;
  getData: () => void;
  setPlan: React.Dispatch<React.SetStateAction<Plan | undefined>>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
            app_id: process.env.NEXT_PUBLIC_EDAMAM_APP_ID, // Your Edamam App ID.
            app_key: process.env.NEXT_PUBLIC_EDAMAM_APP_KEY, // Your Edamam App Key.
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

  /**
   * Fetches the plan details from the backend and enriches it with macro information.
   */
  const getData = async () => {
    if (!globalPlan) {
      setPlan(undefined);
      return;
    }
    setLoading(true);
    setError(null);
    try {
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

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalPlan]);

  return (
    <PlanContext.Provider value={{ plan, loading, error, getData, setPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

/**
 * Custom hook to access the PlanContext.
 */
export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};
