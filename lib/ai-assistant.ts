import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';
import Groq from 'groq-sdk';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

export const addUserMessage = (content: string, userId?: string): Message => {
  return {
    id: new ObjectId().toString(),
    userId,
    role: 'user',
    content,
    timestamp: new Date()
  };
};

const addAssistantMessage = (content: string, userId?: string): Message => {
  return {
    id: new ObjectId().toString(),
    userId,
    role: 'assistant',
    content,
    timestamp: new Date()
  };
};

export const getAssistantResponse = async (userMessage: string, userId?: string): Promise<Message> => {
  // Save user message to database if userId is provided
  if (userId) {
    await saveMessage(userId, addUserMessage(userMessage, userId));
  }

  try {
    // Get conversation history for context (last 10 messages)
    let conversationContext: any[] = [];
    if (userId) {
      const history = await getConversationHistory(userId, 10);
      conversationContext = history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }));
    }

    // Call Groq API - using llama-3.3-70b-versatile (latest model!)
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful, friendly, and knowledgeable fitness and nutrition AI assistant. Your role is to:
- Provide personalized workout advice and suggestions
- Give nutrition and diet guidance
- Offer motivation and encouragement
- Help track fitness goals and progress
- Remind users about hydration
- Answer questions about exercise, health, and wellness

Keep responses concise (2-4 sentences), encouraging, and actionable. Use emojis occasionally to keep the tone friendly. Focus on evidence-based fitness and nutrition advice.`
        },
        ...conversationContext,
        {
          role: 'user',
          content: userMessage
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm here to help! Could you please rephrase your question?";
    const assistantMessage = addAssistantMessage(responseText, userId);

    // Save assistant message to database if userId is provided
    if (userId) {
      await saveMessage(userId, assistantMessage);
    }

    return assistantMessage;
  } catch (error: any) {
    console.error('Groq API Error:', error);
    
    // Fallback response if API fails
    const fallbackMessage = "I'm having trouble connecting right now. Please try again in a moment, or feel free to ask me about workouts, nutrition, or fitness goals! 💪";
    const assistantMessage = addAssistantMessage(fallbackMessage, userId);
    
    if (userId) {
      await saveMessage(userId, assistantMessage);
    }
    
    return assistantMessage;
  }
};

export const getHydrationReminder = async (): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a friendly hydration coach. Generate a short, encouraging reminder about drinking water. Keep it under 50 words and include a water emoji.'
        },
        {
          role: 'user',
          content: 'Give me a hydration reminder'
        }
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content || "💧 Time for some water! Staying hydrated helps with recovery and performance.";
  } catch (error) {
    console.error('Groq API Error:', error);
    const fallbackReminders = [
      "💧 Time for some water! Staying hydrated helps with recovery and performance.",
      "🚰 Don't forget to drink water! Your body needs it to function optimally.",
      "💦 Quick reminder: Have you had water recently? Keep those hydration levels up!",
      "🌊 Hydration check! Grab a glass of water to keep your energy levels high.",
    ];
    return fallbackReminders[Math.floor(Math.random() * fallbackReminders.length)];
  }
};

export const getWorkoutMotivation = async (status: 'missed' | 'completed'): Promise<string> => {
  try {
    const userPrompt = status === 'completed' 
      ? 'Give a short, enthusiastic congratulations message for completing a workout. Include an emoji and keep it under 40 words.'
      : 'Give a short, supportive and encouraging message for missing a workout. Focus on getting back on track tomorrow. Include an emoji and keep it under 40 words.';

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are an enthusiastic and supportive fitness coach who motivates people.'
        },
        {
          role: 'user',
          content: userPrompt
        }
      ],
      max_tokens: 100,
      temperature: 0.9,
    });

    return completion.choices[0]?.message?.content || (status === 'completed' 
      ? "🎉 Awesome work! You crushed that workout!"
      : "Don't worry! Tomorrow is a new opportunity. You've got this! 💪");
  } catch (error) {
    console.error('Groq API Error:', error);
    
    if (status === 'completed') {
      const completedMessages = [
        "🎉 Awesome work! You crushed that workout!",
        "💪 Great job completing your workout! You're one step closer to your goals!",
        "🔥 That's what I'm talking about! Keep up the amazing work!",
        "⭐ You did it! Every workout counts towards your success!",
        "🏆 Fantastic! Your dedication is paying off!"
      ];
      return completedMessages[Math.floor(Math.random() * completedMessages.length)];
    } else {
      const missedMessages = [
        "Don't worry! Tomorrow is a new opportunity. You've got this! 💪",
        "It's okay to miss a workout. What matters is getting back on track tomorrow! 🎯",
        "Life happens! Let's make the next workout count. You're still awesome! ⚡",
        "No problem! Rest is important too. Come back stronger tomorrow! 💯",
        "Missing one workout doesn't define your journey. Keep moving forward! 🚀"
      ];
      return missedMessages[Math.floor(Math.random() * missedMessages.length)];
    }
  }
};

export const getWorkoutSuggestion = async (preferences: any = {}): Promise<string> => {
  try {
    const userContext = preferences.fitnessGoal 
      ? `My fitness goal is ${preferences.fitnessGoal}.` 
      : '';
    
    const equipmentContext = preferences.equipment 
      ? `Available equipment: ${preferences.equipment}.` 
      : 'I have basic home equipment.';

    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a certified personal trainer. Suggest a specific workout routine with 3-5 exercises, including sets and reps. Keep it concise and actionable.'
        },
        {
          role: 'user',
          content: `Suggest a workout routine. ${userContext} ${equipmentContext} Make it practical and effective.`
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || "How about a 30-minute full-body workout? Try: Push-ups (3x12), Squats (3x15), Planks (3x30s), and Jumping Jacks (3x1min). 💪";
  } catch (error) {
    console.error('Groq API Error:', error);
    const suggestions = [
      "How about a 30-minute full-body workout? Try: Push-ups (3x12), Squats (3x15), Planks (3x30s), and Jumping Jacks (3x1min).",
      "Let's do a HIIT session! 20 seconds work, 10 seconds rest: Burpees, Mountain Climbers, Jump Squats, High Knees. Repeat 4 rounds.",
      "Time for strength training! Focus on: Deadlifts (3x8), Pull-ups (3x8), Bench Press (3x10), and Shoulder Press (3x10).",
      "Cardio day! Try a 45-minute run or cycling session at moderate intensity. Mix in some intervals for extra challenge!",
      "Flexibility focus! Try a 30-minute yoga session with Downward Dog, Warrior Poses, Child's Pose, and Pigeon Pose."
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }
};

const saveMessage = async (userId: string, message: Message): Promise<void> => {
  const db = await getDB();
  const conversationsCollection = db.collection<ConversationHistory>('conversations');

  const conversation = await conversationsCollection.findOne({ userId });

  if (conversation) {
    await conversationsCollection.updateOne(
      { userId },
      {
        $push: { messages: message },
        $set: { lastUpdated: new Date() }
      }
    );
  } else {
    const newConversation: ConversationHistory = {
      userId,
      messages: [message],
      lastUpdated: new Date()
    };
    await conversationsCollection.insertOne(newConversation);
  }
};

export const getConversationHistory = async (userId: string, limit: number = 20): Promise<Message[]> => {
  const db = await getDB();
  const conversationsCollection = db.collection<ConversationHistory>('conversations');

  const conversation = await conversationsCollection.findOne({ userId });

  if (!conversation) return [];

  return conversation.messages.slice(-limit);
};

export const clearConversationHistory = async (userId: string): Promise<void> => {
  const db = await getDB();
  const conversationsCollection = db.collection<ConversationHistory>('conversations');

  await conversationsCollection.deleteOne({ userId });
};