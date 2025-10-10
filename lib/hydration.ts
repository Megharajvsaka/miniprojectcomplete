export interface HydrationEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  amount: number; // in ml
  goal: number; // daily goal in ml
  entries: { time: string; amount: number }[];
}
import { awardPoints, updateStreak, POINT_STRUCTURE } from './gamification';

// Mock hydration database
const hydrationData: HydrationEntry[] = [];

export const getHydrationForDate = async (userId: string, date: string): Promise<HydrationEntry | null> => {
  return hydrationData.find(entry => entry.userId === userId && entry.date === date) || null;
};

export const updateHydration = async (
  userId: string, 
  date: string, 
  amount: number, 
  goal: number = 2500
): Promise<HydrationEntry> => {
  const existingEntry = hydrationData.find(entry => entry.userId === userId && entry.date === date);
  
  if (existingEntry) {
    existingEntry.amount += amount;
    existingEntry.entries.push({
      time: new Date().toISOString(),
      amount
    });
    
    // Check if hydration goal is met and award points
    if (existingEntry.amount >= existingEntry.goal) {
      await awardPoints(userId, 'hydration_goal_met', POINT_STRUCTURE.hydration_goal_met);
      await updateStreak(userId, 'hydration', date, true);
      
      // Bonus points for exceeding goal by 50%
      if (existingEntry.amount >= existingEntry.goal * 1.5) {
        await awardPoints(userId, 'hydration_bonus', POINT_STRUCTURE.hydration_bonus);
      }
    }
    
    return existingEntry;
  } else {
    const newEntry: HydrationEntry = {
      id: Date.now().toString(),
      userId,
      date,
      amount,
      goal,
      entries: [{
        time: new Date().toISOString(),
        amount
      }]
    };
    hydrationData.push(newEntry);
    
    // Check if hydration goal is met and award points
    if (newEntry.amount >= newEntry.goal) {
      await awardPoints(userId, 'hydration_goal_met', POINT_STRUCTURE.hydration_goal_met);
      await updateStreak(userId, 'hydration', date, true);
      
      // Bonus points for exceeding goal by 50%
      if (newEntry.amount >= newEntry.goal * 1.5) {
        await awardPoints(userId, 'hydration_bonus', POINT_STRUCTURE.hydration_bonus);
      }
    }
    
    return newEntry;
  }
};

export const getHydrationStreak = async (userId: string): Promise<number> => {
  const userEntries = hydrationData
    .filter(entry => entry.userId === userId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < userEntries.length; i++) {
    const entryDate = new Date(userEntries[i].date);
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === i && userEntries[i].amount >= userEntries[i].goal) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
};