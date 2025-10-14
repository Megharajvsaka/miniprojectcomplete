'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Target, TrendingUp } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'nutrition' | 'hydration' | 'streak' | 'achievement';
  earnedAt: Date;
  isSeen?: boolean;
}

interface GamificationCardProps {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  recentBadges: Badge[];
  streak?: number;
}

export default function GamificationCard({
  totalPoints,
  level,
  currentLevelPoints,
  nextLevelPoints,
  recentBadges,
  streak = 0,
}: GamificationCardProps) {
  const categoryColors = {
    workout: 'text-red-400 bg-red-500/20 border-red-500/30',
    nutrition: 'text-green-400 bg-green-500/20 border-green-500/30',
    hydration: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    streak: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    achievement: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  };

  const progressPercentage = nextLevelPoints > 0 
    ? (currentLevelPoints / nextLevelPoints) * 100 
    : 0;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Trophy className="h-6 w-6 text-yellow-400 mr-2" />
          Your Progress
        </h3>
        {streak > 0 && (
          <div className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-400">{streak} day streak</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-blue-400" />
            <span className="text-2xl font-bold text-white">{level}</span>
          </div>
          <p className="text-sm text-gray-400">Level</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{totalPoints.toLocaleString()}</span>
          </div>
          <p className="text-sm text-gray-400">Total Points</p>
        </motion.div>
      </div>

      {/* Progress to Next Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <div className="flex items-center">
            <TrendingUp className="h-4 w-4 text-purple-400 mr-1" />
            <span className="text-gray-400">Progress to Level {level + 1}</span>
          </div>
          <span className="text-gray-300 font-medium">
            {currentLevelPoints}/{nextLevelPoints} pts
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(progressPercentage)}% complete
        </div>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <Award className="h-4 w-4 mr-1" />
            Recent Badges
          </h4>
          <div className="space-y-2">
            {recentBadges.slice(0, 3).map((badge, index) => (
              <motion.div
                key={badge.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${categoryColors[badge.category]}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
              >
                <div className="text-2xl">{badge.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${categoryColors[badge.category].split(' ')[0]}`}>
                    {badge.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{badge.description}</p>
                </div>
                {!badge.isSeen && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentBadges.length === 0 && (
        <motion.div 
          className="text-center py-6 px-4 bg-gray-700/30 rounded-lg border border-gray-600/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Award className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-400 mb-1">No badges yet</p>
          <p className="text-xs text-gray-500">Complete activities to earn your first badge!</p>
        </motion.div>
      )}
    </div>
  );
}