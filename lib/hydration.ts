import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { awardPoints, updateStreak, POINT_STRUCTURE, awardBadge } from './gamification';
import { findUserById } from './auth';

export interface HydrationEntry {
  _id?: ObjectId;
  id: string;
  userId: string;
  date: string;
  amount: number;
  goal: number;
  entries: { time: string; amount: number }[];
}

/**
 * Calculate recommended daily water intake based on user weight
 * Formula: weight (kg) × 30-35 ml
 */
export const calculateHydrationGoal = async (userId: string): Promise<number> => {
  const user = await findUserById(userId);
  
  if (user?.weight) {
    // Use 33ml per kg as middle ground
    return Math.round(user.weight * 33);
  }
  
  // Default to 2500ml (approximately 8 glasses)
  return 2500;
};

export const getHydrationForDate = async (userId: string, date: string): Promise<HydrationEntry | null> => {
  const db = await getDB();
  const hydrationCollection = db.collection<HydrationEntry>('hydration');
  
  const entry = await hydrationCollection.findOne({ userId, date });
  return entry;
};

export const updateHydration = async (
  userId: string, 
  date: string, 
  amount: number, 
  customGoal?: number
): Promise<HydrationEntry> => {
  const db = await getDB();
  const hydrationCollection = db.collection<HydrationEntry>('hydration');
  
  // Calculate goal if not provided
  const goal = customGoal || await calculateHydrationGoal(userId);
  
  const existingEntry = await hydrationCollection.findOne({ userId, date });
  
  if (existingEntry) {
    const previousAmount = existingEntry.amount;
    existingEntry.amount += amount;
    existingEntry.entries.push({
      time: new Date().toISOString(),
      amount
    });
    
    // Award points only when crossing the goal threshold
    const crossedGoal = previousAmount < existingEntry.goal && existingEntry.amount >= existingEntry.goal;
    
    if (crossedGoal) {
      await awardPoints(userId, 'hydration_goal_met', POINT_STRUCTURE.hydration_goal_met);
      await updateStreak(userId, 'hydration', date, true);
      
      // Award hydration badges
      const totalEntries = await hydrationCollection.countDocuments({ userId });
      if (totalEntries === 1) {
        // First hydration entry
        await awardBadge(userId, { 
          id: 'hydration-start', 
          name: 'Hydration Hero', 
          description: 'Meet hydration goal', 
          icon: '💧', 
          category: 'hydration' as const 
        });
      } else if (totalEntries === 7) {
        // 7 days of hydration tracking
        await awardBadge(userId, { 
          id: 'hydration-week', 
          name: 'Water Warrior', 
          description: 'Meet hydration goal for 7 days', 
          icon: '🌊', 
          category: 'hydration' as const 
        });
      }
    }
    
    // Bonus points for exceeding goal by 50%
    const crossedBonusThreshold = previousAmount < (existingEntry.goal * 1.5) && 
                                   existingEntry.amount >= (existingEntry.goal * 1.5);
    
    if (crossedBonusThreshold) {
      await awardPoints(userId, 'hydration_bonus', POINT_STRUCTURE.hydration_bonus);
    }
    
    await hydrationCollection.updateOne(
      { userId, date },
      { 
        $set: { 
          amount: existingEntry.amount,
          entries: existingEntry.entries,
          goal: existingEntry.goal // Keep original goal for consistency
        }
      }
    );
    
    return existingEntry;
  } else {
    const newEntry: HydrationEntry = {
      id: new ObjectId().toString(),
      userId,
      date,
      amount,
      goal,
      entries: [{
        time: new Date().toISOString(),
        amount
      }]
    };
    
    // Check if hydration goal is met on first entry
    if (newEntry.amount >= newEntry.goal) {
      await awardPoints(userId, 'hydration_goal_met', POINT_STRUCTURE.hydration_goal_met);
      await updateStreak(userId, 'hydration', date, true);
      
      // Award first hydration badge
      await awardBadge(userId, { 
        id: 'hydration-start', 
        name: 'Hydration Hero', 
        description: 'Meet hydration goal', 
        icon: '💧', 
        category: 'hydration' as const 
      });
      
      if (newEntry.amount >= newEntry.goal * 1.5) {
        await awardPoints(userId, 'hydration_bonus', POINT_STRUCTURE.hydration_bonus);
      }
    }
    
    await hydrationCollection.insertOne(newEntry);
    return newEntry;
  }
};

export const getHydrationStreak = async (userId: string): Promise<number> => {
  const db = await getDB();
  const hydrationCollection = db.collection<HydrationEntry>('hydration');
  
  const userEntries = await hydrationCollection
    .find({ userId })
    .sort({ date: -1 })
    .toArray();
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day
  
  for (let i = 0; i < userEntries.length; i++) {
    const entryDate = new Date(userEntries[i].date);
    entryDate.setHours(0, 0, 0, 0);
    
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    expectedDate.setHours(0, 0, 0, 0);
    
    // Check if entry matches expected consecutive date
    if (entryDate.getTime() === expectedDate.getTime() && 
        userEntries[i].amount >= userEntries[i].goal) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};

export const getWeeklyHydrationStats = async (userId: string): Promise<{
  totalAmount: number;
  averageDaily: number;
  goalsMet: number;
  totalDays: number;
  completionRate: number;
}> => {
  const db = await getDB();
  const hydrationCollection = db.collection<HydrationEntry>('hydration');
  
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  
  const weekEntries = await hydrationCollection
    .find({
      userId,
      date: {
        $gte: weekAgo.toISOString().split('T')[0],
        $lte: today.toISOString().split('T')[0]
      }
    })
    .toArray();
  
  const totalAmount = weekEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const goalsMet = weekEntries.filter(entry => entry.amount >= entry.goal).length;
  const totalDays = weekEntries.length;
  
  return {
    totalAmount,
    averageDaily: totalDays > 0 ? Math.round(totalAmount / totalDays) : 0,
    goalsMet,
    totalDays,
    completionRate: totalDays > 0 ? (goalsMet / totalDays) * 100 : 0
  };
};