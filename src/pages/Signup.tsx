import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  // Interfaces
  interface Data {
    username: string;
    email: string;
    password: string;
    gender: string;
    height: string; // Changed from number to string
    weight: string; // Changed from number to string
    date_of_birth: string;
  }

  // States
  const [data, setData] = useState<Data>({
    username: "",
    email: "",
    password: "",
    gender: "",
    height: "", // Initialized as empty string
    weight: "", // Initialized as empty string
    date_of_birth: "",
  });

  // Change handler
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setData((prev: Data) => ({ ...prev, [name]: value }));
  }

  // Navigate
  const navigate = useNavigate();
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); // Prevent the form from submitting traditionally
    try {
      const formattedData = {
        ...data,
        height: data.height ? Number(data.height) : null,
        weight: data.weight ? Number(data.weight) : null,
        date_of_birth: data.date_of_birth + "T00:00:00.000Z",
      };
      const result = await axios.post(
        "http://100.28.28.31:3000/auth/signup",
        formattedData
      );
      localStorage.setItem("access_token", result.data.access_token);
      localStorage.setItem("refresh_token", result.data.refresh_token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }

  // JSX
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-lg p-8 rounded-lg">
        <h1 className="text-xl font-bold text-center mb-6">
          Signup to MealPlanner Pro
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            onChange={handleChange}
            value={data.username}
            name="username"
            type="text"
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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
          <select
            onChange={handleChange}
            value={data.gender}
            name="gender"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            onChange={handleChange}
            value={data.height}
            name="height"
            type="number"
            placeholder="Height (cm)"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <input
            onChange={handleChange}
            value={data.weight}
            name="weight"
            type="number"
            placeholder="Weight (kg)"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <input
            type="date"
            onChange={handleChange}
            value={data.date_of_birth}
            name="date_of_birth"
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
          <Link to="/signin" className="text-blue-600 hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
