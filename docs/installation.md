# Installation Guide

Choose the installation method that works best for your environment.

## npm (Node.js)

The recommended way to install Butterfly CLI globally.

### Requirements

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

```bash
npm install -g @butterfly-security/cli
```

### Verify Installation

```bash
butterfly --version
```

### Update

```bash
npm install -g @butterfly-security/cli@latest
```

### Uninstall

```bash
npm uninstall -g @butterfly-security/cli
```

## Homebrew (macOS/Linux)

Package manager installation for macOS and Linux.

### Prerequisites

- Homebrew installed

### Installation

```bash
brew tap butterfly-security/tap
brew install butterfly
```

### Verify Installation

```bash
butterfly --version
```

### Update

```bash
brew upgrade butterfly
```

### Uninstall

```bash
brew uninstall butterfly
```

## Binary Download

Download pre-built executables for your platform.

Visit the [Releases Page](https://github.com/mickolasjae/cli/releases) and download the binary for your OS:

- `butterfly-v0.1.0-macos-arm64.tar.gz` - macOS (Apple Silicon)
- `butterfly-v0.1.0-macos-x64.tar.gz` - macOS (Intel)
- `butterfly-v0.1.0-linux-x64.tar.gz` - Linux
- `butterfly-v0.1.0-windows-x64.zip` - Windows

### Setup Binary

```bash
# Extract
tar -xzf butterfly-v0.1.0-macos-arm64.tar.gz

# Make executable (if needed)
chmod +x butterfly

# Move to PATH
sudo mv butterfly /usr/local/bin/

# Verify
butterfly --version
```

## From Source

Build from source if you want the latest development version.

### Prerequisites

- Node.js 18.0.0+
- npm or yarn
- Git

### Build Steps

```bash
# Clone repository
git clone https://github.com/mickolasjae/cli.git
cd cli

# Install dependencies
npm install

# Build
npm run build

# Run (optional: link globally)
npm install -g .
```

## Troubleshooting Installation

### Command Not Found

If `butterfly` command is not found after installation:

**npm:** Check that npm's global bin directory is in your PATH
```bash
npm config get prefix
# Add to PATH if needed
export PATH="$(npm config get prefix)/bin:$PATH"
```

**Homebrew:** Verify installation
```bash
which butterfly
```

### Permission Denied

If you get permission errors with npm:

```bash
# Don't use sudo with npm - instead fix permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Node Version Issues

Ensure you're running Node.js 18+:

```bash
node --version
# Should output: v18.0.0 or higher
```

Update Node.js if needed: https://nodejs.org/

## Next Steps

After installation, proceed with [Login & Authentication](usage.md#authentication).
