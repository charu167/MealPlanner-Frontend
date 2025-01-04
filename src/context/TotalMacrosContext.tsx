"use client";

import React, { createContext, useState } from "react";

// Define the structure for macro totals
interface MacroTotals {
  protein: number;
  fats: number;
  carbs: number;
  calories: number;
}

// Define the context value types
interface TotalMacrosContextProps {
  totalMacros: MacroTotals;
  setTotalMacros: React.Dispatch<React.SetStateAction<MacroTotals>>;
}

// Create the TotalMacrosContext with default values
export const TotalMacrosContext = createContext<TotalMacrosContextProps>({
  totalMacros: { protein: 0, fats: 0, carbs: 0, calories: 0 },
  setTotalMacros: () => {},
});

// Provider component to wrap around parts of the app that need access to totalMacros
export const TotalMacrosProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // State to hold the total macros
  const [totalMacros, setTotalMacros] = useState<MacroTotals>({
    protein: 0,
    fats: 0,
    carbs: 0,
    calories: 0,
  });

  return (
    <TotalMacrosContext.Provider value={{ totalMacros, setTotalMacros }}>
      {children}
    </TotalMacrosContext.Provider>
  );
};
