import { config } from 'dotenv';
config();

import '@/ai/flows/autonomous-investigation-case-generation.ts';
import '@/ai/flows/sar-generation-and-summary.ts';
import '@/ai/flows/compliance-copilot-query.ts';