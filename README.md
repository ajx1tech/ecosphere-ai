# 🌍 EcoSphere AI — Your Personal Climate Intelligence Assistant

> Built for PromptWars: Virtual | Challenge 3: Carbon Footprint Awareness Platform

## 🎯 Problem Statement Alignment
The challenge asks for a solution that helps users **understand, track, and reduce** their carbon footprint through **simple actions and personalized insights**. EcoSphere AI maps directly:
- **Understand** → Carbon DNA profile + visual breakdown
- **Track** → Monthly history stored in Firestore, AI-detected habit trend insights  
- **Reduce** → Ranked, numerically-justified recommendations + Carbon Twin aspirational model + What-If Simulator
- **Simple actions** → Gamified weekly missions targeting highest-impact category
- **Personalized insights** → Gemini AI coach receives the user's actual computed footprint data as context, never generic advice

## 🧠 What Makes This Different
Most carbon trackers are static calculators. EcoSphere AI separates concerns intentionally:
- A **deterministic calculation engine** (`lib/carbonEngine.ts`) computes real numbers using documented emission factors — fully unit tested, fully auditable, zero hallucination risk
- **Google Gemini AI** is used only where it adds value: natural language coaching, contextual Q&A, and weekly summaries — always grounded in the engine's real output

This hybrid architecture (deterministic logic + AI explanation layer) is what makes the assistant genuinely "smart and dynamic" rather than an LLM guessing numbers.

## ✨ Features
- 🧬 **Carbon DNA** — Personalized archetype derived from your actual habits
- 👯 **Carbon Twin** — See an optimized version of yourself with real savings math
- 🤖 **AI Sustainability Coach** — Context-aware Gemini chat, grounded in your data
- 🎚️ **What-If Simulator** — Interactive sliders projecting your footprint to 2050
- 📊 **Carbon Risk Score** — 0-100 score like a credit score, with category breakdown
- 📈 **Habit Trend Detection** — Deterministic month-over-month change detection
- 🎮 **Gamification** — Levels, XP, badges, weekly missions targeting your biggest impact area
- 📶 **Offline-capable PWA** — Service worker caching

## 🛠️ Tech Stack
Next.js 14 (TypeScript) · Tailwind CSS · Framer Motion · Recharts · Radix UI
Google Gemini API · Firebase Firestore · Docker · Google Cloud Run

## 🏗️ Architecture
User Onboarding → Deterministic Carbon Engine (pure functions, unit tested)
→ Carbon DNA / Risk Score / Twin / Recommendations (computed, not guessed)
→ Gemini AI Coach (explains the numbers, answers questions, grounded in real context)
→ Firebase Firestore (history for habit detection)

## 🚀 Running Locally
```bash
git clone https://github.com/ajx1tech/ecosphere-ai
cd ecosphere-ai
npm install
# add your keys to .env.local
npm run dev
```

## ✅ Testing
```bash
npm test
npm run test:coverage
```
20+ unit tests cover the carbon engine, habit detection, gamification, and Gemini service with mocking. Component tests cover onboarding and accessibility attributes.

## 🔐 Security
- CSP headers on every route
- DOMPurify sanitizes all AI-generated content before rendering
- Rate limiting on Gemini API calls (800ms minimum interval)
- Input validation with bounded ranges on all numeric onboarding fields
- No secrets committed — all keys in `.env.local`, gitignored

## ♿ Accessibility (WCAG 2.1 AA)
- Full keyboard navigation, focus-visible states
- aria-live regions for dynamic content (chat, onboarding steps)
- role="meter" on risk score gauge with proper aria-value attributes
- Text-table fallback for the What-If chart
- prefers-reduced-motion respected throughout
- Skip-to-main-content link

## 📐 Assumptions
- Emission factors are approximate, sourced from publicly documented averages (EPA, IPCC-aligned figures) — disclosed in code comments, not presented as precise measurements
- No authentication implemented; anonymous session ID via localStorage/UUID for hackathon scope
- Region selector currently informational (future: region-specific grid emission factors)

## 🌐 Live Demo
[Deployed on Google Cloud Run](YOUR_CLOUD_RUN_URL)

## Google Services Used
- **Google Gemini API** — AI sustainability coach + weekly summary generation
- **Firebase Firestore** — Profile history persistence for habit detection
- **Google Cloud Run** — Production deployment

Built with 🌱 by [Ajit Sharma](https://github.com/ajx1tech)
