import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getHydrationForDate, updateHydration, getHydrationStreak } from '@/lib/hydration';

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
    const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

    const hydrationData = await getHydrationForDate(decoded.userId, date);
    const streak = await getHydrationStreak(decoded.userId);

    return NextResponse.json({
      hydration: hydrationData || { amount: 0, goal: 2500, entries: [] },
      streak
    });
  } catch (error) {
    console.error('Get hydration error:', error);
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

    const { amount, date } = await request.json();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const hydrationData = await updateHydration(decoded.userId, targetDate, amount);

    return NextResponse.json({ hydration: hydrationData });
  } catch (error) {
    console.error('Update hydration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}