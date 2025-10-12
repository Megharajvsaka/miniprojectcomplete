import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';

export interface Message {
  _id?: ObjectId;
  id: string;
  userId?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationHistory {
  _id?: ObjectId;
  userId: string;
  messages: Message[];
  lastUpdated: Date;
}

// Simple response templates for the AI assistant
const responseTemplates = {
  greeting: [
    "Hello! I'm your fitness assistant. How can I help you today?",
    "Hi there! Ready to discuss your fitness goals?",
    "Welcome! What would you like to know about your fitness journey?"
  ],
  workout: [
    "Great question about workouts! Remember, consistency is key. Based on your goals, I recommend focusing on a balanced routine.",
    "Workouts are essential for progress. Make sure to include both strength training and cardio for optimal results.",
    "Let's talk about your workout plan. What specific exercises are you interested in?"
  ],
  nutrition: [
    "Nutrition is 70% of the battle! A balanced diet with proper macros is crucial for reaching your goals.",
    "Great question about nutrition! Focus on whole foods, lean proteins, and complex carbs.",
    "Your diet plays a huge role in your fitness journey. What specific nutritional guidance do you need?"
  ],
  hydration: [
    "Staying hydrated is crucial! Aim for at least 8 glasses (2 liters) of water daily.",
    "Water is essential for recovery and performance. Don't forget to drink throughout the day!",
    "Proper hydration helps with muscle recovery and energy levels. Keep that water bottle handy!"
  ],
  motivation: [
    "You're doing great! Every step forward is progress, no matter how small.",
    "Remember why you started. Your goals are within reach!",
    "Consistency beats perfection. Keep showing up for yourself!"
  ],
  default: [
    "That's an interesting question! Let me help you with that.",
    "I'm here to support your fitness journey. Can you tell me more about what you need?",
    "Thanks for reaching out! How can I assist you with your fitness goals today?"
  ]
};

const motivationalQuotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Progress, not perfection.",
  "Small steps every day lead to big changes.",
  "Believe in yourself and all that you are."
];

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

  const lowerMessage = userMessage.toLowerCase();
  let responseText = '';

  // Keyword-based response generation
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    responseText = responseTemplates.greeting[Math.floor(Math.random() * responseTemplates.greeting.length)];
  } else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('train')) {
    responseText = responseTemplates.workout[Math.floor(Math.random() * responseTemplates.workout.length)];
  } else if (lowerMessage.includes('food') || lowerMessage.includes('nutrition') || lowerMessage.includes('diet') || lowerMessage.includes('eat')) {
    responseText = responseTemplates.nutrition[Math.floor(Math.random() * responseTemplates.nutrition.length)];
  } else if (lowerMessage.includes('water') || lowerMessage.includes('hydration') || lowerMessage.includes('drink')) {
    responseText = responseTemplates.hydration[Math.floor(Math.random() * responseTemplates.hydration.length)];
  } else if (lowerMessage.includes('motivat') || lowerMessage.includes('inspire') || lowerMessage.includes('encourage')) {
    responseText = responseTemplates.motivation[Math.floor(Math.random() * responseTemplates.motivation.length)];
  } else {
    responseText = responseTemplates.default[Math.floor(Math.random() * responseTemplates.default.length)];
  }

  const assistantMessage = addAssistantMessage(responseText, userId);

  // Save assistant message to database if userId is provided
  if (userId) {
    await saveMessage(userId, assistantMessage);
  }

  return assistantMessage;
};

export const getHydrationReminder = async (): Promise<string> => {
  const reminders = [
    "💧 Time for some water! Staying hydrated helps with recovery and performance.",
    "🚰 Don't forget to drink water! Your body needs it to function optimally.",
    "💦 Quick reminder: Have you had water recently? Keep those hydration levels up!",
    "🌊 Hydration check! Grab a glass of water to keep your energy levels high.",
  ];

  return reminders[Math.floor(Math.random() * reminders.length)];
};

export const getWorkoutMotivation = async (status: 'missed' | 'completed'): Promise<string> => {
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
};

export const getWorkoutSuggestion = async (preferences: any = {}): Promise<string> => {
  const suggestions = [
    "How about a 30-minute full-body workout? Try: Push-ups (3x12), Squats (3x15), Planks (3x30s), and Jumping Jacks (3x1min).",
    "Let's do a HIIT session! 20 seconds work, 10 seconds rest: Burpees, Mountain Climbers, Jump Squats, High Knees. Repeat 4 rounds.",
    "Time for strength training! Focus on: Deadlifts (3x8), Pull-ups (3x8), Bench Press (3x10), and Shoulder Press (3x10).",
    "Cardio day! Try a 45-minute run or cycling session at moderate intensity. Mix in some intervals for extra challenge!",
    "Flexibility focus! Try a 30-minute yoga session with Downward Dog, Warrior Poses, Child's Pose, and Pigeon Pose."
  ];

  return suggestions[Math.floor(Math.random() * suggestions.length)];
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