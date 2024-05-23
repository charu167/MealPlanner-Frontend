// IMPORTS
import { ChevronLeftIcon, TrashIcon } from "@heroicons/react/16/solid";
import axios from "axios";
import React, { SetStateAction } from "react";
import { Link, useNavigate } from "react-router-dom";

// INTERFACES
interface Plan {
  id: number;
  name: string;
}

interface Props {
  plans: Plan[];
  setPlans: React.Dispatch<SetStateAction<Plan[]>>;
}

// MAIN FUNCTION
export default function Plans({ plans, setPlans }: Props) {
  const navigate = useNavigate();
  // States

  // Change handlers

  // Submit handlers
  async function handleDeletePlan(planId: number) {
    try {
      const result = await axios.delete("http://100.28.28.31:3001/plan", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        params: {
          planId,
        },
      });

      setPlans((prev) => prev.filter((plan) => plan.id !== result.data.id));
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
    }
  }

  //JSX
  return (
    <ul className="w-full h-screen overflow-y-auto">
      {plans.map((plan) => (
        <li className="border border-gray-300 rounded mb-2" key={plan.id}>
          <div className="flex justify-between items-center p-2">
            <div className="flex items-center space-x-2">
              <button
                // onClick={() => toggleExpand(e.id)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none"
              >
                <Link to={`/dashboard/plan/${plan.id}`}>
                  <ChevronLeftIcon className="h-5 w-5" />
                </Link>
              </button>

              <button className="text-red-500 hover:text-red-700 focus:outline-none">
                <TrashIcon
                  onClick={() => {
                    handleDeletePlan(plan.id);
                  }}
                  className="h-5 w-5"
                />
              </button>
            </div>
            <span className="text-left">{plan.name}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
