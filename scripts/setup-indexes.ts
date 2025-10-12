// Create this file: scripts/setup-indexes.ts
// Run with: npx ts-node scripts/setup-indexes.ts

import { getDB } from '../lib/mongodb';


async function setupIndexes() {
  console.log('🔧 Setting up MongoDB indexes...');
  
  try {
    const db = await getDB();

    // Users collection indexes
    console.log('Creating indexes for users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });

    // Gamification profiles indexes
    console.log('Creating indexes for gamificationProfiles collection...');
    await db.collection('gamificationProfiles').createIndex({ userId: 1 }, { unique: true });
    await db.collection('gamificationProfiles').createIndex({ totalPoints: -1 });
    await db.collection('gamificationProfiles').createIndex({ level: -1 });

    // Activity logs indexes
    console.log('Creating indexes for activityLogs collection...');
    await db.collection('activityLogs').createIndex({ userId: 1, timestamp: -1 });
    await db.collection('activityLogs').createIndex({ type: 1 });

    // Nutrition goals indexes
    console.log('Creating indexes for nutritionGoals collection...');
    await db.collection('nutritionGoals').createIndex({ userId: 1 }, { unique: true });

    // Food entries indexes
    console.log('Creating indexes for foodEntries collection...');
    await db.collection('foodEntries').createIndex({ userId: 1, date: -1 });
    await db.collection('foodEntries').createIndex({ id: 1 }, { unique: true });
    await db.collection('foodEntries').createIndex({ mealType: 1 });

    // Meal plans indexes
    console.log('Creating indexes for mealPlans collection...');
    await db.collection('mealPlans').createIndex({ userId: 1, startDate: -1 });
    await db.collection('mealPlans').createIndex({ id: 1 }, { unique: true });

    // Workout plans indexes
    console.log('Creating indexes for workoutPlans collection...');
    await db.collection('workoutPlans').createIndex({ userId: 1, startDate: -1 });
    await db.collection('workoutPlans').createIndex({ id: 1 }, { unique: true });
    await db.collection('workoutPlans').createIndex({ goal: 1 });

    // Workout sessions indexes
    console.log('Creating indexes for workoutSessions collection...');
    await db.collection('workoutSessions').createIndex({ userId: 1, date: -1 });
    await db.collection('workoutSessions').createIndex({ id: 1 }, { unique: true });
    await db.collection('workoutSessions').createIndex({ completed: 1 });

    // Hydration indexes
    console.log('Creating indexes for hydration collection...');
    await db.collection('hydration').createIndex({ userId: 1, date: -1 });
    await db.collection('hydration').createIndex({ id: 1 }, { unique: true });

    // Fitness metrics indexes
    console.log('Creating indexes for fitnessMetrics collection...');
    await db.collection('fitnessMetrics').createIndex({ userId: 1, date: -1 });
    await db.collection('fitnessMetrics').createIndex({ id: 1 }, { unique: true });
    await db.collection('fitnessMetrics').createIndex({ source: 1 });

    // Fitness goals indexes
    console.log('Creating indexes for fitnessGoals collection...');
    await db.collection('fitnessGoals').createIndex({ userId: 1 }, { unique: true });

    // Achievements indexes
    console.log('Creating indexes for achievements collection...');
    await db.collection('achievements').createIndex({ userId: 1, achievedAt: -1 });
    await db.collection('achievements').createIndex({ id: 1 }, { unique: true });
    await db.collection('achievements').createIndex({ type: 1 });

    // Conversations indexes
    console.log('Creating indexes for conversations collection...');
    await db.collection('conversations').createIndex({ userId: 1 }, { unique: true });
    await db.collection('conversations').createIndex({ lastUpdated: -1 });

    console.log('✅ All indexes created successfully!');
    console.log('\n📊 Index Summary:');
    console.log('- Users: email, id');
    console.log('- Gamification: userId, totalPoints, level');
    console.log('- Activity Logs: userId+timestamp, type');
    console.log('- Nutrition: userId, userId+date');
    console.log('- Workouts: userId+date, completed');
    console.log('- Fitness: userId+date, source');
    console.log('- And more...');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up indexes:', error);
    process.exit(1);
  }
}

setupIndexes();