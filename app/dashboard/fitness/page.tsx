'use client';

import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import FitnessStatsCard from '@/components/FitnessStatsCard';
import { 
  Activity, 
  TrendingUp, 
  Calendar,
  Settings,
  Target,
  Heart,
  Footprints,
  Flame
} from 'lucide-react';
import Cookies from 'js-cookie';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressTrend {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRateAvg: number;
}

interface WeeklyProgress {
  steps: number;
  calories: number;
  activeMinutes: number;
  workouts: number;
  avgHeartRate: number;
}

function FitnessContent() {
  const { user } = useAuth();
  const [trends, setTrends] = useState<ProgressTrend[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const token = Cookies.get('token');
      
      // Load trends
      const trendsResponse = await fetch('/api/fitness/progress?type=trends', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setTrends(trendsData.trends);
      }

      // Load weekly progress
      const weeklyResponse = await fetch('/api/fitness/progress?type=weekly', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        setWeeklyProgress(weeklyData.progress);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-300" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.dataKey === 'heartRateAvg' ? ' bpm' : 
               entry.dataKey === 'steps' ? ' steps' : 
               entry.dataKey === 'calories' ? ' cal' : ' min'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
                  <Activity className="h-8 w-8 text-green-400 mr-3" />
                  Fitness Tracking
                </h1>
                <p className="text-gray-400">Monitor your daily activity and health metrics.</p>
              </div>
              <button className="mt-4 sm:mt-0 px-6 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 font-medium hover:bg-gray-600 transition-all duration-200 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {error}
            </div>
          )}

          {/* Fitness Stats */}
          <div className="mb-8">
            <FitnessStatsCard />
          </div>

          {/* Weekly Progress Summary */}
          {weeklyProgress && (
            <div className="mb-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-400 mr-2" />
                This Week's Progress
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Footprints className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {weeklyProgress.steps.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Steps</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Flame className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {weeklyProgress.calories.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Calories Burned</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {weeklyProgress.avgHeartRate}
                  </div>
                  <div className="text-sm text-gray-400">Avg Heart Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">
                    {weeklyProgress.activeMinutes}
                  </div>
                  <div className="text-sm text-gray-400">Active Minutes</div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Trends Chart */}
          {trends.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Calendar className="h-5 w-5 text-purple-400 mr-2" />
                30-Day Trends
              </h3>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="steps" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Steps"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Calories"
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="heartRateAvg" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Heart Rate"
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend */}
              <div className="flex justify-center space-x-6 mt-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">Steps</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">Calories</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-300">Heart Rate</span>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">Loading fitness data...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Fitness() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <FitnessContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}