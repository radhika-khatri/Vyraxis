# Vyraxis Intelligence Dashboard

## Overview

Vyraxis Intelligence is a Next.js web application prototype built for financial crime investigation, compliance analysis, and graph-based risk monitoring. It combines a live dashboard, entity relationship graph, AI-assisted investigation flows, and a conversational Compliance Copilot.

The application is driven by a single shared data model, so dashboard metrics, alert lists, graph analysis, and AI prompts all derive from the same mock dataset. 
Demo: https://vyraxis.netlify.app/

## Key Features

- **Dashboard Analytics**
  - System risk score and risk change percentage
  - Active investigation counts and escalation tracking
  - Anomaly precision based on flagged transactions
  - Graph coverage and hub detection metrics
- **Live Signal Stream**
  - Transaction feed that uses real dataset values directly
  - Risk indicators based on transaction risk score
  - Status badges for monitored, flagged, and verified transactions
- **Graph Intelligence Hub**
  - Node-and-edge relationship display
  - Timeline replay analysis for suspicious graph patterns
  - AI agent reasoning over actual graph entities and case context
- **Compliance Copilot**
  - Persistent chat sessions stored in browser localStorage
  - Context-aware title generation from case IDs or entity labels
  - Conversational inspection of investigation data
- **Data Persistence**
  - App dataset saved to localStorage as `vyraxis_data`
  - Chat sessions saved as `vyraxis_chat_sessions`
  - Current chat selection saved as `vyraxis_chat_current`

## Data and Metric Formulas

### Dashboard Metrics

- **System Risk Score**
  - Formula: `round(sum(case.risk) / max(1, totalCases))`
  - Computes the average risk across all active cases.

- **Risk Change**
  - Formula: `highRiskCount > 0 ? +round((highRiskCount / max(1, totalCases)) * 100)% : -0%`
  - High risk cases are defined as cases with `risk > 80`.

- **Anomaly Precision**
  - Formula: `round(flaggedTransactions / totalTransactions * 100)`
  - Uses the dataset transaction list to calculate the percentage of transactions marked as `flagged`.

- **AI Readiness**
  - Uses node count thresholds:
    - `>= 8` nodes → `OPTIMAL`
    - `>= 4` nodes → `FAIR`
    - otherwise → `LIMITED`
  - Also displays node/link counts and graph coverage.

- **Coverage Percent**
  - Formula: `min(100, round(totalNodes / max(1, 10) * 100))`
  - This is a simple coverage heuristic based on a 10-node baseline.

- **Deep Hubs**
  - Count of nodes connected to 3 or more edges.
  - Calculated by counting nodes where total incoming/outgoing edges >= 3.

- **Priority Alerts**
  - The top 3 cases are selected by sorting all cases by descending `risk`.

### Live Signal Stream

- All transaction rows are taken from `src/lib/mock-data.ts` and rendered without random generation.
- Each transaction includes:
  - `id`
  - `entity`
  - `amount`
  - `risk`
  - `status`
- UI risk presentation is based on value ranges:
  - `risk > 75` → destructive pulse indicator
  - `risk > 40` → amber indicator
  - else → green indicator

### Investigation / AI Context

- The AI agent in `src/app/graph/page.tsx` chooses the highest-risk existing case from the dataset.
- It no longer fabricates a fallback case ID.
- The agent builds its analysis input from actual graph data:
  - high-risk nodes (`risk > 70`)
  - a target node of type `target`
  - related edges pointing to that node
  - total transaction value computed from edge amounts

### Graph Replay Logic

- Suspicious graph state is detected when:
  - nodes with `risk > 80` exist, and
  - edges have `color === "destructive"`
- If both are present, the system highlights those nodes/edges and marks a structural shift.
- Otherwise, it reports normal baseline consistency.

## Investigation Case Generation

The AI case generation flow is implemented in `src/ai/flows/autonomous-investigation-case-generation.ts`.

- Uses `Genkit` prompt logic to generate:
  - `caseId`
  - `summary`
  - `suspiciousBehaviorExplanation`
  - `tracedAccountRelationships`
  - `initialFindings`
  - `recommendedActions`
- Input includes a real `alertId` from the dataset and JSON-encoded transaction details.
- The prompt explicitly asks the AI to analyze suspicious behavior, trace account relationships, and recommend next steps.

## How to Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser at:

```text
http://localhost:9002
```

4. If you want to run the AI flow development server, use:

```bash
npm run genkit:dev
```

> Note: AI functionality depends on `Genkit` and the configured AI provider. If you are using Google GenAI, make sure provider credentials are available in your environment.

## Code Architecture (Simple Terms)

### Application Layers

- **Pages**
  - `src/app/page.tsx` — Main dashboard view with risk metrics, graph readiness, and live transaction feed.
  - `src/app/graph/page.tsx` — Graph intelligence workspace with AI agent and timeline replay.
  - `src/app/copilot/page.tsx` — Conversational Copilot interface with persistent session history.
  - `src/app/cases/page.tsx` — Investigation case table and management view.

- **Shared Data Context**
  - `src/context/data-context.tsx` provides a shared `data` object to every page.
  - The data context includes chart series, cases, transactions, graph nodes, and edges.
  - State is persisted to localStorage so the app restores data across browser reloads.

- **Mock Data Source**
  - `src/lib/mock-data.ts` contains all baseline objects used across the app.
  - This includes chart points, case records, transactions, graph nodes, edges, and SAR form defaults.

- **UI Components**
  - Reusable UI components live under `src/components/ui/`.
  - Dashboard-specific components live under `src/components/dashboard/`.
  - Copilot chat components live under `src/components/copilot/`.
  - Graph visualization and interactions live under `src/components/graph/`.

- **AI Flow Definitions**
  - `src/ai/flows/` defines prompt-driven AI flows for compliance tasks.
  - `src/ai/genkit.ts` is the local Genkit setup entrypoint.

### Flow Summary

1. The user opens the dashboard.
2. The app loads the shared dataset from localStorage or defaults.
3. Metrics are calculated from that dataset every render.
4. The graph page uses that same data to drive AI analysis and replay logic.
5. The Copilot page uses browser storage to keep chat sessions and state.

## Why This Structure?

- **Single source of truth**: All real-time metrics and AI inputs come from one shared data object.
- **Easy experimentation**: Changing the mock dataset updates the whole UI consistently.
- **No random case generation**: AI reasoning stays grounded in actual cases and graph elements.
- **Clear separation**: Pages handle layout, components handle presentation, and context handles data state.

## Notes

- The app is built with **Next.js App Router** and **React client components** for interactive pages.
- UI styling uses the existing Tailwind configuration and Shadcn-inspired component patterns.
- The current implementation is a prototype and is designed for demonstration rather than production deployment.
