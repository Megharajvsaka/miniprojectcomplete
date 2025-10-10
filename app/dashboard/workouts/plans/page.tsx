'use client';

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { 
  Target, 
  Plus, 
  Calendar,
  Clock,
  Dumbbell,
  Zap,
  Heart,
  Sparkles
} from 'lucide-react';
import Cookies from 'js-cookie';
import { WorkoutPlan } from '@/lib/workouts';

const fitnessGoals = [
  { 
    value: 'weight_loss', 
    label: 'Weight Loss', 
    description: 'High-intensity workouts to burn calories',
    icon: '🔥',
    color: 'from-red-500 to-orange-500'
  },
  { 
    value: 'muscle_gain', 
    label: 'Muscle Gain', 
    description: 'Strength training for muscle building',
    icon: '💪',
    color: 'from-blue-500 to-purple-500'
  },
  { 
    value: 'flexibility', 
    label: 'Flexibility', 
    description: 'Yoga and stretching routines',
    icon: '🧘',
    color: 'from-purple-500 to-pink-500'
  },
  { 
    value: 'endurance', 
    label: 'Endurance', 
    description: 'Cardio workouts for stamina',
    icon: '🏃',
    color: 'from-green-500 to-teal-500'
  },
  { 
    value: 'general_fitness', 
    label: 'General Fitness', 
    description: 'Balanced mix of all workout types',
    icon: '⚡',
    color: 'from-yellow-500 to-orange-500'
  }
];

function WorkoutPlansContent() {
  const { user } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    goal: '',
    startDate: new Date().toISOString().split('T')[0],
    weeks: 4
  });

  useEffect(() => {
    loadWorkoutPlans();
  }, []);

  const loadWorkoutPlans = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/workouts/plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkoutPlans(data.plans);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load workout plans');
      }
    } catch (error) {
      console.error('Failed to load workout plans:', error);
      setError('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/workouts/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkoutPlans(prev => [data.plan, ...prev]);
        setShowCreateForm(false);
        setCreateFormData({
          goal: '',
          startDate: new Date().toISOString().split('T')[0],
          weeks: 4
        });
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create workout plan');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getGoalInfo = (goal: string) => {
    return fitnessGoals.find(g => g.value === goal) || fitnessGoals[4];
  };

  if (loading && workoutPlans.length === 0) {
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
                  <Target className="h-8 w-8 text-purple-400 mr-3" />
                  Workout Plans
                </h1>
                <p className="text-gray-400">Create and manage your personalized workout routines.</p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Plan
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Create Plan Form */}
          {showCreateForm && (
            <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Sparkles className="h-5 w-5 text-purple-400 mr-2" />
                  Create Workout Plan
                </h3>
              </div>
              
              <form onSubmit={handleCreatePlan} className="space-y-6">
                {/* Goal Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Select Your Fitness Goal
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fitnessGoals.map((goal) => (
                      <button
                        key={goal.value}
                        type="button"
                        onClick={() => setCreateFormData(prev => ({ ...prev, goal: goal.value }))}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          createFormData.goal === goal.value
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        }`}
                      >
                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{goal.icon}</span>
                          <h4 className="font-medium text-white">{goal.label}</h4>
                        </div>
                        <p className="text-sm text-gray-400">{goal.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date and Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={createFormData.startDate}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (weeks)
                    </label>
                    <select
                      value={createFormData.weeks}
                      onChange={(e) => setCreateFormData(prev => ({ ...prev, weeks: parseInt(e.target.value) }))}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    >
                      <option value={2}>2 weeks</option>
                      <option value={4}>4 weeks</option>
                      <option value={6}>6 weeks</option>
                      <option value={8}>8 weeks</option>
                      <option value={12}>12 weeks</option>
                    </select>
                  </div>
                </div>

                {/* Plan Preview */}
                {createFormData.goal && (
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="text-purple-400 font-medium mb-2">Plan Preview</h4>
                    <div className="text-gray-300 text-sm space-y-1">
                      <p>Goal: <strong>{getGoalInfo(createFormData.goal).label}</strong></p>
                      <p>Duration: <strong>{createFormData.weeks} weeks</strong></p>
                      <p>Start: <strong>{formatDate(createFormData.startDate)}</strong></p>
                      <p className="text-gray-400 text-xs mt-2">
                        Your plan will include personalized workouts based on your selected goal.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading || !createFormData.goal}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {loading ? 'Creating...' : 'Create Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-6 py-2 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Workout Plans List */}
          {workoutPlans.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No Workout Plans Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first personalized workout plan to start your fitness journey.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutPlans.map((plan) => {
                const goalInfo = getGoalInfo(plan.goal);
                const completedSessions = plan.sessions.filter(s => s.completed).length;
                const completionPercentage = plan.sessions.length > 0 
                  ? (completedSessions / plan.sessions.length) * 100 
                  : 0;

                return (
                  <div key={plan.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{goalInfo.icon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                          <p className="text-sm text-gray-400">{goalInfo.label}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Duration
                        </span>
                        <span className="text-white">
                          {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400 flex items-center">
                          <Dumbbell className="h-4 w-4 mr-1" />
                          Sessions
                        </span>
                        <span className="text-white">
                          {completedSessions}/{plan.sessions.length}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-300">Progress</span>
                        <span className="text-sm text-gray-400">
                          {Math.round(completionPercentage)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className={`bg-gradient-to-r ${goalInfo.color} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        completionPercentage === 100 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : completionPercentage > 0
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                      }`}>
                        {completionPercentage === 100 ? 'Completed' : completionPercentage > 0 ? 'In Progress' : 'Not Started'}
                      </div>
                      <span className="text-xs text-gray-500">
                        Created {formatDate(plan.createdAt.toString())}
                      </span>
                    </div>
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

export default function WorkoutPlans() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <WorkoutPlansContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}