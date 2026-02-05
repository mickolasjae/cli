# Butterfly Platform - Complete Features Guide

## Overview

Butterfly is a production-grade identity backup, recovery, and governance platform for Okta. This document provides a comprehensive overview of all features and capabilities across the CLI, REST API, and web dashboard.

## 1. Backup & Recovery System

### Backup Operations

#### Create Backups
```bash
# Simple backup
butterfly backup

# Wait for completion
butterfly backup --wait

# Backup specific resources
butterfly backup -r users,groups,apps

# With custom name
butterfly backup --name "Pre-deployment backup"
```

**Features:**
- Incremental snapshots for efficiency
- Chunked uploads for large datasets
- Resumable operations
- Progress streaming
- Compression and encryption
- Version control with retention policies

### Restore Operations

```bash
# Preview restorable items
butterfly restore --preview

# Selective restore
butterfly restore --resources users,groups

# Full restore
butterfly restore --backup <backup-id>
```

**Features:**
- Pre-flight validation and dependency analysis
- Conflict detection and resolution
- Capacity validation
- Selective resource restore
- Rollback support
- Atomic transactions

### Backup Management

```bash
# List all backups
butterfly list

# Get backup details
butterfly info <backup-id>

# Download backup
butterfly download <backup-id>

# Delete old backups
butterfly delete <backup-id>
```

**Storage:**
- Encrypted at-rest (AES-256)
- Cloudflare R2 integration
- Automatic versioning
- Retention policy enforcement
- Multi-region redundancy

---

## 2. Topology Visualization & Search

### Interactive Graph Visualization

The topology viewer provides a visual representation of your Okta configuration:

#### Node Types (18 supported)
- **Identity**: Users, Groups, Group Rules, Admin Roles
- **Applications**: SAML Apps, OAuth Apps, OpenID Connect, API Services
- **Security**: Sign-on Policies, Access Policies, MFA Policies, Device Assurance
- **Infrastructure**: Auth Servers, Identity Providers, Trusted Origins
- **Advanced**: Workflows, Entitlements, Resource Sets, PAM Resources

#### Relationship Types (35+ supported)
- `member_of` - User/Group membership
- `assigned_to` - Resource assignment
- `governed_by` - Policy governance
- `sourced_from` - Identity source
- `authenticates_with` - Auth method
- `has_entitlement` - Entitlement grant
- `has_role` - Role assignment
- `applies_to` - Policy application
- And 27+ more...

#### Features
- **Radial/Concentric Layout** - Intuitive visualization
- **Interactive Controls** - Zoom, pan, minimap
- **Click-to-Highlight** - Show connections for any node
- **Status Indicators** - Active, Staged, Suspended, Deprovisioned
- **Edge Labels** - Relationship type identification
- **Filtering** - By node type, status, or relationship

### Natural Language Search

Query your identity graph in plain English:

```bash
# User access queries
"What can John access?"
"Who has access to AWS?"

# Group and membership queries
"What groups is John in?"
"All members of the Engineering group"

# Security queries
"Find users without MFA"
"Active admin users"

# Application queries
"Apps with SAML"
"All OAuth clients"
```

**Features:**
- Autocomplete suggestions
- Result type icons
- Status badges
- Context-aware filtering
- Saved searches
- Export results

### Details Panel

Three view modes for detailed information:

#### Visual Mode
- Categorized connections
- Group by relationship type
- Access & Permissions
- Security & Policies
- Infrastructure & Federation
- Advanced Features

#### Tree Mode
- Hierarchical file-system-style view
- Expandable nodes
- Path navigation
- Parent/child relationships

#### Table Mode
- Structured data table
- Column sorting and filtering
- Full-text search
- Export to CSV

---

## 3. AI-Powered Analysis

### Five Analysis Templates

#### 1. Security Audit 🔒
Identify security risks and compliance gaps.

**Analysis Includes:**
- Over-provisioned access identification
- Unused application detection
- Orphaned identity discovery
- Policy compliance validation
- MFA enforcement verification
- SOC2 and ISO27001 alignment
- Risk scoring and prioritization
- Remediation recommendations

#### 2. Access Review 👁️
Audit access patterns for compliance.

**Analysis Includes:**
- User access inventory
- Direct vs inherited access
- Application access mapping
- Group membership review
- Admin role verification
- License compliance
- Certification-ready documentation
- Approval workflow support

#### 3. Blast Radius Analysis 💥
Assess incident impact and risk.

**Analysis Includes:**
- Compromise scope assessment
- Cascading access implications
- Data exposure risk quantification
- Service disruption analysis
- Recovery time estimates
- Containment recommendations
- Severity ratings (Critical/High/Medium/Low)
- Incident response playbooks

#### 4. Documentation Generation 📝
Automatically create operational documentation.

**Generates:**
- Runbooks for common operations
- Configuration management database entries
- Integration dependency maps
- Operational procedure documentation
- Change management forms
- Rollback procedures
- Training documentation

#### 5. Troubleshooting Guide 🔧
Diagnose and resolve access issues.

**Diagnoses:**
- Access failure root causes
- Missing group memberships
- Policy block explanations
- MFA requirement issues
- Application provisioning problems
- Configuration validation
- Step-by-step remediation

### AI Provider Support

**Supported Models:**
- **Claude** (Anthropic) - Advanced reasoning
- **ChatGPT** (OpenAI) - Broad capabilities
- **Copilot** (Microsoft) - Enterprise alignment
- **Gemini** (Google) - Advanced analytics
- **Generic AI** - Custom tool support

**Features:**
- Context-aware prompt generation
- Structured JSON export
- Real-time preview
- One-click clipboard copy
- Provider-specific formatting

---

## 4. Drift Detection & Monitoring

### Real-Time Monitoring

```bash
# Start watching for changes
butterfly watch

# Custom interval
butterfly watch --interval 30  # 30-minute checks

# Specific resources
butterfly watch --resources users,groups,apps

# Log to file
butterfly watch --log backup.log
```

**Monitors:**
- User creation/modification/deletion
- Group membership changes
- Application assignments
- Policy modifications
- Role changes
- Entitlement updates
- Admin access changes
- Workflow execution

### Drift Analysis

Compare current state against baseline:

**Analyzes:**
- Configuration divergence
- Policy compliance gaps
- Unauthorized changes
- Missing critical controls
- Outdated definitions
- Orphaned resources

### Change Tracking

**Records:**
- Before/after snapshots
- Timestamp of change
- User/system making change
- Change type (create/modify/delete)
- Affected resources
- Related changes

### Alerting

**Notifications:**
- Email alerts
- Slack integration
- Webhook delivery
- Jira ticket creation
- Custom notification rules
- Threshold-based triggers

---

## 5. Compliance & Governance

### Compliance Frameworks

#### SOC2 Type II
- User authentication & authorization
- Administrative access controls
- Change management procedures
- Incident response capabilities
- Audit trail completeness

#### ISO 27001
- Information security policies
- User access management
- Cryptographic controls
- Physical security measures
- Incident management procedures

#### Custom Policies
- MFA enforcement
- Password complexity
- Session timeout
- Admin approval workflows
- Segregation of duties

### Compliance Reporting

```bash
# Generate compliance report
butterfly compliance-report

# For specific framework
butterfly compliance-report --framework SOC2
butterfly compliance-report --framework ISO27001

# Evidence collection
butterfly compliance-evidence --output ./evidence
```

**Reports Include:**
- Executive summary
- Compliance status by control
- Evidence collection
- Gap analysis
- Remediation timeline
- Attestation support

### Access Certification

- Periodic access reviews
- Manager approval workflows
- Audit trail documentation
- Revocation capabilities
- Recertification scheduling

---

## 6. Environment Synchronization

### Compare Configurations

```bash
# Compare two backups
butterfly diff --from backup1 --to backup2

# Filter by resource type
butterfly diff --type users

# Generate detailed report
butterfly diff --report
```

**Compares:**
- User settings and attributes
- Group memberships
- Application assignments
- Policy configurations
- Admin roles and permissions
- Workflow definitions
- Integration settings

### Sync Operations

**Features:**
- Pre-flight validation
- Dependency tracking
- Safe deployment ordering
- Atomic transactions
- Failure recovery
- Rollback support

### Multi-Environment Support

- Sync between Prod, Staging, Dev
- Selective resource synchronization
- Change staging and approval
- Scheduled synchronization
- Diff review before execution

---

## 7. Okta Workflows Integration

### Backup Workflows

```bash
# Backup all workflows
butterfly backup

# Backup includes:
# - Workflow definitions
# - Connector configurations
# - Table/Stash data
# - Flopack exports
```

**Features:**
- Full workflow preservation
- Connector inventory
- Connection credentials (encrypted)
- Execution history
- Flow versioning

### Restore Workflows

```bash
# Restore workflows to environment
butterfly restore --resources workflows

# Restore from flopack
butterfly restore --flopack package.zip
```

**Features:**
- Workflow deployment
- Connector provisioning
- Flow activation
- Selective restore
- Version control

### Connector Management

**Supported Connectors:**
- HTTP (REST APIs)
- Slack
- Teams
- Jira
- ServiceNow
- Salesforce
- Google Workspace
- AWS Lambda
- Azure Functions
- Custom connectors

---

## 8. Git Integration & IaC Export

### Supported Git Providers

#### GitHub
- Direct repository access
- Personal and organization repos
- Branch management
- Pull request creation

#### GitLab
- Cloud and self-hosted
- Group and personal repos
- Merge request support
- Runner integration

#### Bitbucket
- Atlassian Cloud
- Workspace access
- Pull request creation
- Pipeline integration

#### Azure DevOps
- Repository and branch management
- Pull request creation
- Repo administration
- Enterprise integration

#### AWS CodeCommit
- Native AWS integration
- IAM authentication
- Branch management
- CodePipeline integration

#### Webhooks
- Custom CI/CD pipelines
- Generic webhook delivery
- Payload customization

### Export Formats

#### Terraform (HCL)
```bash
butterfly export terraform --output ./terraform

# Generates:
# - main.tf - Resource definitions
# - variables.tf - Input variables
# - outputs.tf - Export values
# - terraform.tfvars - Variable values
```

#### JSON
```bash
butterfly export json --output backup.json

# Complete fidelity representation
# All metadata and relationships
# Suitable for programmatic processing
```

#### YAML
```bash
butterfly export yaml --output backup.yaml

# Human-readable format
# Clear hierarchical structure
# Easy diff tracking
```

### Advanced Options

- **Selective Export** - Choose specific resources
- **Change Tracking** - See diffs between exports
- **Pull Requests** - Automatic PR creation
- **Scheduled Exports** - Automated runs
- **Merge Strategies** - How to handle conflicts
- **File Organization** - By resource type or hierarchy

---

## 9. REST API

### 80+ Endpoints Across:

- **Authentication** - OAuth flows for multiple providers
- **Backup Management** - Create, list, download, delete
- **Restore Operations** - Preview, validate, execute
- **Workflows** - Backup, restore, test operations
- **Export** - Git, Terraform, JSON, reports
- **Monitoring** - Drift, changes, alerts
- **Compliance** - Reports, validation, evidence
- **Connections** - Manage integrated services
- **Utilities** - Health checks, validation, cleanup

### Example API Calls

```bash
# Create backup
curl -X POST https://api.butterflysecurity.org/v1/backups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"organizationId": "org123", "name": "backup"}'

# List backups
curl https://api.butterflysecurity.org/v1/backups \
  -H "Authorization: Bearer $TOKEN"

# Compare backups
curl -X POST https://api.butterflysecurity.org/v1/backups/compare \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"from": "id1", "to": "id2"}'

# Export to Terraform
curl -X POST https://api.butterflysecurity.org/v1/export/terraform \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"backupId": "id123"}'
```

---

## 10. Security Features

### Authentication

- **OAuth 2.0** - Industry standard
- **Multi-account support** - Manage multiple Okta orgs
- **Token management** - Automatic refresh and rotation
- **Session control** - Timeout and revocation

### Data Protection

- **Encryption at rest** - AES-256-GCM
- **Encryption in transit** - TLS 1.3
- **Key management** - Secure key derivation
- **Credential masking** - In logs and exports
- **Audit logging** - All access and changes

### Access Control

- **Role-based access** - Admin, Viewer, Editor
- **Resource-level control** - Fine-grained permissions
- **Multi-tenancy** - Organization isolation
- **Delegation** - Granular permission sharing

---

## 11. Command Reference

### Authentication

```bash
butterfly login                    # OAuth login
butterfly logout                   # Clear credentials
butterfly whoami                   # Show status
```

### Backup Operations

```bash
butterfly backup                   # Trigger backup
butterfly backup --wait            # Wait for completion
butterfly list                     # List backups
butterfly info <id>                # Backup details
butterfly download <id>            # Download backup
butterfly delete <id>              # Delete backup
```

### Comparison

```bash
butterfly diff                     # Latest two backups
butterfly diff --from id1 --to id2 # Specific backups
butterfly diff --type users        # Filter by type
```

### Export

```bash
butterfly export terraform         # Export as Terraform
butterfly export json              # Export as JSON
butterfly export yaml              # Export as YAML
butterfly export git               # Export to Git
```

### Monitoring

```bash
butterfly watch                    # Start monitoring
butterfly monitor                  # Generate report
butterfly status                   # Organization status
```

### Configuration

```bash
butterfly config show              # View settings
butterfly config set key value     # Update setting
butterfly config edit              # Interactive editor
butterfly config reset             # Reset to defaults
```

---

## 12. Resource Types

### Users
- Profile attributes
- Group memberships
- App assignments
- Admin roles
- MFA enrollment
- Status (Active, Staged, Suspended, Deprovisioned)

### Groups
- Member list
- Application assignments
- Rules (user creation and update)
- Dynamic group criteria
- Profile attributes

### Applications
- SAML configuration
- OAuth credential
- OpenID Connect settings
- API scopes
- User assignments
- Group assignments
- Sign-on rules

### Policies
- Sign-on policies
- Password policies
- MFA policies
- Access policies
- Device assurance policies
- Conditions and actions

### Infrastructure
- Authorization servers
- Identity providers (OIDC, SAML, Social)
- Trusted origins
- Network zones
- Provisioning connections

### Workflows
- Flow definitions
- Connectors and connections
- Tables and stashes
- Execution policies
- Error handling
- Scheduling

---

## 13. Use Cases

### Disaster Recovery
- Regular automated backups
- Multi-version storage
- Quick restore capability
- RTO/RPO enforcement

### Compliance & Auditing
- Configuration audit trail
- Change tracking
- Evidence collection
- Certification support
- Access reviews

### Development & Testing
- Clone configuration to dev/staging
- Safe experimentation
- Rollback capability
- Team collaboration

### Infrastructure as Code
- Export to Terraform
- Version control integration
- CI/CD automation
- Reproducible deployments

### Identity Governance
- Access reviews
- Compliance monitoring
- Drift detection
- Remediation tracking

### Migration & Integration
- Configuration export
- Multi-environment sync
- Scheduled backups
- Webhook integration

---

## 14. Performance & Scalability

### Capacity Support
- 100,000+ users
- 10,000+ groups
- 5,000+ applications
- 1,000+ workflows
- Unlimited backups

### Performance
- Incremental backup (minutes for changes)
- Parallel processing
- Compression optimization
- Streaming uploads/downloads
- Efficient diff computation

### Reliability
- Resumable operations
- Automatic retry logic
- Rollback capability
- Atomic transactions
- Transaction logs

---

## Conclusion

Butterfly provides a comprehensive solution for Okta backup, recovery, and identity governance. Whether using the CLI for automation or the web dashboard for management, you have the tools to:

✅ Protect your Okta configuration
✅ Ensure compliance and security
✅ Govern identity access
✅ Automate operations
✅ Enable rapid recovery

For more information, see the complete [documentation](https://mickolasjae.github.io/cli/) and [API reference](api.md).
