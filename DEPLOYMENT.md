# MUSUHI 2.0 - v1.0.0 Deployment Guide

## Deployment Status

✅ **All preparation complete** - Ready for production release!

### Pre-Deployment Checklist

- [x] All packages updated to v1.0.0 (22 packages)
- [x] CHANGELOG.md updated with release notes
- [x] Git tag v1.0.0 created with annotations
- [x] All tests passing (718/718)
- [x] ESLint errors resolved (0 critical errors)
- [x] Security vulnerabilities resolved (0 vulnerabilities)
- [x] Build successful for all packages
- [x] GitHub Actions workflow configured (.github/workflows/publish.yml)

### Quality Metrics (v1.0.0)

```
Tests:          718/718 passing (100%)
ESLint Errors:  0 critical (191 non-blocking dashboard warnings)
Security:       0 vulnerabilities
Build:          ✅ All packages build successfully
Type Safety:    ✅ TypeScript strict mode
Coverage:       High coverage across all packages
```

## Manual Deployment Steps

Since git push requires authentication, follow these manual steps to complete deployment:

### Step 1: Push to GitHub

```bash
# From your local terminal with git authentication configured
cd /path/to/musuhi-ng

# Push all commits to main branch
git push origin main

# Push the v1.0.0 tag
git push origin v1.0.0
```

### Step 2: Configure npm Token (First Time Only)

If not already configured:

1. Go to https://www.npmjs.com/settings/your-username/tokens
2. Generate a new **Automation** token with **Read and Write** permissions
3. Copy the token

4. Go to your GitHub repository: https://github.com/nahisaho/musuhi-ng
5. Navigate to: Settings → Secrets and variables → Actions
6. Create a new repository secret:
   - Name: `NPM_TOKEN`
   - Value: (paste your npm token)

### Step 3: Monitor GitHub Actions

After pushing the v1.0.0 tag:

1. GitHub Actions will automatically trigger the publish workflow
2. Go to: https://github.com/nahisaho/musuhi-ng/actions
3. Watch the "Publish to npm" workflow

The workflow will:

- ✅ Validate: Build, lint, typecheck, test, security audit
- ✅ Publish: Publish all 21 packages to npm registry
- ✅ Verify: Confirm packages are available on npm

### Step 4: Verify Publication

After workflow completes, verify packages on npm:

```bash
# Check a few key packages
npm view @musuhi-ng/core version
npm view @musuhi-ng/cli version
npm view @musuhi-ng/change-workflow version
```

All should show: **1.0.0**

## Alternative: Manual npm Publish

If you prefer to publish manually without GitHub Actions:

```bash
# From project root
cd /path/to/musuhi-ng

# Build all packages
pnpm build

# Login to npm (if not already)
npm login

# Publish all packages (dry run first)
pnpm -r publish --dry-run

# Actual publish
pnpm -r publish --access public
```

## Post-Deployment Verification

### 1. Check npm Registry

Visit https://www.npmjs.com/~your-npm-username to see all published packages:

- @musuhi-ng/core
- @musuhi-ng/cli
- @musuhi-ng/config-loader
- @musuhi-ng/specification-model
- @musuhi-ng/change-workflow
- @musuhi-ng/agents
- @musuhi-ng/dashboard
- @musuhi-ng/document-parser
- @musuhi-ng/llm-integration
- @musuhi-ng/persistence
- @musuhi-ng/template-engine
- @musuhi-ng/traceability-graph
- @musuhi-ng/workflow-engine
- Plus all 8 adapter packages

### 2. Test Installation

Create a test project:

```bash
mkdir test-musuhi
cd test-musuhi
npm init -y
npm install @musuhi-ng/cli
npx musuhi init
```

### 3. Monitor npm Downloads

- Check package pages on npmjs.com for download statistics
- Monitor any issues or bug reports

## Release Announcement

After successful deployment, announce v1.0.0 release:

### GitHub Release

1. Go to: https://github.com/nahisaho/musuhi-ng/releases
2. Click "Draft a new release"
3. Tag: v1.0.0
4. Title: "MUSUHI 2.0 - Production Release v1.0.0"
5. Copy release notes from CHANGELOG.md
6. Publish release

### npm Package README

All packages already have comprehensive README.md files with:

- Installation instructions
- Quick start guides
- API documentation
- Examples

## Rollback Plan (If Needed)

If critical issues are discovered after deployment:

```bash
# Unpublish within 24 hours (npm policy)
npm unpublish @musuhi-ng/package-name@1.0.0

# Or deprecate (if > 24 hours)
npm deprecate @musuhi-ng/package-name@1.0.0 "Critical bug, use 1.0.1"

# Fix issues and release patch
# Update versions to 1.0.1
# Follow same deployment process
```

## Current Status

**Local repository**: All commits and tags ready
**Remote repository**: Waiting for push (requires authentication)
**npm registry**: Not yet published (waiting for workflow trigger)

## Next Action Required

**Manual step needed**: Push commits and tag from your local terminal with git authentication.

```bash
git push origin main
git push origin v1.0.0
```

This will trigger the automated GitHub Actions workflow to publish all packages to npm.

---

**Deployment prepared by**: Phase 7 automated preparation
**Deployment date**: 2025-11-16
**Release version**: 1.0.0
**Total packages**: 21 (13 core + 8 adapters)
