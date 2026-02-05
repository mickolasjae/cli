# Usage Guide

Complete reference for all Butterfly CLI commands and options.

## Authentication

Before using Butterfly CLI, you need to authenticate with your API key.

### Login

```bash
# Interactive login
butterfly login

# Login with API key
butterfly login --api-key YOUR_API_KEY

# Login with environment variable
export BUTTERFLY_API_KEY=your-api-key
butterfly login
```

### Logout

```bash
butterfly logout
```

### Check Status

```bash
butterfly whoami
butterfly status
```

## Backup Operations

### Create Backup

```bash
# Create a new backup (non-blocking)
butterfly backup

# Create and wait for completion
butterfly backup --wait

# Backup specific resources only
butterfly backup -r users,groups

# Backup with custom name
butterfly backup --name "Pre-deployment backup"
```

### List Backups

```bash
# List all backups
butterfly list

# Show more backups
butterfly list --limit 20

# Machine-readable format
butterfly list --json

# Filter by date
butterfly list --since "2024-01-01"
```

### Get Backup Details

```bash
# Show info about specific backup
butterfly info <backup-id>

# Show selected backup
butterfly selected
```

## Backup Selection

### Select Backup

```bash
# Interactive selection
butterfly select

# Select by ID
butterfly select abc123

# View current selection
butterfly selected

# Clear selection
butterfly select --clear
```

## Comparison & Diff

### Compare Backups

```bash
# Compare latest two backups
butterfly diff

# Compare specific backups
butterfly diff --from id1 --to id2

# Filter by resource type
butterfly diff --type users

# Show detailed changes
butterfly diff --verbose

# JSON output
butterfly diff --json
```

## Export

### Export to Terraform

```bash
# Interactive Terraform export
butterfly export terraform

# Export to directory
butterfly export terraform --output ./my-terraform

# Shorthand
butterfly export tf --output ./terraform

# Export specific backup
butterfly export terraform --backup <backup-id>
```

### Export to Git

```bash
# Interactive Git export
butterfly export git

# Export to repository
butterfly export git --repo ./my-repo

# With git push
butterfly export git --push
```

### Export to JSON

```bash
# Export selected backup to JSON
butterfly export json

# Export specific backup
butterfly export json --backup <backup-id>

# Save to file
butterfly export json --output backup.json
```

## Configuration

### View Configuration

```bash
# Show current config
butterfly config show

# Show as JSON
butterfly config show --json
```

### Set Configuration

```bash
# Set API URL
butterfly config set apiUrl https://api.example.com

# Set default organization
butterfly config set defaultOrg my-org-id

# Set custom value
butterfly config set key value
```

### Edit Configuration

```bash
# Interactive configuration editor
butterfly config edit

# Reset to defaults
butterfly config reset
```

### Configuration File

Configuration is stored in: `~/.config/butterfly-cli/config.json`

```json
{
  "apiKey": "sk_live_...",
  "apiUrl": "https://api.butterflysecurity.org",
  "defaultOrg": "org-id",
  "selectedBackup": null
}
```

## Monitoring

### Watch Mode

```bash
# Start watching for changes (checks every 60 seconds)
butterfly watch

# Custom interval (in minutes)
butterfly watch --interval 30

# Watch specific resources
butterfly watch --resources users,groups

# Log to file
butterfly watch --log backup.log
```

## Output Formats

Most commands support `--json` flag for machine-readable output:

```bash
butterfly status --json
butterfly list --json
butterfly diff --json
butterfly backup --json
```

## Global Options

### Help

```bash
# General help
butterfly --help
butterfly -h

# Command-specific help
butterfly backup --help
butterfly export terraform --help
```

### Version

```bash
butterfly --version
butterfly -v
```

### Quiet Mode

```bash
# Suppress output (useful in scripts)
butterfly backup --quiet
```

### Verbose Mode

```bash
# Detailed output
butterfly backup --verbose
```

## Environment Variables

### Configuration via Environment

```bash
# API Key
export BUTTERFLY_API_KEY=sk_live_...

# API URL (optional)
export BUTTERFLY_API_URL=https://api.butterflysecurity.org

# Default organization
export BUTTERFLY_DEFAULT_ORG=org-id
```

### Runtime Behavior

```bash
# Disable color output
export NO_COLOR=1

# Disable interactive prompts
export BUTTERFLY_NO_INTERACTIVE=true
```

## Exit Codes

Understanding exit codes for scripting:

- `0` - Success
- `1` - General error
- `2` - Usage error
- `3` - Authentication error
- `4` - API error
- `5` - Network error

Example:

```bash
butterfly backup
if [ $? -eq 0 ]; then
  echo "Backup successful"
else
  echo "Backup failed"
  exit 1
fi
```

## Next Steps

- [Examples](examples.md) - See real-world usage scenarios
- [Configuration](configuration.md) - Advanced configuration
- [Troubleshooting](troubleshooting.md) - Common issues
