// Imports
import { TrashIcon } from "@heroicons/react/20/solid";
import axios from "axios";
import React, { SetStateAction, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Interfaces
interface MealFood {
  id: number;
  foodName: string;
  mealId: number;
  foodId: string;
  quantity: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

interface SearchSuggestions {
  foodId: string;
  foodName: string;
  macros: {
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  };
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

interface Props {
  meals: Meal[];
  setMeals: React.Dispatch<SetStateAction<Meal[]>>;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Main function
export default function Meal({ meals = [], setMeals }: Props) {
  // Login check

  useLogin();

  const navigate = useNavigate();
  const mealId = Number(useParams().mealId);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // States
  const [meal, setMeal] = useState<Meal>({
    id: 0,
    name: "",
    MealFoods: [],
  });

  const [searchSuggestions, setSearchSuggestions] = useState<
    SearchSuggestions[]
  >([]);

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // get data
  useEffect(() => {
    if (!meals || meals.length === 0) {
      return; // Exit the effect if meals is not ready
    }

    const meal = meals.find((m) => m.id === mealId);
    if (meal) {
      setMeal(meal);
    } else {
    }
  }, [mealId, meals]); // Ensure meals is in the dependency array

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Change handlers

  //Food quantity change handler
  function handleQuantityChange(
    event: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) {
    const newQuantity = Number(event.target.value);

    // Clone the MealFoods array and update the quantity for the specific index
    const updatedMealFoods = meal.MealFoods.map((food, index) => {
      if (index === idx) {
        return { ...food, quantity: newQuantity };
      }
      return food;
    });

    // Update the meal state with the new MealFoods array
    setMeal((prevMeal) => ({
      ...prevMeal,
      MealFoods: updatedMealFoods,
    }));
  }

  // Meal name change handler
  function handleMealNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newName = event.target.value;
    setMeal((prev) => ({ ...prev, ["name"]: newName }));
  }

  // Food search input change handler
  async function handleSearchChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const searchInput = event.target.value.trim();

    if (searchInput === "") {
      setSearchSuggestions([]); // Clear suggestions if input is empty
    } else {
      try {
        const result = await axios.get(
          "https://api.edamam.com/api/food-database/v2/parser",
          {
            params: {
              app_id: "225503b7",
              app_key: "1a3335dc20c618bdf213441cce8aeadb",
              ingr: searchInput,
            },
          }
        );

        const suggestions = result.data.hints
          .map((hint: any) => ({
            foodId: hint.food.foodId,
            foodName: hint.food.label,
            macros: {
              protein: hint.food.nutrients.PROCNT,
              fats: hint.food.nutrients.FAT,
              carbs: hint.food.nutrients.CHOCDF,
              calories: hint.food.nutrients.ENERC_KCAL,
            },
          }))
          .slice(0, 5);
        setSearchSuggestions(suggestions);
      } catch (error) {
        console.log(error);
        setSearchSuggestions([]); // Clear suggestions if there is an error
      }
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Submit handlers

  // Searched food select handler
  async function handleSearchSelect(
    event: React.ChangeEvent<HTMLSelectElement>
  ): Promise<void> {
    const selectedFoodId = event.target.value;
    const selectedFood = searchSuggestions.find(
      (item) => item.foodId === selectedFoodId
    );

    if (!selectedFood) {
      console.log("Selected food not found in suggestions.");
      return;
    }

    try {
      const foodId = selectedFood.foodId;
      const foodName = selectedFood.foodName;
      const quantity = 100; // Default quantity
      const result = await axios.post(
        "http://100.28.28.31:3001/meal/addSingleFood",
        { mealId, foodId, foodName, quantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (result.status === 200) {
        const id = result.data.id; // Assuming API returns the id of the new food entry

        const newMealFood: MealFood = {
          id,
          mealId,
          foodName,
          foodId,
          quantity,
          macros: {
            protein: selectedFood.macros.protein,
            fats: selectedFood.macros.fats,
            carbs: selectedFood.macros.carbs,
            calories: selectedFood.macros.calories,
          },
        };

        // Update the meal state with the new MealFoods array
        setMeal((prevMeal) => ({
          ...prevMeal,
          MealFoods: [...prevMeal.MealFoods, newMealFood],
        }));
      }
    } catch (error) {
      console.error("Error adding food to meal:", error);
    }

    setSearchSuggestions([]);
  }

  // Save Changes Button Handler
  async function handleSubmit() {
    try {
      const result = await axios.put(
        "http://100.28.28.31:3001/meal/updateMealDetails",
        { ...meal },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            mealId,
          },
        }
      );
      if (result.status === 200) {
        setMeals((prev) => {
          const updatedMeals = prev.map((m) => {
            if (m.id === meal.id) {
              return meal;
            }
            return m;
          });

          return updatedMeals;
        });

        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Delete Food Button handler
  async function handleDeleteFood(foodId: string) {
    try {
      const result = await axios.delete(
        "http://100.28.28.31:3001/meal/deleteFoodFromMeal",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params: {
            mealId, // Using mealId from the component state
            foodId, // Passed to the function
          },
        }
      );

      if (result.status === 200) {
        // Update the meal state by removing the food item with the matching foodId
        setMeal((prevMeal) => ({
          ...prevMeal,
          MealFoods: prevMeal.MealFoods.filter(
            (food) => food.foodId.toString() !== foodId.toString()
          ),
        }));
      }
    } catch (error) {
      console.error("Error deleting food from meal:", error);
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Calculating total nutrients using meal.MealFoods
  const totals = meal.MealFoods.reduce(
    (acc, food) => {
      // Ensure macros and quantity are not undefined using logical OR with defaults
      const macros = food.macros || {
        protein: 0,
        fats: 0,
        carbs: 0,
        calories: 0,
      };
      const quantity = food.quantity || 0; // Ensure quantity is not null/undefined

      // Update totals for protein, fats, and carbs
      acc.protein += (macros.protein * quantity) / 100;
      acc.fats += (macros.fats * quantity) / 100;
      acc.carbs += (macros.carbs * quantity) / 100;

      // Calculate calories
      const caloriesFromProtein = (macros.protein * 4 * quantity) / 100;
      const caloriesFromFats = (macros.fats * 9 * quantity) / 100;
      const caloriesFromCarbs = (macros.carbs * 4 * quantity) / 100;

      // Sum calories from all macronutrients
      acc.calories +=
        caloriesFromProtein + caloriesFromFats + caloriesFromCarbs;

      return acc;
    },
    { protein: 0, fats: 0, carbs: 0, calories: 0 }
  );

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // JSX
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex mb-4 items-center">
        {/* Meal Name Input Box */}
        <input
          className="flex-1 border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2 mr-4"
          type="text"
          placeholder="Meal name"
          onChange={handleMealNameChange}
          value={meal.name}
        />

        {/* Search Container */}
        <div className="flex-1 relative">
          {/* Food Search box */}
          <input
            type="text"
            className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-2"
            placeholder="Search and Add food"
            onChange={handleSearchChange}
          />
          {/* Conditional Rendering of Suggestions List */}
          {searchSuggestions.length > 0 && (
            <select
              onChange={handleSearchSelect}
              className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow z-50"
              size={Math.min(searchSuggestions.length, 5)}
            >
              {searchSuggestions.map((item, index) => (
                <option key={index} value={item.foodId}>
                  {item.foodName}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {/* Nutrition Table */}
      <table className="table-auto w-full">
        {/* Table Head */}
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-gray-700">Food</th>
            <th className="px-4 py-2 text-gray-700">Quantity (g)</th>
            <th className="px-4 py-2 text-blue-600">Protein (g)</th>
            <th className="px-4 py-2 text-orange-600">Fats (g)</th>
            <th className="px-4 py-2 text-yellow-600">Carbs (g)</th>
            <th className="px-4 py-2 text-yellow-600">Calories (kcal)</th>
            <th className="px-4 py-2 text-gray-700">Action</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {meal.MealFoods.map((food, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="border px-4 py-2">{food.foodName}</td>
              {/* Quantity input box */}
              <td className="border px-4 py-2">
                <input
                  type="number"
                  className="w-full p-2 border-2 border-gray-200 rounded focus:border-blue-500 text-right"
                  value={food.quantity || ""}
                  onChange={(e) => handleQuantityChange(e, idx)}
                />
              </td>
              {/* Nutrients */}
              <td className="border px-4 py-2">
                {(
                  ((food.macros || { protein: 0 }).protein *
                    (food.quantity || 100)) /
                  100
                ).toFixed(2)}
              </td>
              <td className="border px-4 py-2">
                {(
                  ((food.macros || { fats: 0 }).fats * (food.quantity || 100)) /
                  100
                ).toFixed(2)}
              </td>
              <td className="border px-4 py-2">
                {(
                  ((food.macros || { carbs: 0 }).carbs *
                    (food.quantity || 100)) /
                  100
                ).toFixed(2)}
              </td>
              <td className="border px-4 py-2">
                {(
                  (((food.macros || { protein: 0 }).protein *
                    (food.quantity || 100)) /
                    100) *
                    4 +
                  (((food.macros || { carbs: 0 }).carbs *
                    (food.quantity || 100)) /
                    100) *
                    4 +
                  (((food.macros || { fats: 0 }).fats *
                    (food.quantity || 100)) /
                    100) *
                    9
                ).toFixed(2)}
              </td>
              {/* Delete button */}
              <td className="cursor-pointer border px-4 py-2">
                <TrashIcon
                  onClick={() => {
                    const foodId = food.foodId;

                    handleDeleteFood(foodId);
                  }}
                  className="text-red-500 hover:text-red-700"
                />
              </td>
            </tr>
          ))}
          {/* Total nutrients row */}
          <tr className="font-bold bg-gray-100">
            <td className="border px-4 py-2">Total</td>
            <td className="border px-4 py-2">—</td>
            <td className="border px-4 py-2">{totals.protein.toFixed(2)}</td>
            <td className="border px-4 py-2">{totals.fats.toFixed(2)}</td>
            <td className="border px-4 py-2">{totals.carbs.toFixed(2)}</td>
            <td className="border px-4 py-2">{totals.calories.toFixed(2)}</td>
            <td className="border px-4 py-2">-</td>
          </tr>
        </tbody>
      </table>

      {/* Final Submit button */}
      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save Changes
        </button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-4">
          <Link to="/dashboard">Dashboard</Link>
        </button>
      </div>
    </div>
  );
}
