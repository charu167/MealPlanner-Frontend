import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faBurn,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white font-body">
      <main className="flex-grow flex flex-col items-center justify-center p-4">
        <div className="max-w-6xl w-full bg-gray-50 p-10 rounded-lg shadow-lg text-center space-y-8">
          <h1 className="text-6xl font-bold text-gray-800">
            Welcome to MealPlanner Pro
          </h1>
          <p className="text-xl text-gray-600">
            Plan your meals, track your calories, and achieve your diet goals
            with ease.
          </p>
          <div className="flex justify-center gap-20">
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon={faUtensils}
                className="text-4xl text-blue-600"
              />
              <span className="mt-2 text-lg text-gray-700">
                Custom Meal Plans
              </span>
            </div>
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon={faBurn}
                className="text-4xl text-red-600"
              />
              <span className="mt-2 text-lg text-gray-700">
                Calorie Tracking
              </span>
            </div>
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon={faBullseye}
                className="text-4xl text-green-600"
              />
              <span className="mt-2 text-lg text-gray-700">Goal Setting</span>
            </div>
          </div>
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded text-lg"
          >
            Try Now
          </Link>
        </div>
      </main>
      <footer className="w-full bg-gray-100 text-center text-gray-700 p-4">
        <p className="text-xl">
          Empowering over 10,000 users to achieve their health goals!
        </p>
        <p>Join our community for more insights.</p>
        <div className="mt-2">
          <a
            href="mailto:support@mealplannerpro.com"
            className="hover:underline"
          >
            Contact Us
          </a>{" "}
          |
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}
