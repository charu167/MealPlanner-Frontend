"use client";
import React, { createContext, SetStateAction, useState } from "react";

// Interfaces
interface GlobalPlan {
  id: number;
  name: string;
}

interface GlobalPlanContextValue {
  globalPlan: GlobalPlan | undefined;
  setGlobalPlan: React.Dispatch<SetStateAction<GlobalPlan | undefined>>;
}

// Context
export const GlobalPlansContext = createContext<GlobalPlanContextValue>({
  globalPlan: undefined,
  setGlobalPlan: () => {},
});

// Provider
export function GlobalPlansContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // States
  const [globalPlan, setGlobalPlan] = useState<GlobalPlan | undefined>(
    undefined
  );

  // TSX
  return (
    <GlobalPlansContext.Provider value={{ globalPlan, setGlobalPlan }}>
      {children}
    </GlobalPlansContext.Provider>
  );
}
