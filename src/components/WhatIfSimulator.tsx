'use client'

import React, { useState, useEffect } from 'react'
import { CarbonProfile, WhatIfScenario } from '@/lib/types'
import { runWhatIfSimulation } from '@/lib/carbonEngine'
import * as Slider from '@radix-ui/react-slider'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface WhatIfSimulatorProps {
  profile: CarbonProfile
}

export default function WhatIfSimulator({ profile }: WhatIfSimulatorProps) {
  const [dietShift, setDietShift] = useState([0])
  const [transportShift, setTransportShift] = useState([0])
  const [shoppingReduction, setShoppingReduction] = useState([0])
  const [energyEfficiency, setEnergyEfficiency] = useState([0])

  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([])
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    const handler = setTimeout(() => {
      // Convert abstract 0-100% shifts into profile changes for simulation
      const changes: Partial<CarbonProfile> = {}

      if (dietShift[0] > 50) changes.dietType = 'vegan'
      else if (dietShift[0] > 20) changes.dietType = 'vegetarian'

      if (transportShift[0] > 70) changes.transportMode = 'bike-walk'
      else if (transportShift[0] > 40) changes.transportMode = 'public-transit'
      else if (transportShift[0] > 10) changes.transportMode = 'mixed'

      if (shoppingReduction[0] > 0) {
        const factor = 1 - shoppingReduction[0] / 100
        changes.onlineShoppingPerMonth = profile.onlineShoppingPerMonth * factor
        changes.fastFashionPerMonth = profile.fastFashionPerMonth * factor
      }

      if (energyEfficiency[0] > 0) {
        const factor = 1 - (energyEfficiency[0] / 100) * 0.4 // max 40% efficiency gain
        changes.electricityKwhPerMonth = profile.electricityKwhPerMonth * factor
      }

      const results = runWhatIfSimulation(profile, changes)
      setScenarios(results)
    }, 300)

    return () => clearTimeout(handler)
  }, [profile, dietShift, transportShift, shoppingReduction, energyEfficiency])

  // Transform scenarios into Recharts data format
  const chartData = [
    {
      year: 2026,
      ...Object.fromEntries(scenarios.map((s) => [s.label, s.year2030])),
    },
    {
      year: 2030,
      ...Object.fromEntries(scenarios.map((s) => [s.label, s.year2030])),
    },
    {
      year: 2040,
      ...Object.fromEntries(scenarios.map((s) => [s.label, s.year2040])),
    },
    {
      year: 2050,
      ...Object.fromEntries(scenarios.map((s) => [s.label, s.year2050])),
    },
  ]

  return (
    <div className="bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-100 mb-6">
        What-If Simulator
      </h2>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="space-y-6">
          <SliderControl
            label="Diet Improvement (Plant-based shift)"
            value={dietShift}
            setValue={setDietShift}
          />
          <SliderControl
            label="Transport Shift (Greener commute)"
            value={transportShift}
            setValue={setTransportShift}
          />
          <SliderControl
            label="Shopping Reduction (Less stuff)"
            value={shoppingReduction}
            setValue={setShoppingReduction}
          />
          <SliderControl
            label="Energy Efficiency (Usage drop)"
            value={energyEfficiency}
            setValue={setEnergyEfficiency}
          />
        </div>

        <div className="h-64 md:h-full min-h-[300px]" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
              />
              <XAxis dataKey="year" stroke="#94a3b8" />
              <YAxis
                stroke="#94a3b8"
                width={60}
                tickFormatter={(val) => `${val}kg`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="Business as Usual"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Moderate Changes"
                stroke="#eab308"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Full Transition"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button
        onClick={() => setShowTable(!showTable)}
        className="text-sm text-emerald-400 hover:text-emerald-300 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded px-1"
        aria-expanded={showTable}
      >
        {showTable ? 'Hide data table' : 'View as accessible data table'}
      </button>

      {showTable && (
        <div className="mt-4 overflow-x-auto">
          <table
            className="w-full text-left text-sm text-slate-300"
            aria-label="Simulation results table"
          >
            <thead className="bg-slate-800 text-slate-200">
              <tr>
                <th className="p-3">Scenario</th>
                <th className="p-3">2026/2030 (kg CO2e)</th>
                <th className="p-3">2040 (kg CO2e)</th>
                <th className="p-3">2050 (kg CO2e)</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, idx) => (
                <tr key={idx} className="border-b border-slate-800">
                  <td className="p-3 font-medium">{s.label}</td>
                  <td className="p-3">{s.year2030}</td>
                  <td className="p-3">{s.year2040}</td>
                  <td className="p-3">{s.year2050}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function SliderControl({
  label,
  value,
  setValue,
}: {
  label: string
  value: number[]
  setValue: (v: number[]) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm text-emerald-400 font-bold">{value[0]}%</span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={value}
        onValueChange={setValue}
        max={100}
        step={5}
        aria-label={label}
      >
        <Slider.Track className="bg-slate-700 relative grow rounded-full h-[6px]">
          <Slider.Range className="absolute bg-emerald-500 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb
          className="block w-5 h-5 bg-white shadow-[0_2px_10px] shadow-black/50 rounded-full hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/50"
          aria-label={label}
        />
      </Slider.Root>
    </div>
  )
}
