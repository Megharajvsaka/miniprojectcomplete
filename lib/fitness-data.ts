export interface FitnessMetrics {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  steps: number;
  caloriesBurned: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
    readings: { time: string; value: number }[];
  };
  distance: number; // in meters
  activeMinutes: number;
  syncedAt: Date;
  source: 'manual' | 'google_fit' | 'device';
}

export interface FitnessGoals {
  userId: string;
  dailySteps: number;
  dailyCalories: number;
  activeMinutes: number;
  weeklyWorkouts: number;
}

export interface Achievement {
  id: string;
  userId: string;
  type: 'steps' | 'calories' | 'workouts' | 'streak';
  title: string;
  description: string;
  threshold: number;
  achieved: boolean;
  achievedAt?: Date;
  icon: string;
}

export interface ProgressTrend {
  date: string;
  steps: number;
  calories: number;
  activeMinutes: number;
  heartRateAvg: number;
}

// Mock database
const fitnessMetrics: FitnessMetrics[] = [];
const fitnessGoals: FitnessGoals[] = [];
const achievements: Achievement[] = [];

// Default fitness goals
const DEFAULT_GOALS = {
  dailySteps: 10000,
  dailyCalories: 2000,
  activeMinutes: 30,
  weeklyWorkouts: 4
};

// Achievement templates
const ACHIEVEMENT_TEMPLATES = [
  { type: 'steps', title: 'First Steps', description: 'Walk 1,000 steps in a day', threshold: 1000, icon: '👣' },
  { type: 'steps', title: 'Step Master', description: 'Walk 10,000 steps in a day', threshold: 10000, icon: '🚶' },
  { type: 'steps', title: 'Marathon Walker', description: 'Walk 20,000 steps in a day', threshold: 20000, icon: '🏃' },
  { type: 'calories', title: 'Calorie Burner', description: 'Burn 500 calories in a day', threshold: 500, icon: '🔥' },
  { type: 'calories', title: 'Fitness Enthusiast', description: 'Burn 1,000 calories in a day', threshold: 1000, icon: '💪' },
  { type: 'workouts', title: 'Workout Warrior', description: 'Complete 7 workouts in a week', threshold: 7, icon: '🏋️' },
  { type: 'streak', title: 'Consistency King', description: 'Maintain a 7-day workout streak', threshold: 7, icon: '⚡' },
];

// Simulate Google Fit API authentication
export const authenticateGoogleFit = async (): Promise<{ success: boolean; token?: string; error?: string }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate successful authentication (90% success rate)
  if (Math.random() > 0.1) {
    return {
      success: true,
      token: `gfit_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } else {
    return {
      success: false,
      error: 'Failed to authenticate with Google Fit. Please try again.'
    };
  }
};

// Simulate fetching data from Google Fit
export const fetchGoogleFitData = async (userId: string, date: string): Promise<FitnessMetrics | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Simulate API rate limiting (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }
  
  // Generate realistic fitness data
  const baseSteps = 8000 + Math.floor(Math.random() * 6000); // 8000-14000 steps
  const baseCalories = 1800 + Math.floor(Math.random() * 800); // 1800-2600 calories
  const baseHeartRate = 70 + Math.floor(Math.random() * 30); // 70-100 bpm average
  
  const fitnessData: FitnessMetrics = {
    id: `${userId}-${date}-${Date.now()}`,
    userId,
    date,
    steps: baseSteps,
    caloriesBurned: baseCalories,
    heartRate: {
      average: baseHeartRate,
      min: baseHeartRate - 10 - Math.floor(Math.random() * 10),
      max: baseHeartRate + 20 + Math.floor(Math.random() * 20),
      readings: generateHeartRateReadings(baseHeartRate)
    },
    distance: Math.floor(baseSteps * 0.762), // Approximate meters per step
    activeMinutes: 20 + Math.floor(Math.random() * 40), // 20-60 minutes
    syncedAt: new Date(),
    source: 'google_fit'
  };
  
  return fitnessData;
};

const generateHeartRateReadings = (avgHeartRate: number) => {
  const readings = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
    const variation = Math.floor(Math.random() * 20) - 10; // ±10 bpm variation
    readings.push({
      time: time.toISOString(),
      value: Math.max(50, Math.min(180, avgHeartRate + variation))
    });
  }
  
  return readings;
};

// Store fitness metrics
export const storeFitnessMetrics = async (metrics: FitnessMetrics): Promise<void> => {
  const existingIndex = fitnessMetrics.findIndex(
    m => m.userId === metrics.userId && m.date === metrics.date
  );
  
  if (existingIndex !== -1) {
    // Update existing metrics (handle conflicts by taking the latest data)
    fitnessMetrics[existingIndex] = {
      ...fitnessMetrics[existingIndex],
      ...metrics,
      syncedAt: new Date()
    };
  } else {
    fitnessMetrics.push(metrics);
  }
  
  // Check for new achievements
  await checkAchievements(metrics.userId, metrics);
};

// Get fitness metrics for a specific date
export const getFitnessMetrics = async (userId: string, date: string): Promise<FitnessMetrics | null> => {
  return fitnessMetrics.find(m => m.userId === userId && m.date === date) || null;
};

// Get fitness metrics for a date range
export const getFitnessMetricsRange = async (
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<FitnessMetrics[]> => {
  return fitnessMetrics.filter(m => 
    m.userId === userId && 
    m.date >= startDate && 
    m.date <= endDate
  ).sort((a, b) => a.date.localeCompare(b.date));
};

// Get or create fitness goals
export const getFitnessGoals = async (userId: string): Promise<FitnessGoals> => {
  let goals = fitnessGoals.find(g => g.userId === userId);
  
  if (!goals) {
    goals = {
      userId,
      ...DEFAULT_GOALS
    };
    fitnessGoals.push(goals);
  }
  
  return goals;
};

// Update fitness goals
export const updateFitnessGoals = async (userId: string, newGoals: Partial<FitnessGoals>): Promise<FitnessGoals> => {
  const existingIndex = fitnessGoals.findIndex(g => g.userId === userId);
  
  if (existingIndex !== -1) {
    fitnessGoals[existingIndex] = { ...fitnessGoals[existingIndex], ...newGoals };
    return fitnessGoals[existingIndex];
  } else {
    const goals = { userId, ...DEFAULT_GOALS, ...newGoals };
    fitnessGoals.push(goals);
    return goals;
  }
};

// Check and award achievements
const checkAchievements = async (userId: string, metrics: FitnessMetrics): Promise<void> => {
  const userAchievements = achievements.filter(a => a.userId === userId);
  
  for (const template of ACHIEVEMENT_TEMPLATES) {
    const existingAchievement = userAchievements.find(a => a.type === template.type && a.threshold === template.threshold);
    
    if (!existingAchievement) {
      let shouldAward = false;
      
      switch (template.type) {
        case 'steps':
          shouldAward = metrics.steps >= template.threshold;
          break;
        case 'calories':
          shouldAward = metrics.caloriesBurned >= template.threshold;
          break;
        case 'workouts':
          // Check weekly workouts (simplified)
          shouldAward = await checkWeeklyWorkouts(userId) >= template.threshold;
          break;
        case 'streak':
          shouldAward = await checkWorkoutStreak(userId) >= template.threshold;
          break;
      }
      
      if (shouldAward) {
        const achievement: Achievement = {
          id: `${userId}-${template.type}-${template.threshold}-${Date.now()}`,
          userId,
          type: template.type as any,
          title: template.title,
          description: template.description,
          threshold: template.threshold,
          achieved: true,
          achievedAt: new Date(),
          icon: template.icon
        };
        
        achievements.push(achievement);
      }
    }
  }
};

// Get user achievements
export const getUserAchievements = async (userId: string): Promise<Achievement[]> => {
  return achievements.filter(a => a.userId === userId && a.achieved);
};

// Calculate weekly progress
export const getWeeklyProgress = async (userId: string): Promise<{
  steps: number;
  calories: number;
  activeMinutes: number;
  workouts: number;
  avgHeartRate: number;
}> => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  
  const weekMetrics = await getFitnessMetricsRange(
    userId,
    startOfWeek.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );
  
  const totals = weekMetrics.reduce(
    (acc, metrics) => ({
      steps: acc.steps + metrics.steps,
      calories: acc.calories + metrics.caloriesBurned,
      activeMinutes: acc.activeMinutes + metrics.activeMinutes,
      heartRateSum: acc.heartRateSum + metrics.heartRate.average,
      count: acc.count + 1
    }),
    { steps: 0, calories: 0, activeMinutes: 0, heartRateSum: 0, count: 0 }
  );
  
  return {
    steps: totals.steps,
    calories: totals.calories,
    activeMinutes: totals.activeMinutes,
    workouts: totals.count, // Simplified: each day with data = workout
    avgHeartRate: totals.count > 0 ? Math.round(totals.heartRateSum / totals.count) : 0
  };
};

// Get progress trends (last 30 days)
export const getProgressTrends = async (userId: string): Promise<ProgressTrend[]> => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const metrics = await getFitnessMetricsRange(
    userId,
    thirtyDaysAgo.toISOString().split('T')[0],
    today.toISOString().split('T')[0]
  );
  
  return metrics.map(m => ({
    date: m.date,
    steps: m.steps,
    calories: m.caloriesBurned,
    activeMinutes: m.activeMinutes,
    heartRateAvg: m.heartRate.average
  }));
};

// Helper functions for achievements
const checkWeeklyWorkouts = async (userId: string): Promise<number> => {
  const weeklyProgress = await getWeeklyProgress(userId);
  return weeklyProgress.workouts;
};

const checkWorkoutStreak = async (userId: string): Promise<number> => {
  // Simplified streak calculation
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const metrics = await getFitnessMetrics(userId, dateStr);
    if (metrics && metrics.steps > 5000) { // Simplified: 5000+ steps = active day
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

// Sync data with retry mechanism
export const syncFitnessData = async (
  userId: string, 
  date: string, 
  retryCount: number = 0
): Promise<{ success: boolean; data?: FitnessMetrics; error?: string }> => {
  try {
    const data = await fetchGoogleFitData(userId, date);
    if (data) {
      await storeFitnessMetrics(data);
      return { success: true, data };
    }
    return { success: false, error: 'No data available' };
  } catch (error) {
    if (retryCount < 3) {
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      return syncFitnessData(userId, date, retryCount + 1);
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sync failed' 
    };
  }
};