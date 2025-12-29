#!/bin/bash
# Fetch private content repository at build time
# Requires GITHUB_TOKEN environment variable with repo read access
#
# Environment variables:
#   GITHUB_TOKEN   - Required: GitHub token with repo read access
#   CONTENT_REF    - Optional: Branch/tag/commit to fetch (default: main)
#
# For Vercel preview deployments, set CONTENT_REF to match a branch in
# teenylilcontent when making coordinated changes across both repos.

set -e

REPO_URL="https://github.com/3mdistal/teenylilcontent.git"
CONTENT_DIR="content"
CONTENT_REF="${CONTENT_REF:-main}"

echo "📦 Fetching private content..."
echo "   ref: $CONTENT_REF"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
	echo "⚠️  GITHUB_TOKEN not set - checking if content already exists..."
	if [ -d "$CONTENT_DIR" ]; then
		echo "✓ Content directory exists (local development)"
		exit 0
	else
		echo "❌ Error: GITHUB_TOKEN is required for fetching content"
		echo "   Set GITHUB_TOKEN environment variable or ensure content/ directory exists"
		exit 1
	fi
fi

# Remove existing content directory if it exists
if [ -d "$CONTENT_DIR" ]; then
	echo "  Removing existing content directory..."
	rm -rf "$CONTENT_DIR"
fi

# Clone using HTTPS with token authentication
echo "  Cloning from private repository..."
if git clone --depth 1 --branch "$CONTENT_REF" "https://${GITHUB_TOKEN}@github.com/3mdistal/teenylilcontent.git" "$CONTENT_DIR" 2>/dev/null; then
	echo "  ✓ Cloned ref: $CONTENT_REF"
else
	# Ref doesn't exist - fall back to main
	if [ "$CONTENT_REF" != "main" ]; then
		echo ""
		echo "  ⚠️  WARNING: Branch '$CONTENT_REF' not found in teenylilcontent"
		echo "  ⚠️  Falling back to 'main' branch"
		echo ""
	fi
	git clone --depth 1 --branch main "https://${GITHUB_TOKEN}@github.com/3mdistal/teenylilcontent.git" "$CONTENT_DIR"

	if [ ! -d "$CONTENT_DIR" ]; then
		echo "❌ Error: Failed to clone teenylilcontent (even main branch)"
		exit 1
	fi
	CONTENT_REF="main (fallback)"
fi

# Remove .git directory to save space (we don't need git history)
rm -rf "$CONTENT_DIR/.git"

echo "✓ Content fetched successfully (ref: $CONTENT_REF)"
