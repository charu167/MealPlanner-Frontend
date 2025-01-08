"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label"; // Custom Label component
import { Input } from "@/components/ui/input"; // Custom Input component
import { cn } from "@/lib/utils"; // Utility function for conditional class names
import { useRouter } from "next/navigation"; // Next.js router for navigation
import axios from "axios"; // Axios for making HTTP requests
import Link from "next/link";

// =========================
// INTERFACES
// =========================

/**
 * Interface representing the structure of the data sent during signup.
 */
interface Data {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  gender: string;
  height: string; // Changed from number to string
  weight: string; // Changed from number to string
  date_of_birth: string;
}

// =========================
// COMPONENT
// =========================

/**
 * SignupFormDemo Component
 *
 * Purpose:
 * - Provides a user interface for users to sign up by entering their personal details.
 * - Handles form submission by sending signup data to the backend.
 * - Navigates the user to the dashboard upon successful signup.
 */
export default function SignupForm() {
  // =========================
  // STATES
  // =========================

  // Local state to store the user's signup data.
  const [data, setData] = useState<Data>({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    gender: "",
    height: "", // Initialized as empty string
    weight: "", // Initialized as empty string
    date_of_birth: "",
  });

  // =========================
  // HOOKS
  // =========================

  const router = useRouter(); // Initialize Next.js router for navigation.

  // =========================
  // CHANGE HANDLERS
  // =========================

  /**
   * Handles changes to the input fields.
   * Updates the corresponding field in the data state.
   *
   * @param e - Change event from the input element.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setData((prev: Data) => ({ ...prev, [name]: value }));
  }

  // =========================
  // SUBMIT HANDLER
  // =========================

  /**
   * Handles the form submission.
   * Sends a POST request to the signup endpoint with the user's data.
   * Stores the received tokens in localStorage and navigates to the dashboard.
   *
   * @param event - Form submission event.
   */
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // Prevent the form from submitting traditionally
    try {
      // Format the data before sending
      const formattedData = {
        ...data,
        height: data.height ? Number(data.height) : null,
        weight: data.weight ? Number(data.weight) : null,
        date_of_birth: data.date_of_birth + "T00:00:00.000Z",
      };
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`,
        formattedData
      );

      // Store tokens in localStorage
      // @ts-expect-error desc
      localStorage.setItem("access_token", result.data.access_token);
      
      // @ts-expect-error desc
      localStorage.setItem("refresh_token", result.data.refresh_token);

      router.push("/dashboard"); // Navigate to the dashboard
    } catch (error) {
      console.error(error); // Log any errors to the console
    }
  }

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div className="max-w-md w-full mx-auto my-4 rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-black border border-white/[0.2] ">
      {/* Welcome Message */}
      <h2 className="text-center font-bold text-xl text-neutral-200">
        Welcome to NutriCraft
      </h2>
      <p className="text-center text-sm max-w-sm mt-2 text-neutral-300">Please Signup</p>

      {/* Signup Form */}
      <form className="my-8">
        {/* Name Inputs */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input
              onChange={handleChange}
              name="firstname"
              placeholder="Tyler"
              type="text"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="lastname">Last name</Label>
            <Input
              onChange={handleChange}
              name="lastname"
              placeholder="Durden"
              type="text"
            />
          </LabelInputContainer>
        </div>

        {/* Email Input */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            onChange={handleChange}
            name="email"
            placeholder="projectmayhem@fc.com"
            type="email"
          />
        </LabelInputContainer>

        {/* Password Input */}
        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            onChange={handleChange}
            name="password"
            placeholder="••••••••"
            type="password"
          />
        </LabelInputContainer>

        {/* Divider */}
        <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        {/* Height and Weight Inputs */}
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="Height">Height</Label>
            <Input
              onChange={handleChange}
              name="height"
              placeholder="177cm"
              type="number"
            />
          </LabelInputContainer>
          <LabelInputContainer>
            <Label htmlFor="weight">Weight</Label>
            <Input
              onChange={handleChange}
              name="weight"
              placeholder="80kg"
              type="number"
            />
          </LabelInputContainer>
        </div>

        {/* Date of Birth Input */}
        <LabelInputContainer className="mb-8">
          <Label htmlFor="age">Date Of Birth</Label>
          <Input
            type="date"
            onChange={handleChange}
            value={data.date_of_birth}
            name="date_of_birth"
            // placeholder="25"
          />
        </LabelInputContainer>

        {/* Gender Radio Buttons */}
        <LabelInputContainer className="mb-8">
          <Label>Gender</Label>
          <div className="flex space-x-4 items-center">
            {/* Male Radio Button */}
            <div className="flex items-center space-x-2">
              <input
                onChange={handleChange}
                type="radio"
                id="male"
                name="gender"
                value="male"
                className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-500 text-blue-600"
              />
              <label
                htmlFor="male"
                className="text-sm font-medium text-neutral-300"
              >
                Male
              </label>
            </div>

            {/* Female Radio Button */}
            <div className="flex items-center space-x-2">
              <input
                onChange={handleChange}
                type="radio"
                id="female"
                name="gender"
                value="female"
                className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-blue-500 text-blue-600"
              />
              <label
                htmlFor="female"
                className="text-sm font-medium text-neutral-300"
              >
                Female
              </label>
            </div>
          </div>
        </LabelInputContainer>

        {/* Divider */}
        <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent my-8 h-[1px] w-full" />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
        >
          Sign up &rarr;
          <BottomGradient /> {/* Decorative gradient effect */}
        </button>

        <div className="text-neutral-200 text-base  mt-4">
          Already have an account?{" "}
          <Link className="underline font-semibold" href="/signup">
            Signin.
          </Link>
        </div>
      </form>
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
