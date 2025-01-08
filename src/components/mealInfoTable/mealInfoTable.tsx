"use client";

import React, { useContext, useEffect, useState } from "react";
import { IconCheck, IconPencil, IconTrash } from "@tabler/icons-react";
import { ColumnMealContext, MealFood } from "@/context/columnMealContext";

// =========================
// INTERFACES
// =========================

/**
 * Interface representing the structure of the data sent during signup.
 */


// =========================
// COMPONENT
// =========================

/**
 * MealInfoTable Component
 *
 * Purpose:
 * - Displays detailed information about a selected meal, including its foods and their macros.
 * - Allows users to edit quantities and remove food items from the meal.
 * - Calculates and displays the total macros for each food based on quantity.
 */
export default function MealInfoTable() {
  // =========================
  // CONTEXT
  // =========================

  const { meal } = useContext(ColumnMealContext); // Accessing the current meal from context.

  // =========================
  // CONDITIONAL RENDERING
  // =========================

  if (!meal) return null; // If there's no meal selected, do not render the table.

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div className="relative overflow-x-auto rounded-lg">
      {/* Meal Information Table */}
      <table className="w-full text-sm text-left border border-gray-200 text-neutral-600 rtl:text-right rounded-lg">
        {/* Table Header */}
        <thead className="text-xs font-medium text-neutral-600 uppercase bg-gray-100">
          <tr>
            <th scope="col" className="px-6 py-3">
              Food
            </th>
            <th scope="col" className="px-6 py-3">
              Quantity
            </th>
            <th scope="col" className="px-6 py-3">
              Protein
            </th>
            <th scope="col" className="px-6 py-3">
              Fats
            </th>
            <th scope="col" className="px-6 py-3">
              Carbs
            </th>
            <th scope="col" className="px-6 py-3">
              Calories
            </th>
            <th scope="col" className="px-6 py-3"></th>
          </tr>
        </thead>
        {/* Table Body */}
        <tbody>
          {meal.MealFoods.map((food, idx) => (
            <TableRow key={`${food.foodId}-${idx}`} food={food} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =========================
// HELPER COMPONENTS
// =========================

/**
 * Props for the TableRow component.
 */
interface TableRowProps {
  food: MealFood;
}

/**
 * TableRow Component
 *
 * Purpose:
 * - Represents a single row in the MealInfoTable, displaying a food item's details.
 * - Allows users to edit the quantity of the food item.
 * - Enables removal of the food item from the meal.
 * - Calculates and displays macros based on the quantity.
 */
function TableRow({ food }: TableRowProps) {
  // =========================
  // CONTEXT
  // =========================

  const { setMeal } = useContext(ColumnMealContext); // Function to update the meal in context.

  // =========================
  // STATES
  // =========================

  const [edit, setEdit] = useState<boolean>(false); // State to toggle edit mode for quantity.
  const [localQuantity, setLocalQuantity] = useState<number>(food.quantity); // Local state for the quantity input.
  const [actualMacros, setActualMacros] = useState<{
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  }>({
    protein: 0,
    fats: 0,
    carbs: 0,
    calories: 0,
  }); // State to store calculated macros based on quantity.

  // =========================
  // EFFECTS
  // =========================

  /**
   * Calculates the actual macros based on the localQuantity and updates the state.
   */
  useEffect(() => {
    if (food.macros) {
      setActualMacros({
        protein: parseFloat(
          ((food.macros.protein * localQuantity) / 100).toFixed(2)
        ),
        fats: parseFloat(((food.macros.fats * localQuantity) / 100).toFixed(2)),
        carbs: parseFloat(
          ((food.macros.carbs * localQuantity) / 100).toFixed(2)
        ),
        calories: parseFloat(
          ((food.macros.calories * localQuantity) / 100).toFixed(2)
        ),
      });
    } else {
      setActualMacros({
        protein: 0,
        fats: 0,
        carbs: 0,
        calories: 0,
      });
    }
  }, [localQuantity, food.macros]);

  // =========================
  // CHANGE HANDLERS
  // =========================

  /**
   * Handles changes to the quantity input field.
   * Updates the localQuantity state and the meal in context.
   *
   * @param event - Change event from the input element.
   */
  function handleQuantityChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newQuantity = Number(event.target.value);
    if (isNaN(newQuantity) || newQuantity < 0) return; // Optional: add more validation

    setLocalQuantity(newQuantity); // Update local state.

    // Update the quantity in the meal within context.
    setMeal((prevMeal) => {
      if (!prevMeal) return prevMeal;
      const updatedMealFoods = prevMeal.MealFoods.map((currentFood) => {
        if (currentFood.foodId === food.foodId) {
          return { ...currentFood, quantity: newQuantity };
        }
        return currentFood;
      });
      return { ...prevMeal, MealFoods: updatedMealFoods };
    });
  }

  /**
   * Handles the removal of a food item from the meal.
   */
  function handleRemoveFood() {
    setMeal((prevMeal) => {
      if (!prevMeal) return prevMeal;
      const updatedMealFoods = prevMeal.MealFoods.filter(
        (f) => f.foodId !== food.foodId
      );
      return { ...prevMeal, MealFoods: updatedMealFoods };
    });
  }

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <tr className="bg-gray-50 border-b hover:bg-gray-100">
      {/* Food Name */}
      <th
        scope="row"
        className="px-6 py-4 font-medium text-neutral-600 whitespace-nowrap"
      >
        {food.foodName}
      </th>
      {/* Quantity */}
      <td className="px-6 py-4">
        {edit ? (
          <input
            onChange={handleQuantityChange}
            className="border-b m-0 p-0 w-16"
            placeholder="100gm"
            value={localQuantity}
          />
        ) : (
          <span>{localQuantity}</span>
        )}
      </td>
      {/* Protein */}
      <td className="px-6 py-4">
        {food.macros ? <span>{actualMacros.protein}</span> : <span>--</span>}
      </td>
      {/* Fats */}
      <td className="px-6 py-4">
        {food.macros ? <span>{actualMacros.fats}</span> : <span>--</span>}
      </td>
      {/* Carbs */}
      <td className="px-6 py-4">
        {food.macros ? <span>{actualMacros.carbs}</span> : <span>--</span>}
      </td>
      {/* Calories */}
      <td className="px-6 py-4">
        {food.macros ? <span>{actualMacros.calories}</span> : <span>--</span>}
      </td>
      {/* Action Buttons */}
      <td className="px-6 py-4 flex justify-between items-center">
        {edit ? (
          <IconCheck
            onClick={() => setEdit(false)}
            className="text-green-600 cursor-pointer"
          />
        ) : (
          <IconPencil
            onClick={() => setEdit(true)}
            className="text-neutral-500 cursor-pointer"
            size={20}
          />
        )}
        <IconTrash
          onClick={handleRemoveFood}
          className="text-red-600 cursor-pointer"
          size={20}
        />
      </td>
    </tr>
  );
}
