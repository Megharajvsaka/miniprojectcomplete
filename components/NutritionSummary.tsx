'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Flame, Beef, Wheat, Droplet } from 'lucide-react';

interface NutritionSummaryProps {
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const COLORS = {
  protein: '#ef4444', // red-500
  carbs: '#3b82f6', // blue-500
  fat: '#f59e0b', // amber-500
};

export default function NutritionSummary({ dailyTotals, goals }: NutritionSummaryProps) {
  const macroData = [
    { name: 'Protein', value: dailyTotals.protein * 4, color: COLORS.protein },
    { name: 'Carbs', value: dailyTotals.carbs * 4, color: COLORS.carbs },
    { name: 'Fat', value: dailyTotals.fat * 9, color: COLORS.fat },
  ];

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100;
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 80) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-gray-300">{Math.round(data.value)} calories</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Progress Bars */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Flame className="h-5 w-5 text-orange-400 mr-2" />
          Daily Progress
        </h3>
        
        <div className="space-y-6">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center">
                <Flame className="h-4 w-4 mr-1 text-orange-400" />
                Calories
              </span>
              <span className="text-sm text-gray-400">
                {dailyTotals.calories} / {goals.calories}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${getProgressColor(dailyTotals.calories, goals.calories)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${getProgressPercentage(dailyTotals.calories, goals.calories)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(getProgressPercentage(dailyTotals.calories, goals.calories))}% of goal
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center">
                <Beef className="h-4 w-4 mr-1 text-red-400" />
                Protein
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(dailyTotals.protein)}g / {goals.protein}g
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${getProgressColor(dailyTotals.protein, goals.protein)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${getProgressPercentage(dailyTotals.protein, goals.protein)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(getProgressPercentage(dailyTotals.protein, goals.protein))}% of goal
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center">
                <Wheat className="h-4 w-4 mr-1 text-blue-400" />
                Carbohydrates
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(dailyTotals.carbs)}g / {goals.carbs}g
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${getProgressColor(dailyTotals.carbs, goals.carbs)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${getProgressPercentage(dailyTotals.carbs, goals.carbs)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(getProgressPercentage(dailyTotals.carbs, goals.carbs))}% of goal
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300 flex items-center">
                <Droplet className="h-4 w-4 mr-1 text-amber-400" />
                Fat
              </span>
              <span className="text-sm text-gray-400">
                {Math.round(dailyTotals.fat)}g / {goals.fat}g
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div 
                className={`bg-gradient-to-r ${getProgressColor(dailyTotals.fat, goals.fat)} h-3 rounded-full transition-all duration-500`}
                style={{ width: `${getProgressPercentage(dailyTotals.fat, goals.fat)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {Math.round(getProgressPercentage(dailyTotals.fat, goals.fat))}% of goal
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient Distribution Chart */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Macronutrient Distribution
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={macroData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          {macroData.map((entry) => (
            <div key={entry.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-300">{entry.name}</span>
            </div>
          ))}
        </div>

        {/* Calorie breakdown */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {dailyTotals.calories}
            </div>
            <div className="text-sm text-gray-400">Total Calories</div>
          </div>
        </div>
      </div>
    </div>
  );
}