import { useState } from 'react';
import { Lightbulb, X, Plus, TrendingUp, Sparkles } from 'lucide-react';

interface FoodSuggestion {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  reason: string;
  matchScore: number;
}

interface FoodSuggesterProps {
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onAddFood: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }) => Promise<void>;
}

// Expanded food database with common foods
const foodDatabase = [
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Greek Yogurt", calories: 100, protein: 17, carbs: 6, fat: 0.4 },
  { name: "Salmon", calories: 206, protein: 22, carbs: 0, fat: 13 },
  { name: "Eggs (2 large)", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8 },
  { name: "Quinoa", calories: 222, protein: 8, carbs: 39, fat: 3.6 },
  { name: "Oatmeal", calories: 150, protein: 5, carbs: 27, fat: 3 },
  { name: "Sweet Potato", calories: 112, protein: 2, carbs: 26, fat: 0.1 },
  { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11, fat: 0.6 },
  { name: "Almonds (1 oz)", calories: 164, protein: 6, carbs: 6, fat: 14 },
  { name: "Banana", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { name: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: "Tuna (canned)", calories: 99, protein: 22, carbs: 0, fat: 0.7 },
  { name: "Turkey Breast", calories: 135, protein: 25, carbs: 0, fat: 3 },
  { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: "Avocado (1/2)", calories: 120, protein: 1.5, carbs: 6, fat: 11 },
  { name: "Whole Wheat Bread", calories: 80, protein: 4, carbs: 14, fat: 1 },
  { name: "Peanut Butter (2 tbsp)", calories: 188, protein: 8, carbs: 7, fat: 16 },
  { name: "Protein Shake", calories: 120, protein: 24, carbs: 3, fat: 1.5 },
  { name: "Spinach (cooked)", calories: 41, protein: 5, carbs: 7, fat: 0.5 },
  { name: "Beef (lean)", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Pasta (whole wheat)", calories: 174, protein: 7, carbs: 37, fat: 0.8 },
  { name: "Lentils", calories: 230, protein: 18, carbs: 40, fat: 0.8 },
  { name: "Black Beans", calories: 227, protein: 15, carbs: 41, fat: 0.9 },
  { name: "Orange", calories: 62, protein: 1.2, carbs: 15, fat: 0.2 },
];

export default function FoodSuggester({ dailyTotals, goals, onAddFood }: FoodSuggesterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<FoodSuggestion[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [adding, setAdding] = useState<string | null>(null);

  const safeGoals = goals || { calories: 2000, protein: 150, carbs: 250, fat: 67 };
  const safeTotals = dailyTotals || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  const remaining = {
    calories: Math.max(0, safeGoals.calories - safeTotals.calories),
    protein: Math.max(0, safeGoals.protein - safeTotals.protein),
    carbs: Math.max(0, safeGoals.carbs - safeTotals.carbs),
    fat: Math.max(0, safeGoals.fat - safeTotals.fat),
  };

  const generateSuggestions = () => {
    const scored = foodDatabase.map(food => {
      let score = 0;
      let reasons: string[] = [];

      if (food.calories > remaining.calories) {
        return null;
      }

      if (remaining.protein > 20 && food.protein > 15) {
        score += 30;
        reasons.push('High protein');
      }
      
      if (remaining.carbs > 30 && food.carbs > 20) {
        score += 25;
        reasons.push('Good carbs');
      }
      
      if (remaining.fat > 15 && food.fat > 10) {
        score += 20;
        reasons.push('Healthy fats');
      }

      const proteinRatio = remaining.protein > 0 ? (food.protein / remaining.protein) : 0;
      const carbRatio = remaining.carbs > 0 ? (food.carbs / remaining.carbs) : 0;
      const fatRatio = remaining.fat > 0 ? (food.fat / remaining.fat) : 0;
      
      if (proteinRatio > 0.1 && proteinRatio < 0.5) score += 10;
      if (carbRatio > 0.1 && carbRatio < 0.5) score += 10;
      if (fatRatio > 0.1 && fatRatio < 0.5) score += 10;

      if (food.protein > remaining.protein) score -= 5;
      if (food.carbs > remaining.carbs) score -= 5;
      if (food.fat > remaining.fat) score -= 5;

      const calorieEfficiency = food.calories / remaining.calories;
      if (calorieEfficiency > 0.1 && calorieEfficiency < 0.4) {
        score += 15;
        reasons.push('Good portion');
      }

      if (reasons.length === 0) {
        reasons.push('Fits your macros');
      }

      return {
        ...food,
        matchScore: score,
        reason: reasons.join(', '),
      };
    }).filter(Boolean) as FoodSuggestion[];

    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 6);
    setSuggestions(sorted);
    setIsOpen(true);
  };

  const handleAddSuggestion = async (food: FoodSuggestion) => {
    setAdding(food.name);
    try {
      await onAddFood({
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        quantity: 1,
        unit: 'serving',
        mealType: selectedMealType,
      });
      setSuggestions(prev => prev.filter(s => s.name !== food.name));
    } catch (error) {
      console.error('Failed to add food:', error);
    } finally {
      setAdding(null);
    }
  };

  const getRemainingText = () => {
    if (remaining.calories === 0) {
      return "You've reached your daily calorie goal!";
    }
    return `${Math.round(remaining.calories)} calories remaining`;
  };

  const getMacroNeed = () => {
    const needs: string[] = [];
    if (remaining.protein > 20) needs.push(`${Math.round(remaining.protein)}g protein`);
    if (remaining.carbs > 30) needs.push(`${Math.round(remaining.carbs)}g carbs`);
    if (remaining.fat > 15) needs.push(`${Math.round(remaining.fat)}g fat`);
    return needs.length > 0 ? needs.join(', ') : 'Well balanced!';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
            AI Food Suggestions
          </h3>
          <p className="text-sm text-gray-400 mt-1">{getRemainingText()}</p>
        </div>
        <button
          onClick={() => isOpen ? setIsOpen(false) : generateSuggestions()}
          disabled={remaining.calories === 0}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-medium rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          {isOpen ? 'Hide' : 'Suggest Foods'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400 mr-2" />
              <span className="text-sm font-medium text-blue-400">Your Current Needs</span>
            </div>
            <p className="text-sm text-gray-300">{getMacroNeed()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add to meal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                <button
                  key={meal}
                  onClick={() => setSelectedMealType(meal as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                    selectedMealType === meal
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {meal}
                </button>
              ))}
            </div>
          </div>

          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No suitable suggestions available.</p>
              <p className="text-sm mt-1">Try adjusting your remaining macros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((food) => (
                <div
                  key={food.name}
                  className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:border-blue-500/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{food.name}</h4>
                      <p className="text-xs text-green-400 mt-1">{food.reason}</p>
                    </div>
                    <button
                      onClick={() => handleAddSuggestion(food)}
                      disabled={adding === food.name}
                      className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                    >
                      {adding === food.name ? (
                        <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">
                      <span className="text-orange-400 font-medium">{Math.round(food.calories)}</span> cal
                    </div>
                    <div className="text-gray-400">
                      <span className="text-red-400 font-medium">{Math.round(food.protein)}g</span> protein
                    </div>
                    <div className="text-gray-400">
                      <span className="text-blue-400 font-medium">{Math.round(food.carbs)}g</span> carbs
                    </div>
                    <div className="text-gray-400">
                      <span className="text-amber-400 font-medium">{Math.round(food.fat)}g</span> fat
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Match Score</span>
                      <div className="flex items-center">
                        <div className="w-16 h-1.5 bg-gray-600 rounded-full overflow-hidden mr-2">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, food.matchScore)}%` }}
                          />
                        </div>
                        <span className="text-gray-400">{Math.round(food.matchScore)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="text-center pt-2">
              <button
                onClick={generateSuggestions}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                Refresh suggestions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}