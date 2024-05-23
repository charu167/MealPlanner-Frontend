// Imports
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrashIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PencilIcon,
} from "@heroicons/react/16/solid";
import { Link, useNavigate } from "react-router-dom";

//Interfaces
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
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
}

// Main function
export default function Meals({ meals, setMeals }: Props) {
  const navigate = useNavigate();
  // States
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  // Load data
  useEffect(() => {
    async function getMeals() {
      try {
        const result = await axios.get("http://localhost:3001/meal", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        const data = result.data.Meal;

        setMeals(data);
      } catch (error) {
        console.log(error);
      }
    }
    getMeals();
  }, []);

  // Submit handlers (delete meal)
  async function deleteMeal(mealId: number) {
    try {
      const result = await axios.delete("http://localhost:3001/meal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          mealId,
        },
      });
      navigate("/dashboard");
      setMeals((prev) => prev.filter((meal) => meal.id !== result.data.id));
    } catch (error) {
      console.log(error);
    }
  }

  // Helper functions
  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  //JSX
  return (
    <ul className="w-full h-screen overflow-y-auto">
      {meals.length === 0
        ? "No meals yet"
        : meals.map((e) => (
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // THE DRAGGABLR, THE DROPPABLE
            <li
              key={e.id}
              draggable="true"
              onDragStart={(event) => {
                const meal = JSON.stringify(e);
                event.dataTransfer.setData("meal", meal);
              }}
              className="border border-gray-300 rounded mb-2"
            >
              {/* Main Meal Section */}
              <div className="flex justify-between items-center p-2">
                <span className="text-left">{e.name}</span>
                <div className="flex items-center space-x-2">
                  <button className=" text-amber-500 hover:text-amber-700 focus:outline-none">
                    <Link to={`/dashboard/meal/${e.id}`}>
                      <PencilIcon className="h-5 w-5" />
                    </Link>
                  </button>
                  <button
                    onClick={() => deleteMeal(e.id)}
                    className="text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => toggleExpand(e.id)}
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  >
                    {expanded[e.id] ? (
                      <ChevronDownIcon className="h-5 w-5" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* MealFoods Sublist */}
              {expanded[e.id] && (
                <ul className="pl-6 pb-2 border-t border-gray-300">
                  {e.MealFoods.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center p-2 border-b border-gray-300"
                    >
                      <span className="text-left">{item.foodName}</span>
                      <span className="text-right">{item.quantity}gm</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
    </ul>
  );
}
