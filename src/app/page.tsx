'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import {
  CarbonProfile,
  FootprintBreakdown,
  CarbonDNA,
  CarbonTwin,
} from '@/lib/types'
import {
  getOrCreateUserId,
  saveProfile,
  getProfileHistory,
} from '@/lib/firebase'
import { generateCarbonTwin, rankRecommendations } from '@/lib/carbonEngine'

import OnboardingWizard from '@/components/OnboardingWizard'
import CarbonDNACard from '@/components/CarbonDNACard'
import RiskScoreGauge from '@/components/RiskScoreGauge'
import CarbonTwinComparison from '@/components/CarbonTwinComparison'
import RecommendationsList from '@/components/RecommendationsList'
import AICoachChat from '@/components/AICoachChat'
import WhatIfSimulator from '@/components/WhatIfSimulator'
import HabitTrendPanel from '@/components/HabitTrendPanel'
import GamificationPanel from '@/components/GamificationPanel'

export default function Home() {
  const [profile, setProfile] = useState<CarbonProfile | null>(null)
  const [breakdown, setBreakdown] = useState<FootprintBreakdown | null>(null)
  const [dna, setDna] = useState<CarbonDNA | null>(null)
  const [riskScore, setRiskScore] = useState<number | null>(null)
  const [twin, setTwin] = useState<CarbonTwin | null>(null)
  const [history, setHistory] = useState<
    { profile: CarbonProfile; breakdown: FootprintBreakdown; timestamp: Date }[]
  >([])
  const [isClient, setIsClient] = useState(false)
  const [dailyActionDone, setDailyActionDone] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Necessary to prevent hydration mismatch in Next.js
    setIsClient(true)
  }, [])

  const handleOnboardingComplete = async (
    p: CarbonProfile,
    b: FootprintBreakdown,
    d: CarbonDNA,
    score: number
  ) => {
    setProfile(p)
    setBreakdown(b)
    setDna(d)
    setRiskScore(score)

    const generatedTwin = generateCarbonTwin(p, b)
    setTwin(generatedTwin)

    try {
      const userId = getOrCreateUserId()
      await saveProfile(userId, p, b)
      const userHistory = await getProfileHistory(userId)
      setHistory(userHistory)
    } catch (e) {
      console.error('Failed to save or fetch profile history:', e)
    }
  }

  const handleReset = () => {
    setProfile(null)
  }

  if (!isClient) return null // Avoid hydration mismatch

  return (
    <div className="min-h-screen text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              🌍
            </span>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                EcoSphere AI
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Understand. Track. Reduce. — Your Personal Climate Intelligence
                Assistant
              </p>
            </div>
          </div>
          {profile && (
            <button
              onClick={handleReset}
              className="text-sm px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Edit Profile
            </button>
          )}
        </div>
      </header>

      <main
        id="main-content"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      >
        <AnimatePresence mode="wait">
          {!profile || !breakdown || !dna || riskScore === null || !twin ? (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="max-w-2xl mx-auto text-center mb-10">
                <h2 className="text-4xl font-extrabold tracking-tight text-white mb-4">
                  Discover Your Carbon DNA
                </h2>
                <p className="text-lg text-emerald-100/70">
                  Answer a few questions to build your personalized
                  environmental profile and unlock AI-driven insights.
                </p>
              </div>
              <OnboardingWizard onComplete={handleOnboardingComplete} />
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <Tabs.Root
                defaultValue="overview"
                className="flex flex-col w-full"
              >
                <Tabs.List
                  className="flex overflow-x-auto gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 mb-8 scrollbar-hide"
                  aria-label="Dashboard views"
                >
                  {[
                    { id: 'overview', label: 'Overview', icon: '📊' },
                    { id: 'coach', label: 'AI Coach', icon: '🤖' },
                    { id: 'simulator', label: 'Simulator', icon: '🎛️' },
                    { id: 'trends', label: 'Trends', icon: '📈' },
                    { id: 'quests', label: 'Quests', icon: '🏆' },
                  ].map((tab) => (
                    <Tabs.Trigger
                      key={tab.id}
                      value={tab.id}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <span>{tab.icon}</span> {tab.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                <div className="focus:outline-none" tabIndex={-1}>
                  {/* UNDERSTAND — Carbon DNA profile + visual footprint breakdown + Risk Score */}
                  <Tabs.Content
                    value="overview"
                    className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 focus:outline-none"
                  >
                    {profile && (
                      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-6 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div aria-label="Top personalized recommendation">
                          <h3 className="text-xl font-bold text-emerald-100 mb-2">
                            🎯 Today's Simple Action
                          </h3>
                          <p className="text-emerald-50/80 text-lg">
                            {rankRecommendations(profile)[0]?.action} &rarr;{' '}
                            <strong className="text-emerald-400">
                              Save{' '}
                              {
                                rankRecommendations(profile)[0]
                                  ?.estimatedSavingsKg
                              }
                              kg CO2
                            </strong>
                          </p>
                        </div>
                        <button
                          onClick={() => setDailyActionDone(true)}
                          disabled={dailyActionDone}
                          className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                            dailyActionDone
                              ? 'bg-slate-700 text-slate-400 cursor-not-allowed shadow-none'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-900/50 hover:scale-105'
                          }`}
                        >
                          {dailyActionDone
                            ? '✓ Completed'
                            : 'Mark as Done +50 XP'}
                        </button>
                      </div>
                    )}

                    <CarbonDNACard dna={dna} breakdown={breakdown} />

                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="md:col-span-1">
                        <RiskScoreGauge
                          score={riskScore}
                          category={dna.riskProfile}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <CarbonTwinComparison twin={twin} />
                      </div>
                    </div>

                    <RecommendationsList
                      recommendations={rankRecommendations(profile)}
                    />
                  </Tabs.Content>

                  {/* PERSONALIZED INSIGHTS — Gemini AI Coach receives the user's real computed data as context for every response, never generic advice */}
                  <Tabs.Content
                    value="coach"
                    className="animate-in fade-in duration-500 focus:outline-none"
                  >
                    <AICoachChat
                      profile={profile}
                      breakdown={breakdown}
                      riskScore={riskScore}
                    />
                  </Tabs.Content>

                  {/* REDUCE — AI Coach + What-If Simulator + ranked Simple Actions */}
                  <Tabs.Content
                    value="simulator"
                    className="animate-in fade-in duration-500 focus:outline-none"
                  >
                    <WhatIfSimulator profile={profile} />
                  </Tabs.Content>

                  {/* TRACK — Habit Trend Panel with month-over-month deterministic change detection */}
                  <Tabs.Content
                    value="trends"
                    className="animate-in fade-in duration-500 focus:outline-none"
                  >
                    <HabitTrendPanel
                      history={history}
                      currentBreakdown={breakdown}
                    />
                  </Tabs.Content>

                  <Tabs.Content
                    value="quests"
                    className="animate-in fade-in duration-500 focus:outline-none"
                  >
                    <GamificationPanel
                      profile={profile}
                      breakdown={breakdown}
                    />
                  </Tabs.Content>
                </div>
              </Tabs.Root>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 text-center text-sm text-slate-500 mt-12 border-t border-slate-900 bg-slate-950/50">
        <p>
          Powered by Google Gemini AI | Carbon factors based on EPA & IPCC
          reference data
        </p>
      </footer>
    </div>
  )
}
