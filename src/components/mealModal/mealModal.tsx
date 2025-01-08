"use client";

import React, { SetStateAction, useContext, useEffect, useState } from "react";
import axios from "axios";
import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

import MealInfoTable from "../mealInfoTable/mealInfoTable";
import { ColumnMealContext, Meal } from "@/context/columnMealContext";

interface MealModalProps {
  open: boolean;
  setOpen: React.Dispatch<SetStateAction<boolean>>;
  selectedMeal: Meal | undefined;
  setCurrMeal: React.Dispatch<SetStateAction<Meal | undefined>>;
}

export default function MealModal({
  open,
  setOpen,
  selectedMeal,
  setCurrMeal,
}: MealModalProps) {
  // Context
  const { meal, setMeal } = useContext(ColumnMealContext);

  // Local states
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [saveLoading, setSaveLoading] = useState<boolean>(false); // For saving
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false); // For deleting
  const [fetchingMacros, setFetchingMacros] = useState<boolean>(false); // For fecthing macros of each food item from edamam

  // =========================
  // SYNC SELECTED MEAL TO CONTEXT
  // =========================
  useEffect(() => {
    if (selectedMeal) {
      setMeal({
        id: selectedMeal.id,
        name: selectedMeal.name,
        MealFoods: selectedMeal.MealFoods ?? [],
      });
    } else {
      setMeal(undefined);
    }
  }, [selectedMeal, setMeal]);

  // =========================
  // FETCH MACROS WHEN MEAL CHANGES
  // =========================
  useEffect(() => {
    if (!meal || !meal.MealFoods?.length) return;

    // 1) Check if all items already have macros
    const missingMacros = meal.MealFoods.some((item) => !item.macros);

    // 2) If none are missing macros, skip fetching
    if (!missingMacros) return;

    // 3) Otherwise, proceed to fetch macros
    const currentMeal = meal;

    async function fetchAllMacros() {
      try {
        setFetchingMacros(true);

        const updatedFoods = await Promise.all(
          currentMeal.MealFoods.map(async (foodItem) => {
            // POST request body for Edamam
            const postData = {
              ingredients: [
                {
                  quantity: 100, // grams
                  measureURI: "g",
                  foodId: foodItem.foodId,
                },
              ],
            };

            // Make the POST request to Edamam's /v2/nutrients
            const res = await axios.post(
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

            // Extract macros from response
            // @ts-expect-error desc
            const totalNutrients = res.data?.totalNutrients || {};
            const protein = totalNutrients.PROCNT?.quantity || 0;
            const fats = totalNutrients.FAT?.quantity || 0;
            const carbs = totalNutrients.CHOCDF?.quantity || 0;
            const calories = totalNutrients.ENERC_KCAL?.quantity || 0;

            return {
              ...foodItem,
              macros: { protein, fats, carbs, calories },
            };
          })
        );

        // Update meal in context
        setMeal((prev) => {
          if (!prev) return prev;
          return { ...prev, MealFoods: updatedFoods };
        });
      } catch (err) {
        console.error("Error fetching macros:", err);
      } finally {
        setFetchingMacros(false);
      }
    }

    fetchAllMacros();
  }, [meal, setMeal]);

  // =========================
  // HANDLE MODAL CLOSE
  // =========================
  function handleModalClose() {
    setMeal(undefined);
    setSearchSuggestions([]);
    setCurrMeal(undefined);
    setOpen(false);
  }

  // =========================
  // SEARCH BAR (PARSE FOOD)
  // =========================
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

  // =========================
  // ADD FOOD TO MEAL
  // =========================
  function handleSearchSelect(event: React.ChangeEvent<HTMLSelectElement>) {
    const selectedFood = JSON.parse(event.target.value);

    setMeal((prev) => {
      if (!prev) {
        return {
          name: "",
          MealFoods: [selectedFood],
        };
      }
      return {
        ...prev,
        MealFoods: [...prev.MealFoods, selectedFood],
      };
    });

    setSearchSuggestions([]);
  }

  // =========================
  // MEAL NAME CHANGE
  // =========================
  function handleMealNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newName = event.target.value;
    setMeal((prev) => {
      if (!prev) {
        return { name: newName, MealFoods: [] };
      }
      return { ...prev, name: newName };
    });
  }

  // =========================
  // SAVE HANDLER
  // =========================
  async function handleSave() {
    if (!meal) return;
    setSaveLoading(true);

    try {
      if (meal.id) {
        // Existing meal -> PUT
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/meal/${meal.id}`,
          meal,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
      } else {
        // New meal -> POST
        await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/meal`, meal, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSaveLoading(false);
      handleModalClose();
    }
  }

  // =========================
  // DELETE HANDLER
  // =========================
  async function handleDelete() {
    if (!meal?.id) {
      handleModalClose();
      return;
    }
    setDeleteLoading(true);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meal/${meal.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteLoading(false);
      handleModalClose();
    }
  }

  // =========================
  //          TSX
  // =========================
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <Overlay />

          <motion.div
            className="min-h-[50%] max-h-[90%] md:max-w-[65%] bg-white dark:bg-neutral-950 
                       border border-transparent dark:border-neutral-800 md:rounded-2xl 
                       relative z-50 flex flex-col flex-1 overflow-hidden"
            initial={{ opacity: 0, scale: 0.5, rotateX: 40, y: 40 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 15 }}
          >
            {/* CONTENT */}
            <div className="p-6 flex flex-col gap-6 px-12 bg-white rounded-lg shadow-md relative">
              {/* Close Icon */}
              <div className="flex items-center justify-end">
                <IconX
                  onClick={handleModalClose}
                  className="cursor-pointer text-neutral-500 hover:text-neutral-700 transition duration-150"
                />
              </div>

              {/* Meal Name */}
              <input
                type="text"
                value={meal?.name || ""}
                onChange={handleMealNameChange}
                placeholder="Meal Name"
                className="text-xl font-bold mx-auto text-center 
                           focus:border-b-2 focus:border-b-blue-500 p-3 border-b w-1/4 
                           border-neutral-300 focus:outline-none"
              />

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

              {/* Macro Loading Indicator */}
              {fetchingMacros && (
                <p className="text-center text-sm text-gray-500 mt-1">
                  Loading macros from Edamam...
                </p>
              )}

              {/* Meal Info Table */}
              <div className="mt-4">
                <MealInfoTable />
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saveLoading} // Optionally disable while saving
                  className={`bg-gradient-to-br w-36 relative group/btn from-zinc-900 to-zinc-900 bg-zinc-800 text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]
                             ${
                               saveLoading
                                 ? "opacity-50 cursor-not-allowed"
                                 : ""
                             }`}
                >
                  {saveLoading ? "Saving..." : "Save"}
                </button>
                {selectedMeal ? (
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className={`bg-gradient-to-br w-36 relative group/btn from-zinc-900 to-zinc-900 bg-zinc-800 text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]
                             ${
                               deleteLoading
                                 ? "opacity-50 cursor-not-allowed"
                                 : ""
                             }`}
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                ) : null}
              </div>
            </div>
            {/* /CONTENT */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Overlay
const Overlay = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      className="fixed inset-0 h-full w-full bg-black bg-opacity-50 z-50"
    />
  );
};
