import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signin() {
  // Interfaces
  interface Data {
    email: string;
    password: string;
  }

  // States
  const [data, setData] = useState<Data>({ email: "", password: "" });

  // onChange handlers
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }

  // onClick handlers
  const navigate = useNavigate();
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      const result = await axios.post(
        "http://localhost:3001/auth/signin",
        data
      );
      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign-in error:", error);
    }
  }

  // JSX
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-lg">
        <h1 className="text-xl font-bold text-center mb-6">
          Login to MealPlanner Pro
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            onChange={handleChange}
            value={data.email}
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            onChange={handleChange}
            value={data.password}
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </form>
        <div className="text-center mt-4">
          <Link to="/signup" className="text-blue-600 hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
