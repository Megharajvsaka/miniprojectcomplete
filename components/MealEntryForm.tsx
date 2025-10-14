'use client';

import { useState } from 'react';
import { Plus, Search, X, Check } from 'lucide-react';
import { commonFoods } from '@/lib/nutrition';

interface MealEntryFormProps {
  onAddFood: (food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    quantity: number;
    unit: string;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }) => Promise<void>;
  loading?: boolean;
}

export default function MealEntryForm({ onAddFood, loading = false }: MealEntryFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    quantity: '1',
    unit: 'serving',
    mealType: 'lunch' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  });

  const filteredFoods = commonFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodSelect = (food: any) => {
    setSelectedFood(food);
    setFormData({
      ...formData,
      name: food.name,
      calories: food.calories.toString(),
      protein: food.protein.toString(),
      carbs: food.carbs.toString(),
      fat: food.fat.toString(),
    });
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.calories) return;

    setSubmitting(true);
    setSuccessMessage('');

    try {
      await onAddFood({
        name: formData.name,
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fat: parseFloat(formData.fat) || 0,
        quantity: parseFloat(formData.quantity) || 1,
        unit: formData.unit,
        mealType: formData.mealType,
      });

      // Show success message
      setSuccessMessage('Food added successfully!');
      
      // Reset form
      setFormData({
        name: '',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        quantity: '1',
        unit: 'serving',
        mealType: 'lunch',
      });
      setSelectedFood(null);
      
      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Error adding food:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Add Food Entry</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-all duration-200"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Success Message */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center">
              <Check className="h-5 w-5 mr-2" />
              {successMessage}
            </div>
          )}

          {/* Food Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Search Common Foods
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Search for foods..."
              />
            </div>
            
            {searchTerm && filteredFoods.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-gray-700 border border-gray-600 rounded-lg">
                {filteredFoods.map((food, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleFoodSelect(food)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-600 text-white text-sm border-b border-gray-600 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium">{food.name}</div>
                    <div className="text-xs text-gray-400">
                      {food.calories} cal, {food.protein}g protein
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {searchTerm && filteredFoods.length === 0 && (
              <div className="mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-400">
                No foods found. Add manually below.
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Food Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="Enter food name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meal Type
              </label>
              <select
                name="mealType"
                value={formData.mealType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Calories *
              </label>
              <input
                type="number"
                name="calories"
                required
                min="0"
                step="0.1"
                value={formData.calories}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Protein (g)
              </label>
              <input
                type="number"
                name="protein"
                min="0"
                step="0.1"
                value={formData.protein}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Carbs (g)
              </label>
              <input
                type="number"
                name="carbs"
                min="0"
                step="0.1"
                value={formData.carbs}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fat (g)
              </label>
              <input
                type="number"
                name="fat"
                min="0"
                step="0.1"
                value={formData.fat}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                min="0.1"
                step="0.1"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
              >
                <option value="serving">serving</option>
                <option value="cup">cup</option>
                <option value="gram">gram</option>
                <option value="ounce">ounce</option>
                <option value="piece">piece</option>
                <option value="slice">slice</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.name || !formData.calories}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {submitting ? 'Adding...' : 'Add Food Entry'}
          </button>
        </form>
      )}
    </div>
  );
}