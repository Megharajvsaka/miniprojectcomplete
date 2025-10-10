import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserBadges, markBadgesAsSeen } from '@/lib/gamification';

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

    const badges = await getUserBadges(decoded.userId);

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('Get user badges error:', error);
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

    const { badgeIds } = await request.json();

    if (!badgeIds || !Array.isArray(badgeIds)) {
      return NextResponse.json(
        { error: 'Badge IDs array is required' },
        { status: 400 }
      );
    }

    await markBadgesAsSeen(decoded.userId, badgeIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark badges as seen error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}