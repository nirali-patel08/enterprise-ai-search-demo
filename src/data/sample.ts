export type Connector = {
  id: string
  name: string
  description: string
  auth: string
  icon: string
  color: string
}

export type Channel = {
  id: string
  name: string
  description: string
  icon: string
}

export type Agent = {
  id: string
  name: string
  description: string
  required?: boolean
}

export const STEPS = [
  { id: 1, label: 'Data Sources', description: 'Connect enterprise data' },
  { id: 2, label: 'Configure & Index', description: 'Validate and index content' },
  { id: 3, label: 'Search Pipeline', description: 'Review processing flow' },
  { id: 4, label: 'AI Agents', description: 'Enable specialized agents' },
  { id: 5, label: 'Test & Validate', description: 'Admin test queries' },
  { id: 6, label: 'Deploy', description: 'Publish to channels' },
  { id: 7, label: 'End-User Chat', description: 'Production experience' },
] as const

export const CONNECTORS: Connector[] = [
  { id: 'sharepoint', name: 'SharePoint', description: 'Microsoft 365 documents: PDF, DOCX, PPTX, XLSX', auth: 'Microsoft Graph / Entra ID', icon: 'SP', color: 'bg-blue-600' },
  { id: 'azure-blob', name: 'Azure Blob', description: 'Azure document storage: files, images, archives', auth: 'Storage account key / SAS', icon: 'AB', color: 'bg-sky-600' },
  { id: 's3', name: 'Amazon S3', description: 'AWS object storage: files, images, reports', auth: 'IAM role / access keys', icon: 'S3', color: 'bg-orange-500' },
  { id: 'sql', name: 'Relational DB', description: 'SQL / RDS / PostgreSQL: tables, views, records', auth: 'SQL connection string', icon: 'DB', color: 'bg-violet-600' },
  { id: 'upload', name: 'Manual Upload', description: 'User-uploaded files: PDF, Word, Excel, images', auth: 'Local upload', icon: 'UP', color: 'bg-slate-600' },
  { id: 'web', name: 'Web / API', description: 'REST API / web content: JSON, HTML, payloads', auth: 'API key / OAuth', icon: 'API', color: 'bg-emerald-600' },
  { id: 'sap', name: 'SAP', description: 'ERP transactions: PO, invoice, vendor, GRN', auth: 'SAP connector', icon: 'SAP', color: 'bg-amber-600' },
  { id: 'salesforce', name: 'Salesforce', description: 'CRM knowledge: accounts, cases, notes', auth: 'OAuth 2.0', icon: 'SF', color: 'bg-cyan-600' },
]

export const CHANNELS: Channel[] = [
  { id: 'web', name: 'Web App', description: 'Enterprise search portal', icon: 'Monitor' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Teams bot experience', icon: 'MessageSquare' },
  { id: 'copilot', name: 'Copilot Studio', description: 'Copilot extension', icon: 'Bot' },
  { id: 'api', name: 'REST API', description: 'Integrate with other apps', icon: 'Link' },
]

export const AGENTS: Agent[] = [
  { id: 'orchestrator', name: 'Orchestrator', description: 'Routes user questions to the right specialized agents', required: true },
  { id: 'contract', name: 'Contract Agent', description: 'Handles clauses, risks, obligations, renewals and comparison' },
  { id: 'po', name: 'PO Agent', description: 'Handles purchase orders, approvals, delivery, GRN and vendor status' },
  { id: 'invoice', name: 'Invoice Agent', description: 'Handles invoices, payment status, duplicate checks and 3-way match' },
  { id: 'policy', name: 'Policy Agent', description: 'Handles policies, SOPs, compliance and approval rules' },
  { id: 'analytics', name: 'Analytics Agent', description: 'Generates insights, summaries, trends and operational analytics' },
]

export const ACTION_MODES = ['Search', 'Ask', 'Summarize', 'Compare', 'Extract', 'Analyze'] as const

export const EXAMPLE_QUESTIONS = [
  'Show unpaid invoices related to contracts expiring next month',
  'Compare PO amount and invoice amount for vendor ABC',
  'What is the approval policy for high-value procurement?',
]

export const CONNECTOR_CONFIG: Record<string, { label: string; value: string }[]> = {
  sharepoint: [
    { label: 'SharePoint Site URL', value: 'https://contoso.sharepoint.com/sites/knowledge' },
    { label: 'Document Library', value: 'Shared Documents' },
    { label: 'Permission Sync', value: 'Graph API permissions' },
  ],
  'azure-blob': [
    { label: 'Storage Account', value: 'corpsearchdata' },
    { label: 'Container', value: 'enterprise-docs' },
    { label: 'Path Prefix', value: 'finance/' },
  ],
  s3: [
    { label: 'Bucket Name', value: 'corp-knowledge-prod' },
    { label: 'Region', value: 'us-east-1' },
    { label: 'Prefix', value: 'procurement/' },
  ],
  sql: [
    { label: 'Host', value: 'sql-prod.contoso.internal' },
    { label: 'Database', value: 'EnterpriseKnowledge' },
    { label: 'Schema', value: 'dbo' },
  ],
  upload: [
    { label: 'Max File Size (MB)', value: '50' },
    { label: 'Allowed Types', value: 'PDF, DOCX, XLSX, PNG' },
  ],
  web: [
    { label: 'API Endpoint', value: 'https://api.contoso.com/v1/docs' },
    { label: 'Auth Type', value: 'OAuth 2.0 Client Credentials' },
  ],
  sap: [
    { label: 'SAP Host', value: 'sap.contoso.com' },
    { label: 'Client', value: '100' },
  ],
  salesforce: [
    { label: 'Instance URL', value: 'https://contoso.my.salesforce.com' },
    { label: 'Object Types', value: 'Account, Case, Knowledge' },
  ],
}

export const TEST_RESULT = {
  retrieval: {
    status: 'pass' as const,
    summary: '8 relevant chunks retrieved from SharePoint, S3, and invoice index.',
    score: '0.87',
  },
  routing: {
    status: 'pass' as const,
    summary: 'Orchestrator routed to Contract Agent, PO Agent, and Invoice Agent.',
  },
  citations: {
    status: 'pass' as const,
    sources: [
      { name: 'Contract_ABC_2024.pdf', detail: 'Page 12 — renewal clause' },
      { name: 'PO-88421.xlsx', detail: 'Row 14 — amount $42,000' },
      { name: 'INV-22019.pdf', detail: 'Total $45,200 — mismatch flagged' },
    ],
  },
  response: {
    status: 'review' as const,
    text: 'ABC Vendor has 3 active contracts. PO #88421 ($42,000) does not match Invoice #22019 ($45,200). Policy requires finance review for variances above $5,000.',
  },
}

export const CHAT_RESPONSE = `I found 3 documents related to **ABC Vendor**:

1. **Contract_ABC_2024.pdf** — Active through Dec 2026
2. **PO #88421** — $42,000 (approved)
3. **Invoice #22019** — $45,200 (pending payment)

There is a **$3,200 mismatch** between the PO and invoice. Per procurement policy, variances above $5,000 require finance review — this case is borderline and flagged for review.`

export const SIDEBAR_NAV = [
  'Dashboard',
  'AI Search Builder',
  'AI Chat',
  'Agent Marketplace',
  'Connectors',
  'Analytics',
  'Governance',
  'Admin',
]
