"use client";
import React from "react";

import DropZone from "@/components/dropZone/DropZone"; // Component for managing meal drops
import MacroDisplay from "@/components/macroDisplay/MacroDisplay"; // Component for displaying macros
import MealsColumn from "@/components/mealsColumn/MealsColumn"; // Component for displaying meals
import PlansColumn from "@/components/plansColumn/PlansColumn"; // Component for displaying plans
import useLogin from "@/hooks/useLogin";

// =========================
// COMPONENT
// =========================

/**
 * Dashboard Component
 *
 * Purpose:
 * - Serves as the main dashboard for the application.
 * - Displays macro information and organizes plans, drop zones, and meals in a grid layout.
 */
export default function Dashboard() {
  // Login Check
  useLogin();

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div>
      {/* Macro Display Section */}
      <MacroDisplay />

      {/* Grid Layout for Plans, DropZone, and Meals */}
      <div className="w-full max-w-full grid grid-cols-10 gap-x-4">
        <PlansColumn /> {/* Displays user's meal plans */}
        <DropZone /> {/* Allows users to add or manage meals */}
        <MealsColumn /> {/* Displays individual meals */}
      </div>
    </div>
  );
}
