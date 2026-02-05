import { getApiKey, getApiUrl } from './config.js';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorResponse {
  error?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = getApiKey();
  const apiUrl = getApiUrl();

  if (!apiKey) {
    throw new Error('Not authenticated. Run `butterfly login` first.');
  }

  const url = `${apiUrl}/api${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as ApiErrorResponse | null;
    throw new ApiError(
      body?.error || `API request failed: ${response.statusText}`,
      response.status,
      body
    );
  }

  return response.json() as Promise<T>;
}

// Type definitions for API responses
export interface Connection {
  id: string;
  org_url: string;
  org_name: string | null;
  auth_type: string;
  last_backup_at: string | null;
  backup_schedule: string;
  is_active: boolean;
}

export interface Backup {
  id: string;
  connection_id: string;
  timestamp: string;
  status: string;
  size_bytes: number | null;
  resource_counts: Record<string, number>;
}

export interface DiffChange {
  resourceType: string;
  resourceId: string;
  resourceName: string;
  action: 'added' | 'removed' | 'modified';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  details?: string;
  changes?: Array<{
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }>;
}

export interface DiffSummary {
  added: number;
  modified: number;
  removed: number;
}

export interface TerraformExportFile {
  name: string;
  content: string;
}

// API functions
export async function getConnections(): Promise<{ connections: Connection[] }> {
  return apiRequest('/connections');
}

export async function getBackups(connectionId?: string): Promise<{ backups: Backup[] }> {
  const query = connectionId ? `?connectionId=${connectionId}` : '';
  return apiRequest(`/backup/list${query}`);
}

export async function getBackup(id: string): Promise<Backup> {
  return apiRequest(`/backup/${id}`);
}

export async function triggerBackup(
  connectionId: string,
  options?: {
    resourceTypes?: string[];
    includeWorkflows?: boolean;
  }
): Promise<{ success: boolean; backupId: string; backup: Backup }> {
  return apiRequest('/backup/run', {
    method: 'POST',
    body: JSON.stringify({
      connectionId,
      include: options?.resourceTypes,
      includeWorkflows: options?.includeWorkflows,
    }),
  });
}

export async function getDiff(
  beforeId: string,
  afterId: string,
  connectionId?: string
): Promise<{ changes: DiffChange[]; summary: DiffSummary }> {
  const params = new URLSearchParams({ before: beforeId, after: afterId });
  if (connectionId) params.append('connectionId', connectionId);
  return apiRequest(`/diff/compare?${params.toString()}`);
}

export async function exportTerraform(
  backupId: string,
  resources?: string[]
): Promise<{ files: TerraformExportFile[]; totalSize: number; downloadUrl?: string }> {
  return apiRequest('/export/terraform', {
    method: 'POST',
    body: JSON.stringify({ backupId, resources }),
  });
}

export async function exportToGit(
  backupId: string,
  options: {
    provider: string;
    repository: string;
    branch: string;
    commitMessage?: string;
  }
): Promise<{ success: boolean; commitSha?: string; url?: string }> {
  return apiRequest('/export/git', {
    method: 'POST',
    body: JSON.stringify({
      backupId,
      provider: options.provider,
      repo: options.repository,
      branch: options.branch,
      message: options.commitMessage,
    }),
  });
}
