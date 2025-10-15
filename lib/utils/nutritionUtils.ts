// lib/utils/nutritionUtils.ts
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type FitnessGoal = "lose_weight" | "gain_muscle" | "maintain_fitness";
export type Gender = "male" | "female";

export const calculateRecommendedGoals = (
  age: number,
  weight: number,
  height: number,
  gender: Gender,
  activityLevel: ActivityLevel,
  fitnessGoal: FitnessGoal
) => {
  const bmr =
    gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let tdee = bmr * activityMultipliers[activityLevel];
  if (fitnessGoal === "lose_weight") tdee *= 0.8;
  if (fitnessGoal === "gain_muscle") tdee *= 1.1;

  const protein = weight * (fitnessGoal === "gain_muscle" ? 2.2 : 1.6);
  const fat = (tdee * 0.25) / 9;
  const carbs = (tdee - protein * 4 - fat * 9) / 4;

  return {
    calories: Math.round(tdee),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
};
