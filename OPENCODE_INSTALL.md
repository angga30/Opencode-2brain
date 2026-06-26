# Opencode Installation Guide

## Installation Methods

### Method 1: Local Development (Recommended for testing)

```bash
# Navigate to your Opencode plugins directory
cd ~/.opencode/plugins

# Clone or symlink your plugin
ln -s /Users/peter/experiment/Opencode-2brain memory-growth-plugin

# Or clone directly
git clone <repository-url> memory-growth-plugin
cd memory-growth-plugin
npm install
npm run build
```

### Method 2: NPM Package Installation (When published)

```bash
# Install from npm registry
npm install -g memory-growth-plugin

# Or install as local dependency in your Opencode config
npm install --save-dev memory-growth-plugin
```

### Method 3: Direct Integration

Copy the built plugin to your Opencode installation:

```bash
# Build the plugin
npm run build

# Copy to Opencode plugins directory
cp -r dist ~/.opencode/plugins/memory-growth-plugin
```

## Opencode Configuration

Create or update `~/.opencode/config.json`:

```json
{
  "plugins": [
    {
      "name": "memory-growth-plugin",
      "enabled": true,
      "path": "/Users/peter/experiment/Opencode-2brain",
      "commands": [
        "memory-status",
        "memory-weights", 
        "memory-patterns",
        "memory-adjust-weight",
        "memory-analyze",
        "memory-export",
        "memory-import",
        "memory-reset"
      ]
    }
  ],
  "agentmemory": {
    "enabled": true,
    "serverUrl": "http://localhost:3111"
  }
}
```

## Verify Installation

```bash
# Start Opencode
opencode start

# Test the plugin
opencode run /memory-status

# You should see:
# 📊 Memory Status
# ├─ Skills Tracked: 12
# ├─ Active Patterns: 5
```

## MCP Server Setup (agentmemory.dev)

The plugin requires agentmemory.dev MCP server running:

```bash
# Install agentmemory MCP server
npm install -g @agentmemory/mcp-server

# Start the server
agentmemory-server --port 3111

# Or run in background
agentmemory-server --port 3111 --daemon
```

## Troubleshooting

### Plugin not loading
```bash
# Check Opencode logs
opencode logs

# Verify plugin build
cd /path/to/memory-growth-plugin
npm run build
ls -la dist/  # Should show index.js
```

### Commands not registered
```bash
# Check plugin is enabled in config
cat ~/.opencode/config.json | grep memory-growth

# Restart Opencode
opencode restart
```

### agentmemory connection failed
```bash
# Verify MCP server is running
curl http://localhost:3111/health

# Check plugin logs for connection status
opencode logs --plugin memory-growth-plugin
```

## Development Setup

For active development:

```bash
# In plugin directory
npm run dev  # Watch mode

# Opencode will auto-reload on changes
# Or manually restart: opencode restart
```

## Usage Example

After installation:

```bash
# Check memory status
opencode run /memory-status

# View skill weights
opencode run /memory-weights --category resilience

# Analyze learning patterns
opencode run /memory-analyze

# Export learning state
opencode run /memory-export backup.json

# Reset if needed
opencode run /memory-reset soft --confirm
```

## Uninstall

```bash
# Stop Opencode
opencode stop

# Remove plugin
rm -rf ~/.opencode/plugins/memory-growth-plugin

# Or uninstall npm package
npm uninstall -g memory-growth-plugin

# Update config to remove plugin entry
# Edit ~/.opencode/config.json

# Restart Opencode
opencode start
```

## Next Steps

1. Configure your skill library in `src/config/skills.json`
2. Start solving problems to track learning
3. Monitor progress with `/memory-status`
4. Analyze patterns with `/memory-patterns`
5. Export/import learning state for backup
