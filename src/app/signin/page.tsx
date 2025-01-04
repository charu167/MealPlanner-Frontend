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
  email: string;
  password: string;
}

// =========================
// COMPONENT
// =========================

/**
 * SigninForm Component
 *
 * Purpose:
 * - Provides a user interface for users to sign up by entering their email and password.
 * - Handles form submission by sending signup data to the backend.
 * - Navigates the user to the dashboard upon successful signup.
 */
export default function SigninForm() {
  // =========================
  // STATES
  // =========================

  // Local state to store the user's signup data.
  const [data, setData] = useState<Data>({ email: "", password: "" });

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
   * @param event - Change event from the input element.
   */
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
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
    event.preventDefault(); // Prevent default form submission behavior
    try {
      const result = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signin`,
        data
      );

      // Store tokens in localStorage
      // @ts-expect-error desc
      localStorage.setItem("access_token", result.data.access_token);

      // @ts-expect-error desc
      localStorage.setItem("refresh_token", result.data.refresh_token);

      router.push("/dashboard"); // Navigate to the dashboard
    } catch (error) {
      console.log(error); // Log any errors to the console
    }
  }

  // =========================
  // JSX RENDERING
  // =========================

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {/* Signup Form Container */}
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 my-auto shadow-input bg-black border border-white/[0.2] ">
        {/* Welcome Message */}
        <h2 className="font-bold text-xl text-neutral-200">
          Welcome to NutriCraft
        </h2>
        <p className="text-sm max-w-sm mt-2 text-neutral-300">Please Login</p>

        {/* Signup Form */}
        <form className="my-8">
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

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="bg-gradient-to-br relative group/btn from-zinc-900 to-zinc-900 bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
          >
            Sign in &rarr;
            <BottomGradient /> {/* Decorative gradient effect */}
          </button>

          <div className="text-neutral-200 text-base  mt-4">
            Don{`'`}t have an account?{" "}
            <Link className="underline font-semibold" href="/signup">
              Signup
            </Link>
          </div>
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
