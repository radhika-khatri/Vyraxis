/**
 * @fileOverview Central repository for all mock data used across the Vyraxis Intelligence platform.
 */

export const CHART_DATA = [
  { time: '00:00', risk: 40, anomalies: 2 },
  { time: '04:00', risk: 30, anomalies: 1 },
  { time: '08:00', risk: 65, anomalies: 4 },
  { time: '12:00', risk: 90, anomalies: 8 },
  { time: '16:00', risk: 70, anomalies: 5 },
  { time: '20:00', risk: 45, anomalies: 3 },
  { time: '23:59', risk: 50, anomalies: 2 },
];

export const MOCK_CASES = [
  { id: "CASE-9381", title: "Potential Layering Cluster - SE Asia", status: "Under Review", priority: "High", analyst: "Sarah J.", updated: "12m ago", risk: 88 },
  { id: "CASE-9377", title: "High Velocity Cross-Border Activity", status: "Escalated", priority: "Critical", analyst: "Mark W.", updated: "1h ago", risk: 95 },
  { id: "CASE-9362", title: "Unusual Deposit Pattern: Node_091", status: "Draft", priority: "Medium", analyst: "Unassigned", updated: "3h ago", risk: 62 },
  { id: "CASE-9350", title: "Shell Entity Investigation: Vertex Ltd", status: "Regulatory Filing", priority: "High", analyst: "Elena R.", updated: "1d ago", risk: 82 },
  { id: "CASE-9344", title: "Account Takeover Suspicion: User_99", status: "Cleared", priority: "Low", analyst: "Sarah J.", updated: "2d ago", risk: 14 },
];

export const INITIAL_TRANSACTIONS = [
  { id: "tx_9381", type: "inbound", entity: "Global Capital Corp", amount: "$45,200.00", status: "monitored", risk: 24, timestamp: "Just now" },
  { id: "tx_9380", type: "outbound", entity: "Wallet: 0x82...12a", amount: "$12,000.00", status: "flagged", risk: 88, timestamp: "2m ago" },
  { id: "tx_9379", type: "outbound", entity: "HSBC Settlement", amount: "$150,000.00", status: "verified", risk: 12, timestamp: "5m ago" },
  { id: "tx_9378", type: "inbound", entity: "Shell Co Ltd", amount: "$8,500.00", status: "flagged", risk: 92, timestamp: "12m ago" },
  { id: "tx_9377", type: "inbound", entity: "Retail Deposit", amount: "$2,400.00", status: "verified", risk: 5, timestamp: "15m ago" },
];

export const MOCK_NODES = [
  { id: 1, label: "Target Account", x: 400, y: 300, type: "target", risk: 92 },
  { id: 2, label: "Offshore Shell A", x: 250, y: 150, type: "suspicious", risk: 78 },
  { id: 3, label: "Offshore Shell B", x: 550, y: 150, type: "suspicious", risk: 85 },
  { id: 4, label: "Crypto Mixer X", x: 400, y: 100, type: "suspicious", risk: 95 },
  { id: 5, label: "Legit Retailer", x: 200, y: 450, type: "safe", risk: 5 },
  { id: 6, label: "Internal Transfer", x: 600, y: 450, type: "safe", risk: 12 },
];

export const MOCK_EDGES = [
  { from: 2, to: 1, amount: "$450k", color: "destructive" },
  { from: 3, to: 1, amount: "$210k", color: "destructive" },
  { from: 4, to: 2, amount: "$1.2M", color: "destructive" },
  { from: 4, to: 3, amount: "$800k", color: "destructive" },
  { from: 1, to: 5, amount: "$5k", color: "muted" },
  { from: 1, to: 6, amount: "$12k", color: "muted" },
];

export const INITIAL_SAR_FORM_DATA = {
  caseId: "CASE-9381",
  investigationDetails: "Suspicious series of high-value inbound transfers from shell entities in high-risk jurisdictions followed by immediate redistribution to private crypto wallets.",
  aiFindings: "Anomalous velocity detected (800% above baseline). Behavioral pattern matches known 'layering' typology. Entity Node_X71 linked to 3 previous investigations.",
  graphInsights: "Cluster analysis reveals a circular flow of funds. 4-hop path detected between origin entity and sanctioned nodes. 14 linked accounts identified.",
  regulatoryContext: "FinCEN Rule 31 CFR § 1010.320. Threshold exceeded ($2,000 for money transmitters). Suspicious activity involves possible money laundering.",
  externalDocs: "14 transaction logs (CSV), 1 graph snapshot (PNG), KYC verification failure for beneficiary 0x82...12a.",
  evidenceSummary: "Aggregated transaction logs and graph node snapshots confirming multi-hop circular flows."
};
