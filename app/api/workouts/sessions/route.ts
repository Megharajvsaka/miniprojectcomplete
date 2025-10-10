import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getWorkoutSessions, getTodaysWorkout, markExerciseCompleted, markExerciseUncompleted } from '@/lib/workouts';

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

    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const today = url.searchParams.get('today');

    if (today === 'true') {
      const todaysWorkout = await getTodaysWorkout(decoded.userId);
      return NextResponse.json({ session: todaysWorkout });
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const sessions = await getWorkoutSessions(decoded.userId, startDate, endDate);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get workout sessions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
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

    const { sessionId, exerciseId, completed } = await request.json();

    if (!sessionId || !exerciseId || completed === undefined) {
      return NextResponse.json(
        { error: 'Session ID, exercise ID, and completed status are required' },
        { status: 400 }
      );
    }

    let session;
    if (completed) {
      session = await markExerciseCompleted(decoded.userId, sessionId, exerciseId);
    } else {
      session = await markExerciseUncompleted(decoded.userId, sessionId, exerciseId);
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Update exercise completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}