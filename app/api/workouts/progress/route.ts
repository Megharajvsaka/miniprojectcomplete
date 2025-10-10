import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getWorkoutProgress, getWorkoutStreak, getWeeklyProgress } from '@/lib/workouts';

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
    const type = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (type === 'streak') {
      const streak = await getWorkoutStreak(decoded.userId);
      return NextResponse.json({ streak });
    }

    if (type === 'weekly') {
      const weeklyProgress = await getWeeklyProgress(decoded.userId);
      return NextResponse.json({ progress: weeklyProgress });
    }

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required for progress data' },
        { status: 400 }
      );
    }

    const progress = await getWorkoutProgress(decoded.userId, startDate, endDate);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Get workout progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}