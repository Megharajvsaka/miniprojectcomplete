import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getFitnessGoals, updateFitnessGoals } from '@/lib/fitness-data';

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

    const goals = await getFitnessGoals(decoded.userId);

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Get fitness goals error:', error);
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

    const updates = await request.json();
    const goals = await updateFitnessGoals(decoded.userId, updates);

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Update fitness goals error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}