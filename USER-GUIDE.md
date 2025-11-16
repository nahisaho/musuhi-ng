# MUSUHI-NG User Guide

**Version**: 1.0.0
**Last Updated**: November 16, 2025

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [8-Stage SDD Workflow](#8-stage-sdd-workflow)
6. [Constitutional Governance](#constitutional-governance)
7. [Multi-Agent Orchestration](#multi-agent-orchestration)
8. [Platform Integration](#platform-integration)
9. [Advanced Features](#advanced-features)
10. [Troubleshooting](#troubleshooting)
11. [Best Practices](#best-practices)
12. [FAQ](#faq)

---

## Introduction

### What is MUSUHI-NG?

MUSUHI-NG (Multi-User Specification Unified Hierarchical Intelligence - Next Generation) is a comprehensive framework for Specification Driven Development (SDD) that integrates with 8 major AI coding assistants to enforce best practices, automate workflows, and ensure requirements traceability throughout the software development lifecycle.

### Key Benefits

- **Enforced Best Practices**: Constitutional governance ensures Test-First, Library-First, and Security-First development
- **Automated Workflows**: 8-stage SDD process guides teams from research to deployment
- **AI Agent Coordination**: 20 specialized AI agents handle complex multi-step tasks
- **Requirements Traceability**: Real-time verification of requirement ↔ design ↔ code ↔ test mapping
- **Parallel Execution**: Smart dependency analysis reduces development timeline by up to 72%
- **Brownfield Support**: Gap analysis for existing codebases
- **Multi-Platform**: Works with VS Code Copilot, Cursor, Zed, Windsurf, Claude Code, and more

### Who Should Use MUSUHI-NG?

- **Development Teams** practicing agile or specification-driven development
- **AI-Assisted Developers** using GitHub Copilot, Cursor, or similar tools
- **Quality-Focused Organizations** requiring rigorous requirements traceability
- **Brownfield Projects** needing systematic modernization approaches
- **Open Source Projects** wanting to enforce contribution standards

---

## Installation

### Prerequisites

- **Node.js**: v20.0.0 or higher
- **pnpm**: v8.0.0 or higher (recommended) or npm v9.0.0+
- **Git**: v2.30.0 or higher
- **Operating System**: Linux, macOS, or Windows (WSL2 recommended)

### Install via npm

```bash
# Install the CLI globally
npm install -g @musuhi-ng/cli

# Verify installation
musuhi --version
# Expected output: 1.0.0
```

### Install via pnpm

```bash
# Install the CLI globally
pnpm add -g @musuhi-ng/cli

# Verify installation
musuhi --version
```

### Install for Project-Specific Use

```bash
# Navigate to your project
cd /path/to/your/project

# Install as dev dependency
npm install --save-dev @musuhi-ng/cli

# Use via npx
npx musuhi --version
```

---

## Quick Start

### 1. Initialize a New Project

```bash
# Create a new project directory
mkdir my-sdd-project
cd my-sdd-project

# Initialize MUSUHI-NG
musuhi init

# This creates:
# - .musuhi/              # Configuration directory
# - specs/                # Specification documents
# - changes/              # Active development changes
# - changes/archive/      # Completed changes
# - .musuhi/constitution.md  # Constitutional Articles
```

### 2. Configure Your AI Platform

```bash
# Configure for your AI coding assistant
musuhi config set platform cursor

# Available platforms:
# - vscode-copilot
# - cursor
# - zed
# - windsurf
# - claude-code
# - codex-cli
# - gemini-cli
# - qwen-code
```

### 3. Start a New Change

```bash
# Create a new change workspace
musuhi change create "add-user-authentication"

# This creates:
# - changes/2025-11-16-add-user-authentication/
#   ├── proposal.md      # Change proposal
#   ├── requirements.md  # EARS requirements
#   ├── design.md        # Technical design
#   ├── tasks.md         # Implementation tasks
#   └── specs/           # Modified specifications
```

### 4. Run the Dashboard

```bash
# Launch the interactive TUI dashboard
musuhi dashboard

# The dashboard shows:
# - Active changes
# - Current specifications
# - Workflow status
# - Agent activity
# - Real-time logs
```

### 5. Invoke AI Agents

```bash
# Example: Use Requirements Analyst agent
musuhi agent requirements-analyst \
  --task "Create requirements for user authentication"

# Example: Use System Architect agent
musuhi agent system-architect \
  --input requirements.md \
  --output design.md
```

---

## Core Concepts

### Specification Driven Development (SDD)

SDD is a methodology where:

1. **Specifications come first**: Before any code is written
2. **Requirements are traceable**: Every line of code traces back to a requirement
3. **Changes are documented**: All modifications go through formal change workflow
4. **Quality is enforced**: Constitutional governance prevents anti-patterns

### EARS Requirements Format

MUSUHI-NG uses EARS (Easy Approach to Requirements Syntax) for all requirements:

```markdown
## Event-Driven Requirements

WHEN [event], the [system] SHALL [response]

Example:
WHEN a user clicks the "Submit" button, the system SHALL validate all form fields.

## State-Driven Requirements

WHILE [state], the [system] SHALL [response]

Example:
WHILE a file is uploading, the system SHALL display a progress bar.

## Unwanted Behavior

IF [error condition], THEN the [system] SHALL [response]

Example:
IF a network timeout occurs, THEN the system SHALL retry the request up to 3 times.

## Optional Features

WHERE [feature enabled], the [system] SHALL [response]

Example:
WHERE dark mode is enabled, the system SHALL use the dark theme color palette.

## Ubiquitous Requirements

The [system] SHALL [requirement]

Example:
The system SHALL encrypt all passwords using bcrypt with a cost factor of 12.
```

### Constitutional Governance

Nine immutable Articles enforce development principles:

1. **Article I**: Library-First Development
2. **Article II**: Test-First Development
3. **Article III**: Documentation-First Development
4. **Article IV**: Security-First Development
5. **Article V**: Accessibility-First Development
6. **Article VI**: Performance-First Development
7. **Article VII**: Privacy-First Development
8. **Article VIII**: Simplicity-First Development
9. **Article IX**: Integration-First Development

Each Article contains specific validation rules that must pass before proceeding.

### Change Workflow

Changes move through 3 directories:

```
specs/           # Current approved specifications
changes/         # Active development changes
changes/archive/ # Completed and merged changes
```

---

## 8-Stage SDD Workflow

### Stage 1: Research

**Purpose**: Gather information and explore options

**Activities**:

- Technology research
- Library evaluation
- Architecture options analysis
- Competitive analysis

**Output**: `research.md`

**Example**:

```bash
musuhi stage research \
  --topic "Authentication libraries for Node.js" \
  --output changes/current/research.md
```

### Stage 2: Requirements

**Purpose**: Define EARS-format requirements

**Activities**:

- Stakeholder interviews
- User story creation
- EARS requirements writing
- Acceptance criteria definition

**Output**: `requirements.md`

**Constitutional Gate**: Must pass all 9 Articles

**Example**:

```bash
musuhi agent requirements-analyst \
  --input research.md \
  --output requirements.md

# Validate requirements
musuhi validate requirements requirements.md
```

### Stage 3: Design

**Purpose**: Create technical design from requirements

**Activities**:

- Architecture design
- API design
- Database schema design
- Component breakdown

**Output**: `design.md`

**Requirements Mapping**: Every design element must map to ≥1 requirement

**Example**:

```bash
musuhi agent system-architect \
  --input requirements.md \
  --output design.md

# Verify traceability
musuhi verify traceability design.md
```

### Stage 4: Tasks

**Purpose**: Break design into implementation tasks

**Activities**:

- Task decomposition
- Dependency analysis
- P-wave labeling (for parallel execution)
- Estimation

**Output**: `tasks.md`

**Example**:

```bash
musuhi agent project-manager \
  --input design.md \
  --output tasks.md

# Analyze dependencies
musuhi analyze dependencies tasks.md
```

### Stage 5: Implementation

**Purpose**: Write code following tasks

**Activities**:

- Code implementation
- Unit test writing
- Code review
- Continuous integration

**Constitutional Gate**: All tests must pass

**Example**:

```bash
# Execute tasks in parallel where possible
musuhi execute tasks.md --parallel

# Invoke Software Developer agent
musuhi agent software-developer \
  --task "Implement user registration endpoint" \
  --requirements requirements.md \
  --design design.md
```

### Stage 6: Testing

**Purpose**: Verify implementation against requirements

**Activities**:

- Integration testing
- E2E testing
- Security testing
- Performance testing

**Coverage Target**: 80% minimum

**Example**:

```bash
musuhi agent test-engineer \
  --requirements requirements.md \
  --generate-tests

# Run all tests
musuhi test --coverage
```

### Stage 7: Deployment

**Purpose**: Release to production

**Activities**:

- Build pipeline execution
- Deployment to staging
- Smoke testing
- Production deployment

**Example**:

```bash
musuhi deploy --environment staging
musuhi deploy --environment production
```

### Stage 8: Monitoring

**Purpose**: Observe production behavior

**Activities**:

- Log monitoring
- Performance monitoring
- Error tracking
- User feedback collection

**Example**:

```bash
musuhi monitor --service user-auth
```

---

## Constitutional Governance

### Understanding Constitutional Validation

Every requirement must pass validation against all 9 Constitutional Articles:

```bash
# Validate a single requirement
musuhi validate requirement "The system SHALL use bcrypt for password hashing"

# Validate entire requirements document
musuhi validate requirements requirements.md

# Generate validation report
musuhi validate requirements requirements.md --report
```

### Article I: Library-First Development

**Principle**: Use existing libraries before writing custom code

**Validation Rules**:

- Custom implementations must document why existing libraries are insufficient
- Library choices must be justified in research.md
- Security-critical functionality must use well-audited libraries

**Example Valid Requirement**:

```markdown
The system SHALL use Passport.js for authentication strategy management.

**Justification**: Passport.js is the de facto standard with 500+ strategies,
22k+ stars, and active security maintenance.
```

**Example Invalid Requirement**:

```markdown
The system SHALL implement a custom JWT authentication library.

❌ Violation: No justification for not using jsonwebtoken or passport-jwt
```

### Article II: Test-First Development

**Principle**: Write tests before implementation

**Validation Rules**:

- Every requirement must have corresponding test specifications
- Test coverage must be ≥80%
- Tests must be executable and repeatable

**Example Valid Requirement**:

```markdown
WHEN a user submits an invalid email, the system SHALL return a 400 error.

**Test Specification**:

- Input: email = "invalid-email"
- Expected: HTTP 400, error message "Invalid email format"
```

### Article III: Documentation-First Development

**Principle**: Document before implementing

**Validation Rules**:

- All public APIs must have JSDoc/TSDoc comments
- README must exist with usage examples
- Architecture decisions must be documented in ADRs

### Article IV: Security-First Development

**Principle**: Security is not optional

**Validation Rules**:

- Authentication/authorization requirements must be explicit
- Input validation must be specified
- Data encryption requirements must be defined
- OWASP Top 10 vulnerabilities must be addressed

**Example Valid Requirement**:

```markdown
The system SHALL validate all user inputs against XSS attacks using DOMPurify.

The system SHALL enforce HTTPS-only communication for all API endpoints.

The system SHALL implement rate limiting of 100 requests per minute per IP address.
```

### Article V: Accessibility-First Development

**Principle**: WCAG 2.1 AA compliance minimum

**Validation Rules**:

- UI components must meet WCAG 2.1 AA standards
- Keyboard navigation must be fully supported
- Screen reader compatibility must be ensured

### Article VI: Performance-First Development

**Principle**: Performance budgets are requirements

**Validation Rules**:

- Response time targets must be specified
- Resource usage limits must be defined
- Load handling capacity must be documented

**Example Valid Requirement**:

```markdown
The system SHALL respond to API requests within 200ms at p95.

The system SHALL handle 1000 concurrent users without degradation.
```

### Article VII: Privacy-First Development

**Principle**: Data privacy by design

**Validation Rules**:

- PII handling must be explicitly defined
- Data retention policies must be specified
- GDPR/CCPA compliance must be addressed

### Article VIII: Simplicity-First Development

**Principle**: Favor simple solutions

**Validation Rules**:

- Complex designs must justify why simpler approaches are insufficient
- Premature optimization must be avoided
- YAGNI principle must be followed

### Article IX: Integration-First Development

**Principle**: Plan for integration from the start

**Validation Rules**:

- API contracts must be defined upfront
- Integration points must be documented
- Backward compatibility must be considered

---

## Multi-Agent Orchestration

### Available AI Agents

MUSUHI-NG includes 20 specialized AI agents:

| Agent                        | Purpose                    | Input                  | Output                 |
| ---------------------------- | -------------------------- | ---------------------- | ---------------------- |
| **Requirements Analyst**     | Create EARS requirements   | Research, user stories | requirements.md        |
| **System Architect**         | Design system architecture | Requirements           | design.md, C4 diagrams |
| **API Designer**             | Design REST/GraphQL APIs   | Requirements           | OpenAPI spec           |
| **Database Schema Designer** | Design database schema     | Requirements           | ER diagrams, DDL       |
| **Software Developer**       | Implement code             | Design, tasks          | Source code            |
| **Test Engineer**            | Write tests                | Requirements           | Test code              |
| **Code Reviewer**            | Review code quality        | Source code            | Review report          |
| **Bug Hunter**               | Find and fix bugs          | Bug reports            | Fixes                  |
| **Security Auditor**         | Security analysis          | Source code            | Security report        |
| **Performance Optimizer**    | Optimize performance       | Source code            | Optimized code         |
| **DevOps Engineer**          | CI/CD automation           | Config                 | Pipeline files         |
| **Cloud Architect**          | Cloud infrastructure       | Requirements           | IaC code               |
| **Technical Writer**         | Documentation              | Code, APIs             | Docs                   |
| **Project Manager**          | Task planning              | Requirements           | tasks.md               |
| **QA Engineer**              | QA strategy                | Requirements           | Test plan              |
| **UI/UX Designer**           | UI/UX design               | Requirements           | Wireframes             |
| **Database Administrator**   | DB operations              | Schema                 | Migration scripts      |
| **AI/ML Engineer**           | ML models                  | Data, requirements     | Model code             |
| **Gap Analyzer**             | Code gap analysis          | Codebase               | Gap report             |
| **Orchestrator**             | Multi-agent coordination   | Complex tasks          | Delegated results      |

### Invoking Individual Agents

```bash
# Basic syntax
musuhi agent <agent-name> [options]

# Examples

# Requirements Analyst
musuhi agent requirements-analyst \
  --input research.md \
  --output requirements.md \
  --stakeholders "product-team, engineering-team"

# System Architect
musuhi agent system-architect \
  --input requirements.md \
  --output design.md \
  --architecture-style "microservices" \
  --generate-diagrams

# Software Developer
musuhi agent software-developer \
  --task "Implement user registration" \
  --requirements requirements.md \
  --design design.md \
  --language typescript

# Test Engineer
musuhi agent test-engineer \
  --requirements requirements.md \
  --framework vitest \
  --coverage-target 85

# Code Reviewer
musuhi agent code-reviewer \
  --files "src/**/*.ts" \
  --focus "security,performance"

# Security Auditor
musuhi agent security-auditor \
  --codebase ./src \
  --owasp-top-10 \
  --output security-report.md
```

### Using the Orchestrator

The Orchestrator agent coordinates multiple specialized agents:

```bash
musuhi agent orchestrator \
  --task "Build complete user authentication system" \
  --stages "requirements,design,implementation,testing"

# The Orchestrator will:
# 1. Invoke Requirements Analyst for requirements.md
# 2. Invoke System Architect for design.md
# 3. Invoke Software Developer for implementation
# 4. Invoke Test Engineer for tests
# 5. Invoke Code Reviewer for final review
```

### Multi-Agent Conversation Patterns

MUSUHI-NG supports 9 orchestration patterns:

1. **Sequential Chat**: Agents work in sequence
2. **Group Chat**: Agents collaborate simultaneously
3. **Hierarchical**: Manager agent delegates to workers
4. **Nested Chat**: Sub-conversations within main conversation
5. **FSM (Finite State Machine)**: State-driven agent transitions
6. **Swarm**: Dynamic task distribution
7. **User Proxy**: Human-in-the-loop pattern
8. **Capability-Based**: Agents selected by capabilities
9. **Tool-Based**: Agents selected by tool availability

**Example: Hierarchical Pattern**

```bash
musuhi orchestrate \
  --pattern hierarchical \
  --manager "project-manager" \
  --workers "software-developer,test-engineer" \
  --task "Implement authentication module"
```

---

## Platform Integration

### Supported AI Coding Assistants

1. **VS Code + GitHub Copilot**
2. **Cursor**
3. **Zed**
4. **Windsurf**
5. **Claude Code**
6. **Codex CLI**
7. **Gemini CLI**
8. **Qwen Code**

### Configuring Your Platform

```bash
# Set active platform
musuhi config set platform cursor

# View current configuration
musuhi config show

# Platform-specific settings
musuhi config set platform.cursor.model "claude-3.5-sonnet"
musuhi config set platform.cursor.temperature 0.7
```

### Platform Adapters

Each platform has a dedicated adapter in `@musuhi-ng/adapter-<platform>`:

```javascript
// Example: Using Cursor adapter programmatically
import { CursorAdapter } from '@musuhi-ng/adapter-cursor';

const adapter = new CursorAdapter({
  model: 'claude-3.5-sonnet',
  temperature: 0.7,
});

const response = await adapter.chat({
  messages: [{ role: 'user', content: 'Generate EARS requirements for login' }],
});
```

---

## Advanced Features

### Parallel Execution with P-Wave Analysis

MUSUHI-NG analyzes task dependencies and executes independent tasks in parallel:

```bash
# Analyze dependencies in tasks.md
musuhi analyze dependencies tasks.md

# Execute with parallel optimization
musuhi execute tasks.md --parallel

# View P-wave diagram
musuhi visualize pwave tasks.md
```

**P-Wave Example**:

```
Wave 0: [Setup Database] [Setup API Framework]
Wave 1: [Create User Model] [Create Auth Routes]
Wave 2: [Implement Registration] [Implement Login]
Wave 3: [Write Tests] [Write Documentation]

Timeline Reduction: 72%
```

### Brownfield Gap Analysis

Analyze existing codebases to find gaps:

```bash
# Analyze a legacy codebase
musuhi analyze gap \
  --codebase ./legacy-app \
  --requirements requirements.md \
  --output gap-report.md

# Strategies used:
# - AST (Abstract Syntax Tree) parsing
# - Pattern matching
# - ML-based code understanding
```

**Gap Report Output**:

```markdown
# Gap Analysis Report

## Missing Features

1. User authentication (required by REQ-AUTH-001)
2. Input validation (required by REQ-SEC-003)

## Pattern Violations

1. Direct SQL queries without parameterization (Article IV violation)
2. Missing unit tests for PaymentService (Article II violation)

## Breaking Changes Detected

1. API endpoint /users changed from GET to POST

## Undocumented Features

1. Admin panel (no corresponding requirement)
```

### Iterative Verification

Continuously verify requirements coverage:

```bash
# Start iterative verification session
musuhi verify iterative \
  --requirements requirements.md \
  --codebase ./src

# The system will:
# 1. Identify uncovered requirements
# 2. Suggest implementation tasks
# 3. Create checkpoints for rollback
# 4. Track metrics (coverage, velocity, quality)
```

### Traceability Visualization

View requirement-to-code mapping:

```bash
# Generate traceability graph
musuhi visualize traceability \
  --requirements requirements.md \
  --design design.md \
  --code ./src \
  --tests ./tests \
  --output traceability.html

# Open in browser
open traceability.html
```

---

## Troubleshooting

### Common Issues

#### Issue: "Constitutional validation failed"

**Symptom**: Requirements don't pass Article validation

**Solution**:

```bash
# Generate detailed validation report
musuhi validate requirements requirements.md --verbose

# Check specific Article
musuhi validate article --article IV requirements.md

# Fix issues and re-validate
```

#### Issue: "Agent invocation timeout"

**Symptom**: Agent doesn't respond within timeout period

**Solution**:

```bash
# Increase timeout
musuhi agent software-developer \
  --task "..." \
  --timeout 300000  # 5 minutes

# Check agent logs
musuhi logs agent --tail 100
```

#### Issue: "Platform adapter not found"

**Symptom**: Selected platform not working

**Solution**:

```bash
# List available platforms
musuhi platform list

# Install missing adapter
npm install @musuhi-ng/adapter-cursor

# Verify installation
musuhi platform verify cursor
```

#### Issue: "Traceability verification failed"

**Symptom**: Cannot link requirements to code

**Solution**:

```bash
# Generate detailed traceability report
musuhi verify traceability --verbose

# Check for missing IDs
musuhi check requirement-ids requirements.md

# Update design.md with requirement references
```

### Debug Mode

Enable detailed logging:

```bash
# Run any command with debug flag
musuhi --debug agent requirements-analyst --task "..."

# View logs
musuhi logs show --level debug

# Export logs
musuhi logs export --output debug.log
```

---

## Best Practices

### 1. Start Small

- Begin with a single, well-defined feature
- Master one agent at a time
- Gradually adopt more workflow stages

### 2. Embrace EARS Format

- All requirements must use EARS patterns
- Be specific: avoid vague words like "should" or "might"
- One requirement per statement

### 3. Maintain Traceability

- Every design element references requirements (e.g., REQ-001)
- Every code file links to design sections
- Every test case maps to requirements

### 4. Use Constitutional Validation Early

- Validate requirements before design
- Fix violations immediately
- Don't skip Article validation

### 5. Leverage Parallel Execution

- Define clear task dependencies in tasks.md
- Use P-wave analysis to optimize timeline
- Monitor execution through dashboard

### 6. Document Decisions

- Use Architecture Decision Records (ADRs)
- Explain why libraries were chosen
- Document trade-offs

### 7. Review Regularly

- Use Code Reviewer agent frequently
- Conduct peer reviews with agent assistance
- Run Security Auditor on every change

### 8. Automate Testing

- Write tests first (Article II)
- Aim for >80% coverage
- Use Test Engineer agent to generate comprehensive test suites

---

## FAQ

### General Questions

**Q: What does "MUSUHI-NG" stand for?**

A: Multi-User Specification Unified Hierarchical Intelligence - Next Generation. It's the evolution of the original MUSUHI framework with modern AI integration.

**Q: Is MUSUHI-NG open source?**

A: Yes, MUSUHI-NG is released under the MIT License.

**Q: Can I use MUSUHI-NG with non-AI development?**

A: Yes! While optimized for AI-assisted development, the SDD methodology and Constitutional Governance work for traditional development too.

### Technical Questions

**Q: Which Node.js versions are supported?**

A: Node.js v20.0.0 and higher. We recommend using the latest LTS version.

**Q: Can I customize the Constitutional Articles?**

A: No, the 9 Articles are immutable by design. However, you can add custom validation rules in `.musuhi/config.json`.

**Q: Does MUSUHI-NG support languages other than JavaScript/TypeScript?**

A: Currently, the framework is built in TypeScript, but the AI agents can generate code in any language. Full multi-language support is planned for v2.0.

**Q: How does MUSUHI-NG handle private codebases?**

A: All analysis happens locally. No code is sent to external services unless you explicitly configure an LLM provider that requires it.

### Workflow Questions

**Q: Can I skip stages in the 8-stage workflow?**

A: While technically possible, it's strongly discouraged. Each stage builds on the previous one. Skipping stages often leads to rework.

**Q: How long does a typical change workflow take?**

A: It varies by change size:

- Small (1-2 files): 1-2 hours
- Medium (3-10 files): 4-8 hours
- Large (10+ files): 1-3 days

P-wave parallel execution can reduce these by up to 72%.

**Q: Can multiple developers work on the same change?**

A: Yes, but each developer should work in their own change workspace. Merge to specs/ when complete.

### Integration Questions

**Q: Can I use MUSUHI-NG with existing projects?**

A: Yes! Use the Gap Analyzer to assess your current codebase and create a migration plan.

**Q: Does MUSUHI-NG work with monorepos?**

A: Yes, MUSUHI-NG itself is a monorepo. You can run it at the root or in individual packages.

**Q: Can I integrate MUSUHI-NG with CI/CD?**

A: Absolutely. See the DevOps Engineer agent and `.github/workflows/` examples.

---

## Additional Resources

### Documentation

- **API Reference**: https://musuhi-ng.dev/api
- **Architecture Guide**: https://musuhi-ng.dev/architecture
- **Contributing Guide**: https://github.com/nahisaho/musuhi-ng/blob/main/CONTRIBUTING.md

### Community

- **GitHub Discussions**: https://github.com/nahisaho/musuhi-ng/discussions
- **Discord**: https://discord.gg/musuhi-ng
- **Stack Overflow**: Tag `musuhi-ng`

### Tutorials

- **Getting Started Video**: https://youtube.com/musuhi-ng-intro
- **EARS Requirements Workshop**: https://musuhi-ng.dev/tutorials/ears
- **Multi-Agent Orchestration Deep Dive**: https://musuhi-ng.dev/tutorials/agents

---

## License

MUSUHI-NG is released under the MIT License. See [LICENSE](LICENSE) for details.

---

## Support

For bugs and feature requests, please open an issue on GitHub:
https://github.com/nahisaho/musuhi-ng/issues

For general questions, join our Discord community or post on GitHub Discussions.

---

**Last Updated**: November 16, 2025
**Version**: 1.0.0
**Maintainer**: MUSUHI-NG Contributors
