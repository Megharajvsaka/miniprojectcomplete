'use client';

import { motion } from 'framer-motion';
import { Trophy, Award, Zap, Target } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  earnedAt: Date;
}

interface GamificationCardProps {
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  recentBadges: Badge[];
  streak?: number;
}

export default function GamificationCard({
  totalPoints,
  level,
  pointsToNextLevel,
  recentBadges,
  streak = 0,
}: GamificationCardProps) {
  const tierColors = {
    bronze: 'text-orange-400',
    silver: 'text-gray-300',
    gold: 'text-yellow-400',
    platinum: 'text-cyan-400',
  };

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
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="h-5 w-5 text-green-400" />
            <span className="text-2xl font-bold text-white">{totalPoints}</span>
          </div>
          <p className="text-sm text-gray-400">Total Points</p>
        </motion.div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress to Level {level + 1}</span>
          <span className="text-gray-300 font-medium">{pointsToNextLevel} pts</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((1 - pointsToNextLevel / 1000) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {recentBadges.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Recent Badges</h4>
          <div className="space-y-2">
            {recentBadges.slice(0, 3).map((badge) => (
              <motion.div
                key={badge.id}
                className="flex items-center space-x-3 p-2 bg-gray-700/30 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${tierColors[badge.tier]}`}>{badge.name}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {recentBadges.length === 0 && (
        <div className="text-center py-4">
          <Award className="h-12 w-12 text-gray-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Complete activities to earn badges!</p>
        </div>
      )}
    </div>
  );
}
