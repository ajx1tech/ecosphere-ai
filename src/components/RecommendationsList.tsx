"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Recommendation {
  action: string;
  estimatedSavingsKg: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export default function RecommendationsList({ recommendations }: RecommendationsListProps) {
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const handleMarkDone = (actionText: string) => {
    if (!completedActions.includes(actionText)) {
      const newCompleted = [...completedActions, actionText];
      setCompletedActions(newCompleted);
      // Save to localStorage
      try {
        localStorage.setItem('ecosphere_completed_actions', JSON.stringify(newCompleted));
        // Mock XP gain trigger
        console.log(`Earned XP for completing: ${actionText}`);
      } catch (e) {
        // Handle localStorage error silently
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">Action Plan</h2>
      <p className="text-slate-400 text-sm mb-6">
        Personalized recommendations ranked by highest impact based on your footprint.
      </p>

      <ul className="space-y-4" aria-label="List of personalized recommendations">
        <AnimatePresence>
          {recommendations.map((rec, index) => {
            const isCompleted = completedActions.includes(rec.action);
            
            return (
              <motion.li 
                key={rec.action}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ delay: index * 0.1 }}
                className={`flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-5 rounded-xl border transition-all ${
                  isCompleted 
                    ? 'bg-slate-800/50 border-emerald-900/30 opacity-60' 
                    : 'bg-slate-800 border-slate-700 hover:border-emerald-600/50'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {rec.action}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-sm font-medium text-emerald-400">
                        -{rec.estimatedSavingsKg} kg CO2e / yr
                      </span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getDifficultyColor(rec.difficulty)}`}>
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleMarkDone(rec.action)}
                  disabled={isCompleted}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                    isCompleted 
                      ? 'bg-emerald-900/30 text-emerald-500 cursor-not-allowed' 
                      : 'bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white shadow hover:shadow-emerald-900/50'
                  }`}
                  aria-label={isCompleted ? `Completed: ${rec.action}` : `Mark as done: ${rec.action}`}
                >
                  {isCompleted ? '✓ Done' : 'Mark as Done'}
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
