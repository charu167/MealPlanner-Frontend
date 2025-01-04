"use client";
import { useContext } from "react";
import axios from "axios";
import { GlobalPlansContext } from "@/context/globalPlanContext";
import { usePlan } from "@/context/PlanContext";
import { Meal } from "@/context/columnMealContext";

/**
 * Custom hook to handle drag-and-drop functionality for adding meals.
 */
export const useHandleDrop = () => {
  const { globalPlan } = useContext(GlobalPlansContext);
  const { getData } = usePlan(); // Access the getData function from context

  /**
   * Handles the drop event to add a meal to the plan.
   * @param event - Drag event from the drop zone.
   */
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const mealData = event.dataTransfer.getData("currMeal");
    if (!mealData) {
      console.warn("No meal data found in drag event.");
      return;
    }

    const meal = JSON.parse(mealData) as Meal;

    try {
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
        await getData(); // Refresh the plan data upon successful addition
      } else {
        console.warn("Unexpected response status:", res.status);
      }
    } catch (error) {
      console.error("Error adding meal to plan:", error);
    }
  };

  return { handleDrop };
};
