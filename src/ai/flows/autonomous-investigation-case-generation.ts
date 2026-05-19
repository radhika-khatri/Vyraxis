'use server';
/**
 * @fileOverview An AI Investigation Agent flow that autonomously generates a detailed investigation case
 * when an alert is triggered, including traced account relationships, explanations of suspicious behavior,
 * and a summary of initial findings.
 *
 * - generateInvestigationCase - A function that initiates the investigation case generation process.
 * - AutonomousInvestigationCaseGenerationInput - The input type for the generateInvestigationCase function.
 * - AutonomousInvestigationCaseGenerationOutput - The return type for the generateInvestigationCase function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutonomousInvestigationCaseGenerationInputSchema = z.object({
  alertId: z.string().describe('The unique identifier for the triggered alert.'),
  transactionDetails: z
    .string()
    .describe('Detailed JSON string of the suspicious transaction and related entities.'),
});
export type AutonomousInvestigationCaseGenerationInput = z.infer<
  typeof AutonomousInvestigationCaseGenerationInputSchema
>;

const AutonomousInvestigationCaseGenerationOutputSchema = z.object({
  caseId: z.string().describe('The unique identifier for the generated investigation case.'),
  summary: z.string().describe('A high-level summary of the investigation case.'),
  suspiciousBehaviorExplanation:
    z.string().describe('A detailed explanation of why the observed activity is suspicious.'),
  tracedAccountRelationships:
    z.string().describe('A textual description of the traced account relationships and their connections relevant to the suspicious activity, as if derived from a graph database.'),
  initialFindings: z.string().describe('Key initial findings from the investigation.'),
  recommendedActions: z.string().describe('Recommended next steps for the compliance analyst.'),
});
export type AutonomousInvestigationCaseGenerationOutput = z.infer<
  typeof AutonomousInvestigationCaseGenerationOutputSchema
>;

export async function generateInvestigationCase(
  input: AutonomousInvestigationCaseGenerationInput
): Promise<AutonomousInvestigationCaseGenerationOutput> {
  return autonomousInvestigationCaseGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autonomousInvestigationCaseGenerationPrompt',
  input: {schema: AutonomousInvestigationCaseGenerationInputSchema},
  output: {schema: AutonomousInvestigationCaseGenerationOutputSchema},
  prompt: `You are an Autonomous AI Compliance Investigator Agent. Your task is to analyze suspicious transaction details and automatically generate a detailed investigation case.

Based on the provided alert and transaction details, you need to:
1.  Identify and explain the suspicious behavior.
2.  Describe the traced account relationships that are part of this suspicious activity, simulating a multi-hop tracing through a graph database.
3.  Summarize the initial findings.
4.  Recommend immediate actions for the compliance analyst.

Generate a unique 'caseId' for this investigation. All outputs should be concise, analytical, and professional.

Alert ID: {{{alertId}}}
Suspicious Transaction Details: {{{transactionDetails}}}`,
});

const autonomousInvestigationCaseGenerationFlow = ai.defineFlow(
  {
    name: 'autonomousInvestigationCaseGenerationFlow',
    inputSchema: AutonomousInvestigationCaseGenerationInputSchema,
    outputSchema: AutonomousInvestigationCaseGenerationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate investigation case output.');
    }
    return output;
  }
);
