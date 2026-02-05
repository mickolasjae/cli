# 🦋 Butterfly CLI Documentation

Welcome to the official documentation for **Butterfly CLI** - the command-line interface for Okta backup and recovery.

## Quick Links

- **[Installation](installation.md)** - Get started with Butterfly CLI
- **[Usage Guide](usage.md)** - Learn all available commands
- **[Examples](examples.md)** - Real-world usage scenarios
- **[API Integration](api.md)** - Connect to Butterfly API
- **[Configuration](configuration.md)** - Configure the CLI
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

## What is Butterfly CLI?

Butterfly CLI is a powerful command-line tool that enables you to:

✅ **Backup** - Create secure backups of your Okta configuration
✅ **Restore** - Recover from backups quickly and reliably
✅ **Compare** - See what changed between backups
✅ **Export** - Convert to Terraform or Git format
✅ **Monitor** - Watch for configuration drift in real-time
✅ **Automate** - Integrate into your CI/CD pipelines

## Installation

### npm (Recommended)

```bash
npm install -g @butterfly-security/cli
```

### Homebrew (macOS/Linux)

```bash
brew tap butterfly-security/tap
brew install butterfly
```

### Verify Installation

```bash
butterfly --version
```

## Quick Start

```bash
# Login with your API key
butterfly login --api-key YOUR_API_KEY

# Check your Okta organizations
butterfly status

# Create a backup
butterfly backup

# List recent backups
butterfly list

# Compare backups
butterfly diff
```

## Getting Help

- **Documentation**: Browse our detailed guides
- **Issues**: [GitHub Issues](https://github.com/mickolasjae/cli/issues)
- **Questions**: Open a discussion on GitHub

## License

MIT License - See [LICENSE](https://github.com/mickolasjae/cli/blob/main/LICENSE) for details.
