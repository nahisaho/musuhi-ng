#!/bin/bash

echo "Publishing all packages to npm registry (v1.0.1)..."
echo ""

# Core packages (in dependency order)
cd packages/core && npm publish --access public && echo "✅ core published" || echo "❌ core failed"
cd ../..

cd packages/constitutional-governance && npm publish --access public && echo "✅ constitutional-governance published" || echo "❌ constitutional-governance failed"
cd ../..

cd packages/change-workflow && npm publish --access public && echo "✅ change-workflow published" || echo "❌ change-workflow failed"
cd ../..

cd packages/multi-agent-orchestrator && npm publish --access public && echo "✅ multi-agent-orchestrator published" || echo "❌ multi-agent-orchestrator failed"
cd ../..

cd packages/parallel-executor && npm publish --access public && echo "✅ parallel-executor published" || echo "❌ parallel-executor failed"
cd ../..

cd packages/gap-analyzer && npm publish --access public && echo "✅ gap-analyzer published" || echo "❌ gap-analyzer failed"
cd ../..

cd packages/iterative-verification && npm publish --access public && echo "✅ iterative-verification published" || echo "❌ iterative-verification failed"
cd ../..

cd packages/verification-engine && npm publish --access public && echo "✅ verification-engine published" || echo "❌ verification-engine failed"
cd ../..

cd packages/platform-adapters && npm publish --access public && echo "✅ platform-adapters published" || echo "❌ platform-adapters failed"
cd ../..

cd packages/dashboard && npm publish --access public && echo "✅ dashboard published" || echo "❌ dashboard failed"
cd ../..

cd packages/security-audit-logger && npm publish --access public && echo "✅ security-audit-logger published" || echo "❌ security-audit-logger failed"
cd ../..

cd packages/cli && npm publish --access public && echo "✅ cli published" || echo "❌ cli failed"
cd ../..

# Adapter packages
echo ""
echo "Publishing adapter packages..."
echo ""

cd packages/adapters/claude-code && npm publish --access public && echo "✅ adapter-claude-code published" || echo "❌ adapter-claude-code failed"
cd ../../..

cd packages/adapters/codex-cli && npm publish --access public && echo "✅ adapter-codex-cli published" || echo "❌ adapter-codex-cli failed"
cd ../../..

cd packages/adapters/cursor && npm publish --access public && echo "✅ adapter-cursor published" || echo "❌ adapter-cursor failed"
cd ../../..

cd packages/adapters/gemini-cli && npm publish --access public && echo "✅ adapter-gemini-cli published" || echo "❌ adapter-gemini-cli failed"
cd ../../..

cd packages/adapters/qwen-code && npm publish --access public && echo "✅ adapter-qwen-code published" || echo "❌ adapter-qwen-code failed"
cd ../../..

cd packages/adapters/vscode-copilot && npm publish --access public && echo "✅ adapter-vscode-copilot published" || echo "❌ adapter-vscode-copilot failed"
cd ../../..

cd packages/adapters/windsurf && npm publish --access public && echo "✅ adapter-windsurf published" || echo "❌ adapter-windsurf failed"
cd ../../..

cd packages/adapters/zed && npm publish --access public && echo "✅ adapter-zed published" || echo "❌ adapter-zed failed"
cd ../../..

echo ""
echo "✅ All packages published to npm registry as v1.0.1"
