"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label"; // Custom Label component
import { Input } from "@/components/ui/input"; // Custom Input component
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import { useRouter } from "next/navigation"; // Next.js router for navigation
import axios from "axios"; // Axios for making HTTP requests
import useLogin from "@/hooks/useLogin"; // Custom hook to ensure user is logged in

// =========================
// INTERFACES
// =========================

/**
 * Interface representing the structure of the user data.
 */
interface User {
  date_of_birth: string;
  gender: string;
  height: number;
  id: number;
  firstname: string;
  lastname: string;
  weight: number;
}

// =========================
// COMPONENT
// =========================

/**
 * Profile Component
 *
 * Purpose:
 * - Displays and allows editing of the user's profile information.
 * - Fetches user data upon mounting.
 * - Handles form input changes and updates the local state.
 * - Saves changes by sending updated data to the backend.
 * - Navigates the user to the dashboard upon successful update.
 */
export default function Profile() {
  useLogin(); // Ensures the user is logged in

  // =========================
  // STATES
  // =========================

  // Local state to store the user's profile data.
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string>(""); // Error state
  const [saving, setSaving] = useState(false);

  const router = useRouter(); // Initialize Next.js router for navigation.

  // =========================
  // EFFECTS
  // =========================

  /**
   * Fetches the user's profile data from the backend upon component mount.
   */
  useEffect(() => {
    async function getUserData() {
      try {
        const result = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        // @ts-expect-error desc
        setUser(result.data);
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setError("Failed to load profile data");
        setIsLoading(false);
      }
    }
    getUserData();
  }, []);

  // =========================
  // CHANGE HANDLERS
  // =========================

  /**
   * Handles changes to the input fields.
   * Updates the corresponding field in the user state.
   *
   * @param event - Change event from the input or select element.
   */
  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  }

  // =========================
  // SUBMIT HANDLER
  // =========================

  /**
   * Handles the form submission.
   * Sends a PUT request to update the user's profile data.
   * Alerts the user upon success or failure.
   */
  async function handleSave() {
    if (user) {
      try {
        setSaving(true);
        await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, user, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        router.push("/dashboard"); // Navigate to the dashboard after successful update
      } catch (error) {
        console.error(error);
        alert("Failed to update profile");
      } finally {
        setSaving(false);
      }
    }
  }

  // Debugging: Log user data to the console
  console.log(user);

  // =========================
  // CONDITIONAL RENDERING
  // =========================

  if (isLoading)
    return (
      <div className="flex bg-black justify-center items-center h-screen">
        <p className="text-neutral-200 text-xl font-bold">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div className="flex flex-col justify-center bg-black items-center h-screen">
      {/* Profile Form Container */}
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 my-auto shadow-input bg-gradient-to-br from-neutral-900 to-black border border-white/[0.2]">
        {/* Profile Title */}
        <h2 className="font-bold text-xl text-center text-neutral-200">
          Your Profile
        </h2>
        <p className="text-sm text-center max-w-sm mt-2 text-neutral-300">
          Update your personal information
        </p>

        {/* Profile Form */}
        <form className="my-8">
          {/* Firstname Input */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="username">Firstname</Label>
            <Input
              onChange={handleChange}
              name="username"
              placeholder="Your Username"
              type="text"
              value={user?.firstname || ""}
            />
          </LabelInputContainer>

          {/* Lastname Input */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="username">Lastname</Label>
            <Input
              onChange={handleChange}
              name="username"
              placeholder="Your Username"
              type="text"
              value={user?.lastname || ""}
            />
          </LabelInputContainer>

          {/* Height Input */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="height">Height (in cm)</Label>
            <Input
              onChange={handleChange}
              name="height"
              placeholder="e.g., 170"
              type="number"
              value={user?.height || ""}
            />
          </LabelInputContainer>

          {/* Weight Input */}
          <LabelInputContainer className="mb-4">
            <Label htmlFor="weight">Weight (in kg)</Label>
            <Input
              onChange={handleChange}
              className=""
              name="weight"
              placeholder="e.g., 65"
              type="number"
              value={user?.weight || ""}
            />
          </LabelInputContainer>

          {/* Divider */}
          <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          {/* Save Changes Button */}
          <button
            type="button"
            onClick={handleSave}
            className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset] hover:from-zinc-900 hover:to-zinc-900 transition duration-200 ease-in-out"
          >
            {saving ? <span>Saving...</span> : <span>Save Changes &rarr;</span>}
            <BottomGradient /> {/* Decorative gradient effect */}
          </button>
        </form>
      </div>
    </div>
  );
}

// =========================
// HELPER COMPONENTS
// =========================

/**
 * BottomGradient Component
 *
 * Purpose:
 * - Adds a gradient effect to the bottom of the button on hover.
 */
const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

/**
 * LabelInputContainer Component
 *
 * Purpose:
 * - Wraps label and input elements with consistent styling.
 *
 * @param children - The child elements (Label and Input).
 * @param className - Additional CSS classes for customization.
 */
const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
