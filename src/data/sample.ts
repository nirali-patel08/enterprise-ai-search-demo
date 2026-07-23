export type DeploymentType = 'cloud' | 'opensource'

export type Connector = {
  id: string
  name: string
  description: string
  auth: string
  deployment: DeploymentType
  category: 'Storage' | 'Databases'
}

export type SavedConnector = {
  id: string
  connectorTypeId: string
  name: string
  deployment: DeploymentType
  validated: boolean
  savedAt: string
  status: 'connected' | 'pending' | 'indexing' | 'indexed'
  detail?: string
  lastTestedAt?: string
  documentCount?: number
  selectedPaths?: string[]
  indexedPaths?: string[]
  lastIndexedAt?: string
}

export type SearchIndex = {
  id: string
  name: string
  deployment: DeploymentType
  createdVia: 'builder-indexing' | 'manual'
  connectorId?: string
  connectorName?: string
  documentCount: number
  sizeBytes?: number
  status: 'green' | 'yellow' | 'red'
  createdAt: string
}

export type WorkflowOrchestrator = {
  id: string
  name: string
  routingInstructions?: string
}

export type WorkflowAgentNode = {
  id: string
  agentId: string
  name: string
  description?: string
}

export type WorkflowDefinition = {
  orchestrator: WorkflowOrchestrator | null
  agents: WorkflowAgentNode[]
}

export const EMPTY_WORKFLOW: WorkflowDefinition = {
  orchestrator: null,
  agents: [],
}

export function buildIndexName(connectorName: string, connectorTypeId: string): string {
  const slug = connectorName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `structured-${slug || connectorTypeId}`
}

export function formatIndexSize(bytes?: number): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes}b`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}kb`
  return `${(bytes / (1024 * 1024)).toFixed(1)}mb`
}

export function getIndexCreatedViaLabel(createdVia: SearchIndex['createdVia']): string {
  return createdVia === 'builder-indexing' ? 'AI Search Builder' : 'Manual'
}

export type MarketplaceAgent = {
  id: string
  name: string
  version: number
  type: 'prompt' | 'workflow' | 'external'
  createdOn: string
  deployment?: DeploymentType
  /** @deprecated Use `deployment`. Kept for persisted custom agents. */
  createdVia?: DeploymentType | 'claude'
  description: string
  model?: string
  instructions?: string
  searchIndex?: string
  selected?: boolean
}

export function resolveAgentDeployment(agent: Pick<MarketplaceAgent, 'deployment' | 'createdVia'>): DeploymentType {
  if (agent.deployment) return agent.deployment
  if (agent.createdVia === 'opensource') return 'opensource'
  return 'cloud'
}

export function getAgentDeploymentLabel(deployment: DeploymentType): string {
  return deployment === 'cloud' ? 'Cloud' : 'Open source'
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
  { id: 2, label: 'Connectors', description: 'Select data sources' },
  { id: 3, label: 'Indexing', description: 'Browse, select scope, index' },
  { id: 4, label: 'AI Agents', description: 'Add agents from marketplace' },
  { id: 5, label: 'Orchestration', description: 'Arrange agents and test' },
] as const

export const CLOUD_CONNECTORS: Connector[] = [
  { id: 'sharepoint', name: 'Document Library', description: 'Enterprise documents and libraries', auth: 'OAuth / SSO', deployment: 'cloud', category: 'Storage' },
  { id: 'azure-blob', name: 'Object Storage', description: 'Cloud document and file storage', auth: 'Storage account / SAS', deployment: 'cloud', category: 'Storage' },
  { id: 'teams-files', name: 'Team Files', description: 'Files shared in team channels', auth: 'OAuth', deployment: 'cloud', category: 'Storage' },
  { id: 'file-upload', name: 'File Upload', description: 'Manual document upload', auth: 'Local upload', deployment: 'cloud', category: 'Storage' },
  { id: 'azure-sql', name: 'SQL Database', description: 'Structured enterprise data', auth: 'SQL connection string', deployment: 'cloud', category: 'Databases' },
  { id: 'onelake', name: 'Data Lake', description: 'Unified analytics data lake', auth: 'SSO', deployment: 'cloud', category: 'Databases' },
  { id: 'rest-api', name: 'REST API', description: 'Custom API endpoints', auth: 'API key / OAuth', deployment: 'cloud', category: 'Storage' },
]

export const OPENSOURCE_CONNECTORS: Connector[] = [
  { id: 'local-fs', name: 'Local File System', description: 'On-premise file folders', auth: 'File path', deployment: 'opensource', category: 'Storage' },
  { id: 's3-minio', name: 'S3 / MinIO', description: 'Object storage', auth: 'Access keys / IAM', deployment: 'opensource', category: 'Storage' },
  { id: 'postgresql', name: 'PostgreSQL', description: 'Relational database', auth: 'Connection string', deployment: 'opensource', category: 'Databases' },
  { id: 'mongodb', name: 'MongoDB', description: 'Document database', auth: 'Connection URI', deployment: 'opensource', category: 'Databases' },
  { id: 'confluence', name: 'Confluence', description: 'Wiki and knowledge pages', auth: 'API token', deployment: 'opensource', category: 'Storage' },
  { id: 'jira', name: 'Jira', description: 'Issues and project data', auth: 'API token', deployment: 'opensource', category: 'Storage' },
  { id: 'rest-api-os', name: 'REST API', description: 'Custom API endpoints', auth: 'API key / OAuth', deployment: 'opensource', category: 'Storage' },
]

export const CONNECTOR_CONFIG: Record<string, { label: string; value: string }[]> = {
  sharepoint: [
    { label: 'Library URL', value: 'https://docs.contoso.com/sites/knowledge' },
    { label: 'Document Library', value: 'Shared Documents' },
    { label: 'Permission Sync', value: 'API permissions' },
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
  's3-minio': [
    { label: 'Bucket', value: 'corp-knowledge' },
    { label: 'Endpoint', value: 'https://minio.contoso.local' },
    { label: 'Access key', value: 'AKIA••••••••EXAMPLE' },
    { label: 'Secret key', value: '••••••••••••••••••••' },
  ],
  postgresql: [{ label: 'Host', value: 'pg-prod.contoso.internal' }, { label: 'Database', value: 'knowledge' }],
  mongodb: [{ label: 'URI', value: 'mongodb://mongo-prod:27017/knowledge' }],
  confluence: [{ label: 'Base URL', value: 'https://contoso.atlassian.net/wiki' }],
  jira: [{ label: 'Base URL', value: 'https://contoso.atlassian.net' }],
  'rest-api-os': [{ label: 'Endpoint', value: 'https://api.contoso.com/v1/docs' }],
}

export const SAMPLE_SEARCH_INDEXES: SearchIndex[] = [
  {
    id: 'idx-conn-1',
    name: 'structured-corp-intranet',
    deployment: 'cloud',
    createdVia: 'builder-indexing',
    connectorId: 'conn-1',
    connectorName: 'Corp intranet',
    documentCount: 4820,
    sizeBytes: 535142,
    status: 'yellow',
    createdAt: '7/5/26, 9:00 AM',
  },
]

export const SAMPLE_SAVED_CONNECTORS: SavedConnector[] = [
  {
    id: 'conn-1',
    connectorTypeId: 'sharepoint',
    name: 'Corp intranet',
    deployment: 'cloud',
    validated: true,
    savedAt: '7/3/26, 2:15 PM',
    detail: 'docs.contoso.com/sites/knowledge',
    lastTestedAt: '7/3/26, 2:14 PM',
    status: 'indexed',
    documentCount: 4820,
    selectedPaths: ['/sites/knowledge/Shared Documents/Contracts', '/sites/knowledge/Shared Documents/Finance'],
    indexedPaths: ['/sites/knowledge/Shared Documents/Contracts', '/sites/knowledge/Shared Documents/Finance'],
    lastIndexedAt: '7/5/26, 9:00 AM',
  },
  {
    id: 'conn-2',
    connectorTypeId: 'azure-blob',
    name: 'Finance archives',
    deployment: 'cloud',
    validated: true,
    savedAt: '7/4/26, 10:30 AM',
    detail: 'corpsearchdata / enterprise-docs',
    lastTestedAt: '7/4/26, 10:28 AM',
    status: 'connected',
  },
  {
    id: 'conn-3',
    connectorTypeId: 'azure-sql',
    name: 'EnterpriseKnowledge',
    deployment: 'cloud',
    validated: true,
    savedAt: '7/5/26, 9:12 AM',
    detail: 'sql-prod.database.windows.net',
    lastTestedAt: '7/5/26, 9:10 AM',
    status: 'connected',
  },
  {
    id: 'conn-4',
    connectorTypeId: 'postgresql',
    name: 'orders_prod_db',
    deployment: 'opensource',
    validated: true,
    savedAt: '7/6/26, 11:02 AM',
    detail: 'pg-prod.contoso.internal / knowledge',
    lastTestedAt: '7/6/26, 11:00 AM',
    status: 'connected',
  },
  {
    id: 'conn-5',
    connectorTypeId: 'mongodb',
    name: 'docs_cluster',
    deployment: 'opensource',
    validated: true,
    savedAt: '7/6/26, 11:20 AM',
    detail: 'mongo-prod:27017 / knowledge',
    lastTestedAt: '7/6/26, 11:18 AM',
    status: 'connected',
  },
]

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  { id: 'postgres-agent', name: 'postgres-agent', version: 7, type: 'prompt', createdOn: '7/3/26, 3:17 PM', deployment: 'opensource', description: 'Answers questions from PostgreSQL enterprise data.', model: 'gpt-4o-mini', searchIndex: 'postgres-index' },
  { id: 'sharepoint-agent', name: 'Document-Library-Agent', version: 3, type: 'prompt', createdOn: '7/2/26, 11:00 AM', deployment: 'cloud', description: 'Searches document libraries and knowledge pages.', model: 'gpt-4o-mini', searchIndex: 'document-library-index' },
  { id: 'byod-agent', name: 'BYOD-agent', version: 4, type: 'prompt', createdOn: '6/28/26, 4:45 PM', deployment: 'cloud', description: 'Bring-your-own-data search across uploaded files.', model: 'gpt-4o-mini', searchIndex: 'byod-index' },
  { id: 'engineering-table-agent', name: 'Engineering-Table-Agent', version: 5, type: 'prompt', createdOn: '6/25/26, 9:20 AM', deployment: 'opensource', description: 'Answers questions by interpreting engineering tables and specifications.', model: 'gpt-4o-mini', searchIndex: 'engineering-tables' },
  { id: 'engineering-drawing-agent', name: 'Engineering-Drawing-Agent', version: 4, type: 'prompt', createdOn: '6/29/26, 4:01 PM', deployment: 'cloud', description: 'Answers questions related to engineering drawings, diagrams, and assembly views.', model: 'gpt-4o-mini', searchIndex: 'byod-index', instructions: 'You are an Engineering Drawing and Diagram Expert. Answer questions related to engineering drawings, figures, diagrams, and layouts.' },
  { id: 'document-router-agent', name: 'Document-Router-Agent', version: 2, type: 'workflow', createdOn: '6/20/26, 1:10 PM', deployment: 'cloud', description: 'Routes document queries to the right specialized agent.', model: 'gpt-4o' },
  { id: 'technical-docs-agent', name: 'Technical-Documentation-Agent', version: 3, type: 'prompt', createdOn: '6/18/26, 8:55 AM', deployment: 'opensource', description: 'Handles technical documentation and SOP queries.', model: 'gpt-4o-mini', searchIndex: 'tech-docs-index' },
]

export const ORCHESTRATION_OPTIONS: OrchestrationOption[] = [
  {
    id: 'langgraph-supervisor',
    name: 'LangGraph Supervisor',
    deployment: 'both',
    description: 'Specialized worker agents → LangGraph supervisor → LLM → Search tool',
    diagram: ['Worker Agents', 'LangGraph Supervisor', 'LLM of choice', 'Search Index'],
  },
]

export type OrchScope = 'Contracts' | 'Finance' | 'Engineering' | 'Policies' | 'HR' | 'IT' | 'Legal'

export type OrchGraphNode = {
  id: string
  kind: 'query' | 'supervisor' | 'worker'
  agentId?: string
  label: string
  role: string
  sub?: string
  model?: string
  instructions?: string
  scopes: OrchScope[]
}

export type OrchTestScript = {
  domain: string
  query: string
  routedTo: string
  answer: string
  cites: string[]
}

export type OrchValidationRow = {
  agentId: string
  name: string
  retrieval: 'pass' | 'warn' | 'fail'
  citations: 'pass' | 'warn' | 'fail'
  routing: 'pass' | 'warn' | 'fail'
  scope: 'pass' | 'warn' | 'fail'
}

export const ORCH_SCOPES: OrchScope[] = ['Contracts', 'Finance', 'Engineering', 'Policies', 'HR', 'IT', 'Legal']

/** Default graph when marketplace agents are selected — Contoso enterprise search */
export const DEFAULT_ORCH_GRAPH: OrchGraphNode[] = [
  {
    id: 'query',
    kind: 'query',
    label: 'User query',
    role: 'Entry',
    scopes: [],
  },
  {
    id: 'supervisor',
    kind: 'supervisor',
    agentId: 'document-router-agent',
    label: 'Orchestrator',
    role: 'Supervisor node',
    model: 'gpt-4o',
    instructions:
      'Classify the request topic, call the matching specialist agent, then merge answers and preserve citations from enterprise search.',
    scopes: ['Contracts', 'Finance', 'Engineering', 'Policies'],
  },
  {
    id: 'sharepoint-agent',
    kind: 'worker',
    agentId: 'sharepoint-agent',
    label: 'Document Library agent',
    role: 'Worker node',
    sub: 'Corp intranet & policies',
    model: 'gpt-4o-mini',
    instructions:
      'Answer questions using document libraries only. Prefer Contracts and Policies folders. Always cite document title and path.',
    scopes: ['Contracts', 'Policies'],
  },
  {
    id: 'engineering-drawing-agent',
    kind: 'worker',
    agentId: 'engineering-drawing-agent',
    label: 'Engineering Drawing agent',
    role: 'Worker node',
    sub: 'Drawings & assemblies',
    model: 'gpt-4o-mini',
    instructions:
      'Answer questions about drawings, diagrams, and assemblies from the engineering index. Cite figure numbers when present.',
    scopes: ['Engineering'],
  },
  {
    id: 'engineering-table-agent',
    kind: 'worker',
    agentId: 'engineering-table-agent',
    label: 'Engineering Table agent',
    role: 'Worker node',
    sub: 'Specs & BOM tables',
    model: 'gpt-4o-mini',
    instructions:
      'Interpret engineering tables, BOMs, and specifications. Stay within Engineering-tagged documents.',
    scopes: ['Engineering'],
  },
  {
    id: 'byod-agent',
    kind: 'worker',
    agentId: 'byod-agent',
    label: 'Finance archives agent',
    role: 'Worker node',
    sub: 'Spend & invoices',
    model: 'gpt-4o-mini',
    instructions:
      'Answer spend, PO, and invoice questions from Finance archives. Flag PO–invoice mismatches above $5,000.',
    scopes: ['Finance'],
  },
]

export const ORCH_TEST_SCRIPTS: OrchTestScript[] = [
  {
    domain: 'Contracts',
    query: "Show ABC Vendor contracts expiring in the next 90 days and any open POs.",
    routedTo: 'Document Library agent',
    answer:
      'ABC Vendor has 2 contracts in Shared Documents/Contracts expiring by Oct 2026. PO-88421 ($42,000) is still open against Contract_ABC_2024.pdf.',
    cites: ['Contract_ABC_2024.pdf', 'PO-88421.xlsx'],
  },
  {
    domain: 'Finance',
    query: 'What was Q3 marketing spend versus budget?',
    routedTo: 'Finance archives agent',
    answer:
      'Q3 marketing spend was $2.4M — 8% under budget — mainly from lower paid-media costs in September per the Finance archives index.',
    cites: ['Q3 Finance Report.xlsx', 'Marketing_Budget_FY26.xlsx'],
  },
  {
    domain: 'Engineering',
    query: 'Which drawing shows the cooling-tower basin assembly for model CT-450?',
    routedTo: 'Engineering Drawing agent',
    answer:
      'Basin assembly for CT-450 is on drawing CT-450-ASM-12 (rev C). Related BOM rows for fasteners are in the engineering tables index.',
    cites: ['CT-450-ASM-12.pdf', 'CT-450_BOM.xlsx'],
  },
  {
    domain: 'Policies',
    query: "What's our current parental leave policy for primary caregivers?",
    routedTo: 'Document Library agent',
    answer:
      'Parental leave is 16 weeks paid for primary caregivers and 6 weeks for secondary caregivers, effective this fiscal year (HR Policy library).',
    cites: ['HR Policy.pdf §4.2'],
  },
]

export const ORCH_VALIDATION_ROWS: OrchValidationRow[] = [
  { agentId: 'sharepoint-agent', name: 'Document Library agent', retrieval: 'pass', citations: 'pass', routing: 'pass', scope: 'pass' },
  { agentId: 'byod-agent', name: 'Finance archives agent', retrieval: 'pass', citations: 'pass', routing: 'pass', scope: 'pass' },
  { agentId: 'engineering-drawing-agent', name: 'Engineering Drawing agent', retrieval: 'pass', citations: 'warn', routing: 'pass', scope: 'pass' },
  { agentId: 'engineering-table-agent', name: 'Engineering Table agent', retrieval: 'pass', citations: 'pass', routing: 'warn', scope: 'pass' },
]

export const CHANNELS: Channel[] = [
  { id: 'web', name: 'Web App', description: 'Enterprise search portal' },
  { id: 'teams', name: 'Team Workspace', description: 'Team bot experience' },
  { id: 'copilot', name: 'AI Assistant', description: 'Embedded assistant experience' },
  { id: 'api', name: 'REST API', description: 'Integrate with other apps' },
]

export const ACTION_MODES = ['Search', 'Ask', 'Summarize', 'Compare', 'Extract', 'Analyze'] as const

export const EXAMPLE_QUESTIONS = [
  'Show unpaid invoices related to contracts expiring next month',
  'Compare PO amount and invoice amount for vendor ABC',
  'What is the approval policy for high-value procurement?',
]

export const TEST_RESULT = {
  retrieval: {
    status: 'pass' as const,
    summary: 'Relevant chunks retrieved from document library and invoice index.',
    score: '0.87',
    chunks: 8,
    indexes: ['Document Library', 'Invoice'],
  },
  routing: {
    status: 'pass' as const,
    summary: 'Workflow Agent routed work across specialist agents.',
    supervisor: 'Workflow Agent',
    agents: ['Contract Agent', 'PO Agent', 'Invoice Agent'],
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
    flag: 'PO / Invoice variance $3,200',
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
  const indexLabel = deployment === 'cloud' ? 'Enterprise Search' : 'OpenSearch'
  const orchestrationLabel = 'LangGraph Supervisor'
  return [
    { title: 'Connected Sources', sub: `${connectorNames.length} configured`, pills: connectorNames, tone: 'info' as const },
    { title: 'Ingestion & Processing', sub: 'OCR, parsing, chunking', pills: ['Document Intelligence', 'ETL', 'Embeddings'], tone: 'info' as const },
    { title: 'Search Index', sub: 'Hybrid + vector + semantic', pills: [indexLabel], tone: 'success' as const },
    { title: 'AI Orchestration', sub: orchestrationLabel, pills: agentNames, tone: 'warning' as const },
    { title: 'Access Channels', sub: `${channelNames.length} enabled`, pills: channelNames, tone: 'gold' as const },
  ]
}
