"use client";

import React, { createContext, SetStateAction, useState } from "react";

export interface MealFood {
  id?: number;
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

export interface Meal {
  id?: number;
  name: string;
  MealFoods: MealFood[];
}

interface MealContextValue {
  meal: Meal | undefined;
  setMeal: React.Dispatch<SetStateAction<Meal | undefined>>;
}

// Context
export const ColumnMealContext = createContext<MealContextValue>({
  meal: undefined,
  setMeal: () => {},
});

// Main Provider Function
export function ColumnMealContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // States
  const [meal, setMeal] = useState<Meal | undefined>(undefined);

  return (
    <ColumnMealContext.Provider value={{ meal, setMeal }}>
      {children}
    </ColumnMealContext.Provider>
  );
}
