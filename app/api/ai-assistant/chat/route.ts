import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAssistantResponse, addUserMessage, getConversationHistory } from '@/lib/ai-assistant';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const history = await getConversationHistory(decoded.userId, limit);

    return NextResponse.json({ history, success: true });
  } catch (error) {
    console.error('Get conversation history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Add user message to conversation history (with userId for DB save)
    const userMessage = addUserMessage(message, decoded.userId);

    // Get AI response (this saves both messages to MongoDB)
    const assistantResponse = await getAssistantResponse(message, decoded.userId);

    return NextResponse.json({
      userMessage,
      assistantResponse,
      success: true
    });
  } catch (error) {
    console.error('AI Assistant chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}