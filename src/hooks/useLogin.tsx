import axios from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface User {
  email: string;
  firstname: string;
  id: number;
  exp: number;
}

async function parseJWT(token: string): Promise<User> {
  const jwt = await import("jsonwebtoken");
  const decoded = jwt.decode(token);
  return decoded as User;
}

export default function useLogin() {
  const router = useRouter();
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
          router.push("/signin");
        }
      } else if (refreshToken) {
        refreshAccessToken(refreshToken);
      } else {
        router.push("/signin");
      }
    }

    handleAuth();
  }, []);

  async function refreshAccessToken(refresh_token: string) {
    try {
      const result = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/refresh-token`, {
        refresh_token,
      });

      // @ts-expect-error desc
      const access_token = result.data.access_token;
      localStorage.setItem("access_token", access_token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error refreshing access token:", error);
      router.push("/signin");
    }
  }
  return isAuthenticated;
}
