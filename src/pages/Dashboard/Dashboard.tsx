// Imports
import { Route, Routes } from "react-router-dom";

import AddMeal from "../../components/Meals/AddMeal";
import Meals from "../../components/Meals/Meals";

import Plans from "../../components/Plans/Plans";
import AddPlan from "../../components/Plans/AddPlan";

import { useEffect, useState } from "react";
import axios from "axios";
import Meal from "./Meal";
import DropZone from "./DropZone";
import useLogin from "../../hooks/useLogin";

// Main function
export default function Dashboard() {
  // Login check
  useLogin();

  // Interfaces
  interface Meal {
    id: number;
    name: string;
    MealFoods: {
      foodName: string;
      mealId: number;
      foodId: string;
      quantity: number | null;
      macros?: {
        protein: number;
        fats: number;
        carbs: number;
      };
    }[];
  }

  interface Plan {
    id: number;
    name: string;
  }

  // States
  // meals is a shared state between Meals and AddMeals components
  const [meals, setMeals] = useState<Meal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Get Data
  // Get meal data
  useEffect(() => {
    async function getMeals() {
      try {
        const result = await axios.get("http://100.28.28.31:3000/meal", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setMeals(result.data.Meal);
        return result.data.Meal;
      } catch (error) {
        console.log(error);
      }
    }

    async function getMacros(meals: Meal[]) {
      try {
        const updatedMeals = await Promise.all(
          meals.map(async (meal) => {
            const updatedMealFoods = await Promise.all(
              meal.MealFoods.map(async (food) => {
                const response = await axios.post(
                  "https://api.edamam.com/api/food-database/v2/nutrients",
                  {
                    ingredients: [
                      {
                        quantity: 100, // You might want to use food.quantity here if it's not null
                        measureURI: "g",
                        foodId: food.foodId,
                      },
                    ],
                  },
                  {
                    params: {
                      app_id: "225503b7",
                      app_key: "1a3335dc20c618bdf213441cce8aeadb",
                    },
                  }
                );
                const nutrients = response.data.totalNutrients;
                const macros = {
                  protein: nutrients.PROCNT.quantity,
                  fats: nutrients.FAT.quantity,
                  carbs: nutrients.CHOCDF.quantity,
                };
                return { ...food, macros }; // Update the macros for the food
              })
            );
            return { ...meal, MealFoods: updatedMealFoods }; // Return the updated meal
          })
        );

        setMeals(updatedMeals); // Update the state with the new meals data
      } catch (error) {
        console.log(error);
      }
    }

    getMeals().then((meals) => {
      if (meals) {
        getMacros(meals);
      }
    });
  }, []);

  // Get plan data
  useEffect(() => {
    async function getPlans() {
      try {
        const result = await axios.get("http://100.28.28.31:3000/plan", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        setPlans(result.data);
      } catch (error) {
        console.log(error);
      }
    }

    getPlans();
  }, []);

  // Change handlers

  // Submit handlers

  //JSX
  if (!meals) {
    return <div>Loading meals...</div>; // Or render a spinner or any appropriate loading state
  }

  return (
    <div className="flex" style={{ paddingTop: "60px" }}>
      {" "}
      {/* Adjust top padding here */}
      <div className="fixed top-12 left-0 h-full w-72 bg-white border-r border-gray-300 z-10 overflow-hidden">
        <AddMeal setMeals={setMeals} />
        <Meals meals={meals} setMeals={setMeals} />
      </div>
      <div className="ml-72 mr-72 flex-1 flex justify-center items-start">
        <Routes>
          <Route path="/plan/:planId" element={<DropZone meals={meals} />} />
          <Route
            path="/meal/:mealId"
            element={<Meal meals={meals} setMeals={setMeals} />}
          />
        </Routes>
      </div>
      <div className="fixed top-12 right-0 h-full w-72 bg-white border-l border-gray-300 z-10 overflow-hidden">
        <AddPlan meals={meals} setPlans={setPlans} />
        <Plans plans={plans} setPlans={setPlans} />
      </div>
    </div>
  );
}
