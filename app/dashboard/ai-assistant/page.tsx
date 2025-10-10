'use client';

import { AuthProvider } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import AIAssistantChat from '@/components/AIAssistantChat';
import { BrainCircuit, Sparkles } from 'lucide-react';

function AIAssistantContent() {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <div className="p-4 lg:p-8 border-b border-gray-700">
          <div className="max-w-6xl mx-auto">
            <div className="mt-12 lg:mt-0">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <BrainCircuit className="h-8 w-8 text-purple-400 mr-3" />
                AI Fitness Assistant
              </h1>
              <p className="text-gray-400 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Your personal AI coach for motivation, hydration reminders, and workout suggestions.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 max-w-6xl mx-auto w-full">
          <div className="h-full bg-gray-800/50 backdrop-blur-sm border-l border-r border-gray-700">
            <AIAssistantChat />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AIAssistant() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AIAssistantContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}