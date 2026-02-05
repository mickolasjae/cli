# Troubleshooting Guide

Common issues and solutions for Butterfly CLI.

## Installation Issues

### Command Not Found

**Problem:** `butterfly: command not found`

**Solution:**

Verify installation:
```bash
npm list -g @butterfly-security/cli
```

Check PATH:
```bash
npm config get prefix
# Should output npm's bin directory

# Add to PATH if needed
export PATH="$(npm config get prefix)/bin:$PATH"
```

### Permission Denied

**Problem:** `Error: EACCES: permission denied`

**Solution:**

Fix npm permissions:
```bash
# Don't use sudo - fix permissions instead
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Reinstall
npm install -g @butterfly-security/cli
```

### Node Version Error

**Problem:** `Node.js version not supported`

**Solution:**

Check Node version:
```bash
node --version
# Should be v18.0.0 or higher
```

Update Node.js:
```bash
# Using nvm (recommended)
nvm install 20
nvm use 20

# Or download from https://nodejs.org
```

## Authentication Issues

### Invalid API Key

**Problem:** `Error: Invalid API key`

**Solution:**

1. Verify API key is correct:
```bash
echo $BUTTERFLY_API_KEY
```

2. Re-login:
```bash
butterfly logout
butterfly login --api-key YOUR_API_KEY
```

3. Check configuration:
```bash
butterfly config show
```

### Authentication Expired

**Problem:** `Error: Authentication failed`

**Solution:**

Re-authenticate:
```bash
butterfly logout
butterfly login --api-key YOUR_API_KEY
```

Or use environment variable:
```bash
export BUTTERFLY_API_KEY=your-new-key
butterfly status
```

### Cannot Connect to API

**Problem:** `Error: Connection refused` or `ECONNREFUSED`

**Solution:**

Check API endpoint:
```bash
butterfly config show

# Should show correct apiUrl
```

Verify network connectivity:
```bash
# Test API endpoint
curl -H "Authorization: Bearer $BUTTERFLY_API_KEY" \
  https://api.butterflysecurity.org/health

# Or custom endpoint
curl https://your-api.example.com/health
```

Check firewall/proxy:
```bash
# If behind proxy, configure:
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=https://proxy.example.com:8080

# Then retry
butterfly status
```

## Command Issues

### Backup Hangs

**Problem:** `butterfly backup` doesn't complete

**Solution:**

1. Wait longer (backups can take time):
```bash
# Give it time or use timeout
butterfly backup --wait --timeout 1800
```

2. Check status in another terminal:
```bash
butterfly status
```

3. Cancel and check logs:
```bash
# Press Ctrl+C to cancel
# Enable debug logging
DEBUG=butterfly:* butterfly backup
```

### Diff Returns No Changes

**Problem:** `butterfly diff` shows nothing changed

**Solution:**

1. Verify backups exist:
```bash
butterfly list
```

2. Check backup IDs:
```bash
butterfly diff --from ID1 --to ID2
```

3. Try with verbose output:
```bash
butterfly diff --verbose
```

4. Check backup selection:
```bash
butterfly selected
```

### Export Fails

**Problem:** `butterfly export` returns error

**Solution:**

Check backup status:
```bash
butterfly list
butterfly selected
```

Verify output directory:
```bash
# Create directory if needed
mkdir -p ./terraform

# Export with full path
butterfly export terraform --output "$(pwd)/terraform"
```

Check permissions:
```bash
# Ensure write permission to output directory
ls -la ./terraform
chmod 755 ./terraform
```

## Performance Issues

### Slow Commands

**Problem:** Commands take too long to execute

**Solution:**

1. Check network:
```bash
ping api.butterflysecurity.org
```

2. Enable debug logging:
```bash
DEBUG=butterfly:* butterfly backup
```

3. Increase timeout:
```bash
butterfly backup --timeout 3600
```

4. Check system resources:
```bash
# Monitor CPU and memory
top
```

### High Memory Usage

**Problem:** CLI uses excessive memory

**Solution:**

1. Upgrade Node.js:
```bash
node --version  # Update to latest LTS
```

2. Reduce concurrency:
```bash
export BUTTERFLY_CONCURRENCY=2
butterfly backup
```

3. Backup in smaller chunks:
```bash
# Backup specific resources
butterfly backup -r users --wait
butterfly backup -r groups --wait
```

## Configuration Issues

### Configuration Not Loading

**Problem:** Settings not being applied

**Solution:**

Verify configuration file:
```bash
butterfly config show

# Check file location
# Linux/macOS: ~/.config/butterfly-cli/config.json
# Windows: %APPDATA%\butterfly-cli\config.json
```

Use environment variables instead:
```bash
export BUTTERFLY_API_KEY=sk_live_...
butterfly status
```

### Environment Variable Not Working

**Problem:** Environment variables ignored

**Solution:**

1. Verify variable is set:
```bash
env | grep BUTTERFLY
```

2. Set and use in same command:
```bash
BUTTERFLY_API_KEY=sk_live_... butterfly status
```

3. Export properly:
```bash
export BUTTERFLY_API_KEY=sk_live_...
butterfly status
```

4. Check shell:
```bash
echo $SHELL
# Add to appropriate rc file
# ~/.bashrc for bash
# ~/.zshrc for zsh
```

## Network Issues

### Proxy Connection Failed

**Problem:** `Error: Cannot connect through proxy`

**Solution:**

Configure proxy:
```bash
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=https://proxy.example.com:8080

# With authentication
export HTTP_PROXY=http://user:pass@proxy.example.com:8080
```

Test proxy:
```bash
curl -v -x $HTTP_PROXY https://api.butterflysecurity.org
```

### Certificate Validation Failed

**Problem:** `Error: Certificate validation failed`

**Solution:**

For self-signed certificates:
```bash
# Path to CA certificate
export NODE_EXTRA_CA_CERTS=/path/to/ca-bundle.crt

# Or skip validation (dev only)
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

### Timeout Errors

**Problem:** `Error: Request timeout`

**Solution:**

Increase timeout:
```bash
export BUTTERFLY_TIMEOUT=60
butterfly backup
```

Check network:
```bash
# Test connectivity
ping api.butterflysecurity.org
traceroute api.butterflysecurity.org
```

## Getting Help

### Enable Debug Logging

Collect debug information:
```bash
DEBUG=butterfly:* butterfly command-name 2>&1 | tee debug.log
```

### Check System Information

```bash
# Operating system
uname -a

# Node version
node --version

# npm version
npm --version

# Butterfly version
butterfly --version
```

### Report an Issue

Create a GitHub issue with:

1. Command that failed
2. Output (with sensitive data removed)
3. System information (OS, Node version)
4. Debug log (if applicable)

Visit: https://github.com/mickolasjae/cli/issues

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid API key` | Wrong/expired key | Re-login |
| `Connection refused` | API unreachable | Check network/endpoint |
| `Permission denied` | File permissions | Check directory permissions |
| `Timeout` | Slow connection | Increase timeout |
| `Out of memory` | Large backup | Reduce concurrency |
| `Not authenticated` | Missing credentials | Run `butterfly login` |

## Contacting Support

- **Issues**: https://github.com/mickolasjae/cli/issues
- **Email**: support@butterflysecurity.org
- **Documentation**: https://docs.butterflysecurity.org

## Next Steps

- [Configuration Guide](configuration.md) - Configure settings
- [Examples](examples.md) - Real-world usage
- [Usage Guide](usage.md) - Command reference
