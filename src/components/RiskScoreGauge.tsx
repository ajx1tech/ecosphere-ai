"use client";

import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface RiskScoreGaugeProps {
  score: number;
  category: string;
}

export default function RiskScoreGauge({ score, category }: RiskScoreGaugeProps) {
  const getColor = () => {
    switch (category) {
      case 'Excellent':
      case 'Low': return '#10b981'; // emerald-500
      case 'Moderate': return '#eab308'; // yellow-500
      case 'High': return '#f97316'; // orange-500
      case 'Critical': return '#ef4444'; // red-500
      default: return '#64748b'; // slate-500
    }
  };

  const getExplanation = () => {
    switch (category) {
      case 'Excellent': return 'Your emissions are exceptionally low.';
      case 'Low': return 'You are well below average. Keep it up!';
      case 'Moderate': return 'Your footprint is average, with room for easy wins.';
      case 'High': return 'Your emissions are above average. Action is recommended.';
      case 'Critical': return 'Your footprint is very high. Prioritize major reductions.';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl">
      <div 
        className="w-48 h-48 mb-6"
        role="meter" 
        aria-valuenow={score} 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-label={`Carbon Risk Score: ${score} out of 100`}
      >
        <CircularProgressbar 
          value={score} 
          text={`${score}/100`}
          styles={buildStyles({
            pathColor: getColor(),
            textColor: '#f8fafc',
            trailColor: '#1e293b',
            textSize: '18px',
            pathTransitionDuration: 1.5
          })}
        />
      </div>
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2" style={{ color: getColor() }}>{category} Risk</h3>
        <p className="text-slate-400 text-sm">{getExplanation()}</p>
      </div>
    </div>
  );
}
