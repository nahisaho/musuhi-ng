# MUSUHI Redesign Research - Part 2: Product Analysis (Continued)

**Research Date**: 2025-11-15
**Researcher**: Orchestrator AI

_Continuation of Part 1 - Analyzing products 4-6_

---

## 4. cc-sdd (Claude Code Specification Driven Development)

### Overview

- **Repository**: `/References/cc-sdd/`
- **Core Philosophy**: Kiro-inspired Spec-Driven Development with AI-DLC (AI-Driven Development Lifecycle)
- **Primary Innovation**: Parallel task execution with P-wave dependency tracking + Subagent system

### Architecture

```
cc-sdd/
├── .kiro/
│   ├── settings/
│   │   ├── templates/           # Customizable document templates
│   │   │   ├── requirements.md
│   │   │   ├── design.md
│   │   │   └── tasks.md
│   │   └── rules/               # AI generation principles
│   ├── specs/
│   │   └── <feature-name>/
│   │       ├── requirements.md  # EARS-format requirements
│   │       ├── research.md      # Technical investigation log
│   │       ├── design.md        # Architecture + Mermaid diagrams
│   │       ├── tasks.md         # P-wave labeled task list
│   │       ├── gap-report.md    # Brownfield gap analysis (optional)
│   │       └── design-validation.md (optional)
│   └── steering/                # Project memory
│       ├── architecture.md
│       ├── conventions.md
│       └── custom/              # Domain-specific steering
└── tools/cc-sdd/
    ├── cli/                     # NPM package installer
    └── agents/                  # 9 Subagents (claude-agent variant)
        ├── requirements-specialist.md
        ├── design-specialist.md
        ├── task-planner.md
        ├── implementation-specialist.md
        ├── validation-specialist.md
        ├── gap-analyzer.md
        ├── research-specialist.md
        ├── steering-specialist.md
        └── orchestrator-specialist.md
```

### Strengths

**1. Parallel Task Execution Framework** ⭐⭐⭐⭐⭐

- **P-Wave Labeling**: Tasks tagged with P0, P1, P2 to indicate parallel execution waves
- **Dependency Tracking**: Clear dependencies prevent race conditions
- **Example `tasks.md` Structure**:

  ```markdown
  ## Phase 1: Foundation (P0)

  - [P0] Task 1.1: Set up database schema
  - [P0] Task 1.2: Create API contract definitions

  ## Phase 2: Core Implementation (P1 - can run after P0)

  - [P1] Task 2.1: Implement user service
  - [P1] Task 2.2: Implement auth middleware (depends on 2.1)

  ## Phase 3: Integration (P2 - can run after P1)

  - [P2] Task 3.1: Connect frontend to API
  - [P2] Task 3.2: Add E2E tests
  ```

- **Benefits**: Teams can parallelize work efficiently, 50%+ time savings on large projects

**2. Brownfield/Greenfield Dual Support** ⭐⭐⭐⭐⭐

- **Greenfield Workflow**: `/kiro:spec-init` → `requirements` → `design` → `tasks` → `impl`
- **Brownfield Workflow**:
  1. `/kiro:steering` - Capture existing architecture
  2. `/kiro:spec-init` - Create new feature spec
  3. `/kiro:validate-gap` - Analyze requirements vs existing code
  4. `/kiro:spec-design` - Generate design with gap reconciliation
  5. `/kiro:validate-design` - Validate design against existing system
  6. `/kiro:spec-tasks` → `/kiro:spec-impl`

- **Gap Analysis** (`/kiro:validate-gap`):
  - Compares requirements against existing codebase
  - Identifies conflicts, missing features, breaking changes
  - Outputs `gap-report.md` with reconciliation recommendations

- **Design Validation** (`/kiro:validate-design`):
  - Ensures new design aligns with existing architecture
  - Detects pattern violations, incompatible abstractions
  - Outputs `design-validation.md`

**3. Slash Command Workflow (11 Commands)** ⭐⭐⭐⭐⭐
**Core Commands**:

- `/kiro:steering` - Build/refresh project memory
- `/kiro:steering-custom` - Add domain-specific steering
- `/kiro:spec-init <feature>` - Start new feature workspace
- `/kiro:spec-requirements <feature>` - Capture requirements & gaps
- `/kiro:spec-design <feature>` - Investigation log + implementation design
- `/kiro:spec-tasks <feature>` - Break design into P-wave tasks
- `/kiro:spec-impl <feature> <task-ids>` - Implement specific tasks

**Optional Commands**:

- `/kiro:validate-gap <feature>` - Gap analysis vs existing code
- `/kiro:validate-design <feature>` - Design validation
- `/kiro:spec-status <feature>` - See phase, approvals, open tasks

**Quick Orchestration**:

- `/kiro:spec-quick <feature>` - Orchestrates steps 2-5 with pauses for approval

**4. Subagent System (Claude Code Variant)** ⭐⭐⭐⭐⭐
**9 Specialized Subagents**:

1. **requirements-specialist** - EARS requirements generation
2. **design-specialist** - Architecture + Mermaid diagrams
3. **task-planner** - P-wave task breakdown with dependencies
4. **implementation-specialist** - Code generation + validation
5. **validation-specialist** - Quality gates, test validation
6. **gap-analyzer** - Brownfield gap analysis
7. **research-specialist** - Technical investigation
8. **steering-specialist** - Project memory management
9. **orchestrator-specialist** - Multi-subagent coordination

- **Benefits**:
  - Specialized expertise per phase
  - Cleaner separation of concerns
  - Better output quality (each subagent is an expert)

**5. Customizable Templates** ⭐⭐⭐⭐

- **Template Directory**: `.kiro/settings/templates/`
- **Customizable Sections**: Teams can define their own document structure
- **Example Use Cases**:
  - PRD-style requirements (vs. EARS format)
  - API/database schema templates
  - Approval gate checklists
  - JIRA integration templates
  - Domain-specific standards (healthcare, finance)

- **Rules Directory**: `.kiro/settings/rules/`
  - AI generation principles
  - Judgment criteria for quality gates
  - Team-specific conventions

**6. Kiro-Inspired Design** ⭐⭐⭐⭐

- **Compatible with Kiro IDE**: Existing Kiro specs remain portable
- **AI-DLC Philosophy**: AI-Driven Development Lifecycle
- **Spec-First Guarantees**: Approve requirements/design upfront, then AI implements exactly as specified
- **Team-Aligned**: Customize once, all agents follow same format

**7. Multi-Platform Support** ⭐⭐⭐⭐⭐

- **7 Platforms**: Claude (Commands / Subagents), Cursor, Gemini, Codex, Copilot, Qwen, Windsurf
- **12 Languages**: English, Japanese, Traditional Chinese, Chinese, Spanish, Portuguese, German, French, Russian, Italian, Korean, Arabic
- **Unified NPX Installer**: `npx cc-sdd@latest --[platform] --lang [language]`

### Weaknesses

**1. No Constitutional Governance** ⭐⭐

- **Problem**: No immutable principles like spec-kit's 9 Articles
- **Impact**: No automatic enforcement of architectural violations
- **Comparison**: spec-kit's gates prevent over-engineering

**2. Limited EARS Format Enforcement** ⭐⭐

- **Problem**: EARS format mentioned in templates but not mandatory
- **Impact**: Teams can write ambiguous requirements if they choose
- **Comparison**: musuhi enforces EARS system-wide

**3. No Change Workflow** ⭐

- **Problem**: No distinction between current truth (`specs/`) and proposed changes (`changes/`)
- **Impact**: Difficult to manage proposed updates, reviews, spec deltas
- **Comparison**: OpenSpec's two-folder model excels here

**4. Manual Traceability Matrix** ⭐⭐

- **Problem**: Requirements → design → tasks → code mapping is manual
- **Impact**: Time-consuming to maintain, matrices drift over time
- **Suggestion**: Automate with requirement IDs in tasks, code comments

**5. No Unified Dashboard** ⭐

- **Problem**: No visual tool to view specs, progress, or agent status
- **Impact**: Teams must manually inspect markdown files
- **Comparison**: OpenSpec's `openspec view` dashboard

**6. Limited Agent Library** ⭐⭐

- **Problem**: Only 9 subagents (vs. musuhi's 20 agents)
- **Impact**: Missing specialists (Security Auditor, Performance Optimizer, UI/UX Designer, AI/ML Engineer, etc.)
- **Suggestion**: Expand subagent library to cover full SDLC

### SDD Relevance

**Highly Relevant** (9/10)

- ✅ **Parallel Execution**: Best-in-class P-wave dependency tracking
- ✅ **Brownfield Support**: Gap analysis + design validation
- ✅ **Subagent System**: Specialized experts for each phase
- ✅ **Customizable**: Templates + rules adapt to team workflow
- ✅ **Kiro-Compatible**: Portable specs across tools
- ⚠️ **Missing**: Constitutional governance, EARS enforcement, change workflow, unified dashboard

### Unique Features

1. **P-Wave Labeling** (P0, P1, P2): Only framework with explicit parallel execution waves
2. **Gap Analysis** (`/kiro:validate-gap`): Brownfield-specific gap detection
3. **Design Validation** (`/kiro:validate-design`): Ensures new design aligns with existing system
4. **Subagent System**: 9 specialized agents (Claude Code variant)
5. **Quick Orchestration** (`/kiro:spec-quick`): One-command workflow with approval pauses
6. **Custom Steering** (`/kiro:steering-custom`): Domain-specific project memory
7. **Kiro-Inspired**: Compatible with Kiro IDE specs

---

## 5. OpenSpec (Fission AI)

### Overview

- **Repository**: `/References/OpenSpec/`
- **Organization**: Fission AI
- **Core Philosophy**: Spec-driven development for brownfield, change tracking first
- **Primary Innovation**: Two-folder model (specs/ + changes/) with delta tracking

### Architecture

```
openspec/
├── specs/                       # Current truth (source of truth)
│   └── <spec-name>/
│       └── spec.md             # Existing spec
├── changes/                     # Proposed updates (workspace)
│   └── <change-name>/
│       ├── proposal.md         # Why and what changes
│       ├── tasks.md            # Implementation checklist
│       ├── design.md           # Technical decisions (optional)
│       └── specs/              # Delta: spec updates
│           └── <spec-name>/
│               └── spec.md     # ADDED/MODIFIED/REMOVED requirements
├── archive/                     # Completed changes
├── project.md                   # Project-level conventions
└── AGENTS.md                    # Hand-off to AGENTS.md-compatible tools
```

### CLI Commands

```bash
openspec init                    # Initialize OpenSpec in project
openspec list                    # View active change folders
openspec view                    # Interactive dashboard
openspec show <change>           # Display change details
openspec validate <change>       # Check spec formatting
openspec archive <change> [--yes] # Move completed change to archive/
```

### Strengths

**1. Two-Folder Model (Specs + Changes)** ⭐⭐⭐⭐⭐

- **Separation of Concerns**:
  - `specs/` = Current truth (production specs)
  - `changes/` = Proposed updates (workspace for new features)
  - `archive/` = Completed changes (historical record)

- **Benefits**:
  - Clear distinction between "what is" and "what we're proposing"
  - Easy to review proposed changes without polluting current specs
  - Supports multiple in-flight changes simultaneously
  - Archiving merges deltas back into source truth

- **Example Workflow**:

  ```bash
  # 1. Draft proposal
  AI: Create proposal for profile search filters
  → openspec/changes/add-profile-filters/proposal.md

  # 2. Review & refine
  $ openspec validate add-profile-filters
  $ openspec show add-profile-filters

  # 3. Implement
  AI: Implement tasks from add-profile-filters

  # 4. Archive (merge deltas into specs/)
  $ openspec archive add-profile-filters --yes
  → Deltas merged into openspec/specs/profile/spec.md
  → Change moved to openspec/archive/add-profile-filters/
  ```

**2. Delta Format (ADDED/MODIFIED/REMOVED)** ⭐⭐⭐⭐⭐

- **Structured Deltas**: Changes are explicit patches, not full rewrites
- **Format**:

  ```markdown
  ## ADDED Requirements

  ### Requirement: Two-Factor Authentication

  The system MUST require a second factor during login.

  ## MODIFIED Requirements

  ### Requirement: User Authentication (UPDATED)

  [Complete updated text with changes highlighted]

  ## REMOVED Requirements

  ### Requirement: SMS Verification (DEPRECATED)

  [Reason for removal]
  ```

- **Benefits**:
  - Clear diff view for reviewers
  - Easy to spot what's changing
  - Prevents accidental overwrites
  - Maintains historical record of removals

**3. Brownfield Excellence** ⭐⭐⭐⭐⭐

- **Designed for 1→n**: Works great when modifying existing features
- **Multi-Spec Changes**: Single change folder can update multiple specs
- **Example**: Adding 2FA might touch `auth/spec.md` + `user/spec.md` + `database/spec.md`
- **Comparison**: spec-kit and Kiro struggle with cross-spec updates

**4. Interactive Dashboard** ⭐⭐⭐⭐⭐

- **`openspec view` Command**: Terminal-based interactive dashboard
- **Features**:
  - View all active changes
  - Inspect proposals, tasks, spec deltas
  - Validate formatting
  - Archive completed changes
- **Benefits**: Visual workflow, no need to navigate markdown files manually

**5. Native Slash Command Support (15+ Tools)** ⭐⭐⭐⭐⭐

- **Primary Tools** (native slash commands):
  - Claude Code: `/openspec:proposal`, `/openspec:apply`, `/openspec:archive`
  - CodeBuddy, CoStrict, Cursor, Cline, Crush, RooCode, Factory Droid, Gemini CLI, OpenCode, Kilo Code, Qoder, Windsurf, Codex, GitHub Copilot, Amazon Q Developer, Auggie, Qwen Code

- **AGENTS.md Compatible Tools**: Amp, Jules, others
  - Tools automatically read `openspec/AGENTS.md` for workflow instructions

**6. Lightweight & No API Keys** ⭐⭐⭐⭐⭐

- **No External Dependencies**: Doesn't require API keys for operation
- **Minimal Setup**: `npm install -g @fission-ai/openspec && openspec init`
- **Text-Based**: All specs are markdown (Git-friendly, diffable)

**7. Change Tracking & Auditing** ⭐⭐⭐⭐⭐

- **Proposal First**: Every change starts with `proposal.md` (why + what)
- **Task Checklist**: `tasks.md` tracks implementation progress
- **Archive System**: Completed changes moved to `archive/` with full history
- **Traceability**: Clear audit trail from proposal → implementation → archive

### Weaknesses

**1. No Constitutional Governance** ⭐

- **Problem**: No immutable architectural principles
- **Impact**: No automatic enforcement of design violations
- **Comparison**: spec-kit's 9 Articles + gates

**2. No EARS Format** ⭐⭐

- **Problem**: Requirements use custom format (not EARS)
- **Impact**: Acceptance criteria may be ambiguous
- **Comparison**: musuhi enforces EARS system-wide

**3. No Agent Orchestration** ⭐⭐

- **Problem**: No multi-agent coordination (single AI assistant per session)
- **Impact**: Can't leverage specialized agents for complex workflows
- **Comparison**: musuhi's 20 agents, ag2's patterns, cc-sdd's 9 subagents

**4. No Project Memory** ⭐⭐

- **Problem**: `project.md` exists but no auto-context awareness like musuhi
- **Impact**: Agents don't automatically read/update project conventions
- **Comparison**: musuhi's auto-update steering system

**5. Manual Task Management** ⭐⭐

- **Problem**: `tasks.md` is a checklist (not executable task breakdown)
- **Impact**: No dependency tracking, parallel execution waves
- **Comparison**: cc-sdd's P-wave labeling

**6. Limited SDD Workflow** ⭐⭐

- **Problem**: Workflow is change-centric (proposal → tasks → implement → archive)
- **Impact**: No explicit requirements → design → tasks phases
- **Comparison**: musuhi's 8-stage SDD, spec-kit's 5-command workflow

### SDD Relevance

**Moderately Relevant** (7/10)

- ✅ **Brownfield Excellence**: Best-in-class change tracking for existing codebases
- ✅ **Delta Format**: Clear ADDED/MODIFIED/REMOVED patches
- ✅ **Two-Folder Model**: Separation of current truth vs proposals
- ✅ **Interactive Dashboard**: Visual workflow management
- ✅ **Multi-Platform**: 15+ AI tools supported
- ⚠️ **Missing**: Constitutional governance, EARS format, multi-agent orchestration, project memory

### Unique Features

1. **Two-Folder Model**: Only framework separating `specs/` (truth) from `changes/` (proposals)
2. **Delta Format**: Structured ADDED/MODIFIED/REMOVED patches (not full rewrites)
3. **Archive System**: Completed changes moved to `archive/` with full history
4. **Interactive Dashboard**: `openspec view` terminal-based UI
5. **Brownfield-First**: Designed for 1→n (not just 0→1)
6. **Multi-Spec Changes**: Single change folder can update multiple specs
7. **AGENTS.md Convention**: Supports AGENTS.md hand-off standard
8. **No API Keys**: Completely local, no external dependencies

---

## 6. ai-dev-tasks (SnarkTank)

### Overview

- **Repository**: `/References/ai-dev-tasks/`
- **Author**: SnarkTank
- **Core Philosophy**: Structured PRD-to-tasks workflow with step-by-step verification
- **Primary Innovation**: Iterative task execution with human checkpoints

### Architecture

```
ai-dev-tasks/
├── create-prd.md        # PRD generation prompt
└── generate-tasks.md    # Task list generation prompt
```

### Workflow

```
1. Create PRD:
   Use @create-prd.md
   Here's the feature: [Describe feature]
   Reference these files: [@file1.py @file2.ts]
   → Outputs: MyFeature-PRD.md

2. Generate Tasks:
   Now take @MyFeature-PRD.md and create tasks using @generate-tasks.md
   → Outputs: MyFeature-Tasks.md (with sub-tasks)

3. Execute Tasks:
   Please start on task 1.1 from the generated task list.
   → AI implements task 1.1, waits for approval
   → Continue: Task 1.2, 1.3, etc.

4. Progress Tracking:
   AI marks tasks complete as it progresses
   User reviews each sub-task before proceeding
```

### Strengths

**1. Simplicity** ⭐⭐⭐⭐⭐

- **Two Files**: Only `create-prd.md` and `generate-tasks.md`
- **No Installation**: Just markdown prompts
- **Universal Compatibility**: Works with any AI tool (Amp, Claude Code, Windsurf, etc.)
- **Minimal Learning Curve**: Immediate productivity

**2. Iterative Verification** ⭐⭐⭐⭐⭐

- **Step-by-Step Execution**: AI works on one sub-task at a time
- **Human Checkpoints**: User reviews each task before proceeding
- **Example Workflow**:

  ```
  AI: I've completed task 1.1: Set up database schema.
      Please review the changes before I proceed to task 1.2.

  User: Looks good, continue.

  AI: Starting task 1.2: Create API contract definitions...
  ```

- **Benefits**:
  - Prevents AI from going off-track
  - Early error detection
  - User maintains control
  - Debuggable progress

**3. PRD-Centric** ⭐⭐⭐⭐

- **Product Requirement Document**: Clear definition of WHAT to build
- **PRD Template Guidance**: `create-prd.md` guides AI to generate comprehensive PRDs
- **Context Injection**: Users can reference existing files (`@file1.py`) for context
- **Benefits**: Lightweight requirements capture, accessible to non-developers

**4. Task Breakdown** ⭐⭐⭐⭐

- **Hierarchical Tasks**: Main tasks → sub-tasks
- **Example**:

  ```markdown
  ## 1. Database Setup

  - [ ] 1.1 Add OTP secret column to users table
  - [ ] 1.2 Create OTP verification logs table

  ## 2. Backend Implementation

  - [ ] 2.1 Add OTP generation endpoint
  - [ ] 2.2 Modify login flow to require OTP
  - [ ] 2.3 Add OTP verification endpoint

  ## 3. Frontend Updates

  - [ ] 3.1 Create OTP input component
  - [ ] 3.2 Update login flow UI
  ```

- **Progress Tracking**: Checkboxes mark completion visually

**5. Proven Reliability** ⭐⭐⭐⭐

- **Tested in Production**: Author demonstrated on "How I AI" podcast
- **Real-World Use**: Used for building larger features with AI assistance
- **Video Demonstration**: YouTube walkthrough available

### Weaknesses

**1. No Spec-Driven Workflow** ⭐⭐

- **Problem**: PRD-centric (not requirements → design → tasks)
- **Impact**: No explicit design phase, architecture decisions
- **Comparison**: musuhi's 8-stage workflow, spec-kit's 5 commands

**2. No EARS Format** ⭐⭐

- **Problem**: PRDs are free-form (not standardized acceptance criteria)
- **Impact**: Requirements may be ambiguous
- **Comparison**: musuhi enforces EARS format

**3. No Project Memory** ⭐

- **Problem**: No steering/context system
- **Impact**: AI doesn't remember architecture patterns, tech stack
- **Comparison**: musuhi's auto-context steering

**4. No Multi-Agent Support** ⭐

- **Problem**: Single AI assistant per session
- **Impact**: Can't leverage specialized agents
- **Comparison**: musuhi's 20 agents, ag2's patterns, cc-sdd's subagents

**5. No Dependency Tracking** ⭐⭐

- **Problem**: Tasks don't specify dependencies or parallel execution
- **Impact**: Sequential execution only, can't parallelize
- **Comparison**: cc-sdd's P-wave labeling

**6. No Change Workflow** ⭐

- **Problem**: No distinction between greenfield/brownfield
- **Impact**: Difficult to modify existing features
- **Comparison**: OpenSpec's two-folder model

**7. Manual Process** ⭐⭐

- **Problem**: No CLI, no automation (just markdown prompts)
- **Impact**: User must manually orchestrate workflow
- **Comparison**: spec-kit's slash commands, cc-sdd's `/kiro:*` commands

### SDD Relevance

**Low Relevance** (4/10)

- ✅ **Iterative Verification**: Best-in-class human checkpoints
- ✅ **Simplicity**: Easiest to get started
- ✅ **PRD-Centric**: Clear requirements capture
- ❌ **No SDD Workflow**: Missing design, architecture phases
- ❌ **No EARS Format**: Free-form requirements
- ❌ **No Multi-Agent**: Single AI assistant
- ❌ **No Automation**: Manual orchestration

### Unique Features

1. **Two-File Simplicity**: Only framework with just 2 markdown prompts
2. **Universal Compatibility**: Works with any AI tool (no installation)
3. **Iterative Verification**: Step-by-step execution with human checkpoints
4. **PRD-Centric**: Product Requirement Document as primary artifact
5. **Context Injection**: `@file1.py` references for AI context
6. **Video Demonstration**: "How I AI" podcast walkthrough
7. **Immediate Productivity**: No learning curve, instant usage

---

_End of Part 2 - Individual Product Analysis (Products 4-6)_

**Next**: Part 3 will contain the Comparative Analysis Matrix and Recommendations.
