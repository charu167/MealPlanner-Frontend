"use client";

import React, { useContext, useEffect, useState } from "react";
import { Sidebar, SidebarBody } from "../ui/PlansSidebar"; // Sidebar components for the plans column
import { IconPencil, IconPlus } from "@tabler/icons-react"; // Icons for editing and adding plans
import { motion } from "framer-motion"; // Animation library for smooth transitions
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import PlanModal from "../planModal/PlanModal"; // Modal component for creating/updating/deleting plans
import axios from "axios"; // Axios for making HTTP requests
import { GlobalPlansContext } from "@/context/globalPlanContext"; // Context for managing global plan state

// =========================
// INTERFACES
// =========================

/**
 * Interface representing the structure of a Plan.
 */
interface Plan {
  id: number;
  label: string;
  icon: React.JSX.Element;
}

// =========================
// COMPONENT
// =========================

/**
 * PlansColumn Component
 *
 * Purpose:
 * - Displays a list of user plans in a sidebar.
 * - Allows users to create new plans, update existing ones, and select a plan to view its details.
 * - Integrates with a modal for plan creation and updates.
 */
export default function PlansColumn() {
  // =========================
  // CONTEXT
  // =========================

  const { setGlobalPlan } = useContext(GlobalPlansContext); // Accessing global plan and setter from context

  // =========================
  // STATES
  // =========================

  const [plans, setPlans] = useState<Plan[]>([]); // State to store the list of plans
  const [open, setOpen] = useState(false); // State to control the visibility of the PlanModal
  const [currPlan, setCurrPlan] = useState<Plan | undefined>(undefined); // State to store the currently selected plan for editing

  // =========================
  // DATA FETCHING
  // =========================

  /**
   * Fetches the list of plans from the backend API.
   * Transforms the received data into the Plan interface structure.
   */
  async function getPlans() {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      interface Data {
        name: string;
        id: number;
      }

      const data = (await res.data) as Data[];

      // Transform the received data into the Plan interface
      setPlans(
        data.map(function (plan): Plan {
          return {
            id: plan.id,
            label: plan.name,
            icon: (
              <IconPencil className="text-neutral-200 h-5 w-5 flex-shrink-0" />
            ), // Icon for editing the plan
          };
        })
      );
    } catch (error) {
      console.log(error); // Log any errors during the fetch
    }
  }

  /**
   * useEffect Hook
   *
   * Purpose:
   * - Fetches the list of plans when the component mounts and whenever the `open` state changes.
   * - Ensures that the plans list is up-to-date, especially after creating or updating a plan.
   */
  useEffect(() => {
    getPlans();
  }, [open]);

  // =========================
  // CHANGE HANDLERS
  // =========================

  /**
   * Handles the selection and editing of a plan.
   *
   * @param idx - Index of the selected plan in the `plans` array.
   */
  function handleChange(idx: number) {
    setCurrPlan(plans[idx]); // Set the current plan to the selected plan
    setOpen(true); // Open the PlanModal for editing
  }

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div
      className={cn(
        "shadow-lg col-span-2 rounded-md flex flex-col md:flex-row bg-black w-full flex-1 mx-auto border border-neutral-200 overflow-hidden",
        "h-screen"
      )}
    >
      {/* Sidebar Container */}
      <Sidebar>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {/* Logo and Title Section */}
            <Logo setOpen={setOpen} />

            {/* Plan Modal for Creating/Updating/Deleting Plans */}
            <PlanModal
              setCurrPlan={setCurrPlan}
              currPlan={currPlan}
              open={open}
              setOpen={setOpen}
            />

            {/* Plans List */}
            <div className="mt-8 flex flex-col gap-2">
              {/* Display a message if there are no plans */}
              {plans.length === 0 ? (
                <span className="text-gray-200 text-center mt-56">
                  Start Adding Plans
                </span>
              ) : (
                /* Map through the list of plans and render each plan */
                plans.map((plan, idx) => (
                  <span
                    key={idx}
                    className="text-gray-200 hover:text-blue-300 flex items-center justify-start gap-2 group/sidebar py-2 cursor-pointer"
                  >
                    {/* Edit Icon */}
                    <span
                      onClick={() => {
                        handleChange(idx); // Open the modal to edit the selected plan
                      }}
                    >
                      {plan.icon}
                    </span>

                    {/* Plan Name */}
                    <motion.span
                      onClick={() => {
                        setGlobalPlan({
                          id: plans[idx].id,
                          name: plans[idx].label,
                        }); // Set the global plan to the selected plan
                      }}
                      className="text-base font-semibold group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                    >
                      {plan.label}
                    </motion.span>
                  </span>
                ))
              )}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
    </div>
  );
}

// =========================
// HELPER COMPONENTS
// =========================

/**
 * Logo Component
 *
 * Purpose:
 * - Displays the logo and title at the top of the Plans Column.
 * - Provides a button to open the PlanModal for creating a new plan.
 */
export const Logo = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div className="font-normal flex flex-col items-start text-sm py-1 relative space-y-2">
      <div className="flex items-center space-x-2">
        {/* Add Plan Button */}
        <button
          onClick={() => {
            setOpen(true); // Open the PlanModal to create a new plan
          }}
          className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0 flex items-center justify-center"
        >
          <IconPlus size={20} className="text-black" /> {/* Plus Icon */}
        </button>

        {/* Plans Title */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-bold text-2xl text-white whitespace-pre"
        >
          Your Plans
        </motion.span>
      </div>
    </div>
  );
};
