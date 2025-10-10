export interface NutritionGoal {
  id: string;
  userId: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  quantity: number;
  unit: string; // e.g., "serving", "cup", "gram"
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodEntry[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}
import { awardPoints, updateStreak, POINT_STRUCTURE } from './gamification';

// Mock database
const nutritionGoals: NutritionGoal[] = [];
const foodEntries: FoodEntry[] = [];
const mealPlans: MealPlan[] = [];

// Common foods database for suggestions
export const commonFoods = [
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
];

// Nutrition Goals Functions
export const getNutritionGoal = async (userId: string): Promise<NutritionGoal | null> => {
  return nutritionGoals.find(goal => goal.userId === userId) || null;
};

export const setNutritionGoal = async (
  userId: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number
): Promise<NutritionGoal> => {
  const existingGoalIndex = nutritionGoals.findIndex(goal => goal.userId === userId);
  
  if (existingGoalIndex !== -1) {
    nutritionGoals[existingGoalIndex] = {
      ...nutritionGoals[existingGoalIndex],
      calories,
      protein,
      carbs,
      fat,
      updatedAt: new Date(),
    };
    return nutritionGoals[existingGoalIndex];
  } else {
    const newGoal: NutritionGoal = {
      id: Date.now().toString(),
      userId,
      calories,
      protein,
      carbs,
      fat,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    nutritionGoals.push(newGoal);
    return newGoal;
  }
};

// Food Entry Functions
export const addFoodEntry = async (
  userId: string,
  date: string,
  name: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  quantity: number = 1,
  unit: string = 'serving',
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' = 'lunch'
): Promise<FoodEntry> => {
  const entry: FoodEntry = {
    id: Date.now().toString(),
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
  
  foodEntries.push(entry);
  
  // Award points for meal logging
  await awardPoints(userId, 'meal_logged', POINT_STRUCTURE.meal_logged);
  
  // Check if this is the first meal of the day to update nutrition streak
  const todayEntries = foodEntries.filter(e => e.userId === userId && e.date === date);
  if (todayEntries.length >= 3) { // At least 3 meals logged
    await updateStreak(userId, 'nutrition', date, true);
    await awardPoints(userId, 'daily_nutrition_goal', POINT_STRUCTURE.daily_nutrition_goal);
  }
  
  return entry;
};

export const getFoodEntriesForDate = async (userId: string, date: string): Promise<FoodEntry[]> => {
  return foodEntries.filter(entry => entry.userId === userId && entry.date === date);
};

export const getDailyTotals = async (userId: string, date: string): Promise<DailyTotals> => {
  const entries = await getFoodEntriesForDate(userId, date);
  
  const totals = entries.reduce(
    (acc, entry) => ({
      calories: acc.calories + entry.calories,
      protein: acc.protein + entry.protein,
      carbs: acc.carbs + entry.carbs,
      fat: acc.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  
  return { ...totals, entries };
};

export const deleteFoodEntry = async (userId: string, entryId: string): Promise<boolean> => {
  const entryIndex = foodEntries.findIndex(entry => entry.id === entryId && entry.userId === userId);
  if (entryIndex !== -1) {
    foodEntries.splice(entryIndex, 1);
    return true;
  }
  return false;
};

// Meal Planning Functions
export const generateMealPlan = async (
  userId: string,
  startDate: string,
  endDate: string,
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain_fitness'
): Promise<MealPlan> => {
  const goal = await getNutritionGoal(userId);
  if (!goal) {
    throw new Error('Nutrition goals must be set before generating meal plan');
  }

  // Simple meal plan generation based on fitness goals
  const mealPlan: MealPlan = {
    id: Date.now().toString(),
    userId,
    name: `${fitnessGoal.replace('_', ' ').toUpperCase()} Plan`,
    startDate,
    endDate,
    meals: [],
    createdAt: new Date(),
  };

  // Generate meals for each day
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate breakfast
    const breakfast = generateMealForType('breakfast', goal, fitnessGoal);
    mealPlan.meals.push({
      id: `${dateStr}-breakfast`,
      date: dateStr,
      mealType: 'breakfast',
      foods: breakfast.foods,
      totalCalories: breakfast.totalCalories,
      totalProtein: breakfast.totalProtein,
      totalCarbs: breakfast.totalCarbs,
      totalFat: breakfast.totalFat,
    });

    // Generate lunch
    const lunch = generateMealForType('lunch', goal, fitnessGoal);
    mealPlan.meals.push({
      id: `${dateStr}-lunch`,
      date: dateStr,
      mealType: 'lunch',
      foods: lunch.foods,
      totalCalories: lunch.totalCalories,
      totalProtein: lunch.totalProtein,
      totalCarbs: lunch.totalCarbs,
      totalFat: lunch.totalFat,
    });

    // Generate dinner
    const dinner = generateMealForType('dinner', goal, fitnessGoal);
    mealPlan.meals.push({
      id: `${dateStr}-dinner`,
      date: dateStr,
      mealType: 'dinner',
      foods: dinner.foods,
      totalCalories: dinner.totalCalories,
      totalProtein: dinner.totalProtein,
      totalCarbs: dinner.totalCarbs,
      totalFat: dinner.totalFat,
    });
  }

  mealPlans.push(mealPlan);
  return mealPlan;
};

const generateMealForType = (
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  goal: NutritionGoal,
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain_fitness'
) => {
  // Distribute calories across meals (breakfast: 25%, lunch: 35%, dinner: 40%)
  const calorieDistribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.40,
    snack: 0.10,
  };

  const targetCalories = goal.calories * calorieDistribution[mealType];
  const foods: FoodEntry[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  // Select foods based on meal type and fitness goal
  const mealFoods = getMealFoodsForType(mealType, fitnessGoal);
  
  for (const food of mealFoods) {
    if (totalCalories < targetCalories) {
      const quantity = Math.min(2, Math.ceil((targetCalories - totalCalories) / food.calories));
      
      const foodEntry: FoodEntry = {
        id: `${Date.now()}-${Math.random()}`,
        userId: goal.userId,
        date: new Date().toISOString().split('T')[0],
        name: food.name,
        calories: food.calories * quantity,
        protein: food.protein * quantity,
        carbs: food.carbs * quantity,
        fat: food.fat * quantity,
        quantity,
        unit: 'serving',
        mealType,
        createdAt: new Date(),
      };

      foods.push(foodEntry);
      totalCalories += foodEntry.calories;
      totalProtein += foodEntry.protein;
      totalCarbs += foodEntry.carbs;
      totalFat += foodEntry.fat;
    }
  }

  return { foods, totalCalories, totalProtein, totalCarbs, totalFat };
};

const getMealFoodsForType = (
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain_fitness'
) => {
  const breakfastFoods = [
    commonFoods.find(f => f.name.includes('Oatmeal'))!,
    commonFoods.find(f => f.name.includes('Banana'))!,
    commonFoods.find(f => f.name.includes('Greek Yogurt'))!,
  ];

  const lunchFoods = [
    commonFoods.find(f => f.name.includes('Chicken Breast'))!,
    commonFoods.find(f => f.name.includes('Brown Rice'))!,
    commonFoods.find(f => f.name.includes('Broccoli'))!,
  ];

  const dinnerFoods = [
    commonFoods.find(f => f.name.includes('Salmon'))!,
    commonFoods.find(f => f.name.includes('Sweet Potato'))!,
    commonFoods.find(f => f.name.includes('Broccoli'))!,
  ];

  const mealMap = {
    breakfast: breakfastFoods,
    lunch: lunchFoods,
    dinner: dinnerFoods,
    snack: [commonFoods.find(f => f.name.includes('Almonds'))!],
  };

  return mealMap[mealType];
};

export const getMealPlansForUser = async (userId: string): Promise<MealPlan[]> => {
  return mealPlans.filter(plan => plan.userId === userId);
};

// Calculate recommended nutrition goals based on user profile
export const calculateRecommendedGoals = (
  age: number,
  weight: number, // in kg
  height: number, // in cm
  gender: 'male' | 'female',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain_fitness'
) => {
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multipliers
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let tdee = bmr * activityMultipliers[activityLevel];

  // Adjust for fitness goals
  switch (fitnessGoal) {
    case 'lose_weight':
      tdee *= 0.8; // 20% deficit
      break;
    case 'gain_muscle':
      tdee *= 1.1; // 10% surplus
      break;
    case 'maintain_fitness':
      // Keep TDEE as is
      break;
  }

  // Calculate macronutrient distribution
  const protein = weight * (fitnessGoal === 'gain_muscle' ? 2.2 : 1.6); // g per kg body weight
  const fat = tdee * 0.25 / 9; // 25% of calories from fat (9 cal/g)
  const carbs = (tdee - (protein * 4) - (fat * 9)) / 4; // Remaining calories from carbs (4 cal/g)

  return {
    calories: Math.round(tdee),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
};