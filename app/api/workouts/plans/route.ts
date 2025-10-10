import { NextResponse } from 'next/server';
import { verifyToken, findUserById } from '@/lib/auth';
import { generateWorkoutPlan, getWorkoutPlansForUser } from '@/lib/workouts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const plans = await getWorkoutPlansForUser(decoded.userId);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Get workout plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { goal, startDate, weeks = 4 } = await request.json();

    if (!goal || !startDate) {
      return NextResponse.json(
        { error: 'Goal and start date are required' },
        { status: 400 }
      );
    }

    const validGoals = ['weight_loss', 'muscle_gain', 'flexibility', 'endurance', 'general_fitness'];
    if (!validGoals.includes(goal)) {
      return NextResponse.json(
        { error: 'Invalid goal specified' },
        { status: 400 }
      );
    }

    const plan = await generateWorkoutPlan(decoded.userId, goal, startDate, weeks);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Generate workout plan error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}