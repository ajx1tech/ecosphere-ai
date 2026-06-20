"use client";

import React from 'react';
import { CarbonDNA, FootprintBreakdown } from '@/lib/types';
import { motion } from 'framer-motion';

interface CarbonDNACardProps {
  dna: CarbonDNA;
  breakdown: FootprintBreakdown;
}

export default function CarbonDNACard({ dna, breakdown }: CarbonDNACardProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Excellent':
      case 'Low': return 'bg-emerald-500 text-emerald-950';
      case 'Moderate': return 'bg-yellow-500 text-yellow-950';
      case 'High': return 'bg-orange-500 text-orange-950';
      case 'Critical': return 'bg-red-500 text-red-950';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getPercentage = (value: number) => {
    if (breakdown.total === 0) return 0;
    return (value / breakdown.total) * 100;
  };

  const transportPct = getPercentage(breakdown.transport);
  const dietPct = getPercentage(breakdown.diet);
  const shoppingPct = getPercentage(breakdown.shopping);
  const energyPct = getPercentage(breakdown.energy);
  const digitalPct = getPercentage(breakdown.digital);

  return (
    <motion.div 
      className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Your Carbon DNA Summary"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-sm font-bold text-emerald-400 tracking-wider uppercase mb-1">Your Archetype</h2>
          <div className="text-3xl font-extrabold text-white flex items-center gap-3">
            {dna.archetype}
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full font-bold text-sm shadow-lg ${getRiskColor(dna.riskProfile)}`}>
          {dna.riskProfile} Risk Profile
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Diet</div>
          <div className="font-semibold text-emerald-100">{dna.dietLabel}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Travel</div>
          <div className="font-semibold text-emerald-100">{dna.travelLabel}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Shopping</div>
          <div className="font-semibold text-emerald-100">{dna.shoppingLabel}</div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Energy</div>
          <div className="font-semibold text-emerald-100">{dna.energyLabel}</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-3">
          <h3 className="text-lg font-bold text-slate-200">Emissions Breakdown</h3>
          <div className="text-sm text-slate-400 font-medium">Total: {breakdown.total.toLocaleString()} kg CO2e</div>
        </div>
        
        {/* Stacked Bar Chart */}
        <div 
          className="w-full h-8 flex rounded-full overflow-hidden bg-slate-800"
          aria-label={`Emissions breakdown. Total is ${breakdown.total} kg. Transport: ${Math.round(transportPct)}%, Diet: ${Math.round(dietPct)}%, Shopping: ${Math.round(shoppingPct)}%, Energy: ${Math.round(energyPct)}%, Digital: ${Math.round(digitalPct)}%.`}
        >
          <div style={{ width: `${transportPct}%` }} className="bg-blue-500 hover:opacity-90 transition-opacity" title={`Transport: ${breakdown.transport} kg`} />
          <div style={{ width: `${dietPct}%` }} className="bg-green-500 hover:opacity-90 transition-opacity" title={`Diet: ${breakdown.diet} kg`} />
          <div style={{ width: `${shoppingPct}%` }} className="bg-purple-500 hover:opacity-90 transition-opacity" title={`Shopping: ${breakdown.shopping} kg`} />
          <div style={{ width: `${energyPct}%` }} className="bg-yellow-500 hover:opacity-90 transition-opacity" title={`Energy: ${breakdown.energy} kg`} />
          <div style={{ width: `${digitalPct}%` }} className="bg-teal-500 hover:opacity-90 transition-opacity" title={`Digital: ${breakdown.digital} kg`} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-300" aria-hidden="true">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Transport</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Diet</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-500"></span> Shopping</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Energy</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-teal-500"></span> Digital</div>
        </div>
      </div>
    </motion.div>
  );
}
