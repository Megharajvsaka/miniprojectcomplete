import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { awardPoints, updateStreak, POINT_STRUCTURE } from './gamification';

export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'yoga' | 'flexibility' | 'hiit';
  duration?: number;
  sets?: number;
  reps?: number;
  restTime?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string;
  targetMuscles: string[];
  equipment?: string[];
  caloriesBurned?: number;
}

export interface WorkoutSession {
  _id?: ObjectId;
  id: string;
  userId: string;
  date: string;
  name: string;
  type: 'strength' | 'cardio' | 'yoga' | 'flexibility' | 'hiit' | 'mixed';
  exercises: Exercise[];
  totalDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  completedAt?: Date;
  completedExercises: string[];
}

export interface WorkoutPlan {
  _id?: ObjectId;
  id: string;
  userId: string;
  name: string;
  goal: 'weight_loss' | 'muscle_gain' | 'flexibility' | 'endurance' | 'general_fitness';
  startDate: string;
  endDate: string;
  sessions: WorkoutSession[];
  createdAt: Date;
}

export interface WorkoutProgress {
  userId: string;
  date: string;
  completedSessions: number;
  totalSessions: number;
  completedExercises: number;
  totalExercises: number;
  totalDuration: number;
  caloriesBurned: number;
  streak: number;
}

// Exercise database
export const exerciseDatabase: Exercise[] = [
  {
    id: 'push-ups',
    name: 'Push-ups',
    type: 'strength',
    sets: 3,
    reps: 12,
    restTime: 60,
    difficulty: 'beginner',
    instructions: 'Start in plank position. Lower your body until chest nearly touches floor. Push back up.',
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    equipment: [],
    caloriesBurned: 50
  },
  {
    id: 'squats',
    name: 'Squats',
    type: 'strength',
    sets: 3,
    reps: 15,
    restTime: 60,
    difficulty: 'beginner',
    instructions: 'Stand with feet shoulder-width apart. Lower body as if sitting back into chair. Return to standing.',
    targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
    equipment: [],
    caloriesBurned: 60
  },
  {
    id: 'deadlifts',
    name: 'Deadlifts',
    type: 'strength',
    sets: 3,
    reps: 8,
    restTime: 90,
    difficulty: 'intermediate',
    instructions: 'Stand with feet hip-width apart. Bend at hips and knees to lower torso. Lift weight by extending hips and knees.',
    targetMuscles: ['hamstrings', 'glutes', 'lower back'],
    equipment: ['barbell', 'dumbbells'],
    caloriesBurned: 80
  },
  {
    id: 'pull-ups',
    name: 'Pull-ups',
    type: 'strength',
    sets: 3,
    reps: 8,
    restTime: 90,
    difficulty: 'intermediate',
    instructions: 'Hang from bar with arms extended. Pull body up until chin clears bar. Lower with control.',
    targetMuscles: ['lats', 'biceps', 'rhomboids'],
    equipment: ['pull-up bar'],
    caloriesBurned: 70
  },
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    type: 'cardio',
    duration: 5,
    difficulty: 'beginner',
    instructions: 'Jump while spreading legs shoulder-width apart and raising arms overhead. Return to starting position.',
    targetMuscles: ['full body'],
    equipment: [],
    caloriesBurned: 40
  },
  {
    id: 'burpees',
    name: 'Burpees',
    type: 'hiit',
    sets: 3,
    reps: 10,
    restTime: 60,
    difficulty: 'advanced',
    instructions: 'Start standing. Drop to squat, kick feet back to plank, do push-up, jump feet to squat, jump up.',
    targetMuscles: ['full body'],
    equipment: [],
    caloriesBurned: 100
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    type: 'hiit',
    duration: 3,
    difficulty: 'intermediate',
    instructions: 'Start in plank position. Alternate bringing knees to chest in running motion.',
    targetMuscles: ['core', 'shoulders', 'legs'],
    equipment: [],
    caloriesBurned: 60
  },
  {
    id: 'downward-dog',
    name: 'Downward Facing Dog',
    type: 'yoga',
    duration: 2,
    difficulty: 'beginner',
    instructions: 'Start on hands and knees. Tuck toes, lift hips up and back. Straighten legs and arms.',
    targetMuscles: ['hamstrings', 'calves', 'shoulders'],
    equipment: ['yoga mat'],
    caloriesBurned: 20
  },
  {
    id: 'warrior-pose',
    name: 'Warrior I Pose',
    type: 'yoga',
    duration: 1,
    difficulty: 'beginner',
    instructions: 'Step left foot back, turn out 45 degrees. Bend right knee over ankle, raise arms overhead.',
    targetMuscles: ['legs', 'core', 'shoulders'],
    equipment: ['yoga mat'],
    caloriesBurned: 15
  },
  {
    id: 'tree-pose',
    name: 'Tree Pose',
    type: 'yoga',
    duration: 1,
    difficulty: 'intermediate',
    instructions: 'Stand on left foot. Place right foot on inner left thigh. Bring palms together at heart center.',
    targetMuscles: ['legs', 'core'],
    equipment: ['yoga mat'],
    caloriesBurned: 10
  },
  {
    id: 'forward-fold',
    name: 'Standing Forward Fold',
    type: 'flexibility',
    duration: 2,
    difficulty: 'beginner',
    instructions: 'Stand with feet hip-width apart. Hinge at hips and fold forward, letting arms hang.',
    targetMuscles: ['hamstrings', 'calves', 'lower back'],
    equipment: [],
    caloriesBurned: 10
  },
  {
    id: 'pigeon-pose',
    name: 'Pigeon Pose',
    type: 'flexibility',
    duration: 3,
    difficulty: 'intermediate',
    instructions: 'From downward dog, bring right knee forward behind right wrist. Extend left leg back.',
    targetMuscles: ['hip flexors', 'glutes'],
    equipment: ['yoga mat'],
    caloriesBurned: 15
  }
];

const workoutTemplates = {
  weight_loss: {
    name: 'Weight Loss Program',
    sessionsPerWeek: 5,
    types: ['hiit', 'cardio', 'strength'],
    duration: 45
  },
  muscle_gain: {
    name: 'Muscle Building Program',
    sessionsPerWeek: 4,
    types: ['strength'],
    duration: 60
  },
  flexibility: {
    name: 'Flexibility & Mobility',
    sessionsPerWeek: 6,
    types: ['yoga', 'flexibility'],
    duration: 30
  },
  endurance: {
    name: 'Endurance Training',
    sessionsPerWeek: 5,
    types: ['cardio', 'hiit'],
    duration: 50
  },
  general_fitness: {
    name: 'General Fitness',
    sessionsPerWeek: 4,
    types: ['strength', 'cardio', 'yoga'],
    duration: 40
  }
};

export const generateWorkoutPlan = async (
  userId: string,
  goal: 'weight_loss' | 'muscle_gain' | 'flexibility' | 'endurance' | 'general_fitness',
  startDate: string,
  weeks: number = 4
): Promise<WorkoutPlan> => {
  const template = workoutTemplates[goal];
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (weeks * 7));

  const plan: WorkoutPlan = {
    id: new ObjectId().toString(),
    userId,
    name: template.name,
    goal,
    startDate,
    endDate: endDate.toISOString().split('T')[0],
    sessions: [],
    createdAt: new Date()
  };

  const db = await getDB();
  const sessionsCollection = db.collection<WorkoutSession>('workoutSessions');

  for (let week = 0; week < weeks; week++) {
    for (let session = 0; session < template.sessionsPerWeek; session++) {
      const sessionDate = new Date(startDate);
      sessionDate.setDate(sessionDate.getDate() + (week * 7) + session);

      const sessionType = template.types[session % template.types.length];
      const exercises = getExercisesForType(sessionType, goal);

      const workoutSession: WorkoutSession = {
        id: `${plan.id}-${week}-${session}`,
        userId,
        date: sessionDate.toISOString().split('T')[0],
        name: `${template.name} - Day ${session + 1}`,
        type: sessionType as any,
        exercises,
        totalDuration: template.duration,
        difficulty: getDifficultyForGoal(goal),
        completed: false,
        completedExercises: []
      };

      plan.sessions.push(workoutSession);
      await sessionsCollection.insertOne(workoutSession);
    }
  }

  const plansCollection = db.collection<WorkoutPlan>('workoutPlans');
  await plansCollection.insertOne(plan);

  return plan;
};

const getExercisesForType = (
  type: string,
  goal: 'weight_loss' | 'muscle_gain' | 'flexibility' | 'endurance' | 'general_fitness'
): Exercise[] => {
  let filteredExercises = exerciseDatabase.filter(ex => ex.type === type);
  
  if (filteredExercises.length === 0) {
    filteredExercises = exerciseDatabase.filter(ex => ex.type === 'strength');
  }

  const exerciseCount = goal === 'muscle_gain' ? 6 : goal === 'flexibility' ? 8 : 5;
  return filteredExercises.slice(0, exerciseCount);
};

const getDifficultyForGoal = (goal: string): 'beginner' | 'intermediate' | 'advanced' => {
  switch (goal) {
    case 'muscle_gain':
      return 'intermediate';
    case 'endurance':
      return 'advanced';
    default:
      return 'beginner';
  }
};

export const getWorkoutPlansForUser = async (userId: string): Promise<WorkoutPlan[]> => {
  const db = await getDB();
  const plansCollection = db.collection<WorkoutPlan>('workoutPlans');
  
  const plans = await plansCollection
    .find({ userId })
    .sort({ createdAt: -1 })
    .toArray();
  
  return plans;
};

export const getWorkoutSessions = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutSession[]> => {
  const db = await getDB();
  const sessionsCollection = db.collection<WorkoutSession>('workoutSessions');
  
  const sessions = await sessionsCollection
    .find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    })
    .sort({ date: 1 })
    .toArray();
  
  return sessions;
};

export const getTodaysWorkout = async (userId: string): Promise<WorkoutSession | null> => {
  const today = new Date().toISOString().split('T')[0];
  const db = await getDB();
  const sessionsCollection = db.collection<WorkoutSession>('workoutSessions');
  
  const session = await sessionsCollection.findOne({ userId, date: today });
  return session;
};

export const markExerciseCompleted = async (
  userId: string,
  sessionId: string,
  exerciseId: string
): Promise<WorkoutSession | null> => {
  const db = await getDB();
  const sessionsCollection = db.collection<WorkoutSession>('workoutSessions');
  
  const session = await sessionsCollection.findOne({ id: sessionId, userId });
  if (!session) return null;

  if (!session.completedExercises.includes(exerciseId)) {
    session.completedExercises.push(exerciseId);
    await awardPoints(userId, 'workout_completed', POINT_STRUCTURE.workout_completed);
  }

  if (session.completedExercises.length === session.exercises.length) {
    session.completed = true;
    session.completedAt = new Date();
    
    const bonusPoints = session.totalDuration > 45 ? POINT_STRUCTURE.workout_completed_bonus : 0;
    if (bonusPoints > 0) {
      await awardPoints(userId, 'workout_completed_bonus', bonusPoints);
    }
    
    await updateStreak(userId, 'workout', session.date, true);
  }

  await sessionsCollection.updateOne(
    { id: sessionId, userId },
    { 
      $set: { 
        completedExercises: session.completedExercises,
        completed: session.completed,
        completedAt: session.completedAt
      }
    }
  );

  return session;
};

export const markExerciseUncompleted = async (
  userId: string,
  sessionId: string,
  exerciseId: string
): Promise<WorkoutSession | null> => {
  const db = await getDB();
  const sessionsCollection = db.collection<WorkoutSession>('workoutSessions');
  
  const session = await sessionsCollection.findOne({ id: sessionId, userId });
  if (!session) return null;

  session.completedExercises = session.completedExercises.filter(id => id !== exerciseId);
  session.completed = false;
  session.completedAt = undefined;
  
  if (session.completedExercises.length === 0) {
    await updateStreak(userId, 'workout', session.date, false);
  }

  await sessionsCollection.updateOne(
    { id: sessionId, userId },
    { 
      $set: { 
        completedExercises: session.completedExercises,
        completed: session.completed
      },
      $unset: { completedAt: "" }
    }
  );

  return session;
};

export const getWorkoutProgress = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<WorkoutProgress[]> => {
  const sessions = await getWorkoutSessions(userId, startDate, endDate);
  const progressByDate: { [date: string]: WorkoutProgress } = {};

  sessions.forEach(session => {
    if (!progressByDate[session.date]) {
      progressByDate[session.date] = {
        userId,
        date: session.date,
        completedSessions: 0,
        totalSessions: 0,
        completedExercises: 0,
        totalExercises: 0,
        totalDuration: 0,
        caloriesBurned: 0,
        streak: 0
      };
    }

    const progress = progressByDate[session.date];
    progress.totalSessions++;
    progress.totalExercises += session.exercises.length;
    progress.completedExercises += session.completedExercises.length;

    if (session.completed) {
      progress.completedSessions++;
      progress.totalDuration += session.totalDuration;
      progress.caloriesBurned += session.exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);
    }
  });

  return Object.values(progressByDate);
};

export const getWorkoutStreak = async (userId: string): Promise<number> => {
  const db = await getDB();
  const sessionsCollection = db.collection<WorkoutSession>('workoutSessions');
  
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);

  while (streak < 365) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const daysSessions = await sessionsCollection.countDocuments({
      userId,
      date: dateStr,
      completed: true
    });

    if (daysSessions > 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getWeeklyProgress = async (userId: string): Promise<{
  completedSessions: number;
  totalSessions: number;
  completionPercentage: number;
  totalDuration: number;
  caloriesBurned: number;
}> => {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const startDate = startOfWeek.toISOString().split('T')[0];
  const endDate = endOfWeek.toISOString().split('T')[0];

  const sessions = await getWorkoutSessions(userId, startDate, endDate);
  const completedSessions = sessions.filter(s => s.completed);

  const totalDuration = completedSessions.reduce((sum, s) => sum + s.totalDuration, 0);
  const caloriesBurned = completedSessions.reduce((sum, s) => 
    sum + s.exercises.reduce((exSum, ex) => exSum + (ex.caloriesBurned || 0), 0), 0
  );

  return {
    completedSessions: completedSessions.length,
    totalSessions: sessions.length,
    completionPercentage: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
    totalDuration,
    caloriesBurned
  };
};