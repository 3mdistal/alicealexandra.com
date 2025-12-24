#!/bin/bash
# Setup content repository for local development
# Uses SSH by default (assumes you have SSH keys configured with GitHub)
# Keeps .git directory so you can push changes back

set -e

REPO_SSH="git@github.com:3mdistal/teenylilcontent.git"
REPO_HTTPS="https://github.com/3mdistal/teenylilcontent.git"
CONTENT_DIR="content"

echo "📦 Setting up content for local development..."

# Check if content directory already exists
if [ -d "$CONTENT_DIR" ]; then
    echo "  Content directory already exists."
    echo ""
    read -p "  Do you want to pull latest changes? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "  Pulling latest changes..."
        cd "$CONTENT_DIR"
        git pull
        cd ..
        echo "✓ Content updated!"
    else
        echo "  Skipping. Run 'cd content && git pull' manually to update."
    fi
    exit 0
fi

# Try SSH first, fall back to HTTPS
echo "  Cloning content repository..."

if git clone "$REPO_SSH" "$CONTENT_DIR" 2>/dev/null; then
    echo "✓ Cloned via SSH"
else
    echo "  SSH clone failed, trying HTTPS..."
    if [ -n "$GITHUB_TOKEN" ]; then
        git clone "https://${GITHUB_TOKEN}@github.com/3mdistal/teenylilcontent.git" "$CONTENT_DIR"
    else
        git clone "$REPO_HTTPS" "$CONTENT_DIR"
    fi
    echo "✓ Cloned via HTTPS"
fi

echo ""
echo "✓ Content setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm dev' to start the dev server"
echo "  2. Edit content in content/ directory"
echo "  3. Push changes: cd content && git add . && git commit -m 'Update' && git push"
