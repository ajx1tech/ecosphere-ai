# EcoSphere AI Architecture

## Why We Separated Deterministic Logic From AI

A core architectural principle of EcoSphere AI is the strict separation between **deterministic calculation** and **natural language generation (AI)**. 

### 1. Deterministic Core Logic (`lib/carbonEngine.ts`)
All footprint calculations, carbon DNA profiling, and risk scoring are handled by pure, deterministic TypeScript functions. 
- **Auditable**: Every calculation relies on explicit, documented emission factors.
- **Testable**: Pure functions guarantee test coverage with expected, identical outputs for a given input.
- **Reliable**: Numbers are never hallucinated by an LLM.

### 2. Generative AI Layer (`lib/geminiService.ts`)
The Gemini API is exclusively used to provide **contextual, natural language coaching**. 
- The AI never calculates emissions.
- Instead, the deterministic `carbonEngine` computes the numbers and passes them securely to Gemini via a rich system prompt.
- This grounds the AI in reality, ensuring all advice is scientifically accurate and personalized to the user's mathematically verified footprint.

## Data Flow Diagram

```text
[User Input (UI)] -> [CarbonProfile Object]
       |
       v
[carbonEngine.ts (Deterministic)]
       |--- Calculates: FootprintBreakdown, Risk Score, Carbon DNA
       |
       v
[geminiService.ts (Generative AI)]
       |--- System Prompt explicitly provides the calculated numbers
       |--- AI generates personalized, empathetic coaching text
       |
       v
[User Interface (Results/Chat)]
```
