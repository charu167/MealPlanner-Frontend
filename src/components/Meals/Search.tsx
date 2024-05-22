import axios from "axios";
import React, { useState } from "react";

// Interfaces
interface FoodList {
  foodId: string;
  name: string;
  quantity: number | null;
  macros?: {
    protein: number;
    fats: number;
    carbs: number;
  };
}

interface suggestions {
  label: string;
  foodId: string;
  macros?: {
    protein: number;
    fats: number;
    carbs: number;
  };
}

interface searchProps {
  setFoodList: React.Dispatch<React.SetStateAction<FoodList[]>>;
}

// Main Function
export default function Search({ setFoodList }: searchProps) {
  // States
  const [suggestions, setSuggestions] = useState<suggestions[]>([]);
  const [selectSize, setSelectSize] = useState(0);

  // Change handlers
  async function handleChangeSearch(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const ingr = event.target.value;

    const result = await axios.get(
      "https://api.edamam.com/api/food-database/v2/parser",
      {
        params: {
          app_id: "225503b7",
          app_key: "1a3335dc20c618bdf213441cce8aeadb",
          ingr,
        },
      }
    );

    const foodLabels = result.data.hints
      .map((hint: any) => {
        const label = hint.food.label;
        const foodId = hint.food.foodId;
        const macros = {
          protein: hint.food.nutrients.PROCNT,
          fats: hint.food.nutrients.FAT,
          carbs: hint.food.nutrients.CHOCDF,
        };
        return { label, foodId, macros };
      })
      .slice(0, 5);
    setSuggestions(foodLabels);
    setSelectSize(suggestions.length + 1);
  }

  // Submit Handlers
  async function handleSubmit(event: React.ChangeEvent<HTMLSelectElement>) {
    let [foodId, name, protein, fats, carbs] = event.target.value.split("|");

    const quantity = null;

    const macros = {
      protein: parseFloat(protein),
      fats: parseFloat(fats),
      carbs: parseFloat(carbs),
    };

    setFoodList((prev) => [...prev, { foodId, name, quantity, macros }]);
    setSelectSize(0);
    setSuggestions([]);
  }

  // JSX
  return (
    <div className="relative w-64 flex flex-col">
      <input
        type="text"
        placeholder="Search Food Item"
        onChange={handleChangeSearch}
        className="w-full p-2 border border-gray-300 rounded"
      />
      {suggestions.length > 0 && (
        <select
          onChange={handleSubmit}
          name="suggestions"
          id="suggestions"
          size={selectSize}
          className=" top-full mt-1 w-full border border-gray-300 rounded bg-white shadow-lg"
        >
          <option>Select</option>
          {suggestions.map((e, i) => {
            return (
              <option
                key={i}
                value={`${e.foodId}|${e.label}|${e.macros?.protein}|${e.macros?.fats}|${e.macros?.carbs}`}
                id={e.label}
                className="p-2"
              >
                {e.label}
              </option>
            );
          })}
        </select>
      )}
    </div>
  );
}
