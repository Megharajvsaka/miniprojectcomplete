export interface GamificationProfile {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  pointsToNextLevel: number;
  totalBadges: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'workout' | 'hydration' | 'nutrition' | 'streak' | 'special';
  requirement: {
    type: 'points' | 'streak' | 'count' | 'milestone';
    value: number;
    activity?: string;
  };
  points: number;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
  isNew: boolean; // For showing unlock animations
}

export interface StreakRecord {
  id: string;
  userId: string;
  type: 'workout' | 'hydration' | 'nutrition';
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  isActive: boolean;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  activity: string;
  points: number;
  timestamp: Date;
  metadata?: any;
}

// Point structure for different activities
export const POINT_STRUCTURE = {
  workout_completed: 50,
  workout_completed_bonus: 25, // Extra points for longer workouts
  hydration_goal_met: 20,
  hydration_bonus: 10, // Extra points for exceeding goal
  meal_logged: 15,
  daily_nutrition_goal: 30,
  streak_bonus_7: 100,
  streak_bonus_30: 500,
  streak_bonus_100: 2000,
  profile_completed: 100,
  first_workout: 200,
  first_meal_log: 150,
  first_hydration_log: 100,
};

// Level system - points required for each level
export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000, 35000, 50000, 75000
];

// Badge definitions
export const BADGE_DEFINITIONS: Badge[] = [
  // Workout Badges
  {
    id: 'first-workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🏃',
    tier: 'bronze',
    category: 'workout',
    requirement: { type: 'count', value: 1, activity: 'workout' },
    points: 50
  },
  {
    id: 'workout-warrior-bronze',
    name: 'Workout Warrior',
    description: 'Complete 10 workouts',
    icon: '💪',
    tier: 'bronze',
    category: 'workout',
    requirement: { type: 'count', value: 10, activity: 'workout' },
    points: 100
  },
  {
    id: 'workout-warrior-silver',
    name: 'Workout Champion',
    description: 'Complete 50 workouts',
    icon: '🏆',
    tier: 'silver',
    category: 'workout',
    requirement: { type: 'count', value: 50, activity: 'workout' },
    points: 300
  },
  {
    id: 'workout-warrior-gold',
    name: 'Fitness Legend',
    description: 'Complete 100 workouts',
    icon: '👑',
    tier: 'gold',
    category: 'workout',
    requirement: { type: 'count', value: 100, activity: 'workout' },
    points: 750
  },

  // Hydration Badges
  {
    id: 'hydration-hero-bronze',
    name: 'Hydration Hero',
    description: 'Meet hydration goal for 7 days',
    icon: '💧',
    tier: 'bronze',
    category: 'hydration',
    requirement: { type: 'streak', value: 7, activity: 'hydration' },
    points: 150
  },
  {
    id: 'hydration-hero-silver',
    name: 'Water Warrior',
    description: 'Meet hydration goal for 30 days',
    icon: '🌊',
    tier: 'silver',
    category: 'hydration',
    requirement: { type: 'streak', value: 30, activity: 'hydration' },
    points: 500
  },
  {
    id: 'hydration-hero-gold',
    name: 'Aqua Master',
    description: 'Meet hydration goal for 100 days',
    icon: '🏺',
    tier: 'gold',
    category: 'hydration',
    requirement: { type: 'streak', value: 100, activity: 'hydration' },
    points: 1500
  },

  // Nutrition Badges
  {
    id: 'meal-master-bronze',
    name: 'Meal Master',
    description: 'Log meals for 7 consecutive days',
    icon: '🍽️',
    tier: 'bronze',
    category: 'nutrition',
    requirement: { type: 'streak', value: 7, activity: 'nutrition' },
    points: 200
  },
  {
    id: 'meal-master-silver',
    name: 'Nutrition Ninja',
    description: 'Log meals for 30 consecutive days',
    icon: '🥗',
    tier: 'silver',
    category: 'nutrition',
    requirement: { type: 'streak', value: 30, activity: 'nutrition' },
    points: 600
  },
  {
    id: 'meal-master-gold',
    name: 'Diet Deity',
    description: 'Log meals for 100 consecutive days',
    icon: '🌟',
    tier: 'gold',
    category: 'nutrition',
    requirement: { type: 'streak', value: 100, activity: 'nutrition' },
    points: 2000
  },

  // Streak Badges
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Maintain any 7-day streak',
    icon: '🔥',
    tier: 'bronze',
    category: 'streak',
    requirement: { type: 'streak', value: 7 },
    points: 100
  },
  {
    id: 'consistency-king',
    name: 'Consistency King',
    description: 'Maintain any 30-day streak',
    icon: '⚡',
    tier: 'silver',
    category: 'streak',
    requirement: { type: 'streak', value: 30 },
    points: 400
  },
  {
    id: 'dedication-master',
    name: 'Dedication Master',
    description: 'Maintain any 100-day streak',
    icon: '💎',
    tier: 'gold',
    category: 'streak',
    requirement: { type: 'streak', value: 100 },
    points: 1200
  },

  // Point Milestones
  {
    id: 'point-collector-bronze',
    name: 'Point Collector',
    description: 'Earn 1,000 total points',
    icon: '🎯',
    tier: 'bronze',
    category: 'special',
    requirement: { type: 'points', value: 1000 },
    points: 100
  },
  {
    id: 'point-collector-silver',
    name: 'Point Master',
    description: 'Earn 5,000 total points',
    icon: '🎖️',
    tier: 'silver',
    category: 'special',
    requirement: { type: 'points', value: 5000 },
    points: 300
  },
  {
    id: 'point-collector-gold',
    name: 'Point Legend',
    description: 'Earn 25,000 total points',
    icon: '🏅',
    tier: 'gold',
    category: 'special',
    requirement: { type: 'points', value: 25000 },
    points: 1000
  }
];

// Mock database
const gamificationProfiles: GamificationProfile[] = [];
const userBadges: UserBadge[] = [];
const streakRecords: StreakRecord[] = [];
const activityLogs: ActivityLog[] = [];

// Activity counters for badge requirements
const activityCounters: { [userId: string]: { [activity: string]: number } } = {};

// Initialize gamification profile for new user
export const initializeUserGamification = async (userId: string): Promise<GamificationProfile> => {
  const profile: GamificationProfile = {
    id: `profile_${userId}_${Date.now()}`,
    userId,
    totalPoints: 0,
    level: 1,
    pointsToNextLevel: LEVEL_THRESHOLDS[1],
    totalBadges: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  gamificationProfiles.push(profile);

  // Initialize streak records
  const streakTypes: ('workout' | 'hydration' | 'nutrition')[] = ['workout', 'hydration', 'nutrition'];
  for (const type of streakTypes) {
    const streak: StreakRecord = {
      id: `streak_${userId}_${type}_${Date.now()}`,
      userId,
      type,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: '',
      isActive: false,
      updatedAt: new Date()
    };
    streakRecords.push(streak);
  }

  // Initialize activity counters
  if (!activityCounters[userId]) {
    activityCounters[userId] = {
      workout: 0,
      hydration: 0,
      nutrition: 0
    };
  }

  return profile;
};

// Award points to user
export const awardPoints = async (
  userId: string, 
  activity: string, 
  basePoints?: number,
  metadata?: any
): Promise<{ pointsAwarded: number; levelUp: boolean }> => {
  let profile = gamificationProfiles.find(p => p.userId === userId);
  if (!profile) {
    profile = await initializeUserGamification(userId);
  }

  const points = basePoints || POINT_STRUCTURE[activity as keyof typeof POINT_STRUCTURE] || 0;
  const oldLevel = profile.level;

  profile.totalPoints += points;
  profile.updatedAt = new Date();

  // Calculate new level
  let newLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (profile.totalPoints >= LEVEL_THRESHOLDS[i]) {
      newLevel = i + 1;
      break;
    }
  }

  profile.level = newLevel;
  profile.pointsToNextLevel = newLevel < LEVEL_THRESHOLDS.length 
    ? LEVEL_THRESHOLDS[newLevel] - profile.totalPoints 
    : 0;

  // Log activity
  const log: ActivityLog = {
    id: `log_${Date.now()}_${Math.random()}`,
    userId,
    activity,
    points,
    timestamp: new Date(),
    metadata
  };
  activityLogs.push(log);

  // Update activity counter
  if (!activityCounters[userId]) {
    activityCounters[userId] = { workout: 0, hydration: 0, nutrition: 0 };
  }
  
  const activityType = activity.includes('workout') ? 'workout' : 
                      activity.includes('hydration') ? 'hydration' : 
                      activity.includes('meal') || activity.includes('nutrition') ? 'nutrition' : activity;
  
  if (activityCounters[userId][activityType] !== undefined) {
    activityCounters[userId][activityType]++;
  }

  // Check for new badges
  await checkAndAwardBadges(userId);

  return {
    pointsAwarded: points,
    levelUp: newLevel > oldLevel
  };
};

// Update streak for user
export const updateStreak = async (
  userId: string,
  type: 'workout' | 'hydration' | 'nutrition',
  date: string,
  achieved: boolean
): Promise<StreakRecord> => {
  let streak = streakRecords.find(s => s.userId === userId && s.type === type);
  
  if (!streak) {
    streak = {
      id: `streak_${userId}_${type}_${Date.now()}`,
      userId,
      type,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: '',
      isActive: false,
      updatedAt: new Date()
    };
    streakRecords.push(streak);
  }

  const today = new Date(date);
  const lastActivity = streak.lastActivityDate ? new Date(streak.lastActivityDate) : null;
  const daysDiff = lastActivity ? Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  if (achieved) {
    if (!lastActivity || daysDiff === 1) {
      // Continue or start streak
      streak.currentStreak++;
      streak.isActive = true;
    } else if (daysDiff === 0) {
      // Same day, no change to streak
      streak.isActive = true;
    } else {
      // Gap in streak, restart
      streak.currentStreak = 1;
      streak.isActive = true;
    }
    
    streak.lastActivityDate = date;
    
    // Update longest streak
    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak;
    }

    // Award streak bonus points
    if (streak.currentStreak === 7) {
      await awardPoints(userId, 'streak_bonus_7', POINT_STRUCTURE.streak_bonus_7);
    } else if (streak.currentStreak === 30) {
      await awardPoints(userId, 'streak_bonus_30', POINT_STRUCTURE.streak_bonus_30);
    } else if (streak.currentStreak === 100) {
      await awardPoints(userId, 'streak_bonus_100', POINT_STRUCTURE.streak_bonus_100);
    }
  } else {
    // Streak broken
    if (daysDiff > 1) {
      streak.currentStreak = 0;
      streak.isActive = false;
    }
  }

  streak.updatedAt = new Date();

  // Check for streak-based badges
  await checkAndAwardBadges(userId);

  return streak;
};

// Check and award badges
export const checkAndAwardBadges = async (userId: string): Promise<UserBadge[]> => {
  const profile = gamificationProfiles.find(p => p.userId === userId);
  if (!profile) return [];

  const userBadgeIds = userBadges.filter(ub => ub.userId === userId).map(ub => ub.badgeId);
  const newBadges: UserBadge[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Skip if user already has this badge
    if (userBadgeIds.includes(badge.id)) continue;

    let shouldAward = false;

    switch (badge.requirement.type) {
      case 'points':
        shouldAward = profile.totalPoints >= badge.requirement.value;
        break;
      
      case 'count':
        const activityCount = activityCounters[userId]?.[badge.requirement.activity!] || 0;
        shouldAward = activityCount >= badge.requirement.value;
        break;
      
      case 'streak':
        if (badge.requirement.activity) {
          const streak = streakRecords.find(s => s.userId === userId && s.type === badge.requirement.activity as any);
          shouldAward = streak ? streak.longestStreak >= badge.requirement.value : false;
        } else {
          // Any streak type
          const maxStreak = Math.max(
            ...streakRecords
              .filter(s => s.userId === userId)
              .map(s => s.longestStreak)
          );
          shouldAward = maxStreak >= badge.requirement.value;
        }
        break;
    }

    if (shouldAward) {
      const userBadge: UserBadge = {
        id: `user_badge_${userId}_${badge.id}_${Date.now()}`,
        userId,
        badgeId: badge.id,
        earnedAt: new Date(),
        isNew: true
      };

      userBadges.push(userBadge);
      newBadges.push(userBadge);

      // Award badge points
      await awardPoints(userId, `badge_${badge.id}`, badge.points);
      
      profile.totalBadges++;
    }
  }

  return newBadges;
};

// Get user's gamification profile
export const getGamificationProfile = async (userId: string): Promise<GamificationProfile | null> => {
  let profile = gamificationProfiles.find(p => p.userId === userId);
  if (!profile) {
    profile = await initializeUserGamification(userId);
  }
  return profile;
};

// Get user's badges
export const getUserBadges = async (userId: string): Promise<(UserBadge & { badge: Badge })[]> => {
  const userBadgeList = userBadges.filter(ub => ub.userId === userId);
  return userBadgeList.map(ub => ({
    ...ub,
    badge: BADGE_DEFINITIONS.find(b => b.id === ub.badgeId)!
  })).filter(ub => ub.badge);
};

// Get recent badges (last 7 days)
export const getRecentBadges = async (userId: string): Promise<(UserBadge & { badge: Badge })[]> => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentUserBadges = userBadges.filter(ub => 
    ub.userId === userId && ub.earnedAt >= sevenDaysAgo
  );

  return recentUserBadges.map(ub => ({
    ...ub,
    badge: BADGE_DEFINITIONS.find(b => b.id === ub.badgeId)!
  })).filter(ub => ub.badge);
};

// Get user's streaks
export const getStreaks = async (userId: string): Promise<StreakRecord[]> => {
  return streakRecords.filter(s => s.userId === userId);
};

// Get activity logs for user
export const getActivityLogs = async (userId: string, limit: number = 10): Promise<ActivityLog[]> => {
  return activityLogs
    .filter(log => log.userId === userId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

// Mark badges as seen (remove "new" status)
export const markBadgesAsSeen = async (userId: string, badgeIds: string[]): Promise<void> => {
  userBadges
    .filter(ub => ub.userId === userId && badgeIds.includes(ub.badgeId))
    .forEach(ub => ub.isNew = false);
};

// Get leaderboard data (top users by points)
export const getLeaderboard = async (limit: number = 10): Promise<GamificationProfile[]> => {
  return gamificationProfiles
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
};

// Calculate next badge progress
export const getNextBadgeProgress = async (userId: string): Promise<{
  badge: Badge;
  progress: number;
  requirement: number;
} | null> => {
  const profile = gamificationProfiles.find(p => p.userId === userId);
  if (!profile) return null;

  const userBadgeIds = userBadges.filter(ub => ub.userId === userId).map(ub => ub.badgeId);
  const availableBadges = BADGE_DEFINITIONS.filter(b => !userBadgeIds.includes(b.id));

  // Find the closest badge to completion
  let closestBadge: Badge | null = null;
  let bestProgress = 0;

  for (const badge of availableBadges) {
    let currentProgress = 0;
    let requirement = badge.requirement.value;

    switch (badge.requirement.type) {
      case 'points':
        currentProgress = profile.totalPoints;
        break;
      case 'count':
        currentProgress = activityCounters[userId]?.[badge.requirement.activity!] || 0;
        break;
      case 'streak':
        if (badge.requirement.activity) {
          const streak = streakRecords.find(s => s.userId === userId && s.type === badge.requirement.activity as any);
          currentProgress = streak ? streak.longestStreak : 0;
        } else {
          currentProgress = Math.max(
            ...streakRecords
              .filter(s => s.userId === userId)
              .map(s => s.longestStreak)
          );
        }
        break;
    }

    const progressPercentage = Math.min((currentProgress / requirement) * 100, 100);
    
    if (progressPercentage > bestProgress && progressPercentage < 100) {
      bestProgress = progressPercentage;
      closestBadge = badge;
    }
  }

  if (!closestBadge) return null;

  let currentProgress = 0;
  switch (closestBadge.requirement.type) {
    case 'points':
      currentProgress = profile.totalPoints;
      break;
    case 'count':
      currentProgress = activityCounters[userId]?.[closestBadge.requirement.activity!] || 0;
      break;
    case 'streak':
      if (closestBadge?.requirement.activity) {
        const streak = streakRecords.find(s => s.userId === userId && s.type === closestBadge?.requirement.activity as any);
        currentProgress = streak ? streak.longestStreak : 0;
      } else {
        currentProgress = Math.max(
          ...streakRecords
            .filter(s => s.userId === userId)
            .map(s => s.longestStreak)
        );
      }
      break;
  }

  return {
    badge: closestBadge,
    progress: currentProgress,
    requirement: closestBadge.requirement.value
  };
};