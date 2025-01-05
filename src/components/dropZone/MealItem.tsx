import {
  IconChevronDown,
  IconChevronUp,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import axios from "axios";
import React, { useState, SetStateAction } from "react";

// =========================
// INTERFACES
// =========================

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

interface MealItemProps {
  meal: PlanMeal;
  plan: Plan;
  setPlan: React.Dispatch<SetStateAction<Plan | undefined>>;
}

export default function MealItem({ meal, plan, setPlan }: MealItemProps) {
  // =========================
  // STATES
  // =========================

  const [isTableVisible, setIsTableVisible] = useState<boolean>(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);

  // =========================
  // MACRO CALCULATIONS
  // =========================

  const totalMacros = meal.PlanMealFoods.reduce(
    (totals, food) => {
      if (food.macros) {
        const multiplier = food.quantity / 100;
        totals.protein += food.macros.protein * multiplier;
        totals.fats += food.macros.fats * multiplier;
        totals.carbs += food.macros.carbs * multiplier;
        totals.calories += food.macros.calories * multiplier;
      }
      return totals;
    },
    { protein: 0, fats: 0, carbs: 0, calories: 0 }
  );

  const formattedTotals = {
    protein: totalMacros.protein.toFixed(2),
    fats: totalMacros.fats.toFixed(2),
    carbs: totalMacros.carbs.toFixed(2),
    calories: totalMacros.calories.toFixed(2),
  };

  // =========================
  // EVENT HANDLERS
  // =========================

  async function handleSearchSelect(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const selectedFood = JSON.parse(event.target.value);

    try {
      // Make API call to add the new food item
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/${plan.id}`,
        {
          name: plan.name,
          planMeal: {
            id: meal.id,
            planMealFoodsToCreate: [
              {
                foodName: selectedFood.foodName,
                foodId: selectedFood.foodId,
                quantity: selectedFood.quantity,
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      // @ts-expect-error desc
      const createdFoods = res.data.createdFoods;

      // Update the plan state locally
      setPlan((prevPlan) => {
        if (!prevPlan) return prevPlan;

        const updatedPlanMeals = prevPlan.PlanMeals.map((existingMeal) => {
          if (existingMeal.id === meal.id) {
            return {
              ...existingMeal,
              PlanMealFoods: [
                ...existingMeal.PlanMealFoods,
                {
                  ...selectedFood, // Keep the local macros, name, etc.
                  id: createdFoods[0].id, // Overwrite with the real DB id
                },
              ],
            };
          }
          return existingMeal;
        });

        return { ...prevPlan, PlanMeals: updatedPlanMeals };
      });
    } catch (error) {
      console.error("Error adding food item:", error);
    } finally {
      setSearchSuggestions([]);
    }
  }

  console.log(plan);

  async function handleSearchChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const searchInput = event.target.value.trim();

    if (!searchInput) {
      setSearchSuggestions([]);
      return;
    }

    try {
      const result = await axios.get(
        "https://api.edamam.com/api/food-database/v2/parser",
        {
          params: {
            app_id: process.env.NEXT_PUBLIC_EDAMAM_APP_ID, // Your Edamam App ID.
            app_key: process.env.NEXT_PUBLIC_EDAMAM_APP_KEY, // Your Edamam App Key.
            ingr: searchInput,
          },
        }
      );

      const suggestions =
        // @ts-expect-error desc
        result.data.hints
          ?.map((hint: any) => ({
            foodId: hint.food.foodId,
            foodName: hint.food.label,
            quantity: 100,
            macros: {
              protein: hint.food.nutrients.PROCNT || 0,
              fats: hint.food.nutrients.FAT || 0,
              carbs: hint.food.nutrients.CHOCDF || 0,
              calories: hint.food.nutrients.ENERC_KCAL || 0,
            },
          }))
          .slice(0, 5) || [];

      setSearchSuggestions(suggestions);
    } catch (error) {
      console.log(error);
      setSearchSuggestions([]);
    }
  }

  async function handleSave() {
    // Example request body that updates multiple PlanMealFoods
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/${plan.id}`,
      {
        name: "",
        planMeal: {
          id: meal.id,
          planMealFoodsToUpdate: meal.PlanMealFoods.map((planMealFood) => ({
            id: planMealFood.id,
            quantity: planMealFood.quantity,
          })),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // Optionally, you can handle success messages or local UI feedback
    console.log("Meal updated successfully!");
  }

  async function handleRemoveMeal() {
    await axios.delete(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/deleteMealFromPlan/${meal.id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // Update plan state to remove this meal
    setPlan((prevPlan) => {
      if (!prevPlan) return prevPlan;

      const updatedPlanMeals = prevPlan.PlanMeals.filter(
        (planMeal) => planMeal.id !== meal.id
      );

      return { ...prevPlan, PlanMeals: updatedPlanMeals };
    });
  }

  async function handleRemoveFood(foodId: number) {
    // Example: If you do a PUT request to remove that food in DB
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/${plan.id}`,
      {
        name: "",
        planMeal: {
          id: meal.id,
          planMealFoodsToDelete: [{ id: foodId }],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // Locally remove the item from state
    setPlan((prevPlan) => {
      if (!prevPlan) return prevPlan;

      const updatedPlanMeals = prevPlan.PlanMeals.map((planMeal) => {
        if (planMeal.id === meal.id) {
          const filteredFoods = planMeal.PlanMealFoods.filter(
            (planMealFood) => planMealFood.id !== foodId
          );
          return {
            ...planMeal,
            PlanMealFoods: filteredFoods,
          };
        }
        return planMeal;
      });

      return { ...prevPlan, PlanMeals: updatedPlanMeals };
    });
  }

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
            onClick={() => setIsTableVisible(!isTableVisible)}
          >
            {isTableVisible ? (
              <IconChevronUp size={20} />
            ) : (
              <IconChevronDown size={20} />
            )}
          </button>

          {/* Remove Meal Button */}
          <button
            onClick={handleRemoveMeal}
            className="text-red-500 hover:text-red-700"
          >
            <IconX size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <input
        onChange={handleSearchChange}
        type="text"
        placeholder="Search for a food item..."
        className="font-semibold text-base border border-neutral-300 rounded-md 
                           w-full p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {/* Suggestions List */}
      {searchSuggestions.length > 0 && (
        <div className="relative">
          <select
            onChange={handleSearchSelect}
            className="absolute w-full mt-1 bg-white border border-gray-300 
                               rounded shadow z-50 py-2 px-2 text-sm 
                               focus:outline-none focus:border-blue-400 
                               focus:ring-1 focus:ring-blue-400"
            size={Math.min(searchSuggestions.length, 5)}
          >
            {searchSuggestions.map((food, idx) => (
              <option key={idx} value={JSON.stringify(food)}>
                {food.foodName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Meal Info Table (conditionally rendered) */}
      {isTableVisible && (
        <div className="px-4 pb-4">
          {/* Table Container */}
          <div className="overflow-x-auto max-w-3xl rounded-lg shadow">
            <table className="min-w-full bg-white">
              {/* Table Header */}
              <thead>
                <tr>
                  <th className="px-2 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700 uppercase">
                    Food Name
                  </th>
                  <th className=" py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase">
                    Quantity (g)
                  </th>
                  <th className=" py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase">
                    Protein (g)
                  </th>
                  <th className=" py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase">
                    Fats (g)
                  </th>
                  <th className=" py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase">
                    Carbs (g)
                  </th>
                  <th className=" py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase">
                    Calories (kcal)
                  </th>
                  <th className=" py-3 border-b-2 border-gray-300 text-center text-sm font-semibold text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {meal.PlanMealFoods.map((food, idx) => {
                  // Calculate actual macros based on quantity
                  const multiplier = food.quantity / 100;
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
                    <tr key={idx} className="hover:bg-gray-100">
                      <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {food.foodName}
                      </td>
                      <td className=" py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        <input
                          className="w-20 px-2 py-1 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 text-center text-sm"
                          type="number"
                          onChange={(event) => {
                            const newQuantity = Number(event.target.value);

                            // Locally update the quantity
                            setPlan((prevPlan) => {
                              if (!prevPlan) return prevPlan;

                              const updatedPlanMeals = prevPlan.PlanMeals.map(
                                (prevMeal) => {
                                  if (prevMeal.id !== meal.id) return prevMeal;

                                  const updatedPlanMealFoods =
                                    prevMeal.PlanMealFoods.map((prevFood) => {
                                      if (prevFood.id !== food.id) {
                                        return prevFood;
                                      }
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
                          }}
                          value={food.quantity}
                        />
                      </td>
                      <td className=" py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {protein}
                      </td>
                      <td className=" py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {fats}
                      </td>
                      <td className=" py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {carbs}
                      </td>
                      <td className=" py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {calories}
                      </td>
                      <td className=" py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        <button
                          onClick={() => handleRemoveFood(food.id)}
                          className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out"
                        >
                          <IconTrash size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Total Row */}
                <tr className="bg-gray-100">
                  <td className="px-2 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                    Total
                  </td>
                  <td className=" py-3 whitespace-nowrap text-sm text-center text-gray-700" />
                  <td className=" py-3 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.protein}
                  </td>
                  <td className=" py-3 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.fats}
                  </td>
                  <td className=" py-3 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.carbs}
                  </td>
                  <td className=" py-3 whitespace-nowrap text-sm font-semibold text-center text-gray-900">
                    {formattedTotals.calories}
                  </td>
                  <td className=" py-3 whitespace-nowrap text-sm text-center text-gray-700"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150 ease-in-out"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
