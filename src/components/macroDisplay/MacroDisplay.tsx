"use client";

import { TotalMacrosContext } from "@/context/TotalMacrosContext"; // Importing the TotalMacrosContext to access total macros.
import { IconTopologyStar3 } from "@tabler/icons-react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";

// INTERFACES
/**
 * Interface representing the structure of a Goal object.
 */
interface Goal {
  id: number;
  userId: number;
  target_weight: number;
  caloric_adjustment: number;
  surplus: boolean;
  protein: number;
  fats: number;
  carbs: number;
  activity_level: number;
}

// COMPONENT
/**
 * MacroDisplay Component
 *
 * Purpose:
 * - Fetches and displays the user's macro goals alongside their current macro intake.
 * - Utilizes TotalMacrosContext to access the aggregated macro data.
 */
export default function MacroDisplay() {
  // CONTEXT
  const { totalMacros } = useContext(TotalMacrosContext); // Accessing totalMacros from TotalMacrosContext.

  // STATES
  // Local state to store the user's goal data fetched from the backend.
  const [goal, setGoal] = useState<Goal | undefined>(undefined);

  // FUNCTIONS
  /**
   * Fetches the user's goal data from the backend API.
   */
  async function getGoal() {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/goal`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Authorization header with JWT token.
        },
      });

      const data = res.data as Goal; // Casting response data to Goal interface.
      setGoal(data); // Updating the goal state with fetched data.
    } catch (error) {
      console.log(error); // Logging any errors to the console.
    }
  }

  // EFFECTS
  useEffect(() => {
    getGoal(); // Fetch the goal data when the component mounts.
  }, []); // Empty dependency array ensures this runs only once.

  // CONDITIONAL RENDERING
  if (!goal) return "Loading..."; // Display loading text while fetching goal data.

  // TSX
  return (
    <div className="flex items-center justify-center gap-x-28 bg-gray-50 py-4 px-4 my-4 border border-gray-300 shadow-lg">
      {/* Title */}
      <div className="flex items-center gap-x-3">
        <span>
          <IconTopologyStar3 size={32} /> {/* Displaying an icon */}
        </span>
        <h1 className="text-4xl font-bold text-black">Macros</h1>{" "}
        {/* Component title */}
      </div>

      {/* Horizontal Macros Container */}
      <div className="flex space-x-8">
        {/* Protein */}
        <div className="flex flex-col items-center">
          <div className="border-blue-300 border-4 rounded-full px-2 py-10 flex items-center justify-center">
            <span className="text-xl font-semibold text-blue-600">
              {(totalMacros.protein / 100).toFixed(0)}
              <span className="text-xs text-neutral-600">
                / {goal.protein.toFixed(0)}g
              </span>
            </span>
          </div>
          <span className="text-sm text-neutral-600 mt-2">Protein</span>{" "}
          {/* Label */}
        </div>

        {/* Fats */}
        <div className="flex flex-col items-center">
          <div className="border-4 border-red-300 rounded-full px-2 py-10 flex items-center justify-center">
            <span className="text-xl font-semibold text-red-600">
              {(totalMacros.fats / 100).toFixed(0)}
              <span className="text-xs text-neutral-600">
                / {goal.fats.toFixed(0)}g
              </span>
            </span>
          </div>
          <span className="text-sm text-neutral-600 mt-2">Fats</span>{" "}
          {/* Label */}
        </div>

        {/* Carbs */}
        <div className="flex flex-col items-center">
          <div className="border-4 border-green-300 rounded-full px-2 py-10 flex items-center justify-center">
            <span className="text-xl font-semibold text-green-600">
              {(totalMacros.carbs / 100).toFixed(0)}
              <span className="text-xs text-neutral-600">
                / {goal.carbs.toFixed(0)}g
              </span>
            </span>
          </div>
          <span className="text-sm text-neutral-600 mt-2">Carbs</span>{" "}
          {/* Label */}
        </div>
      </div>
    </div>
  );
}
