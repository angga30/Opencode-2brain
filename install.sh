#!/bin/bash

# Memory Growth Plugin - Opencode Installation Script
# This script helps install the plugin in your Opencode setup

set -e

echo "🚀 Memory Growth Plugin - Opencode Installation"
echo ""

# Check if Opencode directory exists
OPENCODE_DIR="$HOME/.opencode"
if [ ! -d "$OPENCODE_DIR" ]; then
    echo "⚠️  Opencode directory not found: $OPENCODE_DIR"
    echo "Creating Opencode directory structure..."
    mkdir -p "$OPENCODE_DIR/plugins"
    mkdir -p "$OPENCODE_DIR/config"
fi

# Get current directory
PLUGIN_DIR=$(pwd)
echo "📁 Plugin directory: $PLUGIN_DIR"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the plugin
echo "🔨 Building plugin..."
npm run build

# Check if build succeeded
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed - dist/index.js not found"
    exit 1
fi

echo "✅ Build successful"
echo ""

# Create symlink in Opencode plugins directory
PLUGINS_DIR="$OPENCODE_DIR/plugins"
mkdir -p "$PLUGINS_DIR"

LINK_PATH="$PLUGINS_DIR/memory-growth-plugin"
if [ -L "$LINK_PATH" ]; then
    echo "🔗 Removing existing symlink..."
    rm "$LINK_PATH"
fi

echo "🔗 Creating plugin symlink..."
ln -s "$PLUGIN_DIR" "$LINK_PATH"
echo "✅ Plugin linked to: $LINK_PATH"
echo ""

# Create or update Opencode config
CONFIG_FILE="$OPENCODE_DIR/config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📝 Creating Opencode config..."
    cat > "$CONFIG_FILE" << EOF
{
  "plugins": []
}
EOF
fi

# Check if plugin already in config
if grep -q "memory-growth-plugin" "$CONFIG_FILE"; then
    echo "ℹ️  Plugin already in config"
else
    echo "📝 Adding plugin to Opencode config..."
    # Use Node.js to properly update JSON
    node -e "
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('$CONFIG_FILE', 'utf8'));
        if (!config.plugins) config.plugins = [];
        config.plugins.push({
            name: 'memory-growth-plugin',
            enabled: true,
            path: '$PLUGIN_DIR',
            commands: [
                'memory-status',
                'memory-weights',
                'memory-patterns',
                'memory-adjust-weight',
                'memory-analyze',
                'memory-export',
                'memory-import',
                'memory-reset'
            ]
        });
        fs.writeFileSync('$CONFIG_FILE', JSON.stringify(config, null, 2));
    "
    echo "✅ Config updated"
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "1. Start Opencode (if not running): opencode start"
echo "2. Test the plugin: opencode run /memory-status"
echo "3. Start agentmemory server (if needed): agentmemory-server --port 3111"
echo ""
echo "For troubleshooting, check: opencode logs"
