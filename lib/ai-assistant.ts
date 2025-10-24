import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { HfInference } from '@huggingface/inference';

// 1. Get the key. Its type is 'string | undefined'
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const hf = new HfInference(requireEnv('HUGGINGFACE_API_KEY'));




// Type definitions
export interface Message {
  _id?: ObjectId;
  id: string;
  userId?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ConversationHistory {
  _id?: ObjectId;
  userId: string;
  messages: Message[];
  lastUpdated: Date;
}

// Helper: Create user message
export const addUserMessage = (content: string, userId?: string): Message => ({
  id: new ObjectId().toString(),
  userId,
  role: 'user',
  content,
  timestamp: new Date(),
});

// Helper: Create assistant message
const addAssistantMessage = (content: string, userId?: string): Message => ({
  id: new ObjectId().toString(),
  userId,
  role: 'assistant',
  content,
  timestamp: new Date(),
});

// --------------------------
// MAIN CHAT RESPONSE HANDLER
// --------------------------
export const getAssistantResponse = async (userMessage: string, userId?: string): Promise<Message> => {
  if (userId) {
    await saveMessage(userId, addUserMessage(userMessage, userId));
  }

  try {
    let conversationContext: any[] = [];
    if (userId) {
      const history = await getConversationHistory(userId, 10);
      conversationContext = history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));
    }

    // Build conversation prompt
    const messages = [
      {
        role: 'system',
        content: `You are a helpful, friendly, and knowledgeable fitness and nutrition AI assistant. 
Your role is to:
- Provide personalized workout advice and suggestions
- Give nutrition and diet guidance
- Offer motivation and encouragement
- Help track fitness goals and progress
- Remind users about hydration
- Answer questions about exercise, health, and wellness

Keep responses concise (2-4 sentences), encouraging, and actionable. 
Use emojis occasionally to keep the tone friendly. Focus on evidence-based fitness and nutrition advice.`,
      },
      ...conversationContext,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Send to Hugging Face API
    const response = await hf.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }).catch(() => null);

    if (!response || !response.choices?.length) {
      throw new Error('No valid response from Hugging Face API');
    }

    const responseText =
      response.choices[0].message?.content ||
      "I'm here to help! Could you please rephrase your question?";

    const assistantMessage = addAssistantMessage(responseText, userId);
    if (userId) {
      await saveMessage(userId, assistantMessage);
    }

    return assistantMessage;
  } catch (error) {
    console.error('HuggingFace API Error:', error);

    const fallbackMessage =
      "I'm having trouble connecting right now. Please try again in a moment, or feel free to ask me about workouts, nutrition, or fitness goals! 💪";

    const assistantMessage = addAssistantMessage(fallbackMessage, userId);
    if (userId) {
      await saveMessage(userId, assistantMessage);
    }
    return assistantMessage;
  }
};

// --------------------------
// HYDRATION REMINDER
// --------------------------
export const getHydrationReminder = async (): Promise<string> => {
  try {
    const response = await hf.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly hydration coach. Generate a short, encouraging reminder about drinking water. Keep it under 50 words and include a water emoji.',
        },
        { role: 'user', content: 'Give me a hydration reminder' },
      ],
      max_tokens: 100,
      temperature: 0.8,
    }).catch(() => null);

    if (!response?.choices?.length) {
      throw new Error('No response');
    }

    return (
      response.choices[0].message.content ||
      '💧 Time for some water! Staying hydrated helps with recovery and performance.'
    );
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    const fallbackReminders = [
      '💧 Time for some water! Staying hydrated helps with recovery and performance.',
      '🚰 Don’t forget to drink water! Your body needs it to function optimally.',
      '💦 Quick reminder: Have you had water recently? Keep those hydration levels up!',
      '🌊 Hydration check! Grab a glass of water to keep your energy levels high.',
    ];
    return fallbackReminders[Math.floor(Math.random() * fallbackReminders.length)];
  }
};

// --------------------------
// WORKOUT MOTIVATION
// --------------------------
export const getWorkoutMotivation = async (status: 'missed' | 'completed'): Promise<string> => {
  try {
    const userPrompt =
      status === 'completed'
        ? 'Give a short, enthusiastic congratulations message for completing a workout. Include an emoji and keep it under 40 words.'
        : 'Give a short, supportive and encouraging message for missing a workout. Focus on getting back on track tomorrow. Include an emoji and keep it under 40 words.';

    const response = await hf.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages: [
        {
          role: 'system',
          content: 'You are an enthusiastic and supportive fitness coach who motivates people.',
        },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 100,
      temperature: 0.9,
    }).catch(() => null);

    if (!response?.choices?.length) throw new Error('No response');

    // Use optional chaining to safely access nested properties.
// If any part is null or undefined, content will be undefined.
const content = response.choices[0]?.message?.content;

// Return the content, or an empty string if it's null/undefined.
return content ?? "";
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    const completed = [
      '🎉 Awesome work! You crushed that workout!',
      '💪 Great job completing your workout! You’re one step closer to your goals!',
      '🔥 That’s what I’m talking about! Keep up the amazing work!',
    ];
    const missed = [
      'Don’t worry! Tomorrow is a new opportunity. You’ve got this! 💪',
      'It’s okay to miss a workout. What matters is getting back on track tomorrow! 🎯',
      'Life happens! Let’s make the next workout count. You’re still awesome! ⚡',
    ];
    return status === 'completed'
      ? completed[Math.floor(Math.random() * completed.length)]
      : missed[Math.floor(Math.random() * missed.length)];
  }
};

// --------------------------
// WORKOUT SUGGESTION
// --------------------------
export const getWorkoutSuggestion = async (preferences: any = {}): Promise<string> => {
  try {
    const userContext = preferences.fitnessGoal ? `My fitness goal is ${preferences.fitnessGoal}.` : '';
    const equipmentContext = preferences.equipment
      ? `Available equipment: ${preferences.equipment}.`
      : 'I have basic home equipment.';

    const response = await hf.chatCompletion({
      model: 'HuggingFaceH4/zephyr-7b-beta',
      messages: [
        {
          role: 'system',
          content:
            'You are a certified personal trainer. Suggest a specific workout routine with 3–5 exercises, including sets and reps. Keep it concise and actionable.',
        },
        { role: 'user', content: `Suggest a workout routine. ${userContext} ${equipmentContext}` },
      ],
      max_tokens: 400,
      temperature: 0.7,
    }).catch(() => null);

    if (!response?.choices?.length) throw new Error('No response');

    // Use optional chaining to safely access nested properties.
// If any part is null or undefined, content will be undefined.
      const content = response.choices[0]?.message?.content;

// Return the content, or an empty string if it's null/undefined.
      return content ?? "";
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    const suggestions = [
      '💪 Try a 30-min full-body workout: Push-ups (3x12), Squats (3x15), Planks (3x30s), Jumping Jacks (3x1min).',
      '🔥 HIIT: 20s work / 10s rest – Burpees, Mountain Climbers, Jump Squats, High Knees (4 rounds).',
      '🏋️ Strength focus: Deadlifts (3x8), Pull-ups (3x8), Bench Press (3x10), Shoulder Press (3x10).',
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }
};

// --------------------------
// DATABASE HELPERS
// --------------------------
const saveMessage = async (userId: string, message: Message): Promise<void> => {
  const db = await getDB();
  const conversations = db.collection<ConversationHistory>('conversations');

  const conversation = await conversations.findOne({ userId });
  if (conversation) {
    await conversations.updateOne(
      { userId },
      { $push: { messages: message }, $set: { lastUpdated: new Date() } }
    );
  } else {
    await conversations.insertOne({
      userId,
      messages: [message],
      lastUpdated: new Date(),
    });
  }
};

export const getConversationHistory = async (userId: string, limit = 20): Promise<Message[]> => {
  const db = await getDB();
  const conversations = db.collection<ConversationHistory>('conversations');
  const conversation = await conversations.findOne({ userId });
  if (!conversation) return [];
  return conversation.messages.slice(-limit);
};

export const clearConversationHistory = async (userId: string): Promise<void> => {
  const db = await getDB();
  await db.collection('conversations').deleteOne({ userId });
};

// --------------------------
// CONNECTION TEST FUNCTION
// --------------------------
export const testHuggingFaceConnection = async (): Promise<string> => {
  try {
    const res = await hf.textGeneration({
      model: 'gpt2',
      inputs: 'Test connection successful.',
      parameters: { max_new_tokens: 5 },
    });
    return `✅ Hugging Face API connected: ${res.generated_text}`;
  } catch (err) {
    console.error('❌ Hugging Face connection failed:', err);
    return '❌ Failed to connect to Hugging Face API. Check your API key or network.';
  }
};
