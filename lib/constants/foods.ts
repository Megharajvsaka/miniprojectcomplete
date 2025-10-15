// lib/constants/foods.ts
// Common foods database - Client-safe data (no server dependencies)

// Define a type for the food structure
export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Typed array of foods
export const commonFoods: FoodItem[] = [
  { name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown Rice (1 cup cooked)', calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: 'Broccoli (1 cup)', calories: 25, protein: 3, carbs: 5, fat: 0.3 },
  { name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 12 },
  { name: 'Sweet Potato (1 medium)', calories: 112, protein: 2, carbs: 26, fat: 0.1 },
  { name: 'Greek Yogurt (1 cup)', calories: 130, protein: 23, carbs: 9, fat: 0 },
  { name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: 'Oatmeal (1 cup cooked)', calories: 154, protein: 6, carbs: 28, fat: 3 },
  { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: 'Avocado (1/2 medium)', calories: 120, protein: 1.5, carbs: 6, fat: 11 },
  { name: 'Quinoa (1 cup cooked)', calories: 222, protein: 8, carbs: 39, fat: 3.5 },
  { name: 'Tuna (100g)', calories: 132, protein: 28, carbs: 0, fat: 1.3 },
  { name: 'Spinach (1 cup)', calories: 7, protein: 0.9, carbs: 1, fat: 0.1 },
  { name: 'Whole Wheat Bread (2 slices)', calories: 160, protein: 8, carbs: 28, fat: 2 },
  { name: 'Peanut Butter (2 tbsp)', calories: 188, protein: 8, carbs: 7, fat: 16 },
  { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'Cottage Cheese (1 cup)', calories: 206, protein: 28, carbs: 6, fat: 9 },
  { name: 'Turkey Breast (100g)', calories: 135, protein: 30, carbs: 0, fat: 0.7 },
  { name: 'Blueberries (1 cup)', calories: 84, protein: 1, carbs: 21, fat: 0.5 },
];
