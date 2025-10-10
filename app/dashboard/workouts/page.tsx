'use client';

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import WorkoutCard from '@/components/WorkoutCard';
import WorkoutCalendar from '@/components/WorkoutCalendar';
import { 
  Dumbbell, 
  Target, 
  Calendar,
  TrendingUp,
  Plus,
  Flame,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { WorkoutSession, WorkoutPlan } from '@/lib/workouts';

interface WeeklyProgress {
  completedSessions: number;
  totalSessions: number;
  completionPercentage: number;
  totalDuration: number;
  caloriesBurned: number;
}

function WorkoutContent() {
  const { user } = useAuth();
  const [todaysWorkout, setTodaysWorkout] = useState<WorkoutSession | null>(null);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({
    completedSessions: 0,
    totalSessions: 0,
    completionPercentage: 0,
    totalDuration: 0,
    caloriesBurned: 0
  });
  const [streak, setStreak] = useState(0);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exerciseLoading, setExerciseLoading] = useState(false);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadSessionsForMonth();
    }
  }, [selectedDate]);

  const loadWorkoutData = async () => {
    try {
      const token = Cookies.get('token');
      
      // Load today's workout
      const todayResponse = await fetch('/api/workouts/sessions?today=true', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (todayResponse.ok) {
        const todayData = await todayResponse.json();
        setTodaysWorkout(todayData.session);
      }

      // Load workout plans
      const plansResponse = await fetch('/api/workouts/plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setWorkoutPlans(plansData.plans);
      }

      // Load weekly progress
      const weeklyResponse = await fetch('/api/workouts/progress?type=weekly', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        setWeeklyProgress(weeklyData.progress);
      }

      // Load streak
      const streakResponse = await fetch('/api/workouts/progress?type=streak', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (streakResponse.ok) {
        const streakData = await streakResponse.json();
        setStreak(streakData.streak);
      }

    } catch (error) {
      console.error('Failed to load workout data:', error);
      setError('Failed to load workout data');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionsForMonth = async () => {
    try {
      const token = Cookies.get('token');
      const date = new Date(selectedDate);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const response = await fetch(
        `/api/workouts/sessions?startDate=${startOfMonth.toISOString().split('T')[0]}&endDate=${endOfMonth.toISOString().split('T')[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const handleExerciseToggle = async (exerciseId: string, completed: boolean) => {
    if (!todaysWorkout) return;

    setExerciseLoading(true);
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/workouts/sessions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: todaysWorkout.id,
          exerciseId,
          completed,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTodaysWorkout(data.session);
        // Reload weekly progress if workout is completed
        if (data.session.completed) {
          loadWorkoutData();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update exercise');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setExerciseLoading(false);
    }
  };

  if (loading) {
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
                  <Dumbbell className="h-8 w-8 text-blue-400 mr-3" />
                  Workout Planner
                </h1>
                <p className="text-gray-400">Track your fitness journey and stay motivated.</p>
              </div>
              <Link
                href="/dashboard/workouts/plans"
                className="mt-4 sm:mt-0 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Plan
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Weekly Progress"
              value={`${weeklyProgress.completedSessions}/${weeklyProgress.totalSessions}`}
              subtitle={`${Math.round(weeklyProgress.completionPercentage)}% complete`}
              icon={<Target className="h-6 w-6 text-blue-400" />}
              progress={weeklyProgress.completionPercentage}
              color="blue"
            />
            <StatsCard
              title="Current Streak"
              value={`${streak}`}
              subtitle="consecutive days"
              icon={<Zap className="h-6 w-6 text-yellow-400" />}
              color="yellow"
            />
            <StatsCard
              title="This Week"
              value={`${weeklyProgress.totalDuration}min`}
              subtitle="total workout time"
              icon={<Clock className="h-6 w-6 text-green-400" />}
              color="green"
            />
            <StatsCard
              title="Calories Burned"
              value={`${weeklyProgress.caloriesBurned}`}
              subtitle="this week"
              icon={<Flame className="h-6 w-6 text-orange-400" />}
              color="orange"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Workout */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Calendar className="h-6 w-6 text-purple-400 mr-2" />
                  Today's Workout
                </h2>
              </div>

              {todaysWorkout ? (
                <WorkoutCard
                  session={todaysWorkout}
                  onExerciseToggle={handleExerciseToggle}
                  loading={exerciseLoading}
                />
              ) : (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 text-center">
                  <Dumbbell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No Workout Scheduled</h3>
                  <p className="text-gray-500 mb-6">
                    Create a workout plan to get started with your fitness journey.
                  </p>
                  <Link
                    href="/dashboard/workouts/plans"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 inline-flex items-center"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Plan
                  </Link>
                </div>
              )}

              {/* Recent Plans */}
              {workoutPlans.length > 0 && (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                    Your Workout Plans
                  </h3>
                  <div className="space-y-3">
                    {workoutPlans.slice(0, 3).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <h4 className="font-medium text-white">{plan.name}</h4>
                          <p className="text-sm text-gray-400">
                            {plan.sessions.length} sessions • {plan.goal.replace('_', ' ')}
                          </p>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(plan.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {workoutPlans.length > 3 && (
                    <Link
                      href="/dashboard/workouts/plans"
                      className="block text-center mt-4 text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View all plans ({workoutPlans.length})
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Calendar */}
            <div>
              <WorkoutCalendar
                sessions={sessions}
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  progress, 
  color = 'blue' 
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  progress?: number; 
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'yellow';
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
    yellow: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
  };

  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} backdrop-blur-sm border rounded-xl p-6 hover:scale-105 transition-all duration-200`}>
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
      <p className="text-xs text-gray-500">{subtitle}</p>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r from-${color}-500 to-${color === 'blue' ? 'cyan' : color === 'green' ? 'emerald' : color === 'purple' ? 'pink' : color === 'orange' ? 'red' : 'amber'}-500 h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Workouts() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <WorkoutContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}