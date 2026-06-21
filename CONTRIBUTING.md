# Contributing to EcoSphere AI

Thank you for your interest in contributing!

## Setup Instructions
1. Clone the repository
2. Run `npm install`
3. Copy `.env.local.example` (or similar) to `.env.local` and add your `NEXT_PUBLIC_GEMINI_API_KEY` and Firebase credentials.
4. Run `npm run dev` to start the local server.

## Code Style
This project enforces a strict Prettier configuration to ensure consistent formatting. 
Before committing, please ensure your code complies with our `.prettierrc.json`:
- No semicolons
- Single quotes
- Trailing commas (es5)
- Tab width: 2

Run `npx prettier --write "src/**/*.{ts,tsx}"` before submitting a PR.

## Testing Requirements
All core logic is contained in pure, deterministic functions within `src/lib/`. 
- Every new calculation must have test coverage.
- Run `npm test` to verify your changes.
- UI components should have basic React Testing Library coverage ensuring accessibility and state changes.

## Architectural Principle: Logic vs AI Separation
**Crucial:** We strictly separate deterministic calculations from Generative AI.
- **Never** ask the LLM (Gemini) to perform math, estimate carbon footprints, or calculate scores.
- All numbers and metrics must be calculated in `src/lib/carbonEngine.ts` using verified emission factors.
- Gemini (`src/lib/geminiService.ts`) is only used to format these numbers into natural language, empathetic coaching, or personalized summaries.
