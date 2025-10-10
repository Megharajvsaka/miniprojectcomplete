'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import FitnessStatsCard from '@/components/FitnessStatsCard';
import GamificationCard from '@/components/GamificationCard';
import AnimatedCard from '@/components/ui/animated-card';
import AnimatedButton from '@/components/ui/animated-button';
import PageTransition from '@/components/ui/page-transition';
import { 
  Droplets, 
  Target, 
  TrendingUp, 
  Calendar,
  Plus,
  User
} from 'lucide-react';
import Cookies from 'js-cookie';

interface HydrationData {
  amount: number;
  goal: number;
  entries: { time: string; amount: number }[];
}

function DashboardContent() {
  const { user } = useAuth();
  const [hydration, setHydration] = useState<HydrationData>({ amount: 0, goal: 2500, entries: [] });
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gamificationData, setGamificationData] = useState({
    totalPoints: 0,
    level: 1,
    pointsToNextLevel: 100,
    recentBadges: [],
  });

  useEffect(() => {
    loadHydrationData();
  }, []);

  const loadHydrationData = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/hydration', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHydration(data.hydration);
        setStreak(data.streak);
      }
    } catch (error) {
      console.error('Failed to load hydration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWater = async (amount: number) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/hydration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setHydration(data.hydration);
        loadHydrationData(); // Reload to get updated streak
      }
    } catch (error) {
      console.error('Failed to add water:', error);
    }
  };

  const hydrationPercentage = Math.min((hydration.amount / hydration.goal) * 100, 100);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-900 flex">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div 
              className="mb-8 mt-12 lg:mt-0"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h1 
                className="text-3xl font-bold text-white mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </motion.h1>
              <motion.p 
                className="text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Here's your fitness overview for today.
              </motion.p>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                title="Daily Hydration"
                value={`${hydration.amount}ml`}
                subtitle={`Goal: ${hydration.goal}ml`}
                icon={<Droplets className="h-6 w-6 text-blue-400" />}
                progress={hydrationPercentage}
                color="blue"
                delay={0.1}
              />
              <StatsCard
                title="Streak Days"
                value={`${streak}`}
                subtitle="Hydration streak"
                icon={<Calendar className="h-6 w-6 text-green-400" />}
                color="green"
                delay={0.2}
              />
              <StatsCard
                title="Goals Progress"
                value={user?.fitnessGoal ? "Active" : "Not Set"}
                subtitle={user?.fitnessGoal?.replace('_', ' ').toUpperCase() || "Set your goal"}
                icon={<Target className="h-6 w-6 text-purple-400" />}
                color="purple"
                delay={0.3}
              />
              <StatsCard
                title="Profile"
                value={user?.weight ? `${user.weight}kg` : "Not Set"}
                subtitle={user?.height ? `Height: ${user.height}cm` : "Complete profile"}
                icon={<User className="h-6 w-6 text-orange-400" />}
                color="orange"
                delay={0.4}
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Gamification Section */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <GamificationCard
                  totalPoints={gamificationData.totalPoints}
                  level={gamificationData.level}
                  pointsToNextLevel={gamificationData.pointsToNextLevel}
                  recentBadges={gamificationData.recentBadges}
                  streak={streak}
                />
              </motion.div>
              
              {/* Fitness Data Integration */}
              <motion.div 
                className="xl:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <FitnessStatsCard />
              </motion.div>

              {/* Hydration Tracker */}
              <AnimatedCard className="p-6 xl:col-span-1" delay={0.7}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Droplets className="h-5 w-5 text-blue-400 mr-2" />
                    Quick Hydration
                  </h3>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Daily Progress</span>
                    <span className="text-sm text-gray-400">{Math.round(hydrationPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${hydrationPercentage}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[250, 500, 750].map((amount, index) => (
                    <motion.button
                      key={amount}
                      onClick={() => addWater(amount)}
                      className="px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 font-medium hover:bg-blue-500/30 transition-all duration-200 flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {amount}ml
                    </motion.button>
                  ))}
                </div>
              </AnimatedCard>

              {/* Today's Progress */}
              <AnimatedCard className="p-6 xl:col-span-1" delay={0.8}>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                  Today's Progress
                </h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Water Intake', value: `${hydration.amount}ml` },
                    { label: 'Hydration Goal', value: `${Math.round(hydrationPercentage)}%` },
                    { label: 'Current Streak', value: `${streak} days` }
                  ].map((item, index) => (
                    <motion.div 
                      key={item.label}
                      className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      whileHover={{ x: 4 }}
                    >
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-white font-medium">{item.value}</span>
                    </motion.div>
                  ))}
                </div>
              </AnimatedCard>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  progress, 
  color = 'blue',
  delay = 0
}: { 
  title: string; 
  value: string; 
  subtitle: string; 
  icon: React.ReactNode; 
  progress?: number; 
  color?: 'blue' | 'green' | 'purple' | 'orange';
  delay?: number;
}) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    orange: 'from-orange-500/20 to-red-500/20 border-orange-500/30'
  };

  return (
    <motion.div 
      className={`bg-gradient-to-r ${colorClasses[color]} backdrop-blur-sm border rounded-xl p-6`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
          {icon}
        </motion.div>
        <motion.span 
          className="text-2xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {value}
        </motion.span>
      </div>
      <motion.h3 
        className="text-sm font-medium text-gray-400 mb-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.4 }}
      >
        {title}
      </motion.h3>
      <motion.p 
        className="text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        {subtitle}
      </motion.p>
      {progress !== undefined && (
        <motion.div 
          className="mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.6 }}
        >
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className={`bg-gradient-to-r from-${color}-500 to-${color === 'blue' ? 'cyan' : color === 'green' ? 'emerald' : color === 'purple' ? 'pink' : 'red'}-500 h-2 rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: delay + 0.7 }}
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}