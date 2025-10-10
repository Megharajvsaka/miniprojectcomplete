'use client';

import { useState } from 'react';
import { Check, Clock, Flame, Target, ChevronDown, ChevronUp } from 'lucide-react';
import { Exercise, WorkoutSession } from '@/lib/workouts';

interface WorkoutCardProps {
  session: WorkoutSession;
  onExerciseToggle: (exerciseId: string, completed: boolean) => void;
  loading?: boolean;
}

export default function WorkoutCard({ session, onExerciseToggle, loading = false }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false);

  const completionPercentage = session.exercises.length > 0 
    ? (session.completedExercises.length / session.exercises.length) * 100 
    : 0;

  const totalCalories = session.exercises.reduce((sum, ex) => sum + (ex.caloriesBurned || 0), 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'intermediate': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'advanced': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '💪';
      case 'cardio': return '❤️';
      case 'yoga': return '🧘';
      case 'flexibility': return '🤸';
      case 'hiit': return '⚡';
      default: return '🏃';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:bg-gray-800/70 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getTypeIcon(session.type)}</span>
          <div>
            <h3 className="text-lg font-semibold text-white">{session.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>{session.totalDuration} min</span>
              <span>•</span>
              <Flame className="h-4 w-4" />
              <span>{totalCalories} cal</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(session.difficulty)}`}>
          {session.difficulty}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Progress</span>
          <span className="text-sm text-gray-400">
            {session.completedExercises.length}/{session.exercises.length} exercises
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              completionPercentage === 100 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            }`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {Math.round(completionPercentage)}% complete
        </div>
      </div>

      {/* Completion Status */}
      {session.completed && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center text-green-400">
            <Check className="h-5 w-5 mr-2" />
            <span className="font-medium">Workout Completed!</span>
          </div>
          {session.completedAt && (
            <p className="text-xs text-green-300 mt-1">
              Finished at {new Date(session.completedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
      >
        <span className="mr-2">
          {expanded ? 'Hide Exercises' : 'Show Exercises'}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Exercise List */}
      {expanded && (
        <div className="mt-4 space-y-3 border-t border-gray-700 pt-4">
          {session.exercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              exercise={exercise}
              completed={session.completedExercises.includes(exercise.id)}
              onToggle={(completed) => onExerciseToggle(exercise.id, completed)}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ExerciseItemProps {
  exercise: Exercise;
  completed: boolean;
  onToggle: (completed: boolean) => void;
  loading: boolean;
}

function ExerciseItem({ exercise, completed, onToggle, loading }: ExerciseItemProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const getExerciseDetails = () => {
    if (exercise.sets && exercise.reps) {
      return `${exercise.sets} sets × ${exercise.reps} reps`;
    }
    if (exercise.duration) {
      return `${exercise.duration} minutes`;
    }
    return 'Complete as prescribed';
  };

  return (
    <div className={`p-4 rounded-lg border transition-all duration-200 ${
      completed 
        ? 'bg-green-500/10 border-green-500/30' 
        : 'bg-gray-700/30 border-gray-600'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onToggle(!completed)}
              disabled={loading}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-500 hover:border-green-500'
              } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {completed && <Check className="h-4 w-4" />}
            </button>
            <div className="flex-1">
              <h4 className={`font-medium transition-all duration-200 ${
                completed ? 'text-green-400 line-through' : 'text-white'
              }`}>
                {exercise.name}
              </h4>
              <p className="text-sm text-gray-400">{getExerciseDetails()}</p>
              {exercise.targetMuscles.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Targets: {exercise.targetMuscles.join(', ')}
                </p>
              )}
            </div>
          </div>

          {/* Instructions Toggle */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showInstructions ? 'Hide' : 'Show'} Instructions
          </button>

          {/* Instructions */}
          {showInstructions && (
            <div className="mt-2 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-sm text-gray-300">{exercise.instructions}</p>
              {exercise.equipment && exercise.equipment.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">
                  Equipment: {exercise.equipment.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Exercise Stats */}
        <div className="text-right text-sm text-gray-400">
          {exercise.caloriesBurned && (
            <div className="flex items-center">
              <Flame className="h-4 w-4 mr-1" />
              <span>{exercise.caloriesBurned} cal</span>
            </div>
          )}
          {exercise.restTime && (
            <div className="flex items-center mt-1">
              <Clock className="h-4 w-4 mr-1" />
              <span>{exercise.restTime}s rest</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}