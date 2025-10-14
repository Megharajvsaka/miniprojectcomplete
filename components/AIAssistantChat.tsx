
'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
    // Load conversation history
    const initializeChat = async () => {
      try {
        const token = Cookies.get('token');
        const response = await fetch('/api/ai-assistant/chat?limit=20', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.history && data.history.length > 0) {
            setMessages(data.history.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            })));
          } else {
            // Only show greeting if no history
            const initialGreeting: ChatMessage = {
              id: 'initial',
              role: 'assistant',
              content: "👋 Hi there! I'm your AI fitness assistant. I'm here to help you stay motivated, track your hydration, and suggest workouts. How can I support your fitness journey today?",
              timestamp: new Date(),
            };
            setMessages([initialGreeting]);
          }
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        // Show greeting on error
        const initialGreeting: ChatMessage = {
          id: 'initial',
          role: 'assistant',
          content: "👋 Hi there! I'm your AI fitness assistant. I'm here to help you stay motivated, track your hydration, and suggest workouts. How can I support your fitness journey today?",
          timestamp: new Date(),
        };
        setMessages([initialGreeting]);
      }
    };

    initializeChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const loadHistory = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/ai-assistant/chat?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.history && data.history.length > 0) {
          setMessages(data.history.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    // Add user message immediately for better UX
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
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
        
        // Add assistant response
        const assistantMsg: ChatMessage = {
          id: data.assistantResponse.id,
          role: 'assistant',
          content: data.assistantResponse.content,
          timestamp: new Date(data.assistantResponse.timestamp),
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to send message');
        // Remove the optimistically added user message on error
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      }
    } catch (error) {
      setError('Network error occurred');
      // Remove the optimistically added user message on error
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (action: string, label: string) => {
    setLoading(true);
    setError('');

    try {
      const token = Cookies.get('token');
      let response;
      let resultMessage = '';

      switch (action) {
        case 'hydration_reminder':
          response = await fetch('/api/ai-assistant/hydration-reminder', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            resultMessage = data.message;
          }
          break;

        case 'workout_motivation':
          response = await fetch('/api/ai-assistant/workout-motivation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: 'completed' }),
          });
          if (response.ok) {
            const data = await response.json();
            resultMessage = data.message;
          }
          break;

        case 'workout_suggestion':
          response = await fetch('/api/ai-assistant/workout-suggestion', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ preferences: {} }),
          });
          if (response.ok) {
            const data = await response.json();
            resultMessage = data.message;
          }
          break;

        default:
          await sendMessage(label);
          return;
      }

      if (resultMessage) {
        const assistantMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: resultMessage,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMsg]);
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
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg flex ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              } items-start space-x-2`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user'
                    ? 'bg-blue-500 ml-2'
                    : 'bg-purple-500 mr-2'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message Bubble */}
              <div className="flex flex-col">
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Timestamp */}
                <span
                  className={`text-xs text-gray-400 mt-1 ${
                    message.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Quick Actions (only show on initial greeting) */}
        {messages.length === 1 && messages[0].role === 'assistant' && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            <button
              onClick={() => handleQuickAction('hydration_reminder', '💧 Hydration Reminder')}
              disabled={loading}
              className="px-3 py-2 text-sm bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              💧 Hydration Reminder
            </button>
            <button
              onClick={() => handleQuickAction('workout_motivation', '💪 Need Motivation')}
              disabled={loading}
              className="px-3 py-2 text-sm bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              💪 Need Motivation
            </button>
            <button
              onClick={() => handleQuickAction('workout_suggestion', '🏃 Suggest Workout')}
              disabled={loading}
              className="px-3 py-2 text-sm bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-400 hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              🏃 Suggest Workout
            </button>
          </div>
        )}

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