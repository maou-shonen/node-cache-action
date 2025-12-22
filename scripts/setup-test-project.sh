#!/usr/bin/env bash
set -e

# Setup test project with package.json
# Usage: ./setup-test-project.sh <package-manager>

PM="${1:-npm}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FIXTURES_DIR="$SCRIPT_DIR/../fixtures"

# Copy package.json from fixtures
cp "$FIXTURES_DIR/package.json" package.json
echo "✓ Copied package.json from fixtures"

# Create lockfile based on package manager
case "$PM" in
  npm)
    npm install --package-lock-only
    echo "✓ Created package-lock.json"
    ;;
  pnpm)
    pnpm install --lockfile-only
    echo "✓ Created pnpm-lock.yaml"
    ;;
  yarn)
    yarn install --mode update-lockfile
    echo "✓ Created yarn.lock"
    ;;
  bun)
    bun install --lockfile-only
    echo "✓ Created bun.lockb"
    ;;
  *)
    echo "❌ Unknown package manager: $PM"
    echo "Supported: npm, pnpm, yarn, bun"
    exit 1
    ;;
esac
