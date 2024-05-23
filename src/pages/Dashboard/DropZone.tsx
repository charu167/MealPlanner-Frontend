import { PencilIcon, XCircleIcon } from "@heroicons/react/24/outline";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

//Interfaces
interface PlanMealList {
  entryId: number;
  mealName: string;
  mealId: number;
  meal?: Meal;
}

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

// MAIN FUNCTION
export default function DropZone({ meals }: { meals: Meal[] }) {
  // Login check
  useLogin();

  const { planId } = useParams();

  // States
  const [planMealList, setPlanMealList] = useState<PlanMealList[]>([]);
  const [planName, setPlanName] = useState<string>("");
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

  // Get data
  useEffect(() => {
    async function getPlanDetails() {
      try {
        const result = await axios.get(
          "http://localhost:3001/plan/getPlanDetails",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            params: {
              planId,
            },
          }
        );
        setPlanName(result.data.name);

        const tempMealList = result.data.PlanMeals.map((entry: any) => {
          const entryId = entry.id;
          const mealId = entry.mealId;
          const mealDetail = meals.find((meal) => meal.id === entry.mealId);
          const mealName = mealDetail?.name;

          return { entryId, mealName, mealId, meal: mealDetail };
        });

        setPlanMealList(tempMealList);

        const goal = await axios.get("http://localhost:3001/goal", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setGoal(goal.data);
      } catch (error) {
        console.log(error);
      }
    }

    getPlanDetails();
  }, [planId, meals]);

  // Submit handlers
  async function handleDeleteMeal(entryId: number) {
    try {
      const result = await axios.delete(
        "http://localhost:3001/plan/deleteMealFromPlan",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            entryId,
          },
        }
      );

      setPlanMealList((prev) =>
        prev.filter((entry) => entry.entryId !== result.data.id)
      );
    } catch (error) {
      console.error("Failed to delete meal from plan:", error);
    }
  }

  async function handleAddMeal(event: React.DragEvent<HTMLDivElement>) {
    try {
      const meal: Meal = JSON.parse(event.dataTransfer.getData("meal"));
      const mealId = meal.id;
      const mealName = meal.name;
      const result = await axios.post(
        "http://localhost:3001/plan/addSingleMEal",
        { mealId, planId, mealName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      const entryId = result.data.id;
      setPlanMealList((prev) => [...prev, { mealId, mealName, entryId, meal }]);
    } catch (error) {
      console.log(error);
    }
  }

  // Helpers
  function calculateTotalMacros(meal: Meal | undefined) {
    if (!meal || !meal.MealFoods) return { protein: 0, fats: 0, carbs: 0 };

    return meal.MealFoods.reduce(
      (acc, food) => {
        const { protein = 0, fats = 0, carbs = 0 } = food.macros || {};
        return {
          protein: acc.protein + (protein * Number(food.quantity)) / 100,
          fats: acc.fats + (fats * Number(food.quantity)) / 100,
          carbs: acc.carbs + (carbs * Number(food.quantity)) / 100,
        };
      },
      { protein: 0, fats: 0, carbs: 0 }
    );
  }

  function calculatePlanTotalMacros(planMeals: PlanMealList[]) {
    return planMeals.reduce(
      (total, planMeal) => {
        const mealMacros = calculateTotalMacros(planMeal.meal);
        return {
          protein: total.protein + mealMacros.protein,
          fats: total.fats + mealMacros.fats,
          carbs: total.carbs + mealMacros.carbs,
        };
      },
      { protein: 0, fats: 0, carbs: 0 }
    );
  }

  // JSX
  return (
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // THE DROP ZONE
    <div className="flex flex-col items-center w-full">
      <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          Total Target Macros
        </h1>
        <div className="mt-4 space-y-2">
          {(() => {
            // const totalMacros = calculatePlanTotalMacros(planMealList);
            return (
              <div className="flex items-center space-x-6 text-base">
                <span className="text-gray-700">
                  Protein:{" "}
                  <span className="font-semibold text-blue-600">
                    {goal.protein.toFixed(2)}g
                  </span>
                </span>
                <span className="text-gray-700">
                  Fats:{" "}
                  <span className="font-semibold text-orange-600">
                    {goal.fats.toFixed(2)}g
                  </span>
                </span>
                <span className="text-gray-700">
                  Carbs:{" "}
                  <span className="font-semibold text-yellow-600">
                    {goal.carbs.toFixed(2)}g
                  </span>
                </span>
                <span className="text-gray-700">
                  Calories:{" "}
                  <span className="font-semibold text-yellow-600">
                    {(
                      goal.carbs * 4 +
                      goal.protein * 4 +
                      goal.fats * 9
                    ).toFixed(2)}
                    kcal
                  </span>
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="mx-8 my-5 p-5 shadow-xl bg-white rounded-xl">
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          Total Plan Macros
        </h1>
        <div className="mt-4 space-y-2">
          {(() => {
            const totalMacros = calculatePlanTotalMacros(planMealList);
            return (
              <div className="flex items-center space-x-6 text-base">
                <span className="text-gray-700">
                  Protein:{" "}
                  <span className="font-semibold text-blue-600">
                    {totalMacros.protein.toFixed(2)}g
                  </span>
                </span>
                <span className="text-gray-700">
                  Fats:{" "}
                  <span className="font-semibold text-orange-600">
                    {totalMacros.fats.toFixed(2)}g
                  </span>
                </span>
                <span className="text-gray-700">
                  Carbs:{" "}
                  <span className="font-semibold text-yellow-600">
                    {totalMacros.carbs.toFixed(2)}g
                  </span>
                </span>
                <span className="text-gray-700">
                  Calories:{" "}
                  <span className="font-semibold text-yellow-600">
                    {(
                      totalMacros.carbs * 4 +
                      totalMacros.protein * 4 +
                      totalMacros.fats * 9
                    ).toFixed(2)}
                    kcal
                  </span>
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      <div
        onDrop={handleAddMeal}
        onDragOver={(event) => event.preventDefault()}
        className="mx-8 my-5 p-5 w-full bg-white shadow-xl rounded-xl"
      >
        <h1 className="text-5xl text-center font-bold text-gray-800 mb-6">
          {planName}
        </h1>
        {planMealList.length > 0 ? (
          <div className="space-y-4 w-full">
            {planMealList.map((planMeal: PlanMealList) => {
              const macros = calculateTotalMacros(planMeal.meal);
              return (
                <div
                  key={planMeal.entryId}
                  className="grid grid-cols-12 gap-4 p-5 shadow bg-white rounded-lg"
                >
                  <div className="col-span-2 text-gray-700 text-xl truncate">
                    {planMeal.mealName}
                  </div>
                  <div className="col-span-8 flex justify-between text-base">
                    <p className="text-blue-600">
                      Protein:{" "}
                      <span className="font-semibold">
                        {macros.protein.toFixed(0)}g
                      </span>
                    </p>
                    <p className="text-orange-600">
                      Fats:{" "}
                      <span className="font-semibold">
                        {macros.fats.toFixed(0)}g
                      </span>
                    </p>
                    <p className="text-yellow-600">
                      Carbs:{" "}
                      <span className="font-semibold">
                        {macros.carbs.toFixed(0)}g
                      </span>
                    </p>
                    <p className="text-yellow-600">
                      Calories:{" "}
                      <span className="font-semibold">
                        {(
                          macros.carbs * 4 +
                          macros.protein * 4 +
                          macros.fats * 9
                        ).toFixed(0)}
                        kcal
                      </span>
                    </p>
                  </div>
                  <div className="col-span-2 flex justify-end items-center space-x-3">
                    <button className="text-blue-500 hover:text-blue-700">
                      <Link to={`/dashboard/meal/${planMeal.mealId}`}>
                        <PencilIcon className="w-6 h-6" />
                      </Link>
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(planMeal.entryId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XCircleIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No meals added to this plan yet.</p>
        )}
      </div>
    </div>
  );
}
