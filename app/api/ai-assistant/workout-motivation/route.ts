import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getWorkoutMotivation } from '@/lib/ai-assistant';

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

    const { status } = await request.json();

    if (!status || !['missed', 'completed'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (missed or completed) is required' },
        { status: 400 }
      );
    }

    const motivationMessage = await getWorkoutMotivation(status);

    return NextResponse.json({
      message: motivationMessage,
      success: true
    });
  } catch (error) {
    console.error('Workout motivation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}