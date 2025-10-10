'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Check, Clock } from 'lucide-react';
import { WorkoutSession } from '@/lib/workouts';

interface WorkoutCalendarProps {
  sessions: WorkoutSession[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

export default function WorkoutCalendar({ sessions, onDateSelect, selectedDate }: WorkoutCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push(new Date(date));
    }
    
    setCalendarDays(days);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getSessionsForDate = (date: Date): WorkoutSession[] => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(session => session.date === dateStr);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Calendar className="h-5 w-5 text-purple-400 mr-2" />
          Workout Calendar
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h4 className="text-lg font-medium text-white min-w-[200px] text-center">
            {formatMonth(currentDate)}
          </h4>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Day Headers */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-400">
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((date, index) => {
          const daysSessions = getSessionsForDate(date);
          const completedSessions = daysSessions.filter(s => s.completed);
          const hasWorkout = daysSessions.length > 0;
          const allCompleted = hasWorkout && completedSessions.length === daysSessions.length;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date.toISOString().split('T')[0])}
              className={`
                relative p-3 text-sm rounded-lg transition-all duration-200 hover:bg-gray-700
                ${isCurrentMonth(date) ? 'text-white' : 'text-gray-500'}
                ${isToday(date) ? 'bg-blue-500/20 border border-blue-500/30' : ''}
                ${isSelected(date) ? 'bg-purple-500/20 border border-purple-500/30' : ''}
                ${hasWorkout ? 'font-medium' : ''}
              `}
            >
              <div className="flex flex-col items-center">
                <span>{date.getDate()}</span>
                
                {/* Workout Indicators */}
                {hasWorkout && (
                  <div className="flex items-center justify-center mt-1 space-x-1">
                    {allCompleted ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Clock className="h-3 w-3 text-yellow-400" />
                    )}
                    <span className="text-xs">
                      {completedSessions.length}/{daysSessions.length}
                    </span>
                  </div>
                )}

                {/* Workout Type Dots */}
                {hasWorkout && (
                  <div className="flex space-x-1 mt-1">
                    {daysSessions.slice(0, 3).map((session, idx) => (
                      <div
                        key={idx}
                        className={`w-2 h-2 rounded-full ${
                          session.completed 
                            ? 'bg-green-400' 
                            : session.type === 'strength' 
                              ? 'bg-red-400' 
                              : session.type === 'cardio' 
                                ? 'bg-orange-400'
                                : session.type === 'yoga'
                                  ? 'bg-purple-400'
                                  : 'bg-blue-400'
                        }`}
                      />
                    ))}
                    {daysSessions.length > 3 && (
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs text-gray-400">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-400 mr-2" />
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
            <span>Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2" />
            <span>Strength</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-400 mr-2" />
            <span>Cardio</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-purple-400 mr-2" />
            <span>Yoga</span>
          </div>
        </div>
      </div>
    </div>
  );
}