import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getWorkoutSuggestion } from '@/lib/ai-assistant';

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

    const { preferences = {} } = await request.json();

    const suggestionMessage = await getWorkoutSuggestion(preferences);

    return NextResponse.json({
      message: suggestionMessage,
      success: true
    });
  } catch (error) {
    console.error('Workout suggestion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}