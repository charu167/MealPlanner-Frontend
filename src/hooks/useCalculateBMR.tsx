import { useMemo } from "react";

interface User {
  date_of_birth: string;
  gender: string;
  height: number;
  username: string;
  weight: number;
}

function useCalculateBMR(user: User): number {
  return useMemo(() => {
    const today = new Date();
    const birthDate = new Date(user.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (user.gender === "male") {
      return 88.362 + 13.397 * user.weight + 4.799 * user.height - 5.677 * age;
    } else if (user.gender === "female") {
      return 447.593 + 9.247 * user.weight + 3.098 * user.height - 4.33 * age;
    }
    return 0;
  }, [user]); // Depend on user object, recalculate when user details change
}

export default useCalculateBMR;
