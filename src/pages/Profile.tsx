import axios from "axios";
import React, { useEffect, useState } from "react";
import useLogin from "../hooks/useLogin";
import { Link } from "react-router-dom";

// Interfaces
interface User {
  date_of_birth: string;
  gender: string;
  height: number;
  id: number;
  username: string;
  weight: number;
}

export default function Profile() {
  useLogin(); // Ensures the user is logged in

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function getUserData() {
      try {
        const result = await axios.get("http://localhost:3001/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
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

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    setUser((prev) => (prev ? { ...prev, [name]: value } : null));
  }

  // Submit Handlers
  async function handleSave() {
    if (user) {
      try {
        await axios.put("http://localhost:3001/user", user, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        alert("Profile updated successfully!");
      } catch (error) {
        console.error(error);
        alert("Failed to update profile");
      }
    }
  }
  console.log(user);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex mt-52 flex-col space-y-4 p-4 max-w-md mx-auto bg-white shadow-md rounded-lg">
      {user ? (
        <>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={user.username}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            name="height"
            placeholder="Height (in cm)"
            value={user.height}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (in kg)"
            value={user.weight}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <select
            name="gender"
            value={user.gender}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input
            type="date"
            name="date_of_birth"
            value={user.date_of_birth}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSave}
            className="p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
          <div className="text-center mt-4">
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
          </div>
        </>
      ) : (
        <p>User not found</p>
      )}
    </div>
  );
}
