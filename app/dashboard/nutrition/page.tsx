'use client';

import { useEffect, useState, useCallback } from 'react'; 
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import FoodSuggester from '@/components/FoodSuggester';
import Sidebar from '@/components/Sidebar';
import NutritionSummary from '@/components/NutritionSummary';
import MealEntryForm from '@/components/MealEntryForm';
import { 
  Utensils, 
  Target, 
  Calendar,
  Trash2,
  Clock,
  Calculator
} from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { calculateRecommendedGoals } from '@/lib/utils/nutritionUtils';

interface NutritionGoal {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: string;
}

interface DailyTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  entries: FoodEntry[];
}

function NutritionContent() {
  const { user } = useAuth();
  const [nutritionGoal, setNutritionGoal] = useState<NutritionGoal | null>(null);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotals>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    entries: []
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalFormData, setGoalFormData] = useState({
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // ✅ Fixed useCallback version to avoid useEffect dependency warning
  const loadNutritionData = useCallback(async () => {
    try {
      const token = Cookies.get('token');
      
      // Load nutrition goals
      const goalsResponse = await fetch('/api/nutrition/goals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (goalsResponse.ok) {
        const goalsData = await goalsResponse.json();
        setNutritionGoal(goalsData.goal);
        if (goalsData.goal) {
          setGoalFormData({
            calories: goalsData.goal.calories.toString(),
            protein: goalsData.goal.protein.toString(),
            carbs: goalsData.goal.carbs.toString(),
            fat: goalsData.goal.fat.toString(),
          });
        }
      }

      // Load food entries for selected date
      const entriesResponse = await fetch(`/api/nutrition/entries?date=${selectedDate}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setFoodEntries(entriesData.entries);
        setDailyTotals(entriesData.dailyTotals);
      }
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      setError('Failed to load nutrition data');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadNutritionData();
  }, [loadNutritionData]);

  const handleSetGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/nutrition/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          calories: parseInt(goalFormData.calories),
          protein: parseInt(goalFormData.protein),
          carbs: parseInt(goalFormData.carbs),
          fat: parseInt(goalFormData.fat),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNutritionGoal(data.goal);
        setShowGoalForm(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to set nutrition goals');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ✅ handleAddFood uses the fixed callback-based data reload
  const handleAddFood = async (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }): Promise<void> => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/nutrition/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...food,
          date: selectedDate,
        }),
      });

      if (response.ok) {
        await loadNutritionData(); // Reload data to get updated totals
        setError(''); // Clear any previous errors
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add food entry');
      }
    } catch (error) {
      setError('Network error occurred');
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`/api/nutrition/entries?id=${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadNutritionData(); // Reload data
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete entry');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  const calculateRecommended = () => {
    if (!user?.age || !user?.weight || !user?.height || !user?.fitnessGoal) {
      setError('Please complete your profile to get recommended nutrition goals');
      return;
    }

    const recommended = calculateRecommendedGoals(
      user.age,
      user.weight,
      user.height,
      'male',
      'moderate',
      user.fitnessGoal
    );

    setGoalFormData({
      calories: recommended.calories.toString(),
      protein: recommended.protein.toString(),
      carbs: recommended.carbs.toString(),
      fat: recommended.fat.toString(),
    });
  };

  const groupedEntries = foodEntries.reduce((acc, entry) => {
    if (!acc[entry.mealType]) {
      acc[entry.mealType] = [];
    }
    acc[entry.mealType].push(entry);
    return acc;
  }, {} as Record<string, FoodEntry[]>);

  const mealTypeOrder: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  if (loading && !nutritionGoal) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 mt-12 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <Utensils className="h-8 w-8 text-green-400 mr-3" />
                  Nutrition Tracker
                </h1>
                <p className="text-gray-400">Track your daily nutrition and reach your fitness goals.</p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Link
                  href="/dashboard/nutrition/plan"
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 font-medium hover:bg-purple-500/30 transition-all duration-200"
                >
                  Meal Plans
                </Link>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {!nutritionGoal && (
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-xl font-semibold text-yellow-400">Set Your Nutrition Goals</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Set your daily nutrition goals to start tracking your progress effectively.
              </p>
              <button
                onClick={() => setShowGoalForm(true)}
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 font-medium hover:bg-yellow-500/30 transition-all duration-200"
              >
                Set Goals Now
              </button>
            </div>
          )}

          {showGoalForm && (
            <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Target className="h-5 w-5 text-blue-400 mr-2" />
                  Set Nutrition Goals
                </h3>
                <button
                  onClick={calculateRecommended}
                  className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium hover:bg-green-500/30 transition-all duration-200 flex items-center"
                >
                  <Calculator className="h-4 w-4 mr-1" />
                  Calculate Recommended
                </button>
              </div>
              
              <form onSubmit={handleSetGoals} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Daily Calories
                  </label>
                  <input
                    type="number"
                    required
                    min="1000"
                    max="5000"
                    value={goalFormData.calories}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, calories: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Protein (g)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="300"
                    value={goalFormData.protein}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, protein: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    required
                    min="50"
                    max="500"
                    value={goalFormData.carbs}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, carbs: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Fat (g)
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="200"
                    value={goalFormData.fat}
                    onChange={(e) => setGoalFormData(prev => ({ ...prev, fat: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    placeholder="67"
                  />
                </div>
                <div className="col-span-2 md:col-span-4 flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Saving...' : 'Save Goals'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoalForm(false)}
                    className="px-6 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {nutritionGoal && (
            <>
              <div className="mb-8">
                <NutritionSummary dailyTotals={dailyTotals} goals={nutritionGoal} />
              </div>
              <div className="mb-8">
              <FoodSuggester 
               dailyTotals={dailyTotals} 
              goals={nutritionGoal}
              onAddFood={handleAddFood}
              />
              </div>

              <div className="mb-8">
                <MealEntryForm onAddFood={handleAddFood} loading={loading} />
              </div>

              <div className="space-y-6">
                {mealTypeOrder.map((mealType) => {
                  const entries = groupedEntries[mealType] || [];
                  const mealTotals = entries.reduce(
                    (acc, entry) => ({
                      calories: acc.calories + entry.calories,
                      protein: acc.protein + entry.protein,
                      carbs: acc.carbs + entry.carbs,
                      fat: acc.fat + entry.fat,
                    }),
                    { calories: 0, protein: 0, carbs: 0, fat: 0 }
                  );

                  return (
                    <div key={mealType} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white capitalize flex items-center">
                          <Clock className="h-5 w-5 text-gray-400 mr-2" />
                          {mealType}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {Math.round(mealTotals.calories)} cal, {Math.round(mealTotals.protein)}g protein
                        </div>
                      </div>

                      {entries.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No entries for this meal</p>
                      ) : (
                        <div className="space-y-3">
                          {entries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium text-white">{entry.name}</div>
                                <div className="text-sm text-gray-400">
                                  {entry.quantity} {entry.unit} • {Math.round(entry.calories)} cal
                                </div>
                                <div className="text-xs text-gray-500">
                                  P: {Math.round(entry.protein)}g • C: {Math.round(entry.carbs)}g • F: {Math.round(entry.fat)}g
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {nutritionGoal && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="px-6 py-2 border border-gray-600 text-gray-300 font-medium rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Update Nutrition Goals
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Nutrition() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <NutritionContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}
