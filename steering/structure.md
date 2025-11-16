# MUSUHI 2.0 Project Structure

## Overview

This document defines the architectural patterns, directory organization, and structural conventions for MUSUHI 2.0, a next-generation Specification Driven Development (SDD) framework. It serves as the single source of truth for how the project is organized.

**Last Updated**: 2025-11-16
**Status**: Phase 5 Complete - All 8 features delivered, 679/683 tests passing (99.4%)

## Organization Philosophy

MUSUHI 2.0 follows a **Document-First, Agent-Driven Architecture**:

- **Document-First**: All specifications, requirements, and design decisions are expressed in structured Markdown/YAML files before implementation
- **Agent-Driven**: 20 specialized AI agents orchestrate development workflows based on these documents
- **Platform-Agnostic Core**: Framework logic is independent of any specific AI coding assistant platform
- **EARS-Based Requirements**: All requirements follow Easy Approach to Requirements Syntax (EARS) for clarity and testability
- **8-Stage SDD Workflow**: Structured progression from Research → Requirements → Design → Tasks → Implementation → Testing → Deployment → Monitoring
- **Monorepo Architecture**: pnpm workspace with 14 packages, TypeScript strict mode, ESM modules

## Architectural Patterns

### 1. Monorepo with Workspace Dependencies

**Pattern**: pnpm workspace with TypeScript Project References

```
packages/
├── core/                          # Foundation - no dependencies
├── constitutional-governance/     # Depends on: core
├── change-workflow/              # Depends on: core
├── multi-agent-orchestrator/     # Depends on: core
├── parallel-executor/            # Depends on: core
├── gap-analyzer/                 # Depends on: core
├── verification-engine/          # Depends on: core
├── iterative-verification/       # Depends on: core
├── security-audit-logger/        # Depends on: core (implicit)
├── platform-adapters/            # Depends on: core
├── dashboard/                    # Depends on: core
├── cli/                          # Depends on: all feature packages
├── adapters/*/                   # Individual adapter packages
└── e2e-tests/                    # Depends on: all packages
```

**Benefits**:
- Shared code reuse through `workspace:*` protocol
- Type-safe cross-package imports
- Single `pnpm build` compiles all packages in dependency order
- Atomic version bumps for releases

### 2. Feature-Based Package Organization

**Pattern**: Each SDD feature is a standalone npm package

```
@musuhi/core                      # Types, parsers, validators, file-system
@musuhi/constitutional-governance # Feature 1: 9 Article validators
@musuhi/change-workflow          # Feature 2: 8-stage workflow engine
@musuhi/multi-agent-orchestrator # Feature 3: 9 conversation patterns
@musuhi/parallel-executor        # Feature 4: P-wave DAG execution
@musuhi/gap-analyzer             # Feature 5: Brownfield analysis
@musuhi/dashboard                # Feature 6: TUI dashboard
@musuhi/iterative-verification   # Feature 7: Task-by-task execution
@musuhi/platform-adapters        # Feature 8: Multi-platform integration
```

**Convention**:
- Package name: `@musuhi/<feature-name>`
- Main export: `packages/<feature-name>/src/index.ts`
- Tests: `packages/<feature-name>/src/__tests__/*.test.ts`
- Types: Co-located with implementation (no separate `types/` folder)

### 3. Layered Architecture (Core → Features → CLI)

**Layers**:

```
Layer 4: CLI & Adapters
  ├── @musuhi/cli (commands: init, validate, workflow, view)
  └── @musuhi/adapter-* (8 platform adapters)

Layer 3: Feature Packages
  ├── @musuhi/constitutional-governance
  ├── @musuhi/change-workflow
  ├── @musuhi/multi-agent-orchestrator
  ├── @musuhi/parallel-executor
  ├── @musuhi/gap-analyzer
  ├── @musuhi/dashboard
  ├── @musuhi/iterative-verification
  ├── @musuhi/platform-adapters
  └── @musuhi/security-audit-logger

Layer 2: Verification & Testing
  ├── @musuhi/verification-engine
  └── @musuhi/e2e-tests

Layer 1: Core Foundation
  └── @musuhi/core (types, parsers, validators, file-system, workflow)
```

**Dependency Rule**: Higher layers depend on lower layers, never the reverse.

### 4. File-Based Configuration (No Database)

**Pattern**: All state stored in Markdown/YAML files

```
Project Root/
├── steering/                    # Project memory (read by all agents)
│   ├── structure.md             # Architecture patterns
│   ├── tech.md                  # Technology stack
│   ├── product.md               # Business context
│   └── constitution.md          # 9 immutable Articles
├── specs/                       # Current specifications
│   ├── requirements.md          # EARS-format requirements
│   ├── design.md                # C4 diagrams + ADRs
│   └── tasks.md                 # P-wave labeled tasks
├── changes/                     # Change proposals
│   └── YYYY-MM-DD-name/         # Each change has timestamped folder
│       ├── proposal.md
│       ├── delta.json
│       └── review.md
└── .musuhi/                     # Framework state
    ├── config.yaml              # User preferences
    ├── workflow-state.json      # Current SDD stage
    └── checkpoints/             # Iterative verification checkpoints
```

**Rationale**:
- Version control friendly (Git-based collaboration)
- Human-readable and editable
- AI-parseable (LLMs can read/write Markdown/YAML)
- No database setup required

### 5. Adapter Pattern for Multi-Platform Support

**Pattern**: Platform-agnostic core + platform-specific adapters

```
Core Framework (Platform-Agnostic)
  │
  ├── PlatformAdapter Interface
  │
  ├── ClaudeCodeAdapter      (CLI)
  ├── CursorAdapter          (IDE)
  ├── VSCodeCopilotAdapter   (IDE)
  ├── ZedAdapter             (IDE)
  ├── WindsurfAdapter        (IDE)
  ├── CodexCLIAdapter        (CLI)
  ├── GeminiCLIAdapter       (CLI)
  └── QwenCodeAdapter        (CLI)
```

**Adapter Responsibilities**:
- Translate MUSUHI commands to platform-specific APIs
- Handle platform-specific file access
- Manage LLM context windows
- Provide unified interface for agent communication

### 6. Event-Driven Architecture

**Pattern**: Event Bus for decoupled components

```typescript
// Central event bus (packages/core/src/events/event-bus.ts)
EventBus.emit('workflow:stage-changed', { stage: 'requirements' });
EventBus.on('task:completed', (task) => { /* update dashboard */ });
```

**Events**:
- `workflow:*` - Workflow state changes
- `task:*` - Task execution events
- `agent:*` - Agent activity
- `validation:*` - Constitutional compliance
- `gap:*` - Gap detection results

**Benefits**:
- Decoupled feature packages
- Real-time dashboard updates
- Extensibility (new features can listen to existing events)

## Directory Structure

### Root Level

```
musuhi2/
├── packages/                    # pnpm workspace (14 packages)
│   ├── core/                    # @musuhi/core - Foundation
│   ├── constitutional-governance/ # @musuhi/constitutional-governance
│   ├── change-workflow/         # @musuhi/change-workflow
│   ├── multi-agent-orchestrator/ # @musuhi/multi-agent-orchestrator
│   ├── parallel-executor/       # @musuhi/parallel-executor
│   ├── gap-analyzer/            # @musuhi/gap-analyzer
│   ├── verification-engine/     # @musuhi/verification-engine
│   ├── iterative-verification/  # @musuhi/iterative-verification
│   ├── platform-adapters/       # @musuhi/platform-adapters
│   ├── security-audit-logger/   # @musuhi/security-audit-logger
│   ├── dashboard/               # @musuhi/dashboard
│   ├── cli/                     # @musuhi/cli
│   ├── e2e-tests/               # @musuhi/e2e-tests
│   └── adapters/                # Individual adapter packages (8)
│       ├── claude-code/         # @musuhi/adapter-claude-code
│       ├── cursor/              # @musuhi/adapter-cursor
│       ├── vscode-copilot/      # @musuhi/adapter-vscode-copilot
│       ├── zed/                 # @musuhi/adapter-zed
│       ├── windsurf/            # @musuhi/adapter-windsurf
│       ├── codex-cli/           # @musuhi/adapter-codex-cli
│       ├── gemini-cli/          # @musuhi/adapter-gemini-cli
│       └── qwen-code/           # @musuhi/adapter-qwen-code
├── docs/                        # Phase 1-4 documentation
│   ├── research/                # Phase 1: 6 SDD frameworks analyzed
│   ├── requirements/            # Phase 2: 91 EARS requirements
│   ├── design/                  # Phase 3: C4 diagrams + 7 ADRs
│   └── tasks/                   # Phase 4: 127 P-wave labeled tasks
├── steering/                    # Project memory (this file)
│   ├── structure.md             # This file - architecture patterns
│   ├── structure.ja.md          # Japanese translation
│   ├── tech.md                  # Technology stack
│   ├── tech.ja.md               # Japanese translation
│   ├── product.md               # Business context
│   ├── product.ja.md            # Japanese translation
│   ├── constitution.md          # 9 immutable Articles
│   ├── rules/                   # Agent behavior rules
│   │   ├── workflow.md          # 8-stage SDD workflow
│   │   ├── ears-format.md       # EARS syntax guide
│   │   └── agent-validation-checklist.md
│   └── templates/               # Document templates
│       ├── research.md
│       ├── requirements.md
│       ├── design.md
│       └── tasks.md
├── .claude/                     # Claude Code configuration
│   ├── agents/                  # 20 specialized AI agents
│   │   ├── orchestrator.md
│   │   ├── steering.md
│   │   ├── requirements-analyst.md
│   │   ├── system-architect.md
│   │   ├── software-developer.md
│   │   └── ... (15 more)
│   └── commands/                # Custom slash commands
├── .github/                     # CI/CD workflows
│   └── workflows/
│       ├── ci.yml               # Lint, build, test, security audit
│       └── publish.yml          # npm publishing
├── References/                  # Research reference implementations
│   ├── musuhi/                  # Original MUSUHI v1
│   ├── OpenSpec/                # Change workflow source
│   ├── ag2/                     # Multi-agent orchestration source
│   └── cc-sdd/                  # Parallel execution source
├── CLAUDE.md                    # Quick-start guide for agents
├── README.md                    # Human-readable project overview
├── package.json                 # Root workspace config
├── pnpm-workspace.yaml          # pnpm workspace definition
├── tsconfig.json                # Root TypeScript config
└── vitest.config.ts             # Shared test config
```

### Package Internal Structure

**Standard Package Layout** (all feature packages follow this):

```
packages/<package-name>/
├── src/
│   ├── index.ts                 # Main export (public API)
│   ├── types.ts                 # Type definitions (if needed)
│   ├── <feature>.ts             # Core implementation
│   └── __tests__/               # Co-located tests
│       └── <feature>.test.ts
├── dist/                        # Compiled output (gitignored)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── package.json
├── tsconfig.json                # Extends root tsconfig
└── README.md
```

**Example: @musuhi/constitutional-governance**

```
packages/constitutional-governance/
├── src/
│   ├── index.ts                      # Exports all validators
│   ├── types.ts                      # Article, ValidationResult types
│   ├── constitution-loader.ts        # Loads steering/constitution.md
│   ├── article-parser.ts             # Parses Article structure
│   ├── validation-rule-engine.ts     # Executes validation rules
│   ├── validation-report-generator.ts # Generates reports
│   ├── phase-gate.ts                 # Phase -1 Gate enforcement
│   ├── validators/                   # 9 Article validators
│   │   ├── index.ts
│   │   ├── library-first-validator.ts
│   │   ├── test-first-validator.ts
│   │   ├── security-first-validator.ts
│   │   ├── documentation-first-validator.ts
│   │   ├── simplicity-first-validator.ts
│   │   ├── performance-first-validator.ts
│   │   ├── accessibility-first-validator.ts
│   │   ├── privacy-first-validator.ts
│   │   └── integration-first-validator.ts
│   └── __tests__/
│       ├── constitution-loader.test.ts
│       ├── article-parser.test.ts
│       ├── validation-rule-engine.test.ts
│       └── phase-gate.test.ts
├── dist/                             # Build output
├── package.json
├── tsconfig.json
└── README.md
```

## Naming Conventions

### File Naming

**Rule**: `kebab-case` for all files

```
✅ Good:
  - constitutional-governance.ts
  - ears-validator.ts
  - phase-gate.ts
  - multi-agent-orchestrator.ts

❌ Bad:
  - ConstitutionalGovernance.ts  (PascalCase)
  - ears_validator.ts            (snake_case)
  - phaseGate.ts                 (camelCase)
```

**Exceptions**:
- `README.md`, `CLAUDE.md`, `CONTRIBUTING.md` (all caps for documentation)
- `.eslintrc.json`, `.prettierrc.json` (dotfiles)

### Directory Naming

**Rule**: `kebab-case` for directories

```
✅ Good:
  - packages/multi-agent-orchestrator/
  - packages/constitutional-governance/
  - docs/requirements/

❌ Bad:
  - packages/MultiAgentOrchestrator/
  - packages/constitutional_governance/
```

### Package Naming

**Rule**: `@musuhi/<feature-name>` (scoped, kebab-case)

```
✅ Good:
  - @musuhi/core
  - @musuhi/constitutional-governance
  - @musuhi/multi-agent-orchestrator
  - @musuhi/adapter-claude-code

❌ Bad:
  - musuhi-core                   (not scoped)
  - @musuhi/ConstitutionalGovernance (PascalCase)
  - @musuhi/adapter_claude_code   (snake_case)
```

### TypeScript Naming

**Rules**: Follow TypeScript/JavaScript conventions

```typescript
// Interfaces, Types, Classes: PascalCase
interface EARSRequirement { }
type WorkflowStage = 'research' | 'requirements';
class ConstitutionLoader { }

// Functions, variables, parameters: camelCase
function validateEARS(requirement: string): boolean { }
const workflowStage = 'requirements';

// Constants (top-level): SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// Private class members: prefixed with _
class Example {
  private _internalState: string;
}

// Test files: *.test.ts
constitution-loader.test.ts
ears-validator.test.ts
```

### Documentation File Naming

**Rule**: `kebab-case.md` (English) + `kebab-case.ja.md` (Japanese)

```
✅ Good:
  - structure.md + structure.ja.md
  - tech.md + tech.ja.md
  - ears-format.md + ears-format.ja.md

❌ Bad:
  - structure_en.md + structure_ja.md  (snake_case)
  - structure-english.md               (verbose)
```

## Import/Export Patterns

### Barrel Exports (index.ts)

**Pattern**: Each package has `src/index.ts` exporting public API

```typescript
// packages/constitutional-governance/src/index.ts
export * from './constitution-loader.js';
export * from './phase-gate.js';
export * from './validators/index.js';
export * from './types.js';
```

**Benefits**:
- Single import point: `import { PhaseGate } from '@musuhi/constitutional-governance';`
- Hide internal implementation details
- Easy to refactor internals without breaking consumers

### Workspace Dependencies

**Pattern**: Use `workspace:*` for cross-package dependencies

```json
{
  "dependencies": {
    "@musuhi/core": "workspace:*"
  }
}
```

**Benefits**:
- Always uses latest local version during development
- pnpm replaces with actual version on publish

### Path Aliases (tsconfig)

**Pattern**: Use package names, not relative paths

```typescript
// ✅ Good: Use package name
import { EARSValidator } from '@musuhi/core';

// ❌ Bad: Relative path
import { EARSValidator } from '../../core/src/validators/ears-validator';
```

**Configuration** (root tsconfig.json):

```json
{
  "compilerOptions": {
    "paths": {
      "@musuhi/core": ["./packages/core/src"],
      "@musuhi/constitutional-governance": ["./packages/constitutional-governance/src"]
    }
  }
}
```

### ESM Module Extensions

**Rule**: Always use `.js` extension in imports (even for `.ts` files)

```typescript
// ✅ Good: .js extension
import { EARSValidator } from './ears-validator.js';

// ❌ Bad: No extension or .ts extension
import { EARSValidator } from './ears-validator';
import { EARSValidator } from './ears-validator.ts';
```

**Rationale**: TypeScript transpiles to ESM, which requires extensions.

## Code Organization Principles

### 1. Library-First (Article 1)

**Principle**: Prefer existing libraries over custom implementations

```typescript
// ✅ Good: Use established library
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

// ❌ Bad: Custom Markdown parser
class CustomMarkdownParser { }
```

**Approved Libraries** (see `steering/tech.md`):
- Markdown: `unified`, `remark-parse`, `remark-gfm`
- YAML: `yaml`
- CLI: `commander`
- Testing: `vitest`
- AST parsing: `ts-morph`
- DAG: `graphlib`
- TUI: `blessed`, `blessed-contrib`

### 2. Test-First (Article 2)

**Principle**: Tests co-located with implementation

```
packages/core/
├── src/
│   ├── validators/
│   │   ├── ears-validator.ts
│   │   └── __tests__/
│   │       └── ears-validator.test.ts
```

**Convention**:
- Test file: `<feature>.test.ts` (not `<feature>.spec.ts`)
- Test location: `__tests__/` folder next to implementation
- Test ratio: 3:1 (3 tests per acceptance criterion)

### 3. Type Safety (TypeScript Strict Mode)

**Principle**: Maximum type safety enabled

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Benefits**:
- Catch errors at compile time
- Self-documenting code
- Better IDE support

### 4. Single Responsibility

**Principle**: Each file/class has one clear purpose

```
✅ Good:
  - constitution-loader.ts       (loads constitution)
  - article-parser.ts            (parses Articles)
  - validation-rule-engine.ts    (executes rules)

❌ Bad:
  - constitution-utils.ts        (too broad, unclear responsibility)
```

### 5. Dependency Injection

**Principle**: Pass dependencies as constructor parameters

```typescript
// ✅ Good: Dependencies injected
class ConstitutionLoader {
  constructor(
    private fileSystem: FileSystem,
    private markdownParser: MarkdownParser
  ) {}
}

// ❌ Bad: Hard-coded dependencies
class ConstitutionLoader {
  constructor() {
    this.fileSystem = new NodeFileSystem();  // Hard to test
  }
}
```

## Testing Conventions

### Test File Organization

**Structure**: AAA Pattern (Arrange, Act, Assert)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { EARSValidator } from '../ears-validator.js';

describe('EARSValidator', () => {
  let validator: EARSValidator;

  beforeEach(() => {
    // Arrange: Setup
    validator = new EARSValidator();
  });

  it('should validate event-driven requirement', () => {
    // Arrange
    const requirement = 'WHEN user clicks login, the system SHALL authenticate';

    // Act
    const result = validator.validate(requirement);

    // Assert
    expect(result.valid).toBe(true);
    expect(result.pattern).toBe('event-driven');
  });
});
```

### Test Coverage Requirements

**Thresholds** (vitest.config.ts):

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  }
}
```

**Coverage Exclusions**:
- `node_modules/`, `dist/`
- `*.config.{js,ts}`
- `*.d.ts` (type declarations)
- `types/` folders
- `__tests__/` folders

### Test Naming

**Pattern**: `should <expected behavior> when <condition>`

```typescript
✅ Good:
  - 'should validate EARS requirement when pattern matches'
  - 'should return error when requirement is invalid'
  - 'should load constitution from steering directory'

❌ Bad:
  - 'test 1'
  - 'validates requirement'
  - 'loading constitution'
```

## Build and Release Conventions

### Build Process

**Command**: `pnpm build` (root)

**Order**: TypeScript Project References ensure correct build order

```
1. @musuhi/core              (no dependencies)
2. Feature packages          (depend on core)
3. @musuhi/cli               (depends on features)
4. @musuhi/e2e-tests         (depends on all)
```

**Output**: `packages/*/dist/` (gitignored)

### Version Bumping

**Strategy**: Synchronized versions across all packages

```bash
# Bump all packages to v0.2.0
pnpm version:all 0.2.0

# Publish all packages
pnpm publish:all
```

**Versioning Scheme**:
- Major (1.0.0): Breaking API changes
- Minor (0.1.0): New features (backward compatible)
- Patch (0.0.1): Bug fixes

### Publishing

**Registry**: npm (public)

**Scope**: `@musuhi/*`

**Process**:
1. CI passes (lint, build, test, security audit)
2. Version bump (synchronized)
3. Git tag (e.g., `v0.1.0`)
4. Publish to npm (automated via GitHub Actions)

## Common Patterns and Anti-Patterns

### Pattern: Event Bus for Decoupling

**✅ Use Case**: Cross-package communication without tight coupling

```typescript
// Package A: Emit event
EventBus.emit('task:completed', { taskId: 'T-001' });

// Package B: Listen to event
EventBus.on('task:completed', (task) => {
  dashboard.updateTaskStatus(task);
});
```

### Pattern: Factory for Instantiation

**✅ Use Case**: Create objects with complex dependencies

```typescript
class ConstitutionLoaderFactory {
  static create(projectRoot: string): ConstitutionLoader {
    const fileSystem = new NodeFileSystem();
    const parser = new MarkdownParser();
    return new ConstitutionLoader(fileSystem, parser, projectRoot);
  }
}
```

### Anti-Pattern: Circular Dependencies

**❌ Avoid**: Package A depends on B, B depends on A

```
packages/core → packages/cli → packages/core  // ❌ Circular
```

**Solution**: Extract shared code to a lower layer (e.g., `@musuhi/core`)

### Anti-Pattern: God Objects

**❌ Avoid**: Single class doing too much

```typescript
// ❌ Bad: ConstitutionManager does everything
class ConstitutionManager {
  loadConstitution() { }
  parseArticles() { }
  validateRules() { }
  generateReport() { }
}

// ✅ Good: Separate responsibilities
class ConstitutionLoader { }
class ArticleParser { }
class ValidationRuleEngine { }
class ValidationReportGenerator { }
```

## References

### Related Documents

- **Technology Stack**: `steering/tech.md` - Detailed technology choices
- **Product Vision**: `steering/product.md` - Business context and goals
- **Constitutional Governance**: `steering/constitution.md` - 9 immutable Articles
- **8-Stage Workflow**: `steering/rules/workflow.md` - SDD process guide
- **EARS Format**: `steering/rules/ears-format.md` - Requirements syntax

### Architecture Decision Records (ADRs)

All architectural decisions are documented in `docs/design/adr/`:

1. **ADR-001**: Constitutional Enforcement (Phase -1 Gate)
2. **ADR-002**: File-Based Storage (Markdown/YAML)
3. **ADR-003**: Agent Orchestration Patterns (9 patterns)
4. **ADR-004**: Parallel Execution Algorithm (P-wave labeling)
5. **ADR-005**: Gap Analysis Strategy (AST + pattern matching)
6. **ADR-006**: Dashboard TUI Framework (blessed-contrib)
7. **ADR-007**: Multi-Platform Abstraction (Adapter pattern)

### Package Dependency Graph

```
@musuhi/core
  ├── @musuhi/constitutional-governance
  ├── @musuhi/change-workflow
  ├── @musuhi/multi-agent-orchestrator
  ├── @musuhi/parallel-executor
  ├── @musuhi/gap-analyzer
  ├── @musuhi/verification-engine
  ├── @musuhi/iterative-verification
  ├── @musuhi/platform-adapters
  ├── @musuhi/security-audit-logger
  ├── @musuhi/dashboard
  ├── @musuhi/cli
  │     └── (depends on all feature packages)
  ├── @musuhi/adapter-* (8 adapters)
  └── @musuhi/e2e-tests
        └── (depends on all packages)
```

---

**Document Status**: ✅ Approved (Phase 5 Complete)
**Last Updated**: 2025-11-16
**Next Review**: Phase 6 (Testing)
