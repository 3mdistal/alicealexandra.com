#!/bin/bash
# Fetch content repository at build time.
# - If `content/` already exists, do nothing (local dev).
# - If `content/` does not exist:
#   - try an unauthenticated clone
#   - if that fails, fall back to requiring `GITHUB_TOKEN` (for private repos)

set -euo pipefail

REPO_URL="https://github.com/3mdistal/teenylilcontent.git"
CONTENT_DIR="content"

echo "📦 Fetching content..."

# Local dev fast-path
if [ -d "$CONTENT_DIR" ]; then
	echo "✓ Content directory exists (skipping fetch)"
	exit 0
fi

clone_and_strip_git() {
	local url="$1"
	echo "  Cloning..."
	git clone --depth 1 "$url" "$CONTENT_DIR"
	rm -rf "$CONTENT_DIR/.git"
}

# First try without auth (works for public repos)
if clone_and_strip_git "$REPO_URL"; then
	echo "✓ Content fetched successfully!"
	exit 0
fi

# If unauth clone fails, try with token (private repos)
if [ -z "${GITHUB_TOKEN:-}" ]; then
	echo "❌ Error: Failed to fetch content without auth, and GITHUB_TOKEN is not set."
	echo "   Set GITHUB_TOKEN or ensure content/ exists locally."
	exit 1
fi

AUTH_REPO_URL="https://${GITHUB_TOKEN}@${REPO_URL#https://}"
rm -rf "$CONTENT_DIR"
clone_and_strip_git "$AUTH_REPO_URL"

echo "✓ Content fetched successfully!"

