import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';

export interface GamificationProfile {
  _id?: ObjectId;
  userId: string;
  level: number;
  totalPoints: number;
  currentLevelPoints: number;
  nextLevelPoints: number;
  badges: Badge[];
  streaks: Streaks;
  lastActive: Date;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'workout' | 'nutrition' | 'hydration' | 'streak' | 'achievement';
  earnedAt: Date;
  isSeen: boolean;
}

export interface Streaks {
  workout: number;
  nutrition: number;
  hydration: number;
  overall: number;
}

export interface ActivityLog {
  _id?: ObjectId;
  id: string;
  userId: string;
  type: 'points_earned' | 'badge_earned' | 'level_up' | 'streak_milestone';
  description: string;
  points?: number;
  badge?: Badge;
  timestamp: Date;
}

export const POINT_STRUCTURE = {
  workout_completed: 50,
  workout_completed_bonus: 25,
  meal_logged: 10,
  daily_nutrition_goal: 30,
  hydration_goal_met: 20,
  hydration_bonus: 15,
  streak_7_days: 100,
  streak_30_days: 300,
  streak_100_days: 1000,
};

const LEVEL_POINTS = [
  0, 100, 250, 500, 1000, 1500, 2000, 3000, 4000, 5000,
  6500, 8000, 10000, 12500, 15000, 18000, 21000, 25000, 30000, 35000
];

const BADGE_TEMPLATES = [
  { id: 'first-workout', name: 'First Workout', description: 'Complete your first workout', icon: '🏋️', category: 'workout' as const },
  { id: 'workout-week', name: 'Week Warrior', description: 'Complete 7 workouts', icon: '⚡', category: 'workout' as const },
  { id: 'workout-month', name: 'Monthly Champion', description: 'Complete 30 workouts', icon: '🏆', category: 'workout' as const },
  { id: 'first-meal', name: 'Nutrition Starter', description: 'Log your first meal', icon: '🥗', category: 'nutrition' as const },
  { id: 'meal-week', name: 'Meal Planner', description: 'Log meals for 7 days straight', icon: '📊', category: 'nutrition' as const },
  { id: 'hydration-start', name: 'Hydration Hero', description: 'Meet hydration goal', icon: '💧', category: 'hydration' as const },
  { id: 'hydration-week', name: 'Water Warrior', description: 'Meet hydration goal for 7 days', icon: '🌊', category: 'hydration' as const },
  { id: 'streak-7', name: '7 Day Streak', description: 'Maintain 7-day activity streak', icon: '🔥', category: 'streak' as const },
  { id: 'streak-30', name: '30 Day Streak', description: 'Maintain 30-day activity streak', icon: '⚡', category: 'streak' as const },
  { id: 'streak-100', name: '100 Day Streak', description: 'Maintain 100-day activity streak', icon: '💎', category: 'streak' as const },
];

export const initializeUserGamification = async (userId: string): Promise<GamificationProfile> => {
  const db = await getDB();
  const profilesCollection = db.collection<GamificationProfile>('gamificationProfiles');
  
  const existingProfile = await profilesCollection.findOne({ userId });
  if (existingProfile) return existingProfile;

  const profile: GamificationProfile = {
    userId,
    level: 1,
    totalPoints: 0,
    currentLevelPoints: 0,
    nextLevelPoints: LEVEL_POINTS[1],
    badges: [],
    streaks: {
      workout: 0,
      nutrition: 0,
      hydration: 0,
      overall: 0
    },
    lastActive: new Date(),
    createdAt: new Date()
  };

  await profilesCollection.insertOne(profile);
  return profile;
};

export const getGamificationProfile = async (userId: string): Promise<GamificationProfile> => {
  const db = await getDB();
  const profilesCollection = db.collection<GamificationProfile>('gamificationProfiles');
  
  let profile = await profilesCollection.findOne({ userId });
  
  if (!profile) {
    profile = await initializeUserGamification(userId);
  }
  
  return profile;
};

export const awardPoints = async (
  userId: string,
  reason: string,
  points: number
): Promise<GamificationProfile> => {
  const db = await getDB();
  const profilesCollection = db.collection<GamificationProfile>('gamificationProfiles');
  const logsCollection = db.collection<ActivityLog>('activityLogs');
  
  const profile = await getGamificationProfile(userId);
  
  profile.totalPoints += points;
  profile.currentLevelPoints += points;
  
  // Check for level up
  let leveledUp = false;
  while (profile.level < LEVEL_POINTS.length && profile.currentLevelPoints >= profile.nextLevelPoints) {
    profile.level++;
    profile.currentLevelPoints -= profile.nextLevelPoints;
    profile.nextLevelPoints = LEVEL_POINTS[profile.level] || profile.nextLevelPoints * 1.5;
    leveledUp = true;
  }
  
  profile.lastActive = new Date();
  
  await profilesCollection.updateOne(
    { userId },
    { 
      $set: {
        totalPoints: profile.totalPoints,
        currentLevelPoints: profile.currentLevelPoints,
        nextLevelPoints: profile.nextLevelPoints,
        level: profile.level,
        lastActive: profile.lastActive
      }
    }
  );
  
  // Log activity
  const log: ActivityLog = {
    id: new ObjectId().toString(),
    userId,
    type: 'points_earned',
    description: reason,
    points,
    timestamp: new Date()
  };
  await logsCollection.insertOne(log);
  
  if (leveledUp) {
    const levelUpLog: ActivityLog = {
      id: new ObjectId().toString(),
      userId,
      type: 'level_up',
      description: `Reached level ${profile.level}!`,
      timestamp: new Date()
    };
    await logsCollection.insertOne(levelUpLog);
  }
  
  return profile;
};

export const awardBadge = async (
  userId: string,
  badgeTemplate: typeof BADGE_TEMPLATES[0]
): Promise<Badge> => {
  const db = await getDB();
  const profilesCollection = db.collection<GamificationProfile>('gamificationProfiles');
  const logsCollection = db.collection<ActivityLog>('activityLogs');
  
  const profile = await getGamificationProfile(userId);
  
  const existingBadge = profile.badges.find(b => b.id === badgeTemplate.id);
  if (existingBadge) return existingBadge;
  
  const badge: Badge = {
    id: badgeTemplate.id,
    name: badgeTemplate.name,
    description: badgeTemplate.description,
    icon: badgeTemplate.icon,
    category: badgeTemplate.category,
    earnedAt: new Date(),
    isSeen: false
  };
  
  profile.badges.push(badge);
  
  await profilesCollection.updateOne(
    { userId },
    { $push: { badges: badge } }
  );
  
  // Log badge earning
  const log: ActivityLog = {
    id: new ObjectId().toString(),
    userId,
    type: 'badge_earned',
    description: `Earned badge: ${badge.name}`,
    badge,
    timestamp: new Date()
  };
  await logsCollection.insertOne(log);
  
  return badge;
};

export const updateStreak = async (
  userId: string,
  type: 'workout' | 'nutrition' | 'hydration',
  date: string,
  success: boolean
): Promise<void> => {
  const db = await getDB();
  const profilesCollection = db.collection<GamificationProfile>('gamificationProfiles');
  
  const profile = await getGamificationProfile(userId);
  const today = new Date().toISOString().split('T')[0];
  
  if (date === today && success) {
    profile.streaks[type]++;
    
    // Update overall streak
    const minStreak = Math.min(profile.streaks.workout, profile.streaks.nutrition, profile.streaks.hydration);
    profile.streaks.overall = minStreak;
    
    // Check for streak badges
    if (profile.streaks[type] === 7) {
      await awardBadge(userId, BADGE_TEMPLATES.find(b => b.id === 'streak-7')!);
      await awardPoints(userId, '7-day streak', POINT_STRUCTURE.streak_7_days);
    }
    
    if (profile.streaks[type] === 30) {
      await awardBadge(userId, BADGE_TEMPLATES.find(b => b.id === 'streak-30')!);
      await awardPoints(userId, '30-day streak', POINT_STRUCTURE.streak_30_days);
    }
    
    if (profile.streaks[type] === 100) {
      await awardBadge(userId, BADGE_TEMPLATES.find(b => b.id === 'streak-100')!);
      await awardPoints(userId, '100-day streak', POINT_STRUCTURE.streak_100_days);
    }
    
    await profilesCollection.updateOne(
      { userId },
      { $set: { streaks: profile.streaks } }
    );
  } else if (!success) {
    profile.streaks[type] = 0;
    await profilesCollection.updateOne(
      { userId },
      { $set: { [`streaks.${type}`]: 0 } }
    );
  }
};

export const getUserBadges = async (userId: string): Promise<Badge[]> => {
  const profile = await getGamificationProfile(userId);
  return profile.badges.sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime());
};

export const getRecentBadges = async (userId: string, limit: number = 5): Promise<Badge[]> => {
  const badges = await getUserBadges(userId);
  return badges.slice(0, limit);
};

export const markBadgesAsSeen = async (userId: string, badgeIds: string[]): Promise<void> => {
  const db = await getDB();
  const profilesCollection = db.collection<GamificationProfile>('gamificationProfiles');
  
  await profilesCollection.updateOne(
    { userId },
    { $set: { "badges.$[elem].isSeen": true } },
    { arrayFilters: [{ "elem.id": { $in: badgeIds } }] }
  );
};

export const getStreaks = async (userId: string): Promise<Streaks> => {
  const profile = await getGamificationProfile(userId);
  return profile.streaks;
};

export const getNextBadgeProgress = async (userId: string): Promise<{
  badge: typeof BADGE_TEMPLATES[0];
  progress: number;
  total: number;
} | null> => {
  const profile = await getGamificationProfile(userId);
  const earnedBadgeIds = profile.badges.map(b => b.id);
  
  const nextBadge = BADGE_TEMPLATES.find(b => !earnedBadgeIds.includes(b.id));
  
  if (!nextBadge) return null;
  
  // Calculate progress based on badge type
  let progress = 0;
  let total = 0;
  
  if (nextBadge.category === 'streak') {
    if (nextBadge.id === 'streak-7') {
      progress = Math.max(profile.streaks.workout, profile.streaks.nutrition, profile.streaks.hydration);
      total = 7;
    } else if (nextBadge.id === 'streak-30') {
      progress = Math.max(profile.streaks.workout, profile.streaks.nutrition, profile.streaks.hydration);
      total = 30;
    } else if (nextBadge.id === 'streak-100') {
      progress = Math.max(profile.streaks.workout, profile.streaks.nutrition, profile.streaks.hydration);
      total = 100;
    }
  }
  
  return { badge: nextBadge, progress, total };
};

export const getActivityLogs = async (userId: string, limit: number = 10): Promise<ActivityLog[]> => {
  const db = await getDB();
  const logsCollection = db.collection<ActivityLog>('activityLogs');
  
  const logs = await logsCollection
    .find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  
  return logs;
};