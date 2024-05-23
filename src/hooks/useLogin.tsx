import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface User {
  email: string;
  username: string;
  id: number;
  exp: number;
}

async function parseJWT(token: string): Promise<User> {
  const jwt = await import("jsonwebtoken");
  const decoded = jwt.decode(token);
  return decoded as User;
}

export default function useLogin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  useEffect(() => {
    async function handleAuth() {
      const accessToken: string | null = localStorage.getItem("access_token");
      const refreshToken: string | null = localStorage.getItem("refresh_token");
      if (accessToken) {
        const userData = await parseJWT(accessToken);
        if (userData.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else if (refreshToken) {
          refreshAccessToken(refreshToken);
        } else {
          navigate("/signin");
        }
      } else if (refreshToken) {
        refreshAccessToken(refreshToken);
      } else {
        navigate("/signin");
      }
    }

    handleAuth();
  }, []);

  async function refreshAccessToken(refresh_token: string) {
    try {
      const result = await axios.post("http://localhost:3001/refresh-token", {
        refresh_token,
      });
      const access_token = result.data.access_token;
      localStorage.setItem("access_token", access_token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error refreshing access token:", error);
      navigate("/signin");
    }
  }
  return isAuthenticated;
}
