import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUtensils } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons/faGithub";

const Navbar = () => {
  return (
    <nav className="w-full bg-gray-100 shadow-md py-4 px-8 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        <div className="text-2xl text-gray-800 font-bold italic hover:text-blue-600">
          <Link to="/" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faUtensils} className="text-blue-500" />
            MealPlanner Pro
          </Link>
        </div>
        <div className="flex gap-4">
          <Link to="/signup" className="hover:text-blue-600">
            Signup
          </Link>
          <Link to="/goalSetting" className="hover:text-blue-600">
            Goal Setting
          </Link>
          <Link to="/dashboard" className="hover:text-blue-600">
            Nutrition Planning
          </Link>
          <Link to="/profile" className="hover:text-blue-600">
            Profile
          </Link>
          <a href="https://github.com" className="hover:text-blue-600">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
