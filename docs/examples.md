# Examples & Use Cases

Real-world examples of using Butterfly CLI in different scenarios.

## Basic Usage

### Daily Backup Script

Automated daily backups of your Okta configuration:

```bash
#!/bin/bash
# backup-daily.sh

# Verify authentication
butterfly whoami || {
  echo "Not authenticated. Run 'butterfly login' first."
  exit 1
}

# Create backup and wait
butterfly backup --wait

# Export to JSON for archival
butterfly export json --output "backups/$(date +%Y-%m-%d).json"

echo "Daily backup completed successfully"
```

Run with cron:

```bash
# Edit crontab
crontab -e

# Add this line to run daily at 2 AM
0 2 * * * /path/to/backup-daily.sh
```

### Check Org Status

Quick status check of all organizations:

```bash
#!/bin/bash

echo "=== Butterfly CLI Status ==="
butterfly whoami
echo ""

echo "=== Recent Backups ==="
butterfly list --limit 5

echo ""
echo "=== Configuration ==="
butterfly config show
```

## CI/CD Integration

### GitHub Actions Workflow

Backup Okta configuration on push with OAuth:

```yaml
name: Backup Okta Configuration

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Butterfly CLI
        run: npm install -g @butterfly-security/cli

      - name: Create Backup
        run: |
          # Use OAuth token (obtained during setup)
          butterfly login --oauth-token ${{ secrets.BUTTERFLY_OAUTH_TOKEN }}
          butterfly backup --wait
          butterfly export terraform --output ./terraform

      - name: Commit and Push
        run: |
          git config user.name "Butterfly Bot"
          git config user.email "bot@butterflysecurity.org"
          git add terraform/
          git commit -m "chore: update Okta backup" || true
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Setup OAuth Token:**
1. Run `butterfly login` locally
2. Get token from: `butterfly config show`
3. Add to GitHub Secrets as `BUTTERFLY_OAUTH_TOKEN`

### GitLab CI Pipeline

```yaml
backup_okta:
  image: node:20
  script:
    - npm install -g @butterfly-security/cli
    - butterfly login --oauth-token $BUTTERFLY_OAUTH_TOKEN
    - butterfly backup --wait
    - butterfly export terraform --output ./terraform
  artifacts:
    paths:
      - terraform/
    expire_in: 30 days
  only:
    - main
```

**Setup:** Add `BUTTERFLY_OAUTH_TOKEN` to GitLab CI/CD Variables

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    environment {
        BUTTERFLY_OAUTH_TOKEN = credentials('butterfly-oauth-token')
    }

    stages {
        stage('Install') {
            steps {
                sh 'npm install -g @butterfly-security/cli'
            }
        }

        stage('Backup') {
            steps {
                sh '''
                    butterfly login --oauth-token $BUTTERFLY_OAUTH_TOKEN
                    butterfly backup --wait
                    butterfly export terraform --output ./terraform
                '''
            }
        }

        stage('Archive') {
            steps {
                archiveArtifacts artifacts: 'terraform/**',
                                 allowEmptyArchive: true
            }
        }
    }
}
```

**Setup:** Add `butterfly-oauth-token` to Jenkins Credentials

## Monitoring & Alerting

### Monitor for Drift

```bash
#!/bin/bash
# monitor-drift.sh

# Monitor every 60 minutes and log changes
butterfly watch --interval 60 --log drift-detection.log

# Send alert if changes detected
if [ -s drift-detection.log ]; then
  curl -X POST $WEBHOOK_URL -d "Configuration drift detected. See logs for details."
fi
```

### Compare Against Baseline

```bash
#!/bin/bash
# compare-baseline.sh

# Create baseline
BASELINE=$(butterfly backup --wait)
echo "Baseline backup: $BASELINE"

# Check periodically
while true; do
  sleep 3600  # Check hourly

  CURRENT=$(butterfly backup --wait)
  DIFF=$(butterfly diff --from $BASELINE --to $CURRENT)

  if [ ! -z "$DIFF" ]; then
    echo "Configuration changed:"
    echo "$DIFF"
    # Send alert
    notify_slack "$DIFF"
  fi
done
```

## Compliance & Audit

### Export for Compliance

```bash
#!/bin/bash
# export-compliance.sh

# Create backup
BACKUP=$(butterfly backup --wait)

# Export to multiple formats
butterfly export terraform --backup $BACKUP --output ./compliance/terraform
butterfly export json --backup $BACKUP --output ./compliance/backup.json

# Create checksum for integrity
find ./compliance -type f -exec sha256sum {} \; > ./compliance/CHECKSUMS.txt

echo "Compliance export complete"
```

### Audit Trail

```bash
#!/bin/bash
# audit-trail.sh

# Get all backups
BACKUPS=$(butterfly list --json)

# For each backup, export and compare
echo "$BACKUPS" | jq -r '.[].id' | while read BACKUP_ID; do
  echo "Processing backup: $BACKUP_ID"
  butterfly export json --backup $BACKUP_ID --output "./audit/$BACKUP_ID.json"
done

# Create audit report
echo "Audit trail saved to ./audit"
```

## Disaster Recovery

### Full Recovery Workflow

```bash
#!/bin/bash
# disaster-recovery.sh

# Find latest backup before incident
BACKUP=$(butterfly list --since "2024-01-15" --limit 1 --json | jq -r '.[0].id')

echo "Recovering from backup: $BACKUP"

# Export configuration
butterfly export terraform --backup $BACKUP --output ./recovery

# Review changes before applying
echo "Review changes in ./recovery directory"
echo "After review, apply with: terraform apply"

# Optional: automatic apply
# cd recovery && terraform apply -auto-approve
```

## Advanced Scenarios

### Multi-Org Sync

```bash
#!/bin/bash
# sync-orgs.sh

ORGS=("org-prod" "org-staging" "org-dev")

for ORG in "${ORGS[@]}"; do
  echo "Processing $ORG..."

  # Switch org
  butterfly config set defaultOrg $ORG

  # Create backup
  butterfly backup --wait

  # Export
  butterfly export terraform --output "./terraform/$ORG"
done

echo "Multi-org sync complete"
```

### Configuration as Code

```bash
#!/bin/bash
# config-as-code.sh

# Backup Okta config to Git
butterfly backup --wait
butterfly export git --repo ./okta-config --push

# Commit with details
cd okta-config
git log --oneline -1 | xargs -I {} \
  git tag "backup-{}" $(git rev-parse HEAD)
```

## Scripting Tips

### Error Handling

```bash
#!/bin/bash
set -euo pipefail

# Set trap for cleanup
trap 'echo "Error occurred"; cleanup' EXIT

backup_okta() {
  butterfly login --api-key "$BUTTERFLY_API_KEY" || {
    echo "Authentication failed" >&2
    return 1
  }

  butterfly backup --wait || {
    echo "Backup failed" >&2
    return 1
  }
}

cleanup() {
  butterfly logout || true
}

backup_okta
echo "Backup successful"
```

### Parallel Backups

```bash
#!/bin/bash
# parallel-backup.sh

ORGS=("org1" "org2" "org3")

# Run backups in parallel
for ORG in "${ORGS[@]}"; do
  (
    butterfly config set defaultOrg $ORG
    butterfly backup --wait
  ) &
done

wait  # Wait for all to complete
echo "All backups complete"
```

## Next Steps

- [Configuration](configuration.md) - Advanced configuration options
- [Troubleshooting](troubleshooting.md) - Debugging and common issues
- [API Integration](api.md) - Programmatic usage
