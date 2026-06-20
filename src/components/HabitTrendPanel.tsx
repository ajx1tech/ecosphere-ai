"use client";

import React, { useEffect, useState } from 'react';
import { CarbonProfile, FootprintBreakdown } from '@/lib/types';
import { detectHabitChanges, HabitChangeInsight } from '@/lib/habitDetection';
import { generateWeeklySummary } from '@/lib/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface HistoryEntry {
  profile: CarbonProfile;
  breakdown: FootprintBreakdown;
  timestamp: Date;
}

interface HabitTrendPanelProps {
  history: HistoryEntry[];
  currentBreakdown: FootprintBreakdown;
}

export default function HabitTrendPanel({ history, currentBreakdown }: HabitTrendPanelProps) {
  const [summary, setSummary] = useState<string>("Analyzing your recent habits...");
  const [insights, setInsights] = useState<HabitChangeInsight[]>([]);

  useEffect(() => {
    if (history.length >= 2) {
      const detected = detectHabitChanges(history);
      setInsights(detected);
      
      // Generate AI summary exactly once on mount
      const fetchSummary = async () => {
        const text = await generateWeeklySummary(currentBreakdown, detected);
        setSummary(text);
      };
      fetchSummary();
    }
  }, [history, currentBreakdown]);

  if (history.length < 2) {
    return (
      <div className="w-full bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl text-center">
        <div className="text-6xl mb-4">🌱</div>
        <h2 className="text-2xl font-bold text-slate-100 mb-2">Planting the Seeds</h2>
        <p className="text-slate-400">
          We need at least two footprint recordings over time to show trend analysis. 
          Come back next month to see your habit trends!
        </p>
      </div>
    );
  }

  // Format data for Recharts (reverse to show chronological order left-to-right)
  const chartData = [...history].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()).map(h => ({
    date: new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(h.timestamp),
    total: h.breakdown.total
  }));

  return (
    <div className="w-full space-y-6">
      {/* AI Summary Highlight */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-emerald-950/30 border border-emerald-900/50 rounded-2xl p-6 shadow-inner"
        aria-live="polite"
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl mt-1">✨</div>
          <div>
            <h3 className="text-emerald-400 font-bold mb-2">AI Trend Summary</h3>
            <p className="text-emerald-50 leading-relaxed text-sm md:text-base">
              {summary}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Area Chart */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl" aria-hidden="true">
        <h3 className="text-lg font-bold text-slate-200 mb-6">Historical Emissions (kg CO2e)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} />
              <YAxis stroke="#94a3b8" tick={{fontSize: 12}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="total" stroke="#10b981" fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detected Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-200">Detected Habit Changes</h3>
        {insights.length === 0 ? (
          <p className="text-slate-400 text-sm">No significant changes detected in your specific categories recently.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2" aria-label="Detected habit changes">
            {insights.map((insight, idx) => {
              const isIncrease = insight.changePercent > 0;
              return (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    isIncrease 
                      ? 'bg-red-950/20 border-red-900/50' 
                      : 'bg-emerald-950/20 border-emerald-900/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${
                      isIncrease ? 'bg-red-900/50 text-red-400' : 'bg-emerald-900/50 text-emerald-400'
                    }`}>
                      {isIncrease ? '↑' : '↓'}
                    </div>
                    <span className={`font-semibold capitalize ${isIncrease ? 'text-red-200' : 'text-emerald-200'}`}>
                      {insight.category} Impact
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{insight.insight}</p>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
