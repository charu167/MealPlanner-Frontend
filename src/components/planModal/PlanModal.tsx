"use client";

import { IconX } from "@tabler/icons-react"; // Icon for closing the modal
import axios from "axios"; // Axios for making HTTP requests
import { AnimatePresence, motion } from "framer-motion"; // Animation library
import { ChangeEvent, useState } from "react";

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
 * PlanModal Component
 *
 * Purpose:
 * - Provides a modal interface for creating, updating, and deleting meal plans.
 * - Handles user input for plan names and interacts with the backend API.
 * - Utilizes animations for smooth appearance and disappearance.
 */
export default function PlanModal({
  currPlan,
  open,
  setOpen,
  setCurrPlan,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  currPlan?: Plan;
  setCurrPlan: (currPlan: Plan | undefined) => void;
}) {
  // =========================
  // STATES
  // =========================

  const [planName, setPlanName] = useState<string>(""); // State to store the plan name input.
  const [saveLoading, setSaveLoading] = useState<boolean>(false); // State to manage save button loading state.
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false); // State to manage delete button loading state.

  // =========================
  // CHANGE HANDLERS
  // =========================

  /**
   * Handles changes to the plan name input field.
   *
   * @param event - Change event from the input element.
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setPlanName(event.target.value);
  }

  // =========================
  // SUBMIT HANDLERS
  // =========================

  /**
   * Handles the creation of a new plan.
   * Sends a POST request to the backend with the new plan name.
   */
  async function handleCreatePlan() {
    setSaveLoading(true); // Set loading state to true.
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan`,
        { name: planName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setSaveLoading(false); // Reset loading state.
      setOpen(false); // Close the modal.
    } catch (error) {
      console.log(error); // Log any errors.
      setSaveLoading(false); // Reset loading state even if there's an error.
    }
  }

  /**
   * Handles the updating of an existing plan's name.
   * Sends a PUT request to the backend with the updated plan name.
   */
  async function handleUpdatePlan() {
    setSaveLoading(true); // Set loading state to true.
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/${currPlan?.id}`,
        { name: planName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setCurrPlan(undefined); // Reset the current plan.
      setOpen(false); // Close the modal.
      setSaveLoading(false); // Reset loading state.
    } catch (error) {
      console.log(error); // Log any errors.
      setSaveLoading(false); // Reset loading state even if there's an error.
    }
  }

  /**
   * Handles the deletion of an existing plan.
   * Sends a DELETE request to the backend to remove the plan.
   */
  async function handleDeletePlan() {
    setDeleteLoading(true); // Set loading state to true.
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/plan/${currPlan?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setCurrPlan(undefined); // Reset the current plan.
      setOpen(false); // Close the modal.
      setDeleteLoading(false); // Reset loading state.
    } catch (error) {
      console.log(error); // Log any errors.
      setDeleteLoading(false); // Reset loading state even if there's an error.
    }
  }

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(10px)",
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          className="fixed [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full flex items-center justify-center z-50"
        >
          {/* Overlay Background */}
          <Overlay />

          {/* Modal Container with Animation */}
          <motion.div
            className={
              "min-h-[20%] max-h-[90%] md:max-w-[30%] bg-white dark:bg-neutral-950 border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden"
            }
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: 40,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotateX: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 15,
            }}
          >
            {/* Modal Content */}
            <div className="p-6 flex flex-col gap-6 px-12 bg-white rounded-lg shadow-md">
              {/* Close Icon */}
              <div className="flex items-center justify-end">
                <IconX
                  onClick={() => {
                    setOpen(false); // Close the modal.
                    setCurrPlan(undefined); // Reset the current plan.
                  }}
                  className="cursor-pointer text-neutral-500 hover:text-neutral-700 transition duration-150"
                />
              </div>

              {/* Title Input Bar */}
              <input
                type="text"
                placeholder={"Plan Name"}
                defaultValue={currPlan !== undefined ? currPlan.label : ""}
                onChange={handleChange}
                className="text-xl font-bold mx-auto text-center focus:border-b-2 focus:border-b-blue-500 p-3 border-b w-1/2 border-neutral-300 focus:outline-none"
              />

              {/* Save & Delete Buttons */}
              <div className="flex justify-center gap-4 mt-4">
                {/* Save Button */}
                <button
                  onClick={
                    currPlan !== undefined ? handleUpdatePlan : handleCreatePlan
                  }
                  className="w-28 px-4 py-2 rounded-md border border-blue-500 bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
                >
                  {saveLoading ? "Saving..." : "Save"}
                </button>
                {/* Delete Button (only for existing plans) */}
                {currPlan !== undefined ? (
                  <button
                    onClick={handleDeletePlan}
                    className="w-28 px-4 py-2 rounded-md border border-red-500 bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
                  >
                    {deleteLoading ? "Deleting..." : "Delete"}
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =========================
// HELPER COMPONENTS
// =========================

/**
 * Overlay Component
 *
 * Purpose:
 * - Provides a semi-transparent background overlay for the modal.
 * - Adds fade-in and fade-out animations.
 *
 * @param className - Additional CSS classes for customization.
 */
const Overlay = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        backdropFilter: "blur(10px)",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px)",
      }}
      className={`fixed inset-0 h-full w-full bg-black bg-opacity-50 z-50 ${className}`}
    ></motion.div>
  );
};
