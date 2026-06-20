"use client";

import React, { useState, useEffect } from 'react';
import { CarbonProfile, FootprintBreakdown } from '@/lib/types';
import { calculateLevel, generateWeeklyMissions, checkBadgeEligibility, Mission, Badge } from '@/lib/gamification';
import * as Progress from '@radix-ui/react-progress';
import { motion } from 'framer-motion';

interface GamificationPanelProps {
  profile: CarbonProfile;
  breakdown: FootprintBreakdown;
  history: { profile: CarbonProfile; breakdown: FootprintBreakdown; timestamp: Date }[];
}

export default function GamificationPanel({ profile, breakdown, history }: GamificationPanelProps) {
  const [totalXP, setTotalXP] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    try {
      const storedXP = parseInt(localStorage.getItem('ecosphere_xp') || '0', 10);
      const storedCompleted = JSON.parse(localStorage.getItem('ecosphere_missions_done') || '[]');
      setTotalXP(storedXP);
      setCompletedMissions(storedCompleted);
    } catch (e) {
      // Ignore parse errors
    }
    
    setMissions(generateWeeklyMissions(profile, breakdown));
  }, [profile, breakdown]);

  const levelData = calculateLevel(totalXP);
  const badges = checkBadgeEligibility(profile, history.map(h => h.profile));

  const handleMissionComplete = (mission: Mission) => {
    if (completedMissions.includes(mission.id)) return;

    const newXP = totalXP + mission.xpReward;
    const newLevelData = calculateLevel(newXP);

    // Check if leveled up
    if (newLevelData.level > levelData.level) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }

    const newCompleted = [...completedMissions, mission.id];
    
    setTotalXP(newXP);
    setCompletedMissions(newCompleted);

    try {
      localStorage.setItem('ecosphere_xp', newXP.toString());
      localStorage.setItem('ecosphere_missions_done', JSON.stringify(newCompleted));
      // In a real app, call saveMissionProgress(userId, mission.id, true) here
    } catch (e) {}
  };

  const calculateProgress = () => {
    // Basic progression math based on level bounds
    const levelStartXP = levelData.level === 1 ? 0 : levelData.level === 2 ? 100 : levelData.level === 3 ? 300 : 600;
    const levelRange = (levelData.xpToNext + totalXP) - levelStartXP;
    if (levelRange <= 0) return 100;
    return ((totalXP - levelStartXP) / levelRange) * 100;
  };

  return (
    <div className="w-full space-y-8 relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden" aria-hidden="true">
          <div className="animate-ping text-6xl">🎉✨🌍</div>
        </div>
      )}

      {/* Level Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-emerald-900/50 border-4 border-emerald-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-900/50">
          Lvl {levelData.level}
        </div>
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-bold text-slate-100 mb-1">{levelData.title}</h2>
          <p className="text-slate-400 text-sm mb-4">Total XP: <span className="text-emerald-400 font-bold">{totalXP}</span></p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-medium">
              <span>Current Level Progress</span>
              <span>{levelData.xpToNext > 0 ? `${levelData.xpToNext} XP to next level` : 'Max Level Reached!'}</span>
            </div>
            <Progress.Root className="relative overflow-hidden bg-slate-800 rounded-full w-full h-3" value={calculateProgress()}>
              <Progress.Indicator 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
                style={{ transform: `translateX(-${100 - calculateProgress()}%)` }}
              />
            </Progress.Root>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Weekly Quests */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-slate-100 mb-4">Weekly Quests</h3>
          <ul className="space-y-3" aria-label="Available weekly quests">
            {missions.map((mission, idx) => {
              const isDone = completedMissions.includes(mission.id);
              return (
                <motion.li 
                  key={mission.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${
                    isDone ? 'bg-slate-800/50 border-emerald-900/30' : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <button 
                    onClick={() => handleMissionComplete(mission)}
                    disabled={isDone}
                    className={`flex-shrink-0 w-6 h-6 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      isDone ? 'bg-emerald-500 border-emerald-500 text-emerald-950' : 'bg-slate-900 border-slate-600 text-transparent hover:border-emerald-500'
                    }`}
                    aria-label={isDone ? `Completed quest: ${mission.title}` : `Complete quest: ${mission.title}`}
                  >
                    ✓
                  </button>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${isDone ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {mission.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Saves approx. {mission.estimatedSavingsKg}kg CO2e
                    </div>
                  </div>
                  <div className={`font-bold text-sm ${isDone ? 'text-slate-600' : 'text-emerald-400'}`}>
                    +{mission.xpReward} XP
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>

        {/* Badges Collection */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl">
          <h3 className="text-xl font-bold text-slate-100 mb-4">Achievement Badges</h3>
          <div className="grid grid-cols-2 gap-4">
            {badges.map(badge => (
              <div 
                key={badge.id}
                className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                  badge.earned 
                    ? 'bg-slate-800 border-emerald-500/50 shadow-inner' 
                    : 'bg-slate-800/30 border-slate-700/50 grayscale opacity-60'
                }`}
                title={badge.description}
                aria-label={`Badge: ${badge.name}. ${badge.earned ? 'Earned' : 'Locked'}. ${badge.description}`}
              >
                <div className="text-3xl mb-2">{badge.icon}</div>
                <div className="font-bold text-sm text-slate-200">{badge.name}</div>
                <div className="text-xs text-slate-400 mt-1">{badge.earned ? 'Unlocked!' : 'Locked'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
