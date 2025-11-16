# E2E Test Scenarios - MUSUHI 2.0

## Document Information

- **Version**: 1.0
- **Date**: 2025-11-16
- **Status**: Draft
- **Parent Document**: `phase-6-test-plan.md`

## Overview

This document provides detailed end-to-end (E2E) test scenarios for MUSUHI 2.0 Phase 6 Testing. Each scenario validates a complete workflow from start to finish, covering all 8 features.

**Total Scenarios**: 8
**Test Framework**: Vitest
**Test Location**: `tests/e2e/`

---

## Table of Contents

1. [TEST-E2E-001: Complete SDD Workflow](#test-e2e-001-complete-sdd-workflow)
2. [TEST-E2E-002: Multi-Agent Orchestration Patterns](#test-e2e-002-multi-agent-orchestration-patterns)
3. [TEST-E2E-003: Parallel Task Execution](#test-e2e-003-parallel-task-execution)
4. [TEST-E2E-004: Gap Analysis on Real Codebase](#test-e2e-004-gap-analysis-on-real-codebase)
5. [TEST-E2E-005: Platform Switching](#test-e2e-005-platform-switching)
6. [TEST-E2E-006: Iterative Verification Workflow](#test-e2e-006-iterative-verification-workflow)
7. [TEST-E2E-007: Dashboard Real-Time Updates](#test-e2e-007-dashboard-real-time-updates)
8. [TEST-E2E-008: Constitutional Enforcement](#test-e2e-008-constitutional-enforcement)

---

## TEST-E2E-001: Complete SDD Workflow

### Test Metadata

- **Test ID**: TEST-E2E-001
- **Feature Coverage**: All 8 features
- **Priority**: P0
- **Estimated Execution Time**: 5 minutes
- **Automation**: Full (Vitest)

### Objective

Validate that all 8 stages of the SDD workflow execute successfully from project initialization to change archival.

### Prerequisites

- MUSUHI 2.0 CLI installed
- Claude Code or Cursor platform available
- Clean test environment

### Test Data

**Project Name**: `test-ecommerce-app`
**Feature**: User Authentication (login, logout, password reset)

### Detailed Test Steps

#### Step 1: Initialize New Project

**Command**:
```bash
musuhi init test-ecommerce-app
cd test-ecommerce-app
```

**Expected Output**:
```
✓ Creating project structure...
✓ Generating steering files...
  - steering/structure.md
  - steering/tech.md
  - steering/product.md
  - steering/constitution.md
✓ Creating directories...
  - specs/
  - changes/
  - archive/
✓ Initializing configuration...
  - .musuhi/config.yaml
✓ Project initialized successfully!

Next steps:
1. Review steering files in steering/
2. Create your first spec in specs/
3. Run: musuhi validate
```

**Verification**:
```typescript
expect(fs.existsSync('steering/structure.md')).toBe(true);
expect(fs.existsSync('steering/tech.md')).toBe(true);
expect(fs.existsSync('steering/product.md')).toBe(true);
expect(fs.existsSync('steering/constitution.md')).toBe(true);
expect(fs.existsSync('.musuhi/config.yaml')).toBe(true);
expect(fs.existsSync('specs/')).toBe(true);
expect(fs.existsSync('changes/')).toBe(true);
```

---

#### Step 2: Create Requirement Spec (Stage 2: Requirements)

**File**: `specs/user-authentication.md`

**Content** (EARS format):
```markdown
# User Authentication Specification

## Overview
This specification defines user authentication functionality for the e-commerce platform.

## Requirements

### AC-1.1: User Login
WHEN a user enters valid credentials, the system SHALL authenticate the user and create a session.

**Acceptance Criteria**:
- Valid email/password combination grants access
- Session token generated (JWT, 24-hour expiry)
- User redirected to dashboard

### AC-1.2: Invalid Login
IF a user enters invalid credentials, THEN the system SHALL display an error message without revealing which field is incorrect.

**Acceptance Criteria**:
- Generic error message: "Invalid email or password"
- No account enumeration (security)
- Login attempt logged

### AC-1.3: Session Persistence
WHILE a user has a valid session token, the system SHALL maintain authentication state.

**Acceptance Criteria**:
- Session persists across page reloads
- Session expires after 24 hours
- Logout invalidates session immediately

## Traceability
- Research Finding: User authentication is critical for e-commerce security
- Design: TBD
- Tasks: TBD
- Code: TBD
- Tests: TBD
```

**Command**:
```bash
musuhi validate specs/user-authentication.md
```

**Expected Output**:
```
✓ Validating specs/user-authentication.md...
✓ EARS format: VALID (3 requirements)
  - AC-1.1: WHEN pattern ✓
  - AC-1.2: IF pattern ✓
  - AC-1.3: WHILE pattern ✓
✓ Acceptance criteria: COMPLETE
✓ Traceability section: PRESENT
✓ Validation passed!
```

**Verification**:
```typescript
const validator = new EARSValidator('specs/user-authentication.md');
const result = await validator.validate();
expect(result.valid).toBe(true);
expect(result.requirements.length).toBe(3);
```

---

#### Step 3: Propose Change (Stage 3: Design)

**Command**:
```bash
musuhi change init "implement-user-authentication"
```

**Expected Output**:
```
✓ Creating change proposal...
✓ Directory created: changes/2025-11-16-implement-user-authentication/
✓ Generated proposal.md
✓ Generated delta.md (template)

Next steps:
1. Edit proposal.md to describe the change
2. Update delta.md with ADDED/MODIFIED/REMOVED files
3. Run: musuhi validate changes/2025-11-16-implement-user-authentication/
```

**Verification**:
```typescript
expect(fs.existsSync('changes/2025-11-16-implement-user-authentication/proposal.md')).toBe(true);
expect(fs.existsSync('changes/2025-11-16-implement-user-authentication/delta.md')).toBe(true);
```

**File**: `changes/2025-11-16-implement-user-authentication/delta.md`

**Content**:
```markdown
# Change Delta: Implement User Authentication

## ADDED
- src/auth/auth-service.ts (authentication logic)
- src/auth/session-manager.ts (session management)
- src/models/user.ts (user model)
- tests/auth/auth-service.test.ts (unit tests)
- tests/auth/session-manager.test.ts (unit tests)

## MODIFIED
- src/app.ts (add authentication middleware)
- package.json (add dependencies: bcrypt, jsonwebtoken)

## REMOVED
- None
```

---

#### Step 4: Execute Change with Agents (Stage 4: Tasks, Stage 5: Implementation)

**Command**:
```bash
musuhi change execute "implement-user-authentication" --agents
```

**Expected Agent Workflow**:
1. **Requirements Analyst**: Reviews `specs/user-authentication.md`
2. **System Architect**: Generates architecture design (auth service, session manager)
3. **Software Developer**: Implements code in `src/auth/`
4. **Test Engineer**: Generates tests in `tests/auth/`

**Expected Output** (abbreviated):
```
✓ Starting change execution...
✓ Agent: Requirements Analyst
  - Analyzing specs/user-authentication.md
  - Requirements validated: 3 ACs
✓ Agent: System Architect
  - Generating architecture design
  - Components: AuthService, SessionManager, User model
✓ Agent: Software Developer
  - Implementing src/auth/auth-service.ts
  - Implementing src/auth/session-manager.ts
  - Implementing src/models/user.ts
✓ Agent: Test Engineer
  - Generating tests/auth/auth-service.test.ts
  - Generating tests/auth/session-manager.test.ts
  - Test coverage: 85%
✓ Change execution complete!
```

**Verification**:
```typescript
expect(fs.existsSync('src/auth/auth-service.ts')).toBe(true);
expect(fs.existsSync('src/auth/session-manager.ts')).toBe(true);
expect(fs.existsSync('tests/auth/auth-service.test.ts')).toBe(true);

// Verify code quality
const testResults = await runTests('tests/auth/');
expect(testResults.passed).toBe(true);
expect(testResults.coverage).toBeGreaterThanOrEqual(80);
```

---

#### Step 5: Validate Constitutional Compliance (Phase -1 Gate)

**Command**:
```bash
musuhi validate changes/2025-11-16-implement-user-authentication/ --phase-gate
```

**Expected Output**:
```
✓ Phase -1 Gate Validation
✓ Article 1 (Library-First): PASS
  - Uses bcrypt library for password hashing ✓
  - Uses jsonwebtoken library for session tokens ✓
✓ Article 2 (Test-First): PASS
  - Test coverage: 85% (target: 80%) ✓
  - All acceptance criteria tested ✓
✓ Article 3 (Security-First): PASS
  - No hardcoded secrets ✓
  - Password hashing implemented ✓
  - Session expiry configured ✓
✓ Article 4 (Documentation-First): PASS
  - Spec exists: specs/user-authentication.md ✓
  - Code comments present ✓
✓ Article 5 (Simplicity-First): PASS
  - No over-engineering detected ✓
✓ Article 6-9: PASS

✓ Phase -1 Gate: PASSED
✓ Change approved for merge
```

**Verification**:
```typescript
const gate = new PhaseGateValidator('/project/root');
const result = await gate.validate('changes/2025-11-16-implement-user-authentication/');
expect(result.passed).toBe(true);
expect(result.violations).toEqual([]);
```

---

#### Step 6: Archive Completed Change (Stage 7: Deployment)

**Command**:
```bash
musuhi change archive "implement-user-authentication"
```

**Expected Output**:
```
✓ Archiving change: implement-user-authentication
✓ Merging delta to specs/
  - Updated specs/user-authentication.md (added implementation details)
✓ Moving change to archive/
  - Moved: changes/2025-11-16-implement-user-authentication/ → archive/2025-11-16-implement-user-authentication/
✓ Change archived successfully!
```

**Verification**:
```typescript
expect(fs.existsSync('archive/2025-11-16-implement-user-authentication/')).toBe(true);
expect(fs.existsSync('changes/2025-11-16-implement-user-authentication/')).toBe(false);
```

---

#### Step 7: Verify All 8 Stages Executed (Stage 8: Monitoring)

**Command**:
```bash
musuhi workflow status
```

**Expected Output**:
```
Workflow Status for test-ecommerce-app

✓ Stage 1 (Research): COMPLETED
  - Project initialized
  - Steering files generated

✓ Stage 2 (Requirements): COMPLETED
  - Spec created: specs/user-authentication.md
  - Requirements validated (3 ACs)

✓ Stage 3 (Design): COMPLETED
  - Change proposal created
  - Architecture designed by System Architect

✓ Stage 4 (Tasks): COMPLETED
  - Task plan generated
  - P-wave labels assigned (P0/P1/P2)

✓ Stage 5 (Implementation): COMPLETED
  - Code implemented by Software Developer
  - 3 files created, 2 files modified

✓ Stage 6 (Testing): COMPLETED
  - Tests generated by Test Engineer
  - Test coverage: 85%

✓ Stage 7 (Deployment): COMPLETED
  - Change archived to archive/2025-11-16-implement-user-authentication/

✓ Stage 8 (Monitoring): IN PROGRESS
  - Workflow state logged
  - No errors detected
```

**Verification**:
```typescript
const workflow = new WorkflowEngine('/project/root');
const status = await workflow.getStatus();
expect(status.currentStage).toBe(8); // Monitoring
expect(status.completedStages).toEqual([1, 2, 3, 4, 5, 6, 7]);
```

---

### Acceptance Criteria

- ✅ All 8 stages complete without errors
- ✅ Constitutional compliance validated (Phase -1 Gate passes)
- ✅ Traceability maintained (requirement → code → test)
- ✅ Execution time <5 minutes

### Expected Results Summary

| Stage | Status | Artifacts |
|-------|--------|-----------|
| 1. Research | ✅ Complete | steering/*.md, .musuhi/config.yaml |
| 2. Requirements | ✅ Complete | specs/user-authentication.md |
| 3. Design | ✅ Complete | changes/*/proposal.md, delta.md |
| 4. Tasks | ✅ Complete | Task plan with P-wave labels |
| 5. Implementation | ✅ Complete | src/auth/*.ts, tests/auth/*.test.ts |
| 6. Testing | ✅ Complete | Test results (85% coverage) |
| 7. Deployment | ✅ Complete | archive/2025-11-16-*/ |
| 8. Monitoring | ✅ Complete | Workflow logs |

---

## TEST-E2E-002: Multi-Agent Orchestration Patterns

### Test Metadata

- **Test ID**: TEST-E2E-002
- **Feature Coverage**: Feature 3 (Multi-Agent Orchestration)
- **Priority**: P0
- **Estimated Execution Time**: 3 minutes
- **Automation**: Full (Vitest)

### Objective

Validate all 4 primary orchestration patterns (Sequential, Group, Nested, Swarm) execute correctly.

### Test Scenarios

#### Scenario 1: Sequential Chat (A → B → C)

**Workflow**: Requirements Analyst → System Architect → Software Developer

**Test Code**:
```typescript
import { Orchestrator } from '@musuhi/multi-agent-orchestrator';

test('Sequential Chat: Requirements → Design → Implementation', async () => {
  const orchestrator = new Orchestrator('/project/root');

  const result = await orchestrator.execute({
    pattern: 'sequential',
    agents: ['requirements-analyst', 'system-architect', 'software-developer'],
    input: {
      spec: 'specs/user-authentication.md',
    },
  });

  // Verify handoff chain
  expect(result.steps.length).toBe(3);
  expect(result.steps[0].agent).toBe('requirements-analyst');
  expect(result.steps[1].agent).toBe('system-architect');
  expect(result.steps[2].agent).toBe('software-developer');

  // Verify artifacts passed between agents
  expect(result.steps[1].input).toContain(result.steps[0].output); // Design receives requirements
  expect(result.steps[2].input).toContain(result.steps[1].output); // Implementation receives design
});
```

**Expected Results**:
- Agent A completes requirements analysis
- Agent B receives requirements and generates design
- Agent C receives design and generates code
- Artifacts passed correctly between agents

---

#### Scenario 2: Group Chat (Manager Selects Speaker)

**Workflow**: Orchestrator manages Code Reviewer, Security Auditor, Performance Optimizer

**Test Code**:
```typescript
test('Group Chat: Multi-agent code review', async () => {
  const orchestrator = new Orchestrator('/project/root');

  const result = await orchestrator.execute({
    pattern: 'group',
    agents: ['code-reviewer', 'security-auditor', 'performance-optimizer'],
    manager: 'orchestrator',
    input: {
      code: 'src/auth/auth-service.ts',
    },
  });

  // Verify all agents contributed
  const speakers = result.steps.map((step) => step.agent);
  expect(speakers).toContain('code-reviewer');
  expect(speakers).toContain('security-auditor');
  expect(speakers).toContain('performance-optimizer');

  // Verify orchestrator selected speakers
  expect(result.managerDecisions.length).toBeGreaterThan(0);
  expect(result.managerDecisions[0].nextSpeaker).toBeDefined();
});
```

**Expected Results**:
- Orchestrator selects next speaker based on context
- All agents contribute to code review
- Final decision aggregates all agent feedback

---

#### Scenario 3: Nested Chat (Sub-Agents)

**Workflow**: System Architect spawns API Designer and Database Schema Designer

**Test Code**:
```typescript
test('Nested Chat: System Architect delegates to sub-agents', async () => {
  const orchestrator = new Orchestrator('/project/root');

  const result = await orchestrator.execute({
    pattern: 'nested',
    agent: 'system-architect',
    input: {
      spec: 'specs/user-authentication.md',
    },
  });

  // Verify parent agent spawned sub-agents
  expect(result.nestedCalls.length).toBeGreaterThan(0);
  expect(result.nestedCalls[0].agent).toBe('api-designer');
  expect(result.nestedCalls[1].agent).toBe('database-schema-designer');

  // Verify sub-agent results returned to parent
  expect(result.output).toContain(result.nestedCalls[0].output); // API design
  expect(result.output).toContain(result.nestedCalls[1].output); // DB schema
});
```

**Expected Results**:
- Parent agent (System Architect) delegates to sub-agents
- Sub-agents complete their tasks
- Results returned to parent agent
- Parent agent aggregates results

---

#### Scenario 4: Swarm Pattern (Parallel Execution)

**Workflow**: Test Engineer spawns 5 parallel test writers

**Test Code**:
```typescript
test('Swarm Pattern: Parallel test generation', async () => {
  const orchestrator = new Orchestrator('/project/root');

  const result = await orchestrator.execute({
    pattern: 'swarm',
    agent: 'test-engineer',
    parallelTasks: 5,
    input: {
      code: 'src/auth/auth-service.ts',
    },
  });

  // Verify parallel execution
  expect(result.parallelExecutions.length).toBe(5);

  // Verify all tasks completed
  const completed = result.parallelExecutions.filter((task) => task.status === 'completed');
  expect(completed.length).toBe(5);

  // Verify results aggregated
  expect(result.output.tests.length).toBe(5);
});
```

**Expected Results**:
- All 5 test writers execute in parallel
- Results aggregated by Test Engineer
- No race conditions or conflicts

---

### Acceptance Criteria

- ✅ All 4 patterns execute successfully
- ✅ Agent communication logged
- ✅ No errors or timeouts
- ✅ Artifacts passed correctly between agents

---

## TEST-E2E-003: Parallel Task Execution

### Test Metadata

- **Test ID**: TEST-E2E-003
- **Feature Coverage**: Feature 4 (Parallel Execution)
- **Priority**: P0
- **Estimated Execution Time**: 2 minutes
- **Automation**: Full (Vitest)

### Objective

Validate that parallel task execution achieves 50%+ time savings versus sequential execution.

### Test Data

**Task Plan**: `tasks.md` (30 tasks)

```markdown
# Implementation Tasks

## Database Setup
- [ ] T1: Setup PostgreSQL database (P0)
- [ ] T2: Create user table schema (P1, depends on T1)
- [ ] T3: Create session table schema (P1, depends on T1)

## Authentication Service
- [ ] T4: Implement AuthService (P1, depends on T1)
- [ ] T5: Implement password hashing (P2, depends on T4)
- [ ] T6: Implement JWT token generation (P2, depends on T4)

## Session Management
- [ ] T7: Implement SessionManager (P1, depends on T1)
- [ ] T8: Implement session creation (P2, depends on T7)
- [ ] T9: Implement session validation (P2, depends on T7)

## API Endpoints
- [ ] T10: POST /auth/login endpoint (P2, depends on T4, T7)
- [ ] T11: POST /auth/logout endpoint (P2, depends on T7)
- [ ] T12: GET /auth/session endpoint (P2, depends on T7)

... (18 more tasks)
```

### Test Steps

#### Step 1: Create Task Plan with Dependencies

**Verification**:
```typescript
const tasks = await loadTasksFromFile('tasks.md');
expect(tasks.length).toBe(30);
```

---

#### Step 2: Label P-Waves

**Command**:
```bash
musuhi tasks label-pwaves tasks.md
```

**Expected Output**:
```
✓ Analyzing task dependencies...
✓ Building dependency graph (DAG)
✓ Detecting circular dependencies... None found
✓ Assigning P-wave labels...

Wave P0 (no dependencies): 1 task
  - T1: Setup PostgreSQL database

Wave P1 (depends on P0): 9 tasks
  - T2: Create user table schema
  - T3: Create session table schema
  - T4: Implement AuthService
  - T7: Implement SessionManager
  ... (5 more)

Wave P2 (depends on P1): 14 tasks
  - T5: Implement password hashing
  - T6: Implement JWT token generation
  - T8: Implement session creation
  ... (11 more)

Wave P3 (depends on P2): 6 tasks
  - T28: Integration tests
  - T29: E2E tests
  ... (4 more)

✓ P-wave labels assigned successfully!
```

**Verification**:
```typescript
const labeler = new PWaveLabeler();
const result = await labeler.label('tasks.md');

expect(result.waves.P0.length).toBe(1);
expect(result.waves.P1.length).toBe(9);
expect(result.waves.P2.length).toBe(14);
expect(result.waves.P3.length).toBe(6);
```

---

#### Step 3: Execute Parallel Waves

**Command**:
```bash
musuhi tasks execute --parallel tasks.md
```

**Expected Output**:
```
✓ Executing tasks in parallel...

Wave P0 (1 task):
  ✓ T1: Setup PostgreSQL database (completed in 30s)

Wave P1 (9 tasks running in parallel):
  ✓ T2: Create user table schema (completed in 10s)
  ✓ T3: Create session table schema (completed in 10s)
  ✓ T4: Implement AuthService (completed in 45s)
  ✓ T7: Implement SessionManager (completed in 40s)
  ... (5 more tasks completed in parallel)

Wave P2 (14 tasks running in parallel):
  ✓ T5: Implement password hashing (completed in 15s)
  ✓ T6: Implement JWT token generation (completed in 20s)
  ... (12 more tasks completed in parallel)

Wave P3 (6 tasks running in parallel):
  ✓ T28: Integration tests (completed in 30s)
  ✓ T29: E2E tests (completed in 25s)
  ... (4 more tasks completed in parallel)

✓ All tasks completed!

Time Summary:
  Sequential time (estimated): 450s
  Parallel time (actual): 125s
  Time savings: 72% ✓ (exceeds 50% target)
```

**Verification**:
```typescript
const executor = new ParallelExecutor();
const result = await executor.execute('tasks.md');

expect(result.metrics.sequentialTime).toBeGreaterThan(0);
expect(result.metrics.parallelTime).toBeGreaterThan(0);
expect(result.metrics.timeSavings).toBeGreaterThanOrEqual(50); // NFR-P.2
```

---

#### Step 4: Validate Time Savings

**Expected Results**:
- Sequential time: ~450s (30 tasks × 15s average)
- Parallel time: ~125s (4 waves × ~31s average wave time)
- Time savings: 72% ✅ (exceeds 50% requirement)

---

#### Step 5: Handle Task Failures

**Test Scenario**: T4 fails during execution

**Expected Output**:
```
Wave P1 (9 tasks running in parallel):
  ✓ T2: Create user table schema (completed in 10s)
  ✓ T3: Create session table schema (completed in 10s)
  ✗ T4: Implement AuthService (FAILED)
    Error: TypeScript compilation error
  ✓ T7: Implement SessionManager (completed in 40s)
  ... (5 more tasks completed)

⚠ Wave P1: 1 task failed (T4)

Wave P2: BLOCKED (depends on T4)
  ⏸ T5: Implement password hashing (blocked by T4)
  ⏸ T6: Implement JWT token generation (blocked by T4)
  ✓ T8: Implement session creation (completed - no dependency on T4)
  ... (11 more tasks)

✗ Execution failed with 1 error

Failure Report:
- Failed tasks: T4
- Blocked tasks: T5, T6, T10 (depend on T4)
- Unblocked tasks: T8, T9, T11, T12 (no dependency on T4)

Recovery Options:
1. Fix T4 and re-run failed wave (P1)
2. Skip T4 and dependent tasks (T5, T6, T10)
3. Rollback all changes
```

**Verification**:
```typescript
const executor = new ParallelExecutor();
const result = await executor.executeWithFailure('tasks.md', 'T4');

expect(result.failedTasks).toContain('T4');
expect(result.blockedTasks).toContain('T5');
expect(result.blockedTasks).toContain('T6');
expect(result.unaffectedTasks).toContain('T8');
```

---

### Acceptance Criteria

- ✅ 50%+ time savings achieved (NFR-P.2)
- ✅ Dependency graph correctly constructed
- ✅ Task failures handled gracefully
- ✅ No race conditions or conflicts

---

## TEST-E2E-004: Gap Analysis on Real Codebase

### Test Metadata

- **Test ID**: TEST-E2E-004
- **Feature Coverage**: Feature 5 (Gap Analysis)
- **Priority**: P0
- **Estimated Execution Time**: 1 minute (for MUSUHI 2.0 itself)
- **Automation**: Full (Vitest)

### Objective

Validate gap analysis on MUSUHI 2.0 codebase (brownfield analysis).

### Test Data

- **Codebase**: MUSUHI 2.0 (`packages/`)
- **Requirements**: `docs/requirements/requirements.md`
- **Size**: ~40,000 LOC

### Test Steps

#### Step 1: Analyze MUSUHI 2.0 Codebase

**Command**:
```bash
musuhi gap analyze --requirements docs/requirements/requirements.md --codebase packages/
```

**Expected Output** (abbreviated):
```
✓ Loading requirements from docs/requirements/requirements.md...
✓ Found 91 requirements (72 functional + 19 non-functional)

✓ Analyzing codebase at packages/...
✓ Detected 40,123 lines of code
✓ Parsing TypeScript files (11 packages)

✓ Running gap detection (5 strategies)...
  ✓ Missing features: 2 found
  ✓ Undocumented features: 3 found
  ✓ Conflicts: 1 found
  ✓ Breaking changes: 0 found
  ✓ Pattern violations: 0 found

✓ Generating recommendations...
✓ Gap report generated: gap-report.md

Analysis completed in 28.5s (target: <60s for 100K LOC) ✓
```

**Verification**:
```typescript
const analyzer = new GapAnalyzer('docs/requirements/requirements.md', 'packages/');
const startTime = performance.now();
const report = await analyzer.analyze();
const endTime = performance.now();
const analysisTime = (endTime - startTime) / 1000;

expect(analysisTime).toBeLessThan(60); // NFR-P.3
expect(report.gaps.length).toBeGreaterThan(0);
```

---

#### Step 2: Review Missing Features

**Gap Report**: `gap-report.md` (excerpt)

```markdown
# Gap Analysis Report

Generated: 2025-11-16
Requirements: docs/requirements/requirements.md
Codebase: packages/
Lines of Code: 40,123
Analysis Time: 28.5s

## Summary

- **Total Requirements**: 91
- **Implemented**: 89 (97.8%)
- **Missing**: 2 (2.2%)
- **Undocumented Features**: 3
- **Conflicts**: 1

---

## Missing Features (2)

### GAP-001: AC-6.5 - Export Dashboard to PDF
**Severity**: Medium
**Requirement**: "The system SHALL export dashboard view to PDF format"
**Status**: Not implemented
**Recommendation**: Implement PDF export using puppeteer or jsPDF

**Files to Create**:
- `packages/dashboard/src/exporters/pdf-exporter.ts`
- `packages/dashboard/__tests__/pdf-exporter.test.ts`

**Estimated Effort**: 1 day

---

### GAP-002: AC-8.10 - Platform Auto-Detection Enhancement
**Severity**: Low
**Requirement**: "The system SHALL auto-detect platform from environment variables"
**Status**: Partially implemented (only detects Claude Code and Cursor)
**Recommendation**: Extend AdapterFactory to detect all 8 platforms

**Files to Modify**:
- `packages/platform-adapters/src/adapter-factory.ts`

**Estimated Effort**: 2 hours
```

**Verification**:
```typescript
const report = await parseGapReport('gap-report.md');
expect(report.summary.missingFeatures).toBe(2);
expect(report.gaps[0].id).toBe('GAP-001');
expect(report.gaps[0].severity).toBe('Medium');
```

---

#### Step 3: Review Undocumented Features

**Gap Report** (excerpt):

```markdown
## Undocumented Features (3)

### GAP-003: EventBus Implementation
**Severity**: Low
**Code**: `packages/dashboard/src/event-bus.ts`
**Status**: Implemented but not in requirements
**Recommendation**: Add requirement AC-6.X for event-driven dashboard updates

**Action**: Document this feature in specs/ or deprecate if not needed

---

### GAP-004: CircularDependencyDetector
**Severity**: Low
**Code**: `packages/parallel-executor/src/circular-dependency-detector.ts`
**Status**: Implemented but not explicitly required
**Recommendation**: Add requirement AC-4.X for circular dependency detection

---

### GAP-005: TimeMetricsCollector
**Severity**: Low
**Code**: `packages/parallel-executor/src/time-metrics-collector.ts`
**Status**: Implemented but not explicitly required
**Recommendation**: Add requirement AC-4.X for time metrics collection
```

**Verification**:
```typescript
expect(report.summary.undocumentedFeatures).toBe(3);
expect(report.gaps.find(g => g.id === 'GAP-003').code).toContain('event-bus.ts');
```

---

#### Step 4: Review Conflicts

**Gap Report** (excerpt):

```markdown
## Conflicts (1)

### GAP-006: Platform Adapter Test Strategy
**Severity**: Low
**Requirement**: AC-8.6 - "All platform adapters SHALL be tested in mock mode"
**Code**: `packages/platform-adapters/__tests__/*Adapter.test.ts`
**Conflict**: Tests expect mock mode but real CLI is detected in test environment
**Recommendation**: Modify tests to handle both mock and real CLI environments

**Resolution Strategy**: Update tests to detect environment and skip real CLI tests if unavailable
```

**Verification**:
```typescript
expect(report.summary.conflicts).toBe(1);
expect(report.gaps.find(g => g.id === 'GAP-006').severity).toBe('Low');
```

---

### Acceptance Criteria

- ✅ Analysis completes in <60s for 40K LOC (NFR-P.3)
- ✅ All 5 gap types detected correctly
- ✅ Gap report generated with recommendations
- ✅ Coverage metrics accurate (97.8% implemented)

---

## Additional Scenarios

(Due to length constraints, I'm providing abbreviated versions of the remaining scenarios. Full details available upon request.)

---

## TEST-E2E-005: Platform Switching

**Objective**: Validate seamless platform migration (Claude Code → Cursor)

**Key Steps**:
1. Initialize on Claude Code
2. Create specs and changes
3. Switch platform: `musuhi config set platform cursor`
4. Verify context preserved
5. Execute agent on new platform

**Acceptance Criteria**:
- ✅ Platform switch completes without errors
- ✅ Steering files, specs, changes preserved
- ✅ Agents work on both platforms

---

## TEST-E2E-006: Iterative Verification Workflow

**Objective**: Validate Continue/Revise/Rollback user actions

**Key Steps**:
1. Enable iterative mode
2. Execute multi-task workflow
3. Test Continue (proceed to next task)
4. Test Revise (provide revision instructions)
5. Test Rollback (revert failed task)
6. Resume from checkpoint

**Acceptance Criteria**:
- ✅ All 3 user actions work correctly
- ✅ Checkpoints save and load successfully
- ✅ tasks.md checkboxes update automatically

---

## TEST-E2E-007: Dashboard Real-Time Updates

**Objective**: Validate dashboard updates in real-time (<2s refresh)

**Key Steps**:
1. Launch dashboard: `musuhi view`
2. Execute workflow in background
3. Verify dashboard updates without manual refresh
4. Test keyboard navigation (V/L/S/A/Q)
5. Measure refresh performance (<100ms, NFR-P.1)

**Acceptance Criteria**:
- ✅ Dashboard launches without errors
- ✅ Real-time updates work (<2s refresh)
- ✅ Keyboard navigation functional
- ✅ Performance meets NFR-P.1 (<100ms)

---

## TEST-E2E-008: Constitutional Enforcement

**Objective**: Validate Phase -1 Gate blocks constitutional violations

**Test Scenarios**:
1. Violate Article 1 (Library-First) - Propose custom logger
2. Violate Article 2 (Test-First) - Skip tests
3. Violate Article 5 (Simplicity-First) - Over-engineer solution
4. Valid requirement - Pass all Articles

**Acceptance Criteria**:
- ✅ Phase -1 Gate blocks violations
- ✅ No bypass possible
- ✅ Violation reports provide actionable recommendations
- ✅ Valid requirements pass all checks

---

## Test Execution Summary

**Total E2E Scenarios**: 8
**Estimated Total Execution Time**: 19 minutes
**Automation Level**: 100% (all scenarios automated with Vitest)

**Exit Criteria**:
- ✅ All 8 E2E scenarios pass without errors
- ✅ All acceptance criteria met
- ✅ No critical bugs found

---

**Document Metadata**:
- **Version**: 1.0
- **Last Updated**: 2025-11-16
- **Status**: Draft - Pending Implementation
- **Next Review**: After E2E test implementation (Week 1, Day 5)
