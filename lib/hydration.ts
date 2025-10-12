import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { awardPoints, updateStreak, POINT_STRUCTURE } from './gamification';

export interface HydrationEntry {
  _id?: ObjectId;
  id: string;
  userId: string;
  date: string;
  amount: number;
  goal: number;
  entries: { time: string; amount: number }[];
}

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
  goal: number = 2500
): Promise<HydrationEntry> => {
  const db = await getDB();
  const hydrationCollection = db.collection<HydrationEntry>('hydration');
  
  const existingEntry = await hydrationCollection.findOne({ userId, date });
  
  if (existingEntry) {
    existingEntry.amount += amount;
    existingEntry.entries.push({
      time: new Date().toISOString(),
      amount
    });
    
    // Check if hydration goal is met
    if (existingEntry.amount >= existingEntry.goal) {
      await awardPoints(userId, 'hydration_goal_met', POINT_STRUCTURE.hydration_goal_met);
      await updateStreak(userId, 'hydration', date, true);
      
      if (existingEntry.amount >= existingEntry.goal * 1.5) {
        await awardPoints(userId, 'hydration_bonus', POINT_STRUCTURE.hydration_bonus);
      }
    }
    
    await hydrationCollection.updateOne(
      { userId, date },
      { 
        $set: { 
          amount: existingEntry.amount,
          entries: existingEntry.entries
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
    
    // Check if hydration goal is met
    if (newEntry.amount >= newEntry.goal) {
      await awardPoints(userId, 'hydration_goal_met', POINT_STRUCTURE.hydration_goal_met);
      await updateStreak(userId, 'hydration', date, true);
      
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