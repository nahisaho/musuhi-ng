#!/bin/bash
# MUSUHI 2.0 - Prepare packages for npm publication
# This script adds necessary fields to package.json files for npm publishing

set -e

echo "🚀 Preparing MUSUHI packages for npm publication..."

# Define packages to publish (excluding e2e-tests and adapters)
PACKAGES=(
  "core"
  "cli"
  "dashboard"
  "constitutional-governance"
  "change-workflow"
  "multi-agent-orchestrator"
  "parallel-executor"
  "gap-analyzer"
  "iterative-verification"
  "platform-adapters"
  "verification-engine"
  "security-audit-logger"
)

# Repository info
REPO_URL="https://github.com/musuhi/musuhi2"
BUGS_URL="https://github.com/musuhi/musuhi2/issues"
HOMEPAGE_URL="https://musuhi.github.io/musuhi2"

# Add publishConfig to each package
for pkg in "${PACKAGES[@]}"; do
  PKG_DIR="packages/$pkg"
  PKG_JSON="$PKG_DIR/package.json"

  if [ ! -f "$PKG_JSON" ]; then
    echo "⚠️  Skipping $pkg (package.json not found)"
    continue
  fi

  echo "📦 Processing $pkg..."

  # Check if package.json has publishConfig
  if ! grep -q '"publishConfig"' "$PKG_JSON"; then
    echo "  ✅ Adding publishConfig"

    # Use node to add publishConfig (more reliable than sed for JSON)
    node -e "
      const fs = require('fs');
      const pkg = JSON.parse(fs.readFileSync('$PKG_JSON', 'utf-8'));

      // Add publishConfig
      pkg.publishConfig = {
        access: 'public',
        registry: 'https://registry.npmjs.org/'
      };

      // Ensure repository field
      if (!pkg.repository) {
        pkg.repository = {
          type: 'git',
          url: '$REPO_URL.git',
          directory: '$PKG_DIR'
        };
      }

      // Ensure bugs field
      if (!pkg.bugs) {
        pkg.bugs = {
          url: '$BUGS_URL'
        };
      }

      // Ensure homepage field
      if (!pkg.homepage) {
        pkg.homepage = '$HOMEPAGE_URL';
      }

      // Ensure files field includes dist and README.md
      if (!pkg.files) {
        pkg.files = ['dist', 'README.md', 'LICENSE'];
      } else if (!pkg.files.includes('dist')) {
        pkg.files.push('dist');
      }

      // Write back
      fs.writeFileSync('$PKG_JSON', JSON.stringify(pkg, null, 2) + '\n');
    "
  else
    echo "  ℹ️  publishConfig already exists"
  fi

  # Create .npmignore if it doesn't exist
  NPM_IGNORE="$PKG_DIR/.npmignore"
  if [ ! -f "$NPM_IGNORE" ]; then
    echo "  ✅ Creating .npmignore"
    cat > "$NPM_IGNORE" << 'EOF'
# Source files
src/
*.test.ts
*.spec.ts
__tests__/
__mocks__/

# Config files
tsconfig.json
vitest.config.ts
.eslintrc.*

# Build artifacts
*.tsbuildinfo
coverage/

# Development
.vscode/
*.log
EOF
  fi
done

echo ""
echo "✅ All packages prepared for npm publication!"
echo ""
echo "Next steps:"
echo "  1. Run 'pnpm build' to build all packages"
echo "  2. Run 'pnpm test' to ensure all tests pass"
echo "  3. Run 'pnpm publish -r --dry-run' to test publication"
echo "  4. Run 'pnpm publish -r' to publish to npm"
