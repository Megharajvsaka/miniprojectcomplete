"use server";

import { getDB } from "./mongodb";
import { ObjectId } from "mongodb";
import { awardPoints, updateStreak, POINT_STRUCTURE } from "./gamification";
import { commonFoods, FoodItem } from "./constants/foods"; // ✅ Correct import

// ----------------------
// Interface Definitions
// ----------------------
export interface NutritionGoal {
  _id?: ObjectId;
  id: string;
  userId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodEntry {
  _id?: ObjectId;
  id: string;
  userId: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  createdAt: Date;
}

export interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: FoodEntry[];
}

export interface MealPlan {
  _id?: ObjectId;
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: MealPlanEntry[];
  createdAt: Date;
}

export interface MealPlanEntry {
  id: string;
  date: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  foods: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// ----------------------
// Nutrition Goal Methods
// ----------------------
export const getNutritionGoal = async (
  userId: string
): Promise<NutritionGoal | null> => {
  const db = await getDB();
  return db.collection<NutritionGoal>("nutritionGoals").findOne({ userId });
};

export const setNutritionGoal = async (
  userId: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number
): Promise<NutritionGoal> => {
  const db = await getDB();
  const goals = db.collection<NutritionGoal>("nutritionGoals");

  const existingGoal = await goals.findOne({ userId });

  const newGoal: NutritionGoal = {
    id: new ObjectId().toString(),
    userId,
    calories,
    protein,
    carbs,
    fat,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (existingGoal) {
    await goals.updateOne({ userId }, { $set: newGoal });
    return { ...existingGoal, ...newGoal };
  }

  await goals.insertOne(newGoal);
  return newGoal;
};

// ----------------------
// Food Entry Methods
// ----------------------
export const addFoodEntry = async (
  userId: string,
  date: string,
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  quantity: number = 1,
  unit: string = "serving",
  mealType: "breakfast" | "lunch" | "dinner" | "snack" = "lunch"
): Promise<FoodEntry> => {
  const db = await getDB();
  const entries = db.collection<FoodEntry>("foodEntries");

  const entry: FoodEntry = {
    id: new ObjectId().toString(),
    userId,
    date,
    name,
    calories: calories * quantity,
    protein: protein * quantity,
    carbs: carbs * quantity,
    fat: fat * quantity,
    quantity,
    unit,
    mealType,
    createdAt: new Date(),
  };

  await entries.insertOne(entry);

  // Gamification triggers
  await awardPoints(userId, "meal_logged", POINT_STRUCTURE.meal_logged);

  const todayCount = await entries.countDocuments({ userId, date });
  if (todayCount >= 3) {
    await updateStreak(userId, "nutrition", date, true);
    await awardPoints(
      userId,
      "daily_nutrition_goal",
      POINT_STRUCTURE.daily_nutrition_goal
    );
  }

  return entry;
};

export const getFoodEntriesForDate = async (
  userId: string,
  date: string
): Promise<FoodEntry[]> => {
  const db = await getDB();
  return db
    .collection<FoodEntry>("foodEntries")
    .find({ userId, date })
    .sort({ createdAt: 1 })
    .toArray();
};

export const getDailyTotals = async (
  userId: string,
  date: string
): Promise<DailyTotals> => {
  const entries = await getFoodEntriesForDate(userId, date);
  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  return { ...totals, entries };
};

export const deleteFoodEntry = async (
  userId: string,
  entryId: string
): Promise<boolean> => {
  const db = await getDB();
  const result = await db
    .collection<FoodEntry>("foodEntries")
    .deleteOne({ id: entryId, userId });
  return result.deletedCount > 0;
};

// ----------------------
// Meal Plan Methods
// ----------------------
export const generateMealPlan = async (
  userId: string,
  startDate: string,
  endDate: string,
  fitnessGoal: "lose_weight" | "gain_muscle" | "maintain_fitness"
): Promise<MealPlan> => {
  const goal = await getNutritionGoal(userId);
  if (!goal) throw new Error("Nutrition goals must be set before generating meal plan");

  const mealPlan: MealPlan = {
    id: new ObjectId().toString(),
    userId,
    name: `${fitnessGoal.replace("_", " ").toUpperCase()} Plan`,
    startDate,
    endDate,
    meals: [],
    createdAt: new Date(),
  };

  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    ["breakfast", "lunch", "dinner"].forEach((type) => {
      mealPlan.meals.push(
        generateMealForType(type as any, goal, fitnessGoal, userId, dateStr)
      );
    });
  }

  const db = await getDB();
  await db.collection<MealPlan>("mealPlans").insertOne(mealPlan);
  return mealPlan;
};

const generateMealForType = (
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  goal: NutritionGoal,
  fitnessGoal: "lose_weight" | "gain_muscle" | "maintain_fitness",
  userId: string,
  dateStr: string
): MealPlanEntry => {
  const calorieDistribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.4,
    snack: 0.1,
  };

  const targetCalories = goal.calories * calorieDistribution[mealType];
  const foods: FoodEntry[] = [];
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFat = 0;

  const mealFoods = getMealFoodsForType(mealType, fitnessGoal);

  for (const food of mealFoods) {
    if (totalCalories < targetCalories) {
      const quantity = Math.min(2, Math.ceil((targetCalories - totalCalories) / food.calories));
      const entry: FoodEntry = {
        id: new ObjectId().toString(),
        userId,
        date: dateStr,
        name: food.name,
        calories: food.calories * quantity,
        protein: food.protein * quantity,
        carbs: food.carbs * quantity,
        fat: food.fat * quantity,
        quantity,
        unit: "serving",
        mealType,
        createdAt: new Date(),
      };
      foods.push(entry);
      totalCalories += entry.calories;
      totalProtein += entry.protein;
      totalCarbs += entry.carbs;
      totalFat += entry.fat;
    }
  }

  return { id: `${dateStr}-${mealType}`, date: dateStr, mealType, foods, totalCalories, totalProtein, totalCarbs, totalFat };
};

const getMealFoodsForType = (
  mealType: "breakfast" | "lunch" | "dinner" | "snack",
  fitnessGoal: "lose_weight" | "gain_muscle" | "maintain_fitness"
): FoodItem[] => {
  const findFood = (keyword: string) =>
    commonFoods.find((f: FoodItem) => f.name.includes(keyword))!;

  const mealMap = {
    breakfast: [findFood("Oatmeal"), findFood("Banana"), findFood("Greek Yogurt")],
    lunch: [findFood("Chicken Breast"), findFood("Brown Rice"), findFood("Broccoli")],
    dinner: [findFood("Salmon"), findFood("Sweet Potato"), findFood("Broccoli")],
    snack: [findFood("Almonds")],
  };

  return mealMap[mealType];
};

export const getMealPlansForUser = async (userId: string): Promise<MealPlan[]> => {
  const db = await getDB();
  return db
    .collection<MealPlan>("mealPlans")
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
};

// ----------------------
// Goal Calculation Helper
// ----------------------
import { calculateRecommendedGoals } from './utils/nutritionUtils';
