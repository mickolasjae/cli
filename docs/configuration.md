# Configuration Guide

Learn how to configure Butterfly CLI for your environment.

## Configuration File

Configuration is stored in a JSON file at:

- **Linux/macOS**: `~/.config/butterfly-cli/config.json`
- **Windows**: `%APPDATA%\butterfly-cli\config.json`

### Default Configuration

```json
{
  "apiKey": null,
  "apiUrl": "https://api.butterflysecurity.org",
  "defaultOrg": null,
  "selectedBackup": null
}
```

## Environment Variables

Override configuration using environment variables:

### Required

```bash
# API authentication key
export BUTTERFLY_API_KEY=sk_live_...
```

### Optional

```bash
# Custom API endpoint
export BUTTERFLY_API_URL=https://custom-api.example.com

# Default organization
export BUTTERFLY_DEFAULT_ORG=org-id

# Disable interactive prompts
export BUTTERFLY_NO_INTERACTIVE=true

# Disable color output
export NO_COLOR=1

# Enable debug logging
export DEBUG=butterfly:*
```

## Configuration Commands

### View Current Configuration

```bash
# Display current configuration
butterfly config show

# JSON format
butterfly config show --json

# Show with sensitive data masked
butterfly config show --secure
```

### Set Configuration Values

```bash
# Set individual values
butterfly config set apiKey sk_live_...
butterfly config set apiUrl https://api.example.com
butterfly config set defaultOrg org-id

# Verify value was set
butterfly config show
```

### Interactive Configuration

```bash
# Launch interactive editor
butterfly config edit
```

### Reset Configuration

```bash
# Reset all settings to defaults
butterfly config reset

# Reset specific setting
butterfly config set apiKey null
```

## API Configuration

### Custom API Endpoint

For self-hosted or custom Butterfly API:

```bash
butterfly config set apiUrl https://your-api.example.com
```

Or environment variable:

```bash
export BUTTERFLY_API_URL=https://your-api.example.com
```

### API Key Management

#### Generate API Key

1. Log in to your Butterfly account
2. Go to Settings > API Keys
3. Click "Create API Key"
4. Copy the key (shown only once)

#### Store API Key Safely

**Option 1: Environment Variable**

```bash
# Add to ~/.bashrc or ~/.zshrc
export BUTTERFLY_API_KEY=sk_live_...

# Or load from secure storage
eval "$(1password item get 'Butterfly API Key' --fields label=value --format=json | jq -r '.[] | "export \(.label | ascii_upcase)=\(.value)"')"
```

**Option 2: Configuration File**

```bash
butterfly config set apiKey sk_live_...
```

**Option 3: CI/CD Secrets**

Store in platform-specific secret managers:

- **GitHub**: `Settings > Secrets > New repository secret`
- **GitLab**: `Settings > CI/CD > Variables`
- **Jenkins**: `Credentials > System > Global credentials`

#### Rotate API Key

```bash
# Generate new key in account settings, then:
butterfly config set apiKey sk_live_...

# Verify new key works
butterfly status

# Delete old key from account settings
```

## Organization Configuration

### Set Default Organization

```bash
# Set default org
butterfly config set defaultOrg my-org-id

# Verify
butterfly config show
```

### List Available Organizations

```bash
butterfly status

# Shows all accessible organizations
```

### Override for Single Command

```bash
# Use specific org without changing default
butterfly --org other-org backup
butterfly --org other-org list
```

## Output Configuration

### Color Output

Disable colored output:

```bash
export NO_COLOR=1
```

### Verbosity

Control output detail:

```bash
# Quiet mode
butterfly backup --quiet

# Verbose mode
butterfly backup --verbose

# Debug mode
export DEBUG=butterfly:* butterfly backup
```

## Performance Configuration

### Timeouts

```bash
# API request timeout (seconds)
export BUTTERFLY_TIMEOUT=30

# Backup operation timeout
butterfly backup --timeout 3600
```

### Concurrency

```bash
# Number of concurrent operations
export BUTTERFLY_CONCURRENCY=4

# Custom backup thread count
butterfly backup --threads 8
```

## Proxy Configuration

### HTTP Proxy

```bash
# Set proxy for all requests
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=https://proxy.example.com:8080

# With authentication
export HTTP_PROXY=http://user:pass@proxy.example.com:8080
```

### No Proxy

```bash
# Skip proxy for specific hosts
export NO_PROXY=localhost,127.0.0.1,api.butterflysecurity.org
```

## Logging Configuration

### Enable Debug Logging

```bash
# Enable detailed logs
export DEBUG=butterfly:*

# Run command with debug
DEBUG=butterfly:* butterfly backup

# Save to file
DEBUG=butterfly:* butterfly backup 2>&1 | tee backup.log
```

### Log Levels

```bash
# Debug (most verbose)
export LOG_LEVEL=debug

# Info (default)
export LOG_LEVEL=info

# Warn
export LOG_LEVEL=warn

# Error (least verbose)
export LOG_LEVEL=error
```

## Advanced Configuration

### Custom Certificate

For self-signed certificates:

```bash
# Path to CA certificate
export NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt

# Or disable certificate verification (not recommended)
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Profile-Based Configuration

Create multiple configurations:

```bash
# Production profile
export BUTTERFLY_CONFIG_DIR=~/.butterfly/prod
butterfly status

# Staging profile
export BUTTERFLY_CONFIG_DIR=~/.butterfly/staging
butterfly status
```

## Configuration Best Practices

### Security

✅ **Do:**
- Store API keys in environment variables
- Use OS credential storage (keychain, Windows Credential Manager)
- Rotate API keys regularly
- Use least-privilege API scopes

❌ **Don't:**
- Commit API keys to version control
- Share API keys via email or chat
- Use same key for multiple environments
- Hardcode keys in scripts

### Maintenance

- Back up your configuration file
- Document non-obvious settings
- Review settings periodically
- Keep API keys rotated

### Performance

- Set appropriate timeouts for your network
- Adjust concurrency based on API limits
- Use caching when possible
- Monitor API rate limits

## Troubleshooting Configuration

### Reset to Defaults

```bash
butterfly config reset
```

### Verify Configuration

```bash
butterfly config show --json | jq
```

### Test Connection

```bash
butterfly status
```

### Check Environment Variables

```bash
env | grep BUTTERFLY
```

## Next Steps

- [Usage Guide](usage.md) - Learn all commands
- [Examples](examples.md) - Real-world scenarios
- [Troubleshooting](troubleshooting.md) - Common issues
