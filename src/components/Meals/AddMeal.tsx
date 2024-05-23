import axios from "axios";
import React, { SetStateAction, Dispatch, useState } from "react";

import Search from "./Search";
import Modal from "../Helper/Modal";

//Interfaces
interface Meal {
  id: number;
  name: string;
  MealFoods: {
    foodName: string;
    mealId: number;
    foodId: string;
    quantity: any;
    macros?: {
      protein: number;
      fats: number;
      carbs: number;
    };
  }[];
}

interface addMealProps {
  setMeals: Dispatch<SetStateAction<Meal[]>>;
}

interface FoodList {
  foodId: string;
  name: string;
  quantity: any;
  macros?: {
    protein: number;
    fats: number;
    carbs: number;
  };
}

// Main function
export default function AddMeal({ setMeals }: addMealProps) {
  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mealName, setMealName] = useState<String>("");
  const [foodList, setFoodList] = useState<FoodList[]>([]);

  // Change Handlers
  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;

    setMealName(name);
  }

  function setQuantity(index: number, quantity: number) {
    setFoodList((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          // Check if it's the item we want to update
          return { ...item, quantity }; // Update the quantity of this item
        }
        return item; // Return all other items unchanged
      })
    );
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFoodList([]);
  };

  // Submit Handlers
  async function handleSubmit() {
    try {
      const result = await axios.post(
        "http://100.28.28.31:3001/meal",
        { name: mealName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      interface MealFoods {
        mealId: number;
        foodName: string;
        foodId: string;
        quantity: number | null;
        macros?: {
          protein: number;
          fats: number;
          carbs: number;
        };
      }
      let mealFoods: MealFoods[] = [];
      const mealId = result.data.id;
      for (let i = 0; i < foodList.length; i++) {
        const foodName = foodList[i].name;
        const foodId = foodList[i].foodId;
        const quantity = foodList[i].quantity;
        const macros = foodList[i].macros;
        mealFoods.push({ mealId, foodId, foodName, quantity, macros });
      }
      const result2 = await axios.post(
        "http://100.28.28.31:3001/meal/addMultipleFoods",
        mealFoods,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (result2.status === 200) {
        setMeals((prev) => [
          ...prev,
          { id: result.data.id, name: result.data.name, MealFoods: mealFoods },
        ]);
      }

      closeModal();
    } catch (error) {
      console.log(error);
    }
  }

  // JSX
  return (
    <>
      <div className="p-4">
        <div className="px-4 py-2">
          <button
            onClick={openModal}
            className="w-full bg-blue-500 text-white rounded hover:bg-blue-600 text-sm py-2 shadow" // Styling adjusted for consistency
          >
            Add Meal
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Add New Meal</h2>
          <input
            onChange={handleChange}
            type="text"
            placeholder="Meal Name"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />

          <Search setFoodList={setFoodList} />
          {foodList.map((e, i) => (
            <div key={i} className="flex items-center space-x-2 mb-2">
              <span className="flex-1">{e.name}</span>
              <input
                className="w-20 p-1 border border-gray-300 rounded"
                type="number"
                placeholder="Qty"
                value={e.quantity}
                onChange={(event) =>
                  setQuantity(i, parseInt(event.target.value) || 0)
                }
              />
            </div>
          ))}

          <button
            onClick={handleSubmit}
            className="w-full bg-red-500 text-white rounded hover:bg-red-600 py-2 mt-4" // Ensured consistent styling for the submit button
          >
            Submit
          </button>
        </Modal>
      )}
    </>
  );
}
