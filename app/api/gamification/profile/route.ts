import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { 
  getGamificationProfile, 
  getStreaks, 
  getRecentBadges, 
  getNextBadgeProgress,
  getActivityLogs 
} from '@/lib/gamification';

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

    const profile = await getGamificationProfile(decoded.userId);
    const streaks = await getStreaks(decoded.userId);
    const recentBadges = await getRecentBadges(decoded.userId);
    const nextBadge = await getNextBadgeProgress(decoded.userId);
    const activityLogs = await getActivityLogs(decoded.userId, 5);

    return NextResponse.json({
      profile,
      streaks,
      recentBadges,
      nextBadge,
      activityLogs
    });
  } catch (error) {
    console.error('Get gamification profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}