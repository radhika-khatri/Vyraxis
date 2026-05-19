# Vyraxis Intelligence Architecture

## Project Overview
Vyraxis Intelligence is a Next.js application built as an AI-native compliance operating system for financial crime investigation. The platform includes a live signal dashboard, graph intelligence hub, autonomous investigation agent, conversational compliance copilot, and SAR generation engine.

The application is structured as a client-first UI with a shared data provider and AI flows managed via Genkit. It uses mock data for demonstration, local storage for persistence, and an interactive UI layer built with Tailwind CSS and reusable component primitives.

## High-Level Architecture

- `src/app/layout.tsx`: Root layout that wraps all pages with `DataProvider` and global UI state.
- `src/context/data-context.tsx`: Central client-side state provider for dashboard charts, cases, transactions, graph nodes, and edges.
- `src/lib/mock-data.ts`: Static mock data used across the dashboard, graph, and SAR workflows.
- `src/ai/genkit.ts`: Genkit AI client configuration using `googleAI`.
- `src/ai/flows/`: Server-side Genkit flows for AI-assisted use cases.
- `src/components/`: UI building blocks and page shells, including navigation, cards, chat interface, graph visualization, and form controls.

## Core Functional Areas

### 1. Live Signals Dashboard
- Entry page: `src/app/page.tsx`
- Components:
  - `DashboardShell` for consistent page layout and navigation
  - `RiskCard` for summary metrics
  - `TransactionStream` for live transaction logs
  - Recharts `AreaChart` for risk and anomaly trend visualization
- Data comes from `useAppData()` via `DataProvider` and `mock-data.ts`.

### 2. Graph Intelligence Hub
- Page: `src/app/graph/page.tsx`
- Components:
  - `NetworkVis` for interactive graph visualization
  - AI-driven investigation controls for timeline replay and autonomous agent execution
- Integrates `generateInvestigationCase()` from `src/ai/flows/autonomous-investigation-case-generation.ts`
- Uses client-side state and toast notifications to manage asynchronous workflows.

### 3. Compliance Copilot
- Page: `src/app/copilot/page.tsx`
- Components:
  - `ChatInterface` for user-agent conversation
- AI flow: `src/ai/flows/compliance-copilot-query.ts` (not fully read, but used by chat)
- Sends natural language queries to the AI backend and renders assistant responses with risk insights.

### 4. SAR Generation Engine
- Page: `src/app/sar/page.tsx`
- AI flow: `src/ai/flows/sar-generation-and-summary.ts`
- Uses form input and AI prompt orchestration to generate regulatory-style SAR narratives and investigation summaries.
- Supports copy, PDF export, and text export workflows.

## AI Integration

### AI Stack
- `src/ai/genkit.ts`: Configures `genkit` with the `googleAI` plugin and model `googleai/gemini-2.5-flash`.
- AI flows are defined with typed `zod` schemas and server-only logic.

### Key AI Flows
- `autonomous-investigation-case-generation.ts`: Generates an investigation case from suspicious transaction details.
- `sar-generation-and-summary.ts`: Builds a SAR narrative and investigation summary from evidence and graph insights.
- `compliance-copilot-query.ts`: Handles natural language question answering for the copilot chat.

## Data Flow

1. User opens the app in the browser.
2. `src/app/layout.tsx` loads and initializes `DataProvider`.
3. `DataProvider` reads data from `localStorage` or falls back to `DEFAULT_DATA` from `mock-data.ts`.
4. Page components use `useAppData()` to render dashboard cards, graph nodes, edges, and case records.
5. User actions trigger UI events:
   - graph timeline replay and export
   - autonomous agent invocation
   - chat messages to the copilot
   - SAR generation form submission
6. AI flows execute on the server (`'use server'` files) and return structured outputs.
7. The UI displays AI results, then optionally persists user graph/data state back to `localStorage`.

## Component & Page Layout

- `src/components/dashboard/shell.tsx`: Primary page shell with sidebar navigation, responsive behavior, and top header.
- `src/components/copilot/chat-interface.tsx`: Conversational chat UI with message history and input handling.
- `src/components/graph/network-vis.tsx`: Graph rendering component for nodes and edges.
- `src/components/ui/`: Shared UI primitives such as buttons, cards, loaders, selects, dialogs, toasts, and more.

## Styling

- Uses Tailwind CSS configured through `tailwind.config.ts`.
- Global CSS in `src/app/globals.css`.
- Dark theme styling with glassmorphism and neon accent design.
- Custom font imports are added in `layout.tsx` for `Space Grotesk`, `Inter`, and `Source Code Pro`.

## Deployment & Runtime Notes

- Next.js App Router is used, with `page.tsx` files representing routes: `/`, `/graph`, `/copilot`, `/sar`, `/cases`, and `/settings`.
- AI flows are server actions (`'use server'`), so they run on the backend while UI components remain client-driven.
- Data is primarily mock/static, making the current implementation a prototype or demo-ready architecture rather than production-grade backend integration.

## Architecture Diagram

```mermaid
flowchart TD
  Browser[User Browser]
  subgraph NextJS[Next.js App Router]
    Layout[RootLayout<br/>src/app/layout.tsx]
    DataProvider[DataProvider<br/>src/context/data-context.tsx]
    Dashboard[/ (Dashboard)]
    Graph[/graph (Graph Hub)]
    Copilot[/copilot (Copilot)]
    SAR[/sar (SAR Engine)]
  end

  subgraph UI_Components[UI Components]
    Shell[DashboardShell]
    Chat[ChatInterface]
    NetworkVis[NetworkVis]
    Cards[RiskCard / TransactionStream]
  end

  subgraph Data[Data Layer]
    MockData[Mock Data<br/>src/lib/mock-data.ts]
    localStorage[LocalStorage]
  end

  subgraph AI[AI Layer]
    Genkit[Genkit AI<br/>src/ai/genkit.ts]
    Investigation[Autonomous Investigation Flow]
    SARFlow[SAR Generation Flow]
    CopilotFlow[Copilot Query Flow]
  end

  Browser --> Layout
  Layout --> DataProvider
  DataProvider --> MockData
  DataProvider --> localStorage
  Layout --> Dashboard
  Layout --> Graph
  Layout --> Copilot
  Layout --> SAR

  Dashboard --> Shell
  Graph --> Shell
  Copilot --> Shell
  SAR --> Shell
  Dashboard --> Cards
  Graph --> NetworkVis
  Copilot --> Chat

  Graph --> Investigation
  SAR --> SARFlow
  Copilot --> CopilotFlow
  Investigation --> Genkit
  SARFlow --> Genkit
  CopilotFlow --> Genkit
```

## Summary
Vyraxis Intelligence is a modular Next.js prototype centered on AI-assisted financial crime investigation. The architecture keeps the UI decoupled from AI workflows by using a shared data provider and server-side Genkit flows, while the app shell and component library provide consistent navigation, responsive layout, and specialized investigation views.

This document is intentionally written as a standalone architecture summary for developers and stakeholders who need to understand how the app is organized and how its major systems interact.