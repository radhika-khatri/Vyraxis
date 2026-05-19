'use server';
/**
 * @fileOverview A conversational AI copilot flow for compliance analysts.
 *
 * - complianceCopilotQuery - A function that handles natural language queries about compliance data.
 * - ComplianceCopilotQueryInput - The input type for the complianceCopilotQuery function.
 * - ComplianceCopilotQueryOutput - The return type for the complianceCopilotQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ComplianceCopilotQueryInputSchema = z.object({
  query: z.string().describe('The natural language query from the compliance analyst.'),
  context: z.object({
    cases: z.array(z.object({
      id: z.string(),
      title: z.string(),
      risk: z.number(),
      status: z.string(),
      analyst: z.string(),
    })).optional().describe('Relevant investigation cases from the system.'),
    nodes: z.array(z.object({
      id: z.number(),
      label: z.string(),
      risk: z.number(),
      type: z.string(),
    })).optional().describe('Graph entities and their risk scores.'),
    transactions: z.array(z.object({
      id: z.string(),
      entity: z.string(),
      amount: z.string(),
      risk: z.number(),
      status: z.string(),
    })).optional().describe('Recent transactions from the system.'),
  }).optional().describe('App context data to ground answers in real system data.'),
});
export type ComplianceCopilotQueryInput = z.infer<typeof ComplianceCopilotQueryInputSchema>;

const ComplianceCopilotQueryOutputSchema = z.object({
  answer: z.string().describe('A concise, evidence-backed answer to the query.'),
  graphReferences: z.array(
    z.object({
      entityId: z.string().optional().describe('The ID of a referenced entity (e.g., account, transaction).'),
      relationshipType: z.string().optional().describe('The type of relationship in the graph (e.g., "transferred_to", "beneficiary_of").'),
      pathDescription: z.string().optional().describe('A natural language description of a relevant path or cluster in the graph.'),
    })
  ).optional().describe('Structured references to relevant graph data points or patterns.'),
  riskScore: z.object({
    score: z.number().describe('A numerical risk score associated with the queried entity or activity.'),
    explanation: z.string().describe('An explanation of how the risk score was derived.'),
    trend: z.enum(['increasing', 'decreasing', 'stable']).optional().describe('The recent trend of the risk score.'),
  }).optional().describe('Details about the risk score of the queried entity or activity.'),
});
export type ComplianceCopilotQueryOutput = z.infer<typeof ComplianceCopilotQueryOutputSchema>;

export async function complianceCopilotQuery(input: ComplianceCopilotQueryInput): Promise<ComplianceCopilotQueryOutput> {
  return complianceCopilotQueryFlow(input);
}

const complianceCopilotQueryPrompt = ai.definePrompt({
  name: 'complianceCopilotQueryPrompt',
  input: {schema: ComplianceCopilotQueryInputSchema},
  output: {schema: ComplianceCopilotQueryOutputSchema},
  prompt: `You are an advanced AI Compliance Copilot, designed to assist compliance analysts in investigating potential financial crimes.
You have access to a sophisticated graph intelligence platform that tracks entities, accounts, transactions, and their relationships, along with real-time risk scoring engines.

IMPORTANT: Answer based on the provided system data. Reference specific case IDs, entity names, risk scores, and transaction amounts from the data. 
Explain findings in simple, plain English. Always cite the data you're referencing.

{{#if context}}
CURRENT SYSTEM DATA:
{{#if context.cases}}
Investigation Cases:
{{#each context.cases}}
- {{{this.id}}}: {{{this.title}}} (Risk: {{{this.risk}}}%, Status: {{{this.status}}}, Analyst: {{{this.analyst}}})
{{/each}}
{{/if}}

{{#if context.nodes}}
Graph Entities:
{{#each context.nodes}}
- {{{this.label}}} (ID: {{{this.id}}}, Risk Score: {{{this.risk}}}%, Type: {{{this.type}}})
{{/each}}
{{/if}}

{{#if context.transactions}}
Recent Transactions:
{{#each context.transactions}}
- {{{this.id}}}: {{{this.entity}}} → {{{this.amount}}} (Risk: {{{this.risk}}}%, Status: {{{this.status}}})
{{/each}}
{{/if}}
{{/if}}

Analyst's Query: {{{query}}}

If the question is only loosely related to the provided data or is out of context, use your compliance knowledge and Gemini-style reasoning to give a helpful, practical answer. Explain any data limitations clearly, and if the system data does not directly support a conclusion, say so while still offering the next best investigative steps.

Provide a direct, simple answer grounded in the data above whenever possible. Cite specific entities, amounts, and risk scores from the data when relevant.`,
});

const complianceCopilotQueryFlow = ai.defineFlow(
  {
    name: 'complianceCopilotQueryFlow',
    inputSchema: ComplianceCopilotQueryInputSchema,
    outputSchema: ComplianceCopilotQueryOutputSchema,
  },
  async input => {
    const {output} = await complianceCopilotQueryPrompt(input);
    if (!output) {
      throw new Error('Failed to get a response from the compliance copilot.');
    }
    return output;
  }
);
