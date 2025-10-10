'use client';

import { useState, useEffect } from 'react';
import { Activity, Heart, Footprints, Flame, Clock, Zap, Trophy } from 'lucide-react';
import Cookies from 'js-cookie';

interface FitnessMetrics {
  steps: number;
  caloriesBurned: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  activeMinutes: number;
  distance: number;
}

interface FitnessGoals {
  dailySteps: number;
  dailyCalories: number;
  activeMinutes: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achievedAt: string;
}

export default function FitnessStatsCard() {
  const [metrics, setMetrics] = useState<FitnessMetrics | null>(null);
  const [goals, setGoals] = useState<FitnessGoals | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    loadFitnessData();
    loadGoals();
    loadAchievements();
  }, []);

  const loadFitnessData = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/fitness/sync', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.metrics) {
          setMetrics(data.metrics);
          setLastSync(new Date(data.metrics.syncedAt));
        }
      }
    } catch (error) {
      console.error('Failed to load fitness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/fitness/goals', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals);
      }
    } catch (error) {
      console.error('Failed to load fitness goals:', error);
    }
  };

  const loadAchievements = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/fitness/progress?type=achievements', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements.slice(0, 3)); // Show latest 3
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };

  const syncData = async () => {
    setSyncing(true);
    setError('');

    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/fitness/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setMetrics(result.data);
        setLastSync(new Date(result.data.syncedAt));
        loadAchievements(); // Reload achievements in case new ones were earned
      } else {
        setError(result.error || 'Sync failed');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setSyncing(false);
    }
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const formatDistance = (meters: number) => {
    const km = meters / 1000;
    return km < 1 ? `${meters}m` : `${km.toFixed(1)}km`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status & Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Activity className="h-5 w-5 text-green-400 mr-2" />
            Fitness Data
          </h3>
          <button
            onClick={syncData}
            disabled={syncing}
            className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 font-medium hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            <Zap className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {lastSync && (
          <p className="text-xs text-gray-400 mb-4">
            Last synced: {lastSync.toLocaleString()}
          </p>
        )}

        {!metrics ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No fitness data available</p>
            <button
              onClick={syncData}
              disabled={syncing}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {syncing ? 'Syncing...' : 'Sync Your First Data'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Steps */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Footprints className="h-5 w-5 text-blue-400" />
                <span className="text-xs text-gray-400">
                  {goals ? Math.round(getProgressPercentage(metrics.steps, goals.dailySteps)) : 0}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.steps.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">steps</div>
              {goals && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(metrics.steps, goals.dailySteps)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Calories */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-xs text-gray-400">
                  {goals ? Math.round(getProgressPercentage(metrics.caloriesBurned, goals.dailyCalories)) : 0}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.caloriesBurned.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">calories</div>
              {goals && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(metrics.caloriesBurned, goals.dailyCalories)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Heart Rate */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="text-xs text-gray-400">avg</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.heartRate.average}
              </div>
              <div className="text-xs text-gray-400">bpm</div>
              <div className="text-xs text-gray-500 mt-1">
                {metrics.heartRate.min}-{metrics.heartRate.max} range
              </div>
            </div>

            {/* Active Minutes */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-purple-400" />
                <span className="text-xs text-gray-400">
                  {goals ? Math.round(getProgressPercentage(metrics.activeMinutes, goals.activeMinutes)) : 0}%
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {metrics.activeMinutes}
              </div>
              <div className="text-xs text-gray-400">active min</div>
              {goals && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${getProgressPercentage(metrics.activeMinutes, goals.activeMinutes)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {metrics && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Distance: {formatDistance(metrics.distance)}</span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Synced with Google Fit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Recent Achievements */}
      {achievements.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Trophy className="h-5 w-5 text-yellow-400 mr-2" />
            Recent Achievements
          </h3>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <span className="text-2xl mr-3">{achievement.icon}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{achievement.title}</h4>
                  <p className="text-sm text-gray-400">{achievement.description}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(achievement.achievedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}