import React, { SetStateAction, useState } from "react";
import Modal from "../Helper/Modal";
import axios from "axios";

// Interfaces
interface Plan {
  id: number;
  name: string;
}

interface Meal {
  id: number;
  name: string;
  MealFoods: {
    foodName: string;
    mealId: number;
    foodId: string;
    quantity: number | null;
  }[];
}

interface MealListItem {
  mealId: number;
  name: string;
  planId: number;
}

interface Props {
  setPlans: React.Dispatch<SetStateAction<Plan[]>>;
  meals: Meal[];
}

export default function AddPlan({ setPlans, meals }: Props) {
  // States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [planName, setPlanName] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [mealList, setMealList] = useState<MealListItem[]>([]);

  // Change handlers
  function handlePlanNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.value;
    setPlanName(name);
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearch(event.target.value);
  }

  const openModal = () => {
    setPlanName("");
    setSearch("");
    setMealList([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPlanName("");
  };

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const vals = event.target.value.split("|");
    const mealId = Number(vals[0]);
    const name = vals[1];
    const planId = 0;
    setMealList((prev) => [...prev, { mealId, name, planId }]);
  }

  // Submit handlers
  async function handleSubmit() {
    try {
      const plan = await axios.post(
        "http://100.28.28.31:3001/plan",
        { name: planName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setPlans((prev) => [...prev, plan.data]);

      const planId = plan.data.id;

      const dataList: { mealId: number; planId: Number; mealName: string }[] =
        mealList.map((meal) => {
          const mealId = meal.mealId;
          const mealName = meal.name;
          return { mealId, planId, mealName };
        });

      const mealCount = await axios.post(
        "http://100.28.28.31:3001/plan/addMultipleMeals",
        dataList,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log(mealCount.data);
      closeModal();
    } catch (error) {
      console.log(error);
    }
  }

  // JSX
  return (
    <div>
      <div className="p-4">
        <div className="px-4 py-2">
          <button
            onClick={openModal}
            className="w-full bg-blue-500 text-white rounded hover:bg-blue-600 text-sm py-2 shadow" // Adjusted color and added shadow
          >
            Add Plan
          </button>
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Add New Plan</h2>
          <input
            onChange={handlePlanNameChange}
            value={planName}
            type="text"
            placeholder="Plan name"
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />

          <input
            onChange={handleSearchChange}
            value={search}
            type="text"
            placeholder="Search Meal"
            className="w-full p-2 border border-gray-300 rounded " // Added consistent styling for search input
          />
          <select
            name="meal"
            id="meal"
            size={meals.length || 5}
            className="w-full border border-gray-300 rounded p-2 mb-4"
            onChange={handleSelectChange}
          >
            {/* <option value="select">Select</option> */}
            {meals
              .filter((meal) =>
                meal.name.toLowerCase().includes(search.toLowerCase())
              )
              .map((meal) => (
                <option value={`${meal.id}|${meal.name}`} key={meal.id}>
                  {meal.name}
                </option>
              ))}
          </select>

          {mealList.map((meal) => (
            <div key={meal.mealId}>{meal.name}</div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white rounded hover:bg-blue-600 py-2 mt-4" // Styling consistency and padding adjustment
          >
            Submit
          </button>
        </Modal>
      )}
    </div>
  );
}
