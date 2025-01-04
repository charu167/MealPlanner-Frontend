"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { IconBowlChopsticks, IconPlus } from "@tabler/icons-react";

import { Sidebar, SidebarBody } from "../ui/MealsSidebar";
import MealModal from "../mealModal/mealModal";
import { cn } from "@/lib/utils";
import { Meal } from "@/context/columnMealContext";

// Main Function
export default function MealsColumn() {
  // Local States
  const [meals, setMeals] = useState<Meal[]>([]);
  const [open, setOpen] = useState(false);
  const [currMeal, setCurrMeal] = useState<Meal | undefined>(undefined);

  // ================
  // FETCH ALL MEALS
  // ================
  async function getMeals() {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/meal`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      // Make sure the shape of data from the server matches your Meal interface
      setMeals(res.data as Meal[]);
    } catch (error) {
      console.log(error);
    }
  }

  // On mount (and whenever modal closes), fetch meals
  useEffect(() => {
    getMeals();
  }, [open]);

  // =====================
  // HANDLE SELECTING MEAL
  // =====================
  function handleSelectMeal(idx: number) {
    // Set the currently selected meal
    setCurrMeal(meals[idx]);
    // Open the modal to edit
    setOpen(true);
  }

  // ================
  // RENDER / RETURN
  // ================
  return (
    <div
      className={cn(
        "col-span-2 rounded-md flex flex-col md:flex-row bg-gray-50  w-full flex-1 max-w-7xl mx-auto border border-gray-300 overflow-hidden",
        "h-screen"
      )}
    >
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            <Logo setOpen={setOpen} />
            <div className="mt-8 flex flex-col gap-2 cursor-pointer">
              {meals.map((meal, idx) => (
                <div
                  key={meal.id ?? idx}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      "currMeal",
                      JSON.stringify(meal)
                    );
                  }}
                  onClick={() => handleSelectMeal(idx)}
                  className="flex items-center justify-start gap-2 group/sidebar py-2"
                >
                  <IconBowlChopsticks className="text-neutral-700 h-5 w-5 flex-shrink-0" />
                  <motion.span className="text-neutral-700 font-semibold text-base group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0">
                    {meal.name}
                  </motion.span>
                </div>
              ))}
            </div>
          </div>

          {/* The Modal */}
          <MealModal open={open} setOpen={setOpen} selectedMeal={currMeal} />
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

const Logo = ({ setOpen }: { setOpen: (val: boolean) => void }) => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative">
      <span className="cursor-pointer h-5 w-6 bg-black rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 flex items-center justify-center">
        <IconPlus
          size={20}
          className="text-white"
          onClick={() => {
            // Clear the modal (currMeal) in parent if you like
            // setCurrMeal(undefined);
            setOpen(true);
          }}
        />
      </span>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-2xl text-black whitespace-pre"
      >
        Your Meals
      </motion.span>
    </div>
  );
};
