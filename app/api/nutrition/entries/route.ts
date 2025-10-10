import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { addFoodEntry, getFoodEntriesForDate, getDailyTotals, deleteFoodEntry } from '@/lib/nutrition';

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

    const entries = await getFoodEntriesForDate(decoded.userId, date);
    const dailyTotals = await getDailyTotals(decoded.userId, date);

    return NextResponse.json({ entries, dailyTotals });
  } catch (error) {
    console.error('Get food entries error:', error);
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

    const { 
      date, 
      name, 
      calories, 
      protein, 
      carbs, 
      fat, 
      quantity = 1, 
      unit = 'serving', 
      mealType = 'lunch' 
    } = await request.json();

    if (!name || !calories || protein === undefined || carbs === undefined || fat === undefined) {
      return NextResponse.json(
        { error: 'Food name and all nutrition values are required' },
        { status: 400 }
      );
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const entry = await addFoodEntry(
      decoded.userId,
      targetDate,
      name,
      calories,
      protein,
      carbs,
      fat,
      quantity,
      unit,
      mealType
    );

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Add food entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
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
    const entryId = url.searchParams.get('id');

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const success = await deleteFoodEntry(decoded.userId, entryId);

    if (!success) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete food entry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}