# 🦋 Butterfly CLI Documentation

Welcome to the official documentation for **Butterfly CLI** - the command-line interface for the Butterfly Security platform. Part of a comprehensive Okta backup, recovery, and identity governance solution.

## Quick Links

- **[Installation](installation.md)** - Get started with Butterfly CLI
- **[Usage Guide](usage.md)** - Learn all available commands
- **[Examples](examples.md)** - Real-world usage scenarios
- **[API Integration](api.md)** - Connect to Butterfly API
- **[Configuration](configuration.md)** - Configure the CLI
- **[Features & Capabilities](features.md)** - Full platform overview
- **[Troubleshooting](troubleshooting.md)** - Common issues and solutions

## What is Butterfly?

**Butterfly** is a production-grade identity backup, recovery, and governance platform for Okta. It provides:

### Core Capabilities
✅ **Backup & Recovery** - Secure backups of Okta configurations with multi-version storage
✅ **Topology Visualization** - Interactive graph of 25+ identity resource types with 35+ relationship types
✅ **Natural Language Search** - Query your identity graph in plain English
✅ **AI-Powered Analysis** - Security audits, access reviews, blast radius analysis
✅ **Drift Detection** - Real-time configuration change monitoring
✅ **Compliance Management** - SOC2, ISO27001, MFA enforcement audits
✅ **Environment Sync** - Synchronize configurations across Okta environments
✅ **Workflows Automation** - Backup and restore Okta Workflows with connectors
✅ **Infrastructure as Code** - Export to Terraform, JSON, or YAML
✅ **Git Integration** - Push to GitHub, GitLab, Bitbucket, Azure DevOps, AWS CodeCommit

### Butterfly CLI
Butterfly CLI is the command-line interface that enables you to:

✅ **Manage Backups** - Create, list, download, and manage backups programmatically
✅ **Compare Configurations** - See what changed between backups with detailed diffs
✅ **Export Resources** - Convert to Terraform, Git, or JSON formats
✅ **Monitor Drift** - Watch for configuration changes in real-time
✅ **Automate Operations** - Integrate into CI/CD pipelines and scheduled tasks
✅ **Analyze Access** - Query topology and generate AI-powered security reports
✅ **Manage Connections** - Configure OAuth for multiple Okta orgs

## Installation

### npm (Recommended)

```bash
npm install -g @butterfly-cli/cli
```

### Homebrew (macOS/Linux)

```bash
brew tap butterfly-cli/tap
brew install butterfly
```

### Verify Installation

```bash
butterfly --version
```

## Quick Start

```bash
# Authenticate with OAuth (opens browser)
butterfly login

# Check your Okta organizations and status
butterfly status

# Create a backup
butterfly backup --wait

# List recent backups
butterfly list

# Compare two backups
butterfly diff

# Export to Terraform
butterfly export terraform --output ./terraform

# Monitor for changes
butterfly watch
```

## Platform Architecture

### CLI (This Package)
Command-line interface for operations, automation, and scripting.

### Dashboard (Web App)
Interactive web interface featuring:
- **Topology Viewer** - Visual graph with 18+ node types
- **Search Interface** - Natural language queries
- **AI Analysis** - Security audits, access reviews, blast radius
- **Backup Management** - Full CRUD operations
- **Drift Monitoring** - Real-time change detection
- **Compliance Reports** - SOC2, ISO27001 validation
- **Environment Sync** - Cross-org synchronization

### REST API
80+ endpoints for programmatic access across all features.

## Supported Resource Types (25+)

**Identity Resources**
- Users, Groups, Group Rules, Admin Roles

**Applications**
- SAML Apps, OAuth Apps, OpenID Connect, API, Custom

**Security Policies**
- Sign-on Policies, Password Policies, MFA Policies, Access Policies, Device Assurance

**Infrastructure**
- Auth Servers, Identity Providers, Trusted Origins, Network Zones

**Advanced Features**
- Okta Workflows, Workflow Connectors, Access Requests, Certifications, Entitlements, Resource Sets

## AI Integration

Generate intelligent analysis with:
- **Security Audit** - Identify risks and compliance gaps
- **Access Review** - Audit access patterns and over-provisioning
- **Blast Radius Analysis** - Assess compromise impact
- **Documentation Generation** - Create runbooks and CMDBs
- **Troubleshooting** - Diagnose access issues

Supported AI providers: Claude, ChatGPT, Copilot, Gemini

## Git Integration

Export backups to version control:
- **GitHub** - Direct repo integration
- **GitLab** - Cloud & self-hosted
- **Bitbucket** - Atlassian Cloud
- **Azure DevOps** - Microsoft enterprise
- **AWS CodeCommit** - Native AWS integration
- **Webhooks** - Custom CI/CD pipelines

## Authentication

Butterfly uses **OAuth 2.0** for secure, token-based authentication:
- No API keys required
- Tokens securely stored and refreshed automatically
- Multi-account support
- Instant revocation with logout

## Getting Help

- **Documentation**: Read our detailed guides
- **Issues**: [GitHub Issues](https://github.com/mickolasjae/cli/issues)
- **Questions**: Open a discussion on GitHub
- **Web App**: Access the full dashboard at https://butterflysecurity.org

## License

MIT License - See [LICENSE](https://github.com/mickolasjae/cli/blob/main/LICENSE) for details.

---

**Part of Butterfly Security** - The complete Okta backup, recovery, and identity governance platform.
