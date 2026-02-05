# API Integration Guide

Use the Butterfly API programmatically instead of the CLI when you need more control.

## REST API Overview

The Butterfly API provides programmatic access to backup and management operations.

### Base URL

```
https://api.butterflysecurity.org/v1
```

### Authentication

All requests require an API key in the Authorization header:

```bash
Authorization: Bearer sk_live_...
```

## Endpoints

### Authentication

#### Check Authentication

```bash
GET /health

# Response
{
  "status": "ok",
  "authenticated": true,
  "organization": "org-id"
}
```

### Backups

#### Create Backup

```bash
POST /backups

# Request
{
  "organizationId": "org-id",
  "name": "Pre-deployment backup",
  "resources": ["users", "groups"]  // optional
}

# Response
{
  "id": "backup_abc123",
  "organizationId": "org-id",
  "name": "Pre-deployment backup",
  "status": "in-progress",
  "createdAt": "2024-02-05T10:00:00Z"
}
```

#### List Backups

```bash
GET /backups?limit=10&offset=0

# Response
{
  "backups": [
    {
      "id": "backup_abc123",
      "organizationId": "org-id",
      "name": "Pre-deployment backup",
      "status": "completed",
      "resourceCount": 1250,
      "createdAt": "2024-02-05T10:00:00Z",
      "completedAt": "2024-02-05T10:15:00Z"
    }
  ],
  "total": 42,
  "limit": 10,
  "offset": 0
}
```

#### Get Backup Details

```bash
GET /backups/{backup_id}

# Response
{
  "id": "backup_abc123",
  "organizationId": "org-id",
  "name": "Pre-deployment backup",
  "status": "completed",
  "resourceCount": 1250,
  "resources": {
    "users": 500,
    "groups": 250,
    "rules": 300,
    "apps": 200
  },
  "createdAt": "2024-02-05T10:00:00Z",
  "completedAt": "2024-02-05T10:15:00Z"
}
```

#### Wait for Backup Completion

```bash
GET /backups/{backup_id}/wait

# Blocks until backup completes
# Response (when ready)
{
  "id": "backup_abc123",
  "status": "completed",
  "completedAt": "2024-02-05T10:15:00Z"
}
```

### Comparison

#### Compare Backups

```bash
POST /backups/compare

# Request
{
  "fromBackupId": "backup_abc123",
  "toBackupId": "backup_def456",
  "resourceType": "users"  // optional filter
}

# Response
{
  "fromBackup": "backup_abc123",
  "toBackup": "backup_def456",
  "changes": {
    "users": {
      "added": 5,
      "modified": 3,
      "deleted": 1,
      "details": [
        {
          "type": "user",
          "id": "user_xyz",
          "operation": "modified",
          "changes": {
            "email": {
              "from": "old@example.com",
              "to": "new@example.com"
            }
          }
        }
      ]
    }
  }
}
```

### Export

#### Export to Terraform

```bash
POST /backups/{backup_id}/export/terraform

# Request
{
  "format": "hcl",
  "outputFormat": "zip"  // or "tar.gz"
}

# Response
{
  "exportId": "export_abc123",
  "status": "in-progress",
  "downloadUrl": null  // set when complete
}
```

#### Get Export Status

```bash
GET /exports/{export_id}

# Response
{
  "id": "export_abc123",
  "backupId": "backup_abc123",
  "type": "terraform",
  "status": "completed",
  "downloadUrl": "https://...signed-url...",
  "createdAt": "2024-02-05T10:00:00Z",
  "completedAt": "2024-02-05T10:15:00Z",
  "expiresAt": "2024-02-06T10:15:00Z"
}
```

## Code Examples

### JavaScript/Node.js

```javascript
const https = require('https');

const apiKey = process.env.BUTTERFLY_API_KEY;
const baseUrl = 'https://api.butterflysecurity.org/v1';

async function createBackup(orgId) {
  const options = {
    hostname: 'api.butterflysecurity.org',
    path: '/v1/backups',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });

    req.on('error', reject);
    req.write(JSON.stringify({
      organizationId: orgId,
      name: 'API backup'
    }));
    req.end();
  });
}

// Usage
createBackup('org-id').then(backup => {
  console.log('Backup created:', backup.id);
});
```

### Python

```python
import requests
import os

api_key = os.getenv('BUTTERFLY_API_KEY')
base_url = 'https://api.butterflysecurity.org/v1'

def create_backup(org_id):
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }

    payload = {
        'organizationId': org_id,
        'name': 'API backup'
    }

    response = requests.post(
        f'{base_url}/backups',
        json=payload,
        headers=headers
    )

    return response.json()

# Usage
backup = create_backup('org-id')
print(f"Backup created: {backup['id']}")
```

### cURL

```bash
# Create backup
curl -X POST https://api.butterflysecurity.org/v1/backups \
  -H "Authorization: Bearer $BUTTERFLY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId": "org-id",
    "name": "API backup"
  }'

# List backups
curl -X GET https://api.butterflysecurity.org/v1/backups?limit=10 \
  -H "Authorization: Bearer $BUTTERFLY_API_KEY"

# Get backup details
curl -X GET https://api.butterflysecurity.org/v1/backups/backup_abc123 \
  -H "Authorization: Bearer $BUTTERFLY_API_KEY"

# Compare backups
curl -X POST https://api.butterflysecurity.org/v1/backups/compare \
  -H "Authorization: Bearer $BUTTERFLY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "fromBackupId": "backup_abc123",
    "toBackupId": "backup_def456"
  }'
```

## Response Format

All responses follow a standard format:

### Success (200-299)

```json
{
  "id": "resource_id",
  "status": "success",
  "data": {}
}
```

### Error (400-599)

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `INVALID_REQUEST` | 400 | Malformed request |
| `UNAUTHORIZED` | 401 | Missing/invalid API key |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict (e.g., duplicate) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Rate Limiting

API requests are rate-limited per API key:

- **Default**: 100 requests per minute
- **Enterprise**: Custom limits available

Rate limit info in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707126000
```

## Best Practices

### Error Handling

```javascript
async function apiRequest(method, path, data = null) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: data ? JSON.stringify(data) : null
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`API Error: ${error.error.message}`);
  }

  return response.json();
}
```

### Polling

For long-running operations:

```javascript
async function waitForBackupCompletion(backupId, maxWait = 3600) {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait * 1000) {
    const backup = await apiRequest('GET', `/backups/${backupId}`);

    if (backup.status === 'completed') {
      return backup;
    }

    if (backup.status === 'failed') {
      throw new Error('Backup failed');
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  throw new Error('Backup timeout');
}
```

## CLI vs API

| Task | CLI | API |
|------|-----|-----|
| Simple operations | ✅ Best | ✓ Works |
| Automation | ✓ Works | ✅ Better |
| Integration | ✓ Works | ✅ Better |
| One-off tasks | ✅ Better | ✓ Works |

## Next Steps

- [Usage Guide](usage.md) - CLI commands
- [Examples](examples.md) - Real-world scenarios
- [Configuration](configuration.md) - Configure API settings
