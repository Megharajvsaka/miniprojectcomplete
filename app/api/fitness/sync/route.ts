import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { syncFitnessData, getFitnessMetrics } from '@/lib/fitness-data';

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

    const { date } = await request.json();
    const targetDate = date || new Date().toISOString().split('T')[0];

    const result = await syncFitnessData(decoded.userId, targetDate);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Fitness sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const metrics = await getFitnessMetrics(decoded.userId, date);

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Get fitness metrics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}