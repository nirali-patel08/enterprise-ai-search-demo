export type DeploymentType = 'cloud' | 'opensource'

export type Connector = {
  id: string
  name: string
  description: string
  auth: string
  deployment: DeploymentType
}

export type SavedConnector = {
  id: string
  connectorTypeId: string
  name: string
  deployment: DeploymentType
  validated: boolean
  savedAt: string
  status: 'connected' | 'pending' | 'indexing' | 'indexed'
  documentCount?: number
}

export type MarketplaceAgent = {
  id: string
  name: string
  version: number
  type: 'prompt' | 'workflow' | 'external'
  createdOn: string
  description: string
  model?: string
  instructions?: string
  searchIndex?: string
  selected?: boolean
}

export type OrchestrationOption = {
  id: string
  name: string
  deployment: DeploymentType | 'both'
  description: string
  diagram: string[]
}

export type Channel = {
  id: string
  name: string
  description: string
}

export const STEPS = [
  { id: 1, label: 'Deployment', description: 'Cloud or open source' },
  { id: 2, label: 'Connectors', description: 'Configure and save sources' },
  { id: 3, label: 'Indexing', description: 'Select sources and index' },
  { id: 4, label: 'AI Agents', description: 'Add agents from marketplace' },
  { id: 5, label: 'Orchestration', description: 'Multi-agent routing' },
  { id: 6, label: 'Test', description: 'Validate before deploy' },
  { id: 7, label: 'Deploy', description: 'Publish to channels' },
] as const

export const CLOUD_CONNECTORS: Connector[] = [
  { id: 'sharepoint', name: 'SharePoint', description: 'Microsoft 365 documents and libraries', auth: 'Microsoft Graph / Entra ID', deployment: 'cloud' },
  { id: 'azure-blob', name: 'Azure Blob Storage', description: 'Azure document and file storage', auth: 'Storage account / SAS', deployment: 'cloud' },
  { id: 'azure-sql', name: 'Azure SQL Database', description: 'Structured enterprise data', auth: 'SQL connection string', deployment: 'cloud' },
  { id: 'onelake', name: 'OneLake / Data Lake', description: 'Unified analytics data lake', auth: 'Azure AD', deployment: 'cloud' },
  { id: 'teams-files', name: 'Microsoft Teams Files', description: 'Files shared in Teams channels', auth: 'Microsoft Graph', deployment: 'cloud' },
  { id: 'rest-api', name: 'REST API', description: 'Custom API endpoints', auth: 'API key / OAuth', deployment: 'cloud' },
  { id: 'file-upload', name: 'File Upload', description: 'Manual document upload', auth: 'Local upload', deployment: 'cloud' },
]

export const OPENSOURCE_CONNECTORS: Connector[] = [
  { id: 'local-fs', name: 'Local File System', description: 'On-premise file folders', auth: 'File path', deployment: 'opensource' },
  { id: 's3-minio', name: 'S3 / MinIO', description: 'Object storage', auth: 'Access keys / IAM', deployment: 'opensource' },
  { id: 'postgresql', name: 'PostgreSQL', description: 'Relational database', auth: 'Connection string', deployment: 'opensource' },
  { id: 'mongodb', name: 'MongoDB', description: 'Document database', auth: 'Connection URI', deployment: 'opensource' },
  { id: 'confluence', name: 'Confluence', description: 'Wiki and knowledge pages', auth: 'API token', deployment: 'opensource' },
  { id: 'jira', name: 'Jira', description: 'Issues and project data', auth: 'API token', deployment: 'opensource' },
  { id: 'rest-api-os', name: 'REST API', description: 'Custom API endpoints', auth: 'API key / OAuth', deployment: 'opensource' },
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
  ],
  'azure-sql': [
    { label: 'Server', value: 'sql-prod.database.windows.net' },
    { label: 'Database', value: 'EnterpriseKnowledge' },
  ],
  onelake: [{ label: 'Workspace', value: 'enterprise-analytics' }, { label: 'Lakehouse', value: 'knowledge-lake' }],
  'teams-files': [{ label: 'Team ID', value: 'a1b2c3d4-e5f6' }, { label: 'Channel', value: 'General' }],
  'rest-api': [{ label: 'Endpoint', value: 'https://api.contoso.com/v1/docs' }, { label: 'Auth', value: 'OAuth 2.0' }],
  'file-upload': [{ label: 'Max Size (MB)', value: '50' }, { label: 'Types', value: 'PDF, DOCX, XLSX' }],
  'local-fs': [{ label: 'Root Path', value: '/data/enterprise-docs' }],
  's3-minio': [{ label: 'Bucket', value: 'corp-knowledge' }, { label: 'Endpoint', value: 'https://minio.contoso.local' }],
  postgresql: [{ label: 'Host', value: 'pg-prod.contoso.internal' }, { label: 'Database', value: 'knowledge' }],
  mongodb: [{ label: 'URI', value: 'mongodb://mongo-prod:27017/knowledge' }],
  confluence: [{ label: 'Base URL', value: 'https://contoso.atlassian.net/wiki' }],
  jira: [{ label: 'Base URL', value: 'https://contoso.atlassian.net' }],
  'rest-api-os': [{ label: 'Endpoint', value: 'https://api.contoso.com/v1/docs' }],
}

export const SAMPLE_SAVED_CONNECTORS: SavedConnector[] = [
  {
    id: 'conn-1',
    connectorTypeId: 'sharepoint',
    name: 'SharePoint — Knowledge Hub',
    deployment: 'cloud',
    validated: true,
    savedAt: '7/3/26, 2:15 PM',
    status: 'indexed',
    documentCount: 4820,
  },
  {
    id: 'conn-2',
    connectorTypeId: 'azure-blob',
    name: 'Azure Blob — Finance Docs',
    deployment: 'cloud',
    validated: true,
    savedAt: '7/4/26, 10:30 AM',
    status: 'connected',
  },
]

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  { id: 'postgres-agent', name: 'postgres-agent', version: 7, type: 'prompt', createdOn: '7/3/26, 3:17 PM', description: 'Answers questions from PostgreSQL enterprise data.', model: 'gpt-4o-mini', searchIndex: 'postgres-index' },
  { id: 'sharepoint-agent', name: 'Sharepoint-agent', version: 3, type: 'prompt', createdOn: '7/2/26, 11:00 AM', description: 'Searches SharePoint document libraries and pages.', model: 'gpt-4o-mini', searchIndex: 'sharepoint-index' },
  { id: 'byod-agent', name: 'BYOD-agent', version: 4, type: 'prompt', createdOn: '6/28/26, 4:45 PM', description: 'Bring-your-own-data search across uploaded files.', model: 'gpt-4o-mini', searchIndex: 'byod-index' },
  { id: 'engineering-table-agent', name: 'Engineering-Table-Agent', version: 5, type: 'prompt', createdOn: '6/25/26, 9:20 AM', description: 'Answers questions by interpreting engineering tables and specifications.', model: 'gpt-4o-mini', searchIndex: 'engineering-tables' },
  { id: 'engineering-drawing-agent', name: 'Engineering-Drawing-Agent', version: 4, type: 'prompt', createdOn: '6/29/26, 4:01 PM', description: 'Answers questions related to engineering drawings, diagrams, and assembly views.', model: 'gpt-4o-mini', searchIndex: 'byod-index', instructions: 'You are an Engineering Drawing and Diagram Expert. Answer questions related to engineering drawings, figures, diagrams, and layouts.' },
  { id: 'document-router-agent', name: 'Document-Router-Agent', version: 2, type: 'workflow', createdOn: '6/20/26, 1:10 PM', description: 'Routes document queries to the right specialized agent.', model: 'gpt-4o' },
  { id: 'technical-docs-agent', name: 'Technical-Documentation-Agent', version: 3, type: 'prompt', createdOn: '6/18/26, 8:55 AM', description: 'Handles technical documentation and SOP queries.', model: 'gpt-4o-mini', searchIndex: 'tech-docs-index' },
]

export const ORCHESTRATION_OPTIONS: OrchestrationOption[] = [
  {
    id: 'foundry-workflow',
    name: 'Microsoft Foundry Workflow Agent',
    deployment: 'cloud',
    description: 'Prompt agents → Workflow orchestrator → GPT model → Azure AI Search tool',
    diagram: ['Prompt Agents', 'Workflow Agent', 'GPT-4o / GPT-5', 'Azure AI Search'],
  },
  {
    id: 'langgraph-supervisor',
    name: 'LangGraph Supervisor',
    deployment: 'opensource',
    description: 'Specialized worker agents → LangGraph supervisor → LLM → OpenSearch tool',
    diagram: ['Worker Agents', 'LangGraph Supervisor', 'LLM of choice', 'OpenSearch'],
  },
  {
    id: 'hybrid-router',
    name: 'Hybrid Document Router',
    deployment: 'both',
    description: 'Document router agent coordinates domain specialists with shared memory.',
    diagram: ['Domain Agents', 'Router Agent', 'Shared State', 'Search Index'],
  },
]

export const CHANNELS: Channel[] = [
  { id: 'web', name: 'Web App', description: 'Enterprise search portal' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Teams bot experience' },
  { id: 'copilot', name: 'Copilot Studio', description: 'Copilot extension' },
  { id: 'api', name: 'REST API', description: 'Integrate with other apps' },
]

export const ACTION_MODES = ['Search', 'Ask', 'Summarize', 'Compare', 'Extract', 'Analyze'] as const

export const EXAMPLE_QUESTIONS = [
  'Show unpaid invoices related to contracts expiring next month',
  'Compare PO amount and invoice amount for vendor ABC',
  'What is the approval policy for high-value procurement?',
]

export const TEST_RESULT = {
  retrieval: { status: 'pass' as const, summary: '8 relevant chunks retrieved from SharePoint and invoice index.', score: '0.87' },
  routing: { status: 'pass' as const, summary: 'Workflow Agent routed to Contract Agent, PO Agent, and Invoice Agent.' },
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

There is a **$3,200 mismatch** between the PO and invoice.`

export function getConnectorsForDeployment(type: DeploymentType): Connector[] {
  return type === 'cloud' ? CLOUD_CONNECTORS : OPENSOURCE_CONNECTORS
}

export function getConnectorById(id: string): Connector | undefined {
  return [...CLOUD_CONNECTORS, ...OPENSOURCE_CONNECTORS].find((c) => c.id === id)
}

export function getPipelineStages(deployment: DeploymentType, connectorNames: string[], agentNames: string[], channelNames: string[]) {
  const indexLabel = deployment === 'cloud' ? 'Azure AI Search' : 'OpenSearch'
  const orchestrationLabel = deployment === 'cloud' ? 'Foundry Workflow' : 'LangGraph Supervisor'
  return [
    { title: 'Connected Sources', sub: `${connectorNames.length} configured`, pills: connectorNames, tone: 'info' as const },
    { title: 'Ingestion & Processing', sub: 'OCR, parsing, chunking', pills: ['Document Intelligence', 'ETL', 'Embeddings'], tone: 'info' as const },
    { title: 'Search Index', sub: 'Hybrid + vector + semantic', pills: [indexLabel], tone: 'success' as const },
    { title: 'AI Orchestration', sub: orchestrationLabel, pills: agentNames, tone: 'warning' as const },
    { title: 'Access Channels', sub: `${channelNames.length} enabled`, pills: channelNames, tone: 'gold' as const },
  ]
}
