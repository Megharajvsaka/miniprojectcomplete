import { NextResponse } from 'next/server';
import { verifyToken, findUserById } from '@/lib/auth';
import { generateMealPlan, getMealPlansForUser } from '@/lib/nutrition';

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

    const mealPlans = await getMealPlansForUser(decoded.userId);

    return NextResponse.json({ mealPlans });
  } catch (error) {
    console.error('Get meal plans error:', error);
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

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const user = await findUserById(decoded.userId);
    if (!user || !user.fitnessGoal) {
      return NextResponse.json(
        { error: 'User fitness goal must be set before generating meal plan' },
        { status: 400 }
      );
    }

    const mealPlan = await generateMealPlan(
      decoded.userId,
      startDate,
      endDate,
      user.fitnessGoal
    );

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error('Generate meal plan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}