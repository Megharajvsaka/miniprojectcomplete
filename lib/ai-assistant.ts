export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  type: 'chat' | 'hydration' | 'motivation' | 'suggestion';
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  data?: any;
}

// Mock conversation history
const conversationHistory: Message[] = [];

// Mock AI responses for different scenarios
const chatResponses = [
  "I'm here to help you stay on track with your fitness goals! How can I assist you today?",
  "Great question! Let me help you with that. What specific area would you like to focus on?",
  "I'm always here to support your fitness journey. What's on your mind?",
  "That's a fantastic goal! I can help you create a plan to achieve it.",
  "I understand your concern. Let's work together to find a solution that works for you.",
  "Your dedication to fitness is inspiring! How can I help you today?",
  "I'm here to provide guidance and motivation. What would you like to discuss?",
  "Every step counts towards your fitness goals! What can I help you with?",
];

const hydrationReminders = [
  "💧 Time for a hydration break! You haven't logged water in a while. How about drinking a glass now?",
  "🚰 Your body needs water to perform at its best! Let's log some hydration.",
  "💦 Staying hydrated is key to your fitness success. Time for a water break!",
  "🥤 Don't forget to drink water! Your muscles need hydration to recover properly.",
  "💧 Hydration check! Let's make sure you're getting enough water today.",
];

const motivationalMessages = {
  missed: [
    "💪 Don't worry about missing today's workout! Tomorrow is a fresh start. What matters is getting back on track.",
    "🌟 Everyone has off days! The important thing is not giving up. You've got this!",
    "🔥 Missing one workout doesn't define your journey. Let's plan something achievable for tomorrow!",
    "⚡ Life happens, and that's okay! Your consistency over time is what counts. Ready to bounce back?",
    "🎯 One missed workout is just a small detour. Your fitness journey is a marathon, not a sprint!",
  ],
  completed: [
    "🎉 Amazing work completing your workout! You're building incredible momentum!",
    "💪 Fantastic job! Every completed workout brings you closer to your goals!",
    "🌟 You crushed it today! Your dedication is truly inspiring!",
    "🔥 Outstanding effort! You're proving to yourself that you can do anything!",
    "⚡ Incredible work! You're building habits that will transform your life!",
  ]
};

const workoutSuggestions = {
  short: [
    "🏃 Quick 15-minute HIIT session: 30 seconds work, 15 seconds rest for 6 exercises",
    "💪 Bodyweight circuit: 10 push-ups, 15 squats, 20 jumping jacks, repeat 3 times",
    "🧘 10-minute yoga flow focusing on flexibility and breathing",
    "⚡ Stair climbing: 10 minutes of walking/running stairs for cardio",
  ],
  equipment: [
    "🏋️ Dumbbell workout: Bicep curls, shoulder press, chest press, rows",
    "🎯 Resistance band routine: Full body workout with bands",
    "⚖️ Kettlebell session: Swings, goblet squats, Turkish get-ups",
    "🏃 Treadmill intervals: Alternate between walking and jogging",
  ],
  bodyweight: [
    "💪 No equipment needed: Push-ups, squats, lunges, planks, burpees",
    "🤸 Bodyweight strength: Mountain climbers, wall sits, tricep dips",
    "🧘 Yoga flow: Sun salutations and basic poses for flexibility",
    "🏃 Cardio blast: Jumping jacks, high knees, butt kicks, dance moves",
  ]
};

export const getAssistantResponse = async (message: string): Promise<Message> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const response = chatResponses[Math.floor(Math.random() * chatResponses.length)];
  
  const assistantMessage: Message = {
    id: Date.now().toString(),
    sender: 'assistant',
    text: response,
    timestamp: new Date(),
    type: 'chat',
    quickActions: [
      { id: 'hydration', label: '💧 Log Water', action: 'hydration' },
      { id: 'workout', label: '💪 Get Workout', action: 'workout' },
      { id: 'motivation', label: '🌟 Need Motivation', action: 'motivation' },
    ]
  };

  conversationHistory.push(assistantMessage);
  return assistantMessage;
};

export const getHydrationReminder = async (): Promise<Message> => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const reminder = hydrationReminders[Math.floor(Math.random() * hydrationReminders.length)];
  
  const reminderMessage: Message = {
    id: Date.now().toString(),
    sender: 'assistant',
    text: reminder,
    timestamp: new Date(),
    type: 'hydration',
    quickActions: [
      { id: 'log-250ml', label: '250ml', action: 'log_water', data: { amount: 250 } },
      { id: 'log-500ml', label: '500ml', action: 'log_water', data: { amount: 500 } },
      { id: 'log-750ml', label: '750ml', action: 'log_water', data: { amount: 750 } },
      { id: 'remind-later', label: 'Remind Later', action: 'remind_later' },
    ]
  };

  conversationHistory.push(reminderMessage);
  return reminderMessage;
};

export const getWorkoutMotivation = async (status: 'missed' | 'completed'): Promise<Message> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const messages = motivationalMessages[status];
  const motivationText = messages[Math.floor(Math.random() * messages.length)];
  
  const quickActions = status === 'missed' 
    ? [
        { id: 'quick-workout', label: '⚡ Quick 15min Workout', action: 'quick_workout' },
        { id: 'reschedule', label: '📅 Reschedule', action: 'reschedule' },
        { id: 'tomorrow', label: '🌅 Plan Tomorrow', action: 'plan_tomorrow' },
      ]
    : [
        { id: 'log-progress', label: '📊 Log Progress', action: 'log_progress' },
        { id: 'share-achievement', label: '🎉 Share Achievement', action: 'share' },
        { id: 'plan-next', label: '➡️ Plan Next Workout', action: 'plan_next' },
      ];

  const motivationMessage: Message = {
    id: Date.now().toString(),
    sender: 'assistant',
    text: motivationText,
    timestamp: new Date(),
    type: 'motivation',
    quickActions
  };

  conversationHistory.push(motivationMessage);
  return motivationMessage;
};

export const getWorkoutSuggestion = async (preferences: {
  time?: string;
  equipment?: string;
  fitnessLevel?: string;
}): Promise<Message> => {
  await new Promise(resolve => setTimeout(resolve, 1200));

  let suggestions: string[];
  let suggestionText = "Here are some workout alternatives based on your preferences:\n\n";

  if (preferences.time === 'short') {
    suggestions = workoutSuggestions.short;
    suggestionText += "⏰ Since you're short on time, here are quick options:\n\n";
  } else if (preferences.equipment === 'none') {
    suggestions = workoutSuggestions.bodyweight;
    suggestionText += "🏠 No equipment? No problem! Try these bodyweight exercises:\n\n";
  } else if (preferences.equipment === 'available') {
    suggestions = workoutSuggestions.equipment;
    suggestionText += "🏋️ Great! Here are some equipment-based workouts:\n\n";
  } else {
    suggestions = [...workoutSuggestions.short, ...workoutSuggestions.bodyweight].slice(0, 3);
    suggestionText += "Here are some flexible options for you:\n\n";
  }

  const selectedSuggestions = suggestions.slice(0, 3);
  suggestionText += selectedSuggestions.join('\n\n');

  const suggestionMessage: Message = {
    id: Date.now().toString(),
    sender: 'assistant',
    text: suggestionText,
    timestamp: new Date(),
    type: 'suggestion',
    quickActions: [
      { id: 'start-workout', label: '🚀 Start Workout', action: 'start_workout' },
      { id: 'save-for-later', label: '💾 Save for Later', action: 'save_workout' },
      { id: 'more-options', label: '🔄 More Options', action: 'more_suggestions' },
    ]
  };

  conversationHistory.push(suggestionMessage);
  return suggestionMessage;
};

export const getConversationHistory = (): Message[] => {
  return conversationHistory;
};

export const addUserMessage = (text: string): Message => {
  const userMessage: Message = {
    id: Date.now().toString(),
    sender: 'user',
    text,
    timestamp: new Date(),
    type: 'chat'
  };

  conversationHistory.push(userMessage);
  return userMessage;
};