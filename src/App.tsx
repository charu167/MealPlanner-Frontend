import "./App.css";
import { Route, Routes, BrowserRouter } from "react-router-dom";

import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard/Dashboard";
import Home from "./pages/Home";
import GoalSetting from "./pages/GoalSetting";
import Profile from "./pages/Profile";

import LayoutWithNavbar from "./layouts/LayoutWithNavbar";

function App() {
  return (
    <BrowserRouter>
      <Routes>
       {/* Routes without Navbar */}
       <Route path="/signup" element={<Signup />} />
        <Route path="/signin" element={<Signin />} />


       {/* Routes with Navbar */}
        <Route path="/" element={<LayoutWithNavbar><Home /></LayoutWithNavbar>} />
        <Route path="/goalSetting" element={<LayoutWithNavbar><GoalSetting /></LayoutWithNavbar>} />
        <Route path="/profile" element={<LayoutWithNavbar><Profile /></LayoutWithNavbar>} />
        <Route path="/dashboard/*" element={<LayoutWithNavbar><Dashboard /></LayoutWithNavbar>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
