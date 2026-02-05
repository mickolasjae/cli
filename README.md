# 🦋 Butterfly CLI

Okta backup and recovery from your terminal. The official CLI for [Butterfly Security](https://butterflysecurity.org).

## Installation

### Homebrew (macOS/Linux)

```bash
brew tap butterfly-security/tap
brew install butterfly
```

### npm (Node.js)

```bash
npm install -g @butterfly-security/cli
```

### Binary Download

Download pre-built binaries from the [releases page](https://github.com/butterfly-security/cli/releases).

## Quick Start

```bash
# Authenticate with OAuth (opens browser)
butterfly login

# Check status of your Okta orgs
butterfly status

# Create a backup
butterfly backup

# List recent backups
butterfly list

# Select a backup to work with
butterfly select

# Compare changes between backups
butterfly diff

# Export as Terraform
butterfly export terraform

# Export to Git repository
butterfly export git
```

## Commands

### Authentication

```bash
butterfly login                    # OAuth login (opens browser)
butterfly logout                   # Clear credentials
butterfly whoami                   # Show current status
```

### Backup Operations

```bash
butterfly backup                   # Trigger new backup
butterfly backup --wait            # Wait for completion
butterfly backup -r users,groups   # Backup specific resources
butterfly list                     # List all backups
butterfly list --limit 20          # Show more backups
butterfly list --json              # JSON output
```

### Select & Focus

```bash
butterfly select                   # Interactive backup selection
butterfly select abc123            # Select by ID
butterfly selected                 # Show current selection
butterfly select --clear           # Clear selection
```

### Diff & Compare

```bash
butterfly diff                     # Compare latest two backups
butterfly diff --from ID1 --to ID2 # Compare specific backups
butterfly diff --type users        # Filter by resource type
```

### Export

```bash
# Terraform
butterfly export terraform
butterfly export tf --output ./my-terraform

# Git
butterfly export git               # Interactive Git export

# JSON
butterfly export json
```

### Configuration

```bash
butterfly config show              # Show configuration
butterfly config set apiUrl URL    # Set API URL
butterfly config set defaultOrg ID # Set default org
butterfly config edit              # Interactive config
butterfly config reset             # Reset to defaults
```

### Watch Mode

```bash
butterfly watch                    # Continuous monitoring
butterfly watch --interval 30      # Check every 30 minutes
```

## Output Formats

Most commands support `--json` for machine-readable output:

```bash
butterfly status --json
butterfly list --json
butterfly diff --json
```

## Environment Variables

- `BUTTERFLY_API_URL` - Custom API URL (default: https://butterflysecurity.org)
- `BUTTERFLY_DEFAULT_ORG` - Default organization ID

OAuth tokens are managed securely by the CLI - no need to set them manually!

## Configuration File

Configuration is stored in `~/.config/butterfly-cli/config.json`:

```json
{
  "oauthToken": "(securely stored)",
  "apiUrl": "https://butterflysecurity.org",
  "defaultOrg": "your-okta-org",
  "selectedBackup": null
}
```

OAuth tokens are encrypted and managed automatically - you don't need to handle them.

## Examples

### Daily Backup Script

```bash
#!/bin/bash
# Backup and export to Git daily
butterfly backup --wait
butterfly export git --backup latest
```

### CI/CD Integration

```yaml
# GitHub Actions
- name: Backup Okta Configuration
  run: |
    npm install -g @butterfly-security/cli
    butterfly login --api-key ${{ secrets.BUTTERFLY_API_KEY }}
    butterfly backup --wait
    butterfly export terraform --output ./terraform
```

### Watch for Drift

```bash
# Monitor for changes and alert
butterfly watch --interval 60 2>&1 | tee backup.log
```

## Support

- Documentation: https://butterflysecurity.org/docs
- Issues: https://github.com/butterfly-security/cli/issues
- Email: support@butterflysecurity.org

## License

MIT License - see [LICENSE](LICENSE) for details.
