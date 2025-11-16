# MUSUHI-NG - Specification Driven Development Framework

[![npm version](https://badge.fury.io/js/@musuhi-ng%2Fcore.svg)](https://www.npmjs.com/package/@musuhi-ng/core)
[![GitHub Actions](https://github.com/nahisaho/musuhi-ng/workflows/CI/badge.svg)](https://github.com/nahisaho/musuhi-ng/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A next-generation framework for AI-assisted software development using Specification Driven Development (SDD) methodology.

## Overview

MUSUHI-NG enables teams to develop software through a structured, specification-driven approach that integrates seamlessly with 8 major AI coding assistants. The framework enforces constitutional governance, automates workflow management, and provides real-time verification of requirements traceability.

## Key Features

- **Constitutional Governance** - 9 immutable Articles enforcing Library-First, Test-First, Security-First principles
- **Change Workflow Management** - Automated 8-stage SDD workflow (Research → Requirements → Design → Tasks → Implementation → Testing → Deployment → Monitoring)
- **Multi-Agent Orchestration** - 20 specialized AI agents coordinated through 9 conversation patterns
- **Parallel Execution** - P-wave dependency analysis enabling 72% timeline reduction
- **Brownfield Gap Analysis** - Multi-strategy analysis (AST + pattern matching + ML) for existing codebases
- **Interactive Dashboard** - Real-time TUI monitoring with traceability visualization
- **Iterative Verification** - Continuous requirements coverage validation
- **Multi-Platform AI Integration** - Unified adapter interface for VS Code + Copilot, Cursor, Zed, Windsurf, Claude Code, Codex CLI, Gemini CLI, Qwen Code

## Architecture

MUSUHI-NG uses a monorepo architecture with the following packages:

```
packages/
├── core/                          # Core framework and types
├── cli/                           # Command-line interface
├── dashboard/                     # TUI dashboard (blessed-contrib)
├── constitutional-governance/     # Phase -1 Gate enforcement
├── change-workflow/              # 8-stage SDD workflow engine
├── multi-agent-orchestrator/     # 20-agent orchestration system
├── parallel-executor/            # P-wave DAG execution engine
├── gap-analyzer/                 # Brownfield analysis engine
├── verification-engine/          # Requirements traceability validation
└── adapters/                     # Platform-specific adapters
    ├── vscode-copilot/
    ├── cursor/
    ├── zed/
    ├── windsurf/
    ├── claude-code/
    ├── codex-cli/
    ├── gemini-cli/
    └── qwen-code/
```

## Requirements

- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0
- **TypeScript**: ^5.3.3

## Installation

### Using npx (Recommended)

```bash
# Run CLI without installation
npx @musuhi-ng/cli --help
npx @musuhi-ng/cli init my-project
```

### Global Installation

```bash
# Install CLI globally
npm install -g @musuhi-ng/cli

# Use musuhi command
musuhi --help
musuhi init my-project
```

### As a Library

```bash
# Install core library
npm install @musuhi-ng/core

# Or install specific packages
npm install @musuhi-ng/constitutional-governance
npm install @musuhi-ng/multi-agent-orchestrator
npm install @musuhi-ng/gap-analyzer
```

### Development

```bash
# Clone repository
git clone https://github.com/nahisaho/musuhi-ng.git
cd musuhi-ng

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Quick Start

### 1. Initialize a New Project

```bash
npx @musuhi-ng/cli init my-project
cd my-project
```

### 2. Configure Platform Adapter

```bash
# Example: VS Code + GitHub Copilot
musuhi config set platform vscode-copilot
```

### 3. Start SDD Workflow

```bash
# Stage 1: Research
musuhi workflow research "Implement user authentication"

# Stage 2: Requirements (EARS format)
musuhi workflow requirements

# Stage 3: Design (C4 + ADR)
musuhi workflow design

# Stage 4: Task Planning (P-wave)
musuhi workflow tasks

# Stage 5-8: Implementation through Monitoring
musuhi workflow execute
```

### 4. Launch Dashboard

```bash
musuhi dashboard
```

## EARS Requirements Format

All requirements must follow EARS (Easy Approach to Requirements Syntax):

```
WHEN [event], the [system] SHALL [response]           # Event-driven
WHILE [state], the [system] SHALL [response]          # State-driven
IF [error], THEN the [system] SHALL [response]        # Unwanted behavior
WHERE [feature enabled], the [system] SHALL [response] # Optional features
The [system] SHALL [requirement]                      # Ubiquitous
```

## Constitutional Articles

The framework enforces 9 immutable Articles through Phase -1 Gates:

1. **Library-First** - Prefer existing solutions over custom code
2. **Test-First** - Write tests before implementation
3. **Security-First** - OWASP Top 10 compliance mandatory
4. **Documentation-First** - Document before coding
5. **Simplicity-First** - Minimize complexity (cyclomatic < 10)
6. **Performance-First** - Performance budgets enforced
7. **Accessibility-First** - WCAG 2.1 AA compliance
8. **Privacy-First** - Data minimization and GDPR compliance
9. **Integration-First** - API contracts defined before implementation

## Development

```bash
# Watch mode for development
pnpm --filter @musuhi-ng/core dev

# Run tests with coverage
pnpm test:coverage

# Type checking
pnpm typecheck

# Format code
pnpm format
```

## Documentation

- **Steering Context**: `steering/` - Architecture, tech stack, product vision
- **Requirements**: `docs/requirements/` - EARS-formatted requirements
- **Design**: `docs/design/` - C4 diagrams and ADRs
- **Tasks**: `docs/tasks/` - P-wave implementation plan
- **API**: `docs/api/` - API documentation

## License

MIT

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## Support

- GitHub Issues: https://github.com/nahisaho/musuhi-ng/issues
- Documentation: https://musuhi.dev/docs

---

**Powered by MUSUHI** - Specification Driven Development for the AI Era
