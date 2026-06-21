'use client'

import React, { useEffect } from 'react'
import { CarbonTwin } from '@/lib/types'
import { motion, useSpring, useTransform } from 'framer-motion'

function AnimatedCounter({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 })
  const display = useTransform(spring, (current) => Math.round(current))

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  return <motion.span>{display}</motion.span>
}

export default function CarbonTwinComparison({ twin }: { twin: CarbonTwin }) {
  return (
    <div
      className="w-full space-y-8"
      aria-label={`Comparison with your Carbon Twin. You: ${twin.currentFootprint} kg. Twin: ${twin.twinFootprint} kg. Savings: ${twin.savingsKg} kg.`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Current You */}
        <motion.div
          className="bg-slate-900 border border-orange-900/50 rounded-2xl p-6 shadow-lg shadow-orange-900/10"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h3 className="text-xl font-bold text-slate-100 mb-2">Current You</h3>
          <div className="text-4xl font-black text-orange-400 mb-4">
            {twin.currentFootprint.toLocaleString()}{' '}
            <span className="text-lg font-medium text-slate-400">kg CO2e</span>
          </div>
          <p className="text-slate-400 text-sm">
            Your actual computed footprint based on your current habits.
          </p>
        </motion.div>

        {/* Carbon Twin */}
        <motion.div
          className="bg-slate-900 border border-emerald-900/50 rounded-2xl p-6 shadow-lg shadow-emerald-900/10"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-100 mb-2">Carbon Twin</h3>
          <div className="text-4xl font-black text-emerald-400 mb-4">
            <AnimatedCounter value={twin.twinFootprint} />{' '}
            <span className="text-lg font-medium text-slate-400">kg CO2e</span>
          </div>
          <p className="text-emerald-100/70 text-sm mb-4">
            An optimized version of you who:
          </p>
          <ul className="space-y-2">
            {twin.twinBehaviors.map((behavior, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-emerald-100"
              >
                <span className="text-emerald-500 font-bold">✓</span> {behavior}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-3xl mb-2">🌳</div>
          <div className="text-2xl font-bold text-emerald-300">
            <AnimatedCounter value={twin.equivalents.treesPlanted} />
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            Trees Planted
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-3xl mb-2">📱</div>
          <div className="text-2xl font-bold text-blue-300">
            <AnimatedCounter value={twin.equivalents.phoneChargesSaved} />
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            Phone Charges
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
          <div className="text-3xl mb-2">🚗</div>
          <div className="text-2xl font-bold text-purple-300">
            {twin.equivalents.carsOffRoad}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">
            Cars Off Road / Yr
          </div>
        </div>
      </div>
    </div>
  )
}
