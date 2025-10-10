import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getAssistantResponse, addUserMessage } from '@/lib/ai-assistant';

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

    // Add user message to conversation history
    const userMessage = addUserMessage(message);

    // Get AI response
    const assistantResponse = await getAssistantResponse(message);

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