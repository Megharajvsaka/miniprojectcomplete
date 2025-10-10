import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getHydrationReminder } from '@/lib/ai-assistant';

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

    const reminderMessage = await getHydrationReminder();

    return NextResponse.json({
      message: reminderMessage,
      success: true
    });
  } catch (error) {
    console.error('Hydration reminder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}