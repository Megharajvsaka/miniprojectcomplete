import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getNutritionGoal, setNutritionGoal } from '@/lib/nutrition';

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

    const goal = await getNutritionGoal(decoded.userId);
    
    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Get nutrition goal error:', error);
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

    const { calories, protein, carbs, fat } = await request.json();

    if (!calories || !protein || !carbs || !fat) {
      return NextResponse.json(
        { error: 'All nutrition values are required' },
        { status: 400 }
      );
    }

    const goal = await setNutritionGoal(decoded.userId, calories, protein, carbs, fat);

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Set nutrition goal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}