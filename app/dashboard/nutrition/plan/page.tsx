'use client';

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  Calendar, 
  ChefHat, 
  Plus, 
  Clock,
  Utensils,
  Target,
  Sparkles
} from 'lucide-react';
import Cookies from 'js-cookie';

interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: MealPlanEntry[];
  createdAt: string;
}

interface MealPlanEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: any[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

function MealPlanContent() {
  const { user } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateFormData, setGenerateFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
  });

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/nutrition/meal-plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMealPlans(data.mealPlans);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load meal plans');
      }
    } catch (error) {
      console.error('Failed to load meal plans:', error);
      setError('Failed to load meal plans');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/nutrition/meal-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(generateFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setMealPlans(prev => [data.mealPlan, ...prev]);
        setShowGenerateForm(false);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate meal plan');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  if (loading && mealPlans.length === 0) {
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
          {/* Header */}
          <div className="mb-8 mt-12 lg:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <ChefHat className="h-8 w-8 text-purple-400 mr-3" />
                  Meal Planning
                </h1>
                <p className="text-gray-400">Generate and manage your personalized meal plans.</p>
              </div>
              <button
                onClick={() => setShowGenerateForm(true)}
                className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Generate New Plan
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Prerequisites Check */}
          {(!user?.fitnessGoal || !user?.weight || !user?.height) && (
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Target className="h-6 w-6 text-yellow-400 mr-2" />
                <h3 className="text-xl font-semibold text-yellow-400">Complete Your Profile</h3>
              </div>
              <p className="text-gray-300 mb-4">
                To generate personalized meal plans, please complete your profile with your fitness goals and body measurements.
              </p>
              <a
                href="/dashboard/profile"
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 font-medium hover:bg-yellow-500/30 transition-all duration-200 inline-block"
              >
                Complete Profile
              </a>
            </div>
          )}

          {/* Generate Meal Plan Form */}
          {showGenerateForm && (
            <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
                  Generate Meal Plan
                </h3>
              </div>
              
              <form onSubmit={handleGenerateMealPlan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={generateFormData.startDate}
                      onChange={(e) => setGenerateFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={generateFormData.endDate}
                      onChange={(e) => setGenerateFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">Plan Details</h4>
                  <p className="text-gray-300 text-sm">
                    Your meal plan will be generated based on your fitness goal: <strong>{user?.fitnessGoal?.replace('_', ' ').toUpperCase()}</strong>
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Make sure you have set your nutrition goals in the Nutrition Tracker for optimal results.
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Generating...' : 'Generate Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateForm(false)}
                    className="px-6 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Meal Plans List */}
          {mealPlans.length === 0 ? (
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Meal Plans Yet</h3>
              <p className="text-gray-500 mb-6">
                Generate your first personalized meal plan to get started with structured nutrition planning.
              </p>
              <button
                onClick={() => setShowGenerateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Generate Your First Plan
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {mealPlans.map((plan) => {
                const uniqueDates = Array.from(new Set(plan.meals.map(meal => meal.date))).sort();
                
                return (
                  <div key={plan.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white flex items-center">
                          <Calendar className="h-5 w-5 text-purple-400 mr-2" />
                          {plan.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {uniqueDates.length} days • {plan.meals.length} meals
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {uniqueDates.slice(0, 6).map((date) => {
                        const dayMeals = plan.meals.filter(meal => meal.date === date);
                        const dayTotals = dayMeals.reduce(
                          (acc, meal) => ({
                            calories: acc.calories + meal.totalCalories,
                            protein: acc.protein + meal.totalProtein,
                          }),
                          { calories: 0, protein: 0 }
                        );

                        return (
                          <div key={date} className="bg-gray-700/30 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-white">{formatDate(date)}</h4>
                              <div className="text-xs text-gray-400">
                                {Math.round(dayTotals.calories)} cal
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {dayMeals.map((meal) => (
                                <div key={meal.id} className="flex items-center justify-between text-sm">
                                  <span className="text-gray-300 flex items-center">
                                    <span className="mr-2">{getMealIcon(meal.mealType)}</span>
                                    {meal.mealType}
                                  </span>
                                  <span className="text-gray-400">
                                    {Math.round(meal.totalCalories)} cal
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {uniqueDates.length > 6 && (
                      <div className="mt-4 text-center">
                        <span className="text-gray-400 text-sm">
                          +{uniqueDates.length - 6} more days
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function MealPlan() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MealPlanContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}