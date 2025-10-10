'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader as Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { Message, QuickAction } from '@/lib/ai-assistant';

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Send initial greeting
    const initialGreeting: Message = {
      id: 'initial',
      sender: 'assistant',
      text: "👋 Hi there! I'm your AI fitness assistant. I'm here to help you stay motivated, track your hydration, and suggest workouts. How can I support your fitness journey today?",
      timestamp: new Date(),
      type: 'chat',
      quickActions: [
        { id: 'hydration-reminder', label: '💧 Hydration Reminder', action: 'hydration_reminder' },
        { id: 'workout-motivation', label: '💪 Need Motivation', action: 'workout_motivation' },
        { id: 'workout-suggestion', label: '🏃 Suggest Workout', action: 'workout_suggestion' },
      ]
    };
    setMessages([initialGreeting]);
  }, []);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: messageText }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.userMessage, data.assistantResponse]);
        setInput('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: QuickAction) => {
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      let response;

      switch (action.action) {
        case 'hydration_reminder':
        case 'hydration':
          response = await fetch('/api/ai-assistant/hydration-reminder', {
            headers: { Authorization: `Bearer ${token}` },
          });
          break;

        case 'workout_motivation':
        case 'motivation':
          response = await fetch('/api/ai-assistant/workout-motivation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'missed' }),
          });
          break;

        case 'workout_suggestion':
        case 'workout':
          response = await fetch('/api/ai-assistant/workout-suggestion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ preferences: { time: 'short' } }),
          });
          break;

        case 'log_water':
          // Handle water logging
          if (action.data?.amount) {
            const hydrationResponse = await fetch('/api/hydration', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ amount: action.data.amount }),
            });

            if (hydrationResponse.ok) {
              const confirmationMessage: Message = {
                id: Date.now().toString(),
                sender: 'assistant',
                text: `✅ Great! I've logged ${action.data.amount}ml of water for you. Keep up the good hydration habits!`,
                timestamp: new Date(),
                type: 'hydration',
              };
              setMessages(prev => [...prev, confirmationMessage]);
              setLoading(false);
              return;
            }
          }
          break;

        default:
          // For other actions, send as a regular message
          await sendMessage(`I clicked: ${action.label}`);
          return;
      }

      if (response && response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
      } else {
        setError('Failed to process action');
      }
    } catch (error) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg flex ${
                message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              } items-start space-x-2`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user'
                    ? 'bg-blue-500 ml-2'
                    : 'bg-purple-500 mr-2'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>

                {/* Timestamp */}
                <span
                  className={`text-xs text-gray-400 mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>

                {/* Quick Actions */}
                {message.quickActions && message.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        disabled={loading}
                        className="px-3 py-1 text-xs bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-xs lg:max-w-md xl:max-w-lg flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center mr-2">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-700 px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Input Form */}
      <div className="border-t border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about fitness..."
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}