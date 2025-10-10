'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Chrome as Home, User, Droplets, Target, TrendingUp, LogOut, Menu, X, Activity, Utensils, Dumbbell, BrainCircuit } from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Profile', href: '/dashboard/profile', icon: User },
  { name: 'Fitness', href: '/dashboard/fitness', icon: Activity },
  { name: 'Workouts', href: '/dashboard/workouts', icon: Dumbbell },
  { name: 'Nutrition', href: '/dashboard/nutrition', icon: Utensils },
  { name: 'AI Assistant', href: '/dashboard/ai-assistant', icon: BrainCircuit },
  { name: 'Hydration', href: '/dashboard/hydration', icon: Droplets },
  { name: 'Goals', href: '/dashboard/goals', icon: Target },
  { name: 'Progress', href: '/dashboard/progress', icon: TrendingUp },
];

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
};

const overlayVariants = {
  open: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <motion.button
          onClick={() => setSidebarOpen(true)}
          className="p-3 rounded-lg bg-gray-800/90 backdrop-blur-sm border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-700 shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 lg:translate-x-0"
        variants={sidebarVariants}
        initial="closed"
        animate={sidebarOpen ? "open" : "closed"}
        style={{ x: 0 }} // Override for desktop
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FitTracker
            </span>
          </div>
          <motion.button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <User className="h-5 w-5 text-white" />
            </motion.div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <motion.div key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <motion.button
            onClick={logout}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            whileHover={{ x: 4 }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop sidebar - always visible */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-blue-500 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FitTracker
            </span>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center">
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
            >
              <User className="h-5 w-5 text-white" />
            </motion.div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <motion.button
            onClick={logout}
            className="flex items-center w-full px-3 py-3 text-sm font-medium text-gray-300 rounded-lg hover:text-white hover:bg-gray-700/50 transition-all duration-200"
            whileHover={{ x: 4 }}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </motion.button>
        </div>
      </div>
    </>
  );
}