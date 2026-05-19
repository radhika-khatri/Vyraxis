'use server';
/**
 * @fileOverview Timeline replay analysis flow that generates simple explanations
 * of network structural changes and anomalies detected during historical reconstruction.
 *
 * - timelineReplayAnalysis - Analyzes graph data and generates simple explanations.
 * - TimelineReplayAnalysisInput - Input type for timeline analysis.
 * - TimelineReplayAnalysisOutput - Output type with explanation and recommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TimelineReplayAnalysisInputSchema = z.object({
  highRiskNodes: z.array(z.object({
    label: z.string(),
    risk: z.number(),
    type: z.string(),
  })).describe('High-risk entities detected in timeline.'),
  suspiciousEdges: z.array(z.object({
    from: z.number(),
    to: z.number(),
    amount: z.string(),
    color: z.string(),
  })).describe('Suspicious transactions or connections.'),
  totalNodesInGraph: z.number().describe('Total number of entities in the graph.'),
  totalEdgesInGraph: z.number().describe('Total number of connections in the graph.'),
});
export type TimelineReplayAnalysisInput = z.infer<typeof TimelineReplayAnalysisInputSchema>;

const TimelineReplayAnalysisOutputSchema = z.object({
  explanation: z.string().describe('Simple, plain-English explanation of what was found and why it matters.'),
  keyFindings: z.array(z.string()).describe('List of 2-3 key findings in simple terms.'),
  riskAssessment: z.string().describe('Simple explanation of whether this is normal or concerning.'),
  recommendations: z.string().describe('Suggested next steps for the analyst.'),
});
export type TimelineReplayAnalysisOutput = z.infer<typeof TimelineReplayAnalysisOutputSchema>;

export async function timelineReplayAnalysis(
  input: TimelineReplayAnalysisInput
): Promise<TimelineReplayAnalysisOutput> {
  return timelineReplayAnalysisFlow(input);
}

const timelineReplayAnalysisPrompt = ai.definePrompt({
  name: 'timelineReplayAnalysisPrompt',
  input: {schema: TimelineReplayAnalysisInputSchema},
  output: {schema: TimelineReplayAnalysisOutputSchema},
  prompt: `You are a financial crime analysis assistant. A compliance analyst has run a timeline replay on their network graph and you need to explain what was found in VERY SIMPLE terms.

The system has detected the following during the timeline reconstruction:

High-Risk Entities Found:
{{#each highRiskNodes}}
- {{{this.label}}} (Risk Score: {{{this.risk}}}%, Type: {{{this.type}}})
{{/each}}

Suspicious Connections Found:
- Total: {{suspiciousEdges.length}} suspicious transaction(s)
- Pattern: These are marked as high-risk in the dataset

Overall Graph Context:
- Total entities in network: {{totalNodesInGraph}}
- Total connections: {{totalEdgesInGraph}}

Now generate a SIMPLE explanation that:
1. Explains what was found in 1-2 sentences, using plain English
2. Explains WHY this matters (what does it suggest about money laundering or fraud?)
3. Lists 2-3 key findings
4. Gives a simple risk assessment (e.g., "This is normal activity" or "This shows signs of layering/structuring")
5. Suggests 1-2 simple next steps

Remember: Use simple language a non-technical person could understand. Reference the actual entity names and numbers.`,
});

const timelineReplayAnalysisFlow = ai.defineFlow(
  {
    name: 'timelineReplayAnalysisFlow',
    inputSchema: TimelineReplayAnalysisInputSchema,
    outputSchema: TimelineReplayAnalysisOutputSchema,
  },
  async input => {
    const {output} = await timelineReplayAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to generate timeline analysis explanation.');
    }
    return output;
  }
);
