# Nutrition Planning App - Frontend Documentation

## Overview
The frontend of the Nutrition Planning App is built using **Next.js** with **TypeScript**. It provides an intuitive and responsive user interface to calculate personalized macronutrient goals, manage meal plans, and track real-time macros. State management is implemented using Context API, with custom hooks for efficient reusability.

---

## Folder Structure
```
/src
  /app                # Pages and routing (Next.js App Router)
  /components         # Reusable UI components
  /hooks              # Custom hooks for encapsulating logic
  /context            # Context API files for shared state management
  /lib                # Utility functions and shared code (e.g., UI libraries)
```

---

## Key Contexts

### **1. ColumnMealContext**
This context manages the state for the meals displayed in the right-hand sidebar. It facilitates viewing, editing, and updating meal details.

#### State Variables:
- **`meal`**: The selected meal.
  ```typescript
  export interface Meal {
    id?: number;
    name: string;
    MealFoods: MealFood[];
  }

  export interface MealFood {
    id?: number;
    foodName: string;
    foodId: string;
    quantity: number;
    macros?: {
      protein: number;
      fats: number;
      carbs: number;
      calories: number;
    };
  }
  ```

#### Usage:
- **Sidebar**: Updates the state when a meal is clicked.
- **Meal Modal**: Displays the selected meal and updates its details (e.g., quantity, food items).
- **MealInfo-Table**: Reflects changes in the global meal state and submits updated data via API.

---

### **2. GlobalPlanContext**
This context stores and manages the currently selected plan from the left-hand plans sidebar.

#### State Variables:
- **`globalPlan`**: Stores the selected plan’s basic details.
  ```typescript
  interface GlobalPlan {
    id: number;
    name: string;
  }
  ```

#### Usage:
- Updates when a user clicks on a plan in the sidebar.
- Shared with other contexts like `PlanContext` to trigger data fetching.

---

### **3. PlanContext**
Manages the state of the currently active plan, including its meals and food items.

#### State Variables:
- **`plan`**: Stores the full details of the active plan.
  ```typescript
  interface Plan {
    id: number;
    name: string;
    PlanMeals: PlanMeal[];
  }

  interface PlanMeal {
    id: number;
    mealId: number;
    mealName: string;
    PlanMealFoods: PlanMealFood[];
  }

  interface PlanMealFood {
    id: number;
    planMealId: number;
    foodName: string;
    foodId: string;
    quantity: number;
    macros?: {
      protein: number;
      fats: number;
      carbs: number;
      calories: number;
    };
  }
  ```

#### Key Functions:
- **`fetchMacros`**: Fetches macro data for a food item using the Edamam API.
- **`calculateTotals`**: Computes total macros for the plan.
- **`getData`**: Fetches plan details from the backend and enriches them with macro data.

#### Usage:
- Fetches plan data whenever `globalPlan` changes.
- Updates state when a meal or food item is modified.

---

### **4. TotalMacrosContext**
Tracks the total macros (protein, fats, carbs, calories) for the active plan.

#### State Variables:
- **`totals`**:
  ```typescript
  interface MacroTotals {
    protein: number;
    fats: number;
    carbs: number;
    calories: number;
  }
  ```

#### Usage:
- Updated in `PlanContext` whenever the plan’s meals or food items change.
- Displayed in the macro-display bar for real-time tracking.

---

## Key Components

### **Macro Display Bar**
- Displays current and target macros (e.g., `150g/200g` for protein).
- Reflects real-time updates as meals or food items are added/edited.

### **Dropzone (Drag-and-Drop)**
- Allows dragging meals from the sidebar into the active plan.
- Updates the plan and recalculates macros in real-time.

---

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=<backend_base_url>
   NEXT_PUBLIC_EDAMAM_APP_ID=<edamam_app_id>
   NEXT_PUBLIC_EDAMAM_APP_KEY=<edamam_app_key>
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

---

## Notes for Developers

1. **State Management**:
   - Utilize the provided contexts (`PlanContext`, `TotalMacrosContext`, etc.) to maintain a clean architecture.
   - Ensure updates to contexts are efficient and well-optimized.

2. **Edamam API Integration**:
   - Avoid excessive API calls by implementing caching for frequently used food items.

3. **UI Enhancements**:
   - Reuse components from the `/components` directory to maintain consistency.

---

This documentation covers the frontend implementation and state management. Let me know if additional details are needed!
