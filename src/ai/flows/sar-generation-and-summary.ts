'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating a draft Suspicious Activity Report (SAR)
 * and a comprehensive investigation summary based on provided evidence, AI findings, and regulatory context.
 *
 * - sarGenerationAndSummary - A function that handles the SAR and summary generation process.
 * - SARGenerationAndSummaryInput - The input type for the sarGenerationAndSummary function.
 * - SARGenerationAndSummaryOutput - The return type for the sarGenerationAndSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const SARGenerationAndSummaryInputSchema = z.object({
  caseId: z.string().describe('The unique identifier for the investigation case.').optional(),
  investigationDetails: z.string().describe('A summary of the core investigation details, including entities involved, dates, and transaction amounts.'),
  aiFindings: z.array(z.string()).describe('A list of key findings and insights from AI analysis, such as anomaly detection, behavioral patterns, and risk assessments.'),
  graphInsights: z.string().describe('Detailed insights derived from graph intelligence, identifying complex relationships, money flow patterns, and suspicious clusters.'),
  regulatoryContext: z.string().describe('Relevant regulatory guidelines, thresholds, or specific regulations pertaining to the suspicious activity.'),
  evidenceSummary: z.string().describe('A comprehensive summary of all collected transactional and behavioral evidence supporting the investigation.'),
});
export type SARGenerationAndSummaryInput = z.infer<typeof SARGenerationAndSummaryInputSchema>;

// Output Schema
const SARGenerationAndSummaryOutputSchema = z.object({
  sarNarrative: z.string().describe('The generated draft narrative for the Suspicious Activity Report (SAR). This should be detailed, factual, and compliant with regulatory reporting standards.'),
  investigationSummary: z.string().describe('A comprehensive summary of the investigation, including key findings, identified suspicious behavior, and recommended actions.'),
});
export type SARGenerationAndSummaryOutput = z.infer<typeof SARGenerationAndSummaryOutputSchema>;

// Wrapper function
export async function sarGenerationAndSummary(
  input: SARGenerationAndSummaryInput
): Promise<SARGenerationAndSummaryOutput> {
  return sarGenerationAndSummaryFlow(input);
}

// Prompt definition
const sarGenerationPrompt = ai.definePrompt({
  name: 'sarGenerationPrompt',
  input: {schema: SARGenerationAndSummaryInputSchema},
  output: {schema: SARGenerationAndSummaryOutputSchema},
  prompt: `You are an expert AI compliance analyst assistant. Your task is to generate a comprehensive Suspicious Activity Report (SAR) narrative and an investigation summary based on the provided investigation details, AI findings, graph intelligence, regulatory context, and evidence.

Ensure the output is factual, objective, detailed, and directly references the provided information. The SAR narrative should be suitable for regulatory submission, focusing on the "who, what, when, where, why, and how" of the suspicious activity. The investigation summary should provide a concise overview of the case, the suspicious behavior identified, and the conclusion.

---
{{#if caseId}}Investigation Case ID: {{{caseId}}}{{/if}}

Investigation Details:
{{{investigationDetails}}}

AI Findings:
{{#each aiFindings}}
- {{{this}}}
{{/each}}

Graph Insights:
{{{graphInsights}}}

Regulatory Context:
{{{regulatoryContext}}}

Evidence Summary:
{{{evidenceSummary}}}
---

Based on the information above, generate the SAR Narrative and Investigation Summary.

SAR Narrative:
[Provide a detailed, chronological, and factual narrative for the SAR. Clearly describe the suspicious activity, the parties involved, the method, and the financial instruments used. Explain why the activity is considered suspicious, referencing AI findings and graph insights. Maintain a formal and objective tone suitable for regulatory submission.]

Investigation Summary:
[Provide a concise yet comprehensive summary of the investigation. Include the key suspicious behaviors identified, the AI-driven insights, the final assessment of the risk, and any recommended next steps or actions.]`,
});

// Flow definition
const sarGenerationAndSummaryFlow = ai.defineFlow(
  {
    name: 'sarGenerationAndSummaryFlow',
    inputSchema: SARGenerationAndSummaryInputSchema,
    outputSchema: SARGenerationAndSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await sarGenerationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate SAR narrative and investigation summary.');
    }
    return output;
  }
);
