import type { ContentBrowseResponse, ContentNode } from "@/types/content";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SHAREPOINT_TREE: ContentNode[] = [
  {
    id: "sp-site",
    name: "knowledge",
    path: "/sites/knowledge",
    type: "site",
    childCount: 2,
    children: [
      {
        id: "sp-lib",
        name: "Shared Documents",
        path: "/sites/knowledge/Shared Documents",
        type: "library",
        childCount: 3,
        children: [
          {
            id: "sp-contracts",
            name: "Contracts",
            path: "/sites/knowledge/Shared Documents/Contracts",
            type: "folder",
            childCount: 4,
            children: [
              { id: "f1", name: "Contract_ABC_2024.pdf", path: "/sites/knowledge/Shared Documents/Contracts/Contract_ABC_2024.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 2_400_000 },
              { id: "f2", name: "Vendor_MSA_Template.docx", path: "/sites/knowledge/Shared Documents/Contracts/Vendor_MSA_Template.docx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 890_000 },
            ],
          },
          {
            id: "sp-finance",
            name: "Finance",
            path: "/sites/knowledge/Shared Documents/Finance",
            type: "folder",
            childCount: 12,
            children: [
              { id: "f3", name: "Q3-budget.xlsx", path: "/sites/knowledge/Shared Documents/Finance/Q3-budget.xlsx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", sizeBytes: 256_000 },
              { id: "f4", name: "INV-22019.pdf", path: "/sites/knowledge/Shared Documents/Finance/INV-22019.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 420_000 },
              { id: "f5", name: "Approval_Policy.pdf", path: "/sites/knowledge/Shared Documents/Finance/Approval_Policy.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 310_000 },
              {
                id: "sp-finance-fy24",
                name: "FY24",
                path: "/sites/knowledge/Shared Documents/Finance/FY24",
                type: "folder",
                childCount: 2,
                children: [
                  { id: "f5b", name: "CapEx-plan.xlsx", path: "/sites/knowledge/Shared Documents/Finance/FY24/CapEx-plan.xlsx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", sizeBytes: 190_000 },
                  { id: "f5c", name: "OpEx-actuals.pdf", path: "/sites/knowledge/Shared Documents/Finance/FY24/OpEx-actuals.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 540_000 },
                ],
              },
            ],
          },
          {
            id: "sp-engineering",
            name: "Engineering Drawings",
            path: "/sites/knowledge/Shared Documents/Engineering Drawings",
            type: "folder",
            childCount: 2,
            children: [
              { id: "f6", name: "Cooling_Tower_Assembly.pdf", path: "/sites/knowledge/Shared Documents/Engineering Drawings/Cooling_Tower_Assembly.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 5_100_000 },
              { id: "f7", name: "Piping_Layout_Diagram.pdf", path: "/sites/knowledge/Shared Documents/Engineering Drawings/Piping_Layout_Diagram.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 3_800_000 },
            ],
          },
        ],
      },
    ],
  },
];

const AZURE_BLOB_TREE: ContentNode[] = [
  {
    id: "ab-container",
    name: "enterprise-docs",
    path: "enterprise-docs/",
    type: "container",
    childCount: 2,
    children: [
      {
        id: "ab-finance",
        name: "finance/",
        path: "enterprise-docs/finance/",
        type: "prefix",
        childCount: 3,
        children: [
          { id: "b1", name: "invoices/INV-22019.pdf", path: "enterprise-docs/finance/invoices/INV-22019.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 420_000 },
          { id: "b2", name: "pos/PO-88421.xlsx", path: "enterprise-docs/finance/pos/PO-88421.xlsx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", sizeBytes: 156_000 },
          { id: "b3", name: "reports/Q2-summary.pdf", path: "enterprise-docs/finance/reports/Q2-summary.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 1_200_000 },
        ],
      },
      {
        id: "ab-hr",
        name: "hr/",
        path: "enterprise-docs/hr/",
        type: "prefix",
        childCount: 2,
        children: [
          { id: "b4", name: "policies/Leave_Policy.docx", path: "enterprise-docs/hr/policies/Leave_Policy.docx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", sizeBytes: 245_000 },
          { id: "b5", name: "handbook/Employee_Handbook.pdf", path: "enterprise-docs/hr/handbook/Employee_Handbook.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 2_100_000 },
        ],
      },
    ],
  },
];

const S3_TREE: ContentNode[] = [
  {
    id: "s3-bucket",
    name: "corp-knowledge-prod",
    path: "corp-knowledge-prod/",
    type: "container",
    childCount: 2,
    children: [
      {
        id: "s3-proc",
        name: "procurement/",
        path: "corp-knowledge-prod/procurement/",
        type: "prefix",
        children: [
          { id: "s1", name: "contracts/vendor-abc.pdf", path: "corp-knowledge-prod/procurement/contracts/vendor-abc.pdf", type: "file", mimeType: "application/pdf", sizeBytes: 980_000 },
          { id: "s2", name: "invoices/batch-2024.zip", path: "corp-knowledge-prod/procurement/invoices/batch-2024.zip", type: "file", mimeType: "application/zip", sizeBytes: 12_000_000 },
        ],
      },
      {
        id: "s3-legal",
        name: "legal/",
        path: "corp-knowledge-prod/legal/",
        type: "prefix",
        children: [
          { id: "s3", name: "compliance/SOX_Checklist.xlsx", path: "corp-knowledge-prod/legal/compliance/SOX_Checklist.xlsx", type: "file", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", sizeBytes: 88_000 },
        ],
      },
    ],
  },
];

const POSTGRESQL_TREE: ContentNode[] = [
  {
    id: "pg-schema",
    name: "dbo",
    path: "dbo/",
    type: "folder",
    children: [
      { id: "t1", name: "vendors (table)", path: "dbo/vendors", type: "file", mimeType: "table", sizeBytes: 0, childCount: 1240 },
      { id: "t2", name: "purchase_orders (table)", path: "dbo/purchase_orders", type: "file", mimeType: "table", sizeBytes: 0, childCount: 8900 },
      { id: "t3", name: "invoices (table)", path: "dbo/invoices", type: "file", mimeType: "table", sizeBytes: 0, childCount: 15200 },
    ],
  },
];

const TREES: Record<string, ContentNode[]> = {
  sharepoint: SHAREPOINT_TREE,
  "azure-blob": AZURE_BLOB_TREE,
  s3: S3_TREE,
  "s3-minio": S3_TREE,
  postgresql: POSTGRESQL_TREE,
  "azure-sql": POSTGRESQL_TREE,
  onelake: AZURE_BLOB_TREE,
  "teams-files": SHAREPOINT_TREE,
  "local-fs": AZURE_BLOB_TREE,
  mongodb: POSTGRESQL_TREE,
  confluence: SHAREPOINT_TREE,
  jira: POSTGRESQL_TREE,
};

function countNodes(nodes: ContentNode[]): { files: number; folders: number } {
  let files = 0;
  let folders = 0;
  const walk = (list: ContentNode[]) => {
    for (const n of list) {
      if (n.type === "file") files++;
      else folders++;
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return { files, folders };
}

export function getBrowseTree(connectorTypeId: string): ContentNode[] {
  return TREES[connectorTypeId] ?? SHAREPOINT_TREE;
}

export const contentBrowserApi = {
  /**
   * Standard connector browse API — returns folder/file hierarchy for scope selection.
   * Real implementations: SharePoint Graph driveItem children, Blob list by prefix, S3 listObjectsV2.
   */
  browse: async (connectorTypeId: string, _connectorInstanceId: string): Promise<ContentBrowseResponse> => {
    await delay(900);
    const nodes = TREES[connectorTypeId] ?? SHAREPOINT_TREE;
    const { files, folders } = countNodes(nodes);
    return {
      connectorTypeId,
      rootPath: nodes[0]?.path ?? "/",
      nodes,
      totalFiles: files,
      totalFolders: folders,
    };
  },
};
