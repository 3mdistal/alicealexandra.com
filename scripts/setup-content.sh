#!/bin/bash
# Setup content repository for local development
# Uses SSH by default (assumes you have SSH keys configured with GitHub)
# Keeps .git directory so you can push changes back
#
# Usage:
#   pnpm setup:content           # Interactive mode (or auto-mode if no TTY)
#   pnpm setup:content --force   # Non-interactive, replaces existing content
#   pnpm setup:content --pull    # Non-interactive, pulls if exists
#
# Environment variables:
#   CONTENT_REF    - Optional: Branch to clone/checkout (default: main)
#   GITHUB_TOKEN   - Optional: Used for HTTPS fallback if SSH fails

set -e

REPO_SSH="git@github.com:3mdistal/teenylilcontent.git"
REPO_HTTPS="https://github.com/3mdistal/teenylilcontent.git"
CONTENT_DIR="content"
CONTENT_REF="${CONTENT_REF:-main}"

# Parse arguments
FORCE=false
PULL=false
for arg in "$@"; do
	case $arg in
	--force | -f)
		FORCE=true
		;;
	--pull | -p)
		PULL=true
		;;
	esac
done

# Check if we're in an interactive terminal
is_interactive() {
	[ -t 0 ]
}

echo "📦 Setting up content for local development..."
if [ "$CONTENT_REF" != "main" ]; then
	echo "   ref: $CONTENT_REF"
fi

# Function to clone the repo
clone_repo() {
	echo "  Cloning content repository (ref: $CONTENT_REF)..."

	# Try SSH first, fall back to HTTPS
	if git clone --branch "$CONTENT_REF" "$REPO_SSH" "$CONTENT_DIR" 2>/dev/null; then
		echo "✓ Cloned via SSH (ref: $CONTENT_REF)"
	else
		echo "  SSH clone failed, trying HTTPS..."
		if [ -n "$GITHUB_TOKEN" ]; then
			git clone --branch "$CONTENT_REF" "https://${GITHUB_TOKEN}@github.com/3mdistal/teenylilcontent.git" "$CONTENT_DIR"
		else
			git clone --branch "$CONTENT_REF" "$REPO_HTTPS" "$CONTENT_DIR"
		fi
		echo "✓ Cloned via HTTPS (ref: $CONTENT_REF)"
	fi
}

# Check if content directory already exists
if [ -d "$CONTENT_DIR" ]; then
	echo "  Content directory already exists."

	# Check if it's a git repo
	if [ -d "$CONTENT_DIR/.git" ]; then
		# It's a git repo - we can pull
		if [ "$PULL" = true ]; then
			echo "  Pulling latest changes..."
			cd "$CONTENT_DIR"
			git pull
			cd ..
			echo "✓ Content updated!"
			exit 0
		elif [ "$FORCE" = true ]; then
			echo "  Force mode: removing and re-cloning..."
			rm -rf "$CONTENT_DIR"
			clone_repo
		elif is_interactive; then
			echo ""
			echo "  Options:"
			echo "    1) Pull latest changes"
			echo "    2) Replace with fresh clone"
			echo "    3) Skip (keep as-is)"
			echo ""
			read -p "  Choose [1/2/3]: " -n 1 -r choice
			echo ""
			case $choice in
			1)
				echo "  Pulling latest changes..."
				cd "$CONTENT_DIR"
				git pull
				cd ..
				echo "✓ Content updated!"
				;;
			2)
				echo "  Removing and re-cloning..."
				rm -rf "$CONTENT_DIR"
				clone_repo
				;;
			*)
				echo "  Skipping. Content left as-is."
				;;
			esac
		else
			# Non-interactive: just use existing content
			echo "  Non-interactive mode: using existing content."
			echo "✓ Content ready!"
		fi
		exit 0
	else
		# Content exists but is NOT a git repo (e.g., from fetch-content.sh)
		# Always replace with a proper git clone so we can push changes
		if [ "$FORCE" = true ] || [ "$PULL" = true ] || ! is_interactive; then
			echo "  Content exists but is not a git repo. Replacing with proper clone..."
			rm -rf "$CONTENT_DIR"
			clone_repo
		else
			echo ""
			echo "  ⚠️  Content exists but is not a git repo."
			echo "  (This happens when content was fetched by vercel-build)"
			echo ""
			read -p "  Replace with proper git clone? (y/n) " -n 1 -r
			echo ""
			if [[ $REPLY =~ ^[Yy]$ ]]; then
				echo "  Removing and re-cloning..."
				rm -rf "$CONTENT_DIR"
				clone_repo
			else
				echo "  Skipping. You won't be able to push changes."
				exit 0
			fi
		fi
	fi
else
	# Content doesn't exist - just clone
	clone_repo
fi

echo ""
echo "✓ Content setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm dev' to start the dev server"
echo "  2. Edit content in content/ directory"
echo "  3. Push changes: cd content && git add . && git commit -m 'Update' && git push"
