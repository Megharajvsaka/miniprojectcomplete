import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getWeeklyProgress, getProgressTrends, getUserAchievements } from '@/lib/fitness-data';

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

    switch (type) {
      case 'weekly':
        const weeklyProgress = await getWeeklyProgress(decoded.userId);
        return NextResponse.json({ progress: weeklyProgress });
      
      case 'trends':
        const trends = await getProgressTrends(decoded.userId);
        return NextResponse.json({ trends });
      
      case 'achievements':
        const achievements = await getUserAchievements(decoded.userId);
        return NextResponse.json({ achievements });
      
      default:
        return NextResponse.json(
          { error: 'Invalid progress type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Get fitness progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}