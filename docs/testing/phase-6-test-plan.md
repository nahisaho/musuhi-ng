# Phase 6 Testing Plan - MUSUHI 2.0

## Document Information

- **Version**: 1.0
- **Date**: 2025-11-16
- **Status**: Draft
- **Author**: Quality Assurance Agent
- **Phase**: Phase 6 (Testing)

## Executive Summary

This document defines the comprehensive testing strategy for MUSUHI 2.0 Phase 6. With Phase 5 (Implementation) complete, delivering all 8 features with 679/683 tests passing (99.4% success rate), Phase 6 focuses on:

1. **Fixing 7 remaining test failures** (0.6% of total tests)
2. **Expanding E2E test coverage** with 8 comprehensive workflow scenarios
3. **Validating 4 non-functional requirements** (NFR-P.1 through NFR-P.4)
4. **Performing security testing** (OWASP Top 10, constitutional compliance)
5. **Executing integration testing** across all 9 packages
6. **Conducting user acceptance testing** (UAT) with real-world scenarios

**Timeline**: 4 weeks (estimated)

**Success Criteria**: 683/683 tests passing (100%), all NFRs validated, UAT scenarios approved

---

## Table of Contents

1. [Current Test Status](#1-current-test-status)
2. [Test Failure Resolution](#2-test-failure-resolution)
3. [E2E Test Scenarios](#3-e2e-test-scenarios)
4. [Performance Validation](#4-performance-validation)
5. [Security Testing](#5-security-testing)
6. [Integration Testing](#6-integration-testing)
7. [User Acceptance Testing](#7-user-acceptance-testing)
8. [Test Execution Plan](#8-test-execution-plan)
9. [Risk Assessment](#9-risk-assessment)
10. [Go/No-Go Criteria](#10-gono-go-criteria)

---

## 1. Current Test Status

### 1.1 Overall Metrics

**Phase 5 Complete - Final Test Results**:

- **Total Tests**: 683 tests
- **Passing Tests**: 679 tests (99.4%)
- **Failing Tests**: 7 tests (0.6%)
- **Test Coverage**: 80%+ (target met)
- **Build Status**: ✅ All packages compile successfully

### 1.2 Package-Level Test Results

| Package | Tests Passing | Tests Failing | Pass Rate | Status |
|---------|--------------|---------------|-----------|--------|
| @musuhi/core | All | 0 | 100% | ✅ Complete |
| @musuhi/cli | All | 0 | 100% | ✅ Complete |
| @musuhi/constitutional-governance | 200+ | 0 | 100% | ✅ Complete |
| @musuhi/change-workflow | 150+ | 0 | 100% | ✅ Complete |
| @musuhi/multi-agent-orchestrator | 217 | 0 | 100% | ✅ Complete |
| @musuhi/parallel-executor | 32 | 0 | 100% | ✅ Complete |
| @musuhi/gap-analyzer | 82 | 3 | 96.5% | ⚠️ Minor issues |
| @musuhi/dashboard | 60 | 0 | 100% | ✅ Complete |
| @musuhi/iterative-verification | 58 | 0 | 100% | ✅ Complete |
| @musuhi/platform-adapters | 27 | 4 | 87% | ⚠️ Environmental |
| **TOTAL** | **679** | **7** | **99.4%** | **99.4% Pass** |

### 1.3 Failing Tests Analysis

#### Group 1: Gap Analyzer - ConflictDetector (3 tests, Low Severity)

**Package**: `@musuhi/gap-analyzer`
**Component**: `ConflictDetector`
**Pass Rate**: 96.5% (82/85 tests)

**Failing Tests**:
1. `ConflictDetector.test.ts:45` - Pattern conflict detection accuracy
2. `ConflictDetector.test.ts:67` - Multiple conflict aggregation
3. `ConflictDetector.test.ts:89` - Conflict severity calculation

**Root Cause**: Detection logic needs refinement for edge cases

**Severity**: Low (functional, but needs accuracy improvements)

**Impact**: Does not block basic gap analysis functionality

**Priority**: P1 (fix in Week 1)

#### Group 2: Platform Adapters - CLI Detection (4 tests, Environmental Issue)

**Package**: `@musuhi/platform-adapters`
**Component**: CLI detection tests
**Pass Rate**: 87% (27/31 tests)

**Failing Tests**:
1. `ClaudeCodeAdapter.test.ts:120` - Mock mode expected, real CLI detected
2. `CodexCLIAdapter.test.ts:85` - Mock mode expected, real CLI detected
3. `GeminiCLIAdapter.test.ts:92` - Mock mode expected, real CLI detected
4. `QwenCodeAdapter.test.ts:78` - Mock mode expected, real CLI detected

**Root Cause**: Tests expect mock mode but real CLI tools are installed in test environment

**Severity**: Low (environmental issue, not code bug)

**Impact**: Does not affect production functionality

**Priority**: P1 (fix in Week 1)

---

## 2. Test Failure Resolution

### 2.1 Resolution Strategy

**Objective**: Achieve 683/683 tests passing (100% pass rate)

**Timeline**: Week 1 of Phase 6

**Approach**:
1. Analyze root causes
2. Fix detection logic or adjust test expectations
3. Validate with additional test cases
4. Re-run full test suite

### 2.2 TEST-FIX-001: Gap Analyzer ConflictDetector

**Test ID**: TEST-FIX-001
**Priority**: P1
**Assignee**: Test Engineer + Software Developer
**Estimated Effort**: 2 days

#### 2.2.1 Failing Test Details

**Test Case**: `ConflictDetector detects pattern conflicts`

**Current Behavior**:
- Test expects 2 conflicts detected
- Actual: 1 conflict detected

**Expected Behavior**:
- Detect conflicts when requirements contradict existing code patterns
- Example: Requirement "System SHALL use REST API" conflicts with existing GraphQL implementation

#### 2.2.2 Root Cause Analysis

**Investigation Steps**:
1. Read test file: `packages/gap-analyzer/__tests__/conflict-detector.test.ts`
2. Analyze ConflictDetector logic: `packages/gap-analyzer/src/detectors/conflict-detector.ts`
3. Identify edge cases not covered by current logic
4. Review steering/structure.md pattern definitions

**Suspected Issues**:
- Pattern matching logic too strict (misses partial conflicts)
- Severity calculation incorrect for edge cases
- Multiple conflict aggregation logic flawed

#### 2.2.3 Fix Plan

**Option 1: Improve Detection Logic** (Recommended)
- Refine pattern matching to detect partial conflicts
- Improve severity calculation algorithm
- Add conflict deduplication logic

**Option 2: Adjust Test Expectations**
- Document current detection limitations
- Update test expectations to match current capability
- Add TODO comments for future improvements

**Acceptance Criteria**:
- All 85 gap-analyzer tests pass (100%)
- No regression in other tests
- Code coverage maintained at 80%+

#### 2.2.4 Test Cases to Add

**New Test Cases** (ensure no future regressions):
1. `TEST-FIX-001-1`: Single pattern conflict
2. `TEST-FIX-001-2`: Multiple overlapping conflicts
3. `TEST-FIX-001-3`: Conflict with low severity
4. `TEST-FIX-001-4`: Conflict with high severity
5. `TEST-FIX-001-5`: No conflicts (negative test)

### 2.3 TEST-FIX-002: Platform Adapters CLI Detection

**Test ID**: TEST-FIX-002
**Priority**: P1
**Assignee**: Test Engineer
**Estimated Effort**: 1 day

#### 2.3.1 Failing Test Details

**Test Case**: `ClaudeCodeAdapter uses mock mode in tests`

**Current Behavior**:
- Test expects mock mode (no real CLI invocation)
- Actual: Real `claude` CLI detected and invoked

**Expected Behavior**:
- Tests should run in mock mode regardless of CLI presence
- Mock mode prevents accidental API calls during testing

#### 2.3.2 Root Cause Analysis

**Investigation Steps**:
1. Read test files: `packages/platform-adapters/__tests__/*Adapter.test.ts`
2. Check CLI detection logic in each adapter
3. Verify mock setup in test configuration
4. Check environment variable overrides

**Suspected Issues**:
- Tests don't explicitly set mock mode
- CLI detection logic runs before mock setup
- Missing environment variable to force mock mode

#### 2.3.3 Fix Plan

**Option 1: Modify Tests to Handle Real CLI** (Recommended)
- Add environment detection logic to tests
- If real CLI present, skip tests or use real CLI gracefully
- Separate "mock tests" vs "real CLI tests"

**Option 2: Force Mock Mode**
- Set environment variable `MUSUHI_FORCE_MOCK=true` in test config
- Update adapters to respect this flag
- Ensure mock setup runs before CLI detection

**Acceptance Criteria**:
- All 31 platform-adapters tests pass (100%)
- Tests work in both mock and real CLI environments
- No accidental API calls during test runs

#### 2.3.4 Test Cases to Update

**Updated Test Cases**:
1. `ClaudeCodeAdapter.test.ts:120` - Add environment detection
2. `CodexCLIAdapter.test.ts:85` - Add environment detection
3. `GeminiCLIAdapter.test.ts:92` - Add environment detection
4. `QwenCodeAdapter.test.ts:78` - Add environment detection

**New Test Cases** (real CLI integration):
5. `TEST-FIX-002-1`: Real CLI invocation (if available)
6. `TEST-FIX-002-2`: Mock CLI invocation (forced)
7. `TEST-FIX-002-3`: CLI not found error handling

### 2.4 Success Metrics

**Target**: 683/683 tests passing (100% pass rate)

**Validation**:
```bash
pnpm test                 # Run all tests
pnpm test:coverage        # Verify 80%+ coverage maintained
pnpm build                # Ensure TypeScript compiles
```

**Exit Criteria for TEST-FIX Phase**:
- ✅ All 7 failing tests fixed
- ✅ No new test failures introduced
- ✅ Code coverage ≥80%
- ✅ TypeScript strict mode passing
- ✅ ESLint passing (0 errors)

---

## 3. E2E Test Scenarios

### 3.1 E2E Testing Objectives

**Goal**: Validate complete workflows from end-to-end

**Scope**: 8 comprehensive scenarios covering all 8 features

**Test Framework**: Vitest (E2E test suite)

**Test Location**: `tests/e2e/`

### 3.2 TEST-E2E-001: Complete SDD Workflow (8 Stages)

**Test ID**: TEST-E2E-001
**Feature Coverage**: All 8 features (Constitutional Governance, Change Workflow, Multi-Agent, Parallel Execution, Gap Analysis, Dashboard, Iterative Verification, Multi-Platform)
**Priority**: P0
**Estimated Execution Time**: 5 minutes

#### Test Steps

**Step 1: Initialize New Project**
```bash
musuhi init
```

**Expected Results**:
- `steering/` directory created
- `steering/structure.md`, `steering/tech.md`, `steering/product.md`, `steering/constitution.md` created
- `.musuhi/config.yaml` created
- `specs/` and `changes/` directories created

**Step 2: Create Requirement Spec**
```bash
# Manually create specs/user-authentication.md
```

**Expected Results**:
- Spec file uses EARS format (validated by EARS parser)
- Acceptance criteria clearly defined (AC-X.Y format)
- Traceability section present

**Step 3: Propose Change**
```bash
musuhi change init "add-login-feature"
```

**Expected Results**:
- `changes/YYYY-MM-DD-add-login-feature/` directory created
- `proposal.md` generated with metadata
- `delta.md` created (initially empty)

**Step 4: Execute Change with Agents**
```bash
musuhi change execute "add-login-feature"
```

**Expected Results**:
- Multi-agent orchestration invoked (Requirements Analyst → System Architect → Software Developer)
- Tasks executed in P-wave order (P0 → P1 → P2)
- Code generated in `src/` directory
- Tests generated in `tests/` directory

**Step 5: Validate Constitutional Compliance**
```bash
musuhi validate changes/YYYY-MM-DD-add-login-feature/
```

**Expected Results**:
- Phase -1 Gate validation runs
- All 9 Articles checked
- Report generated: `validation-report.md`
- Pass/fail status displayed

**Step 6: Archive Completed Change**
```bash
musuhi change archive "add-login-feature"
```

**Expected Results**:
- Change moved from `changes/` to `archive/`
- Specs updated in `specs/` directory
- Delta applied and finalized

**Step 7: Verify All 8 Stages Executed**

**Expected Results**:
- ✅ Stage 1 (Research): Project initialized
- ✅ Stage 2 (Requirements): Spec created in EARS format
- ✅ Stage 3 (Design): Architecture generated by System Architect
- ✅ Stage 4 (Tasks): Task plan with P-wave labels
- ✅ Stage 5 (Implementation): Code generated
- ✅ Stage 6 (Testing): Tests generated and passing
- ✅ Stage 7 (Deployment): Change archived
- ✅ Stage 8 (Monitoring): Workflow state logged

**Acceptance Criteria**:
- All 8 stages complete without errors
- Constitutional compliance validated
- Traceability maintained (requirement → code → test)

---

### 3.3 TEST-E2E-002: Multi-Agent Orchestration Patterns

**Test ID**: TEST-E2E-002
**Feature Coverage**: Feature 3 (Multi-Agent Orchestration)
**Priority**: P0
**Estimated Execution Time**: 3 minutes

#### Test Scenario 1: Sequential Chat (A → B → C)

**Workflow**: Requirements Analyst → System Architect → Software Developer

**Expected Results**:
- Agent A (Requirements Analyst) completes requirements
- Agent B (System Architect) receives requirements and generates design
- Agent C (Software Developer) receives design and generates code
- Handoff artifacts passed correctly between agents

#### Test Scenario 2: Group Chat (Manager Selects Speaker)

**Workflow**: Orchestrator manages Code Reviewer, Security Auditor, Performance Optimizer

**Expected Results**:
- Orchestrator selects next speaker based on context
- All agents contribute to code review
- Final decision aggregates all agent feedback

#### Test Scenario 3: Nested Chat (Sub-Agents)

**Workflow**: System Architect spawns API Designer and Database Schema Designer

**Expected Results**:
- Parent agent (System Architect) delegates to sub-agents
- Sub-agents complete their tasks
- Results returned to parent agent
- Parent agent aggregates results

#### Test Scenario 4: Swarm Pattern (Parallel Execution)

**Workflow**: Test Engineer spawns 5 parallel test writers

**Expected Results**:
- All 5 test writers execute in parallel
- Results aggregated by Test Engineer
- No race conditions or conflicts

**Acceptance Criteria**:
- All 4 patterns execute successfully
- Agent communication logged
- No errors or timeouts

---

### 3.4 TEST-E2E-003: Parallel Task Execution

**Test ID**: TEST-E2E-003
**Feature Coverage**: Feature 4 (Parallel Execution)
**Priority**: P0
**Estimated Execution Time**: 2 minutes

#### Test Steps

**Step 1: Create Task Plan with Dependencies**
```yaml
# tasks.md
- id: T1
  description: Setup database
  dependencies: []

- id: T2
  description: Implement user model
  dependencies: [T1]

- id: T3
  description: Implement authentication
  dependencies: [T1]

- id: T4
  description: Write tests
  dependencies: [T2, T3]
```

**Step 2: Label P-Waves**
```bash
musuhi tasks label-pwaves tasks.md
```

**Expected Results**:
- T1: P0 (no dependencies)
- T2: P1 (depends on T1)
- T3: P1 (depends on T1)
- T4: P2 (depends on T2 and T3)

**Step 3: Execute Parallel Waves**
```bash
musuhi tasks execute --parallel tasks.md
```

**Expected Results**:
- **Wave P0**: T1 executes (1 task)
- **Wave P1**: T2 and T3 execute in parallel (2 tasks)
- **Wave P2**: T4 executes after P1 completes (1 task)

**Step 4: Validate Time Savings**

**Expected Results**:
- Sequential time: T1 + T2 + T3 + T4 (4 time units)
- Parallel time: T1 + max(T2, T3) + T4 (3 time units)
- Time savings: 25% (validated)

**Step 5: Handle Task Failures**

**Test Case**: T2 fails during execution

**Expected Results**:
- T3 continues (independent task)
- T4 is blocked (depends on T2)
- Failure report generated with recovery options

**Acceptance Criteria**:
- 50%+ time savings achieved (NFR-P.2)
- Dependency graph correctly constructed
- Task failures handled gracefully

---

### 3.5 TEST-E2E-004: Gap Analysis on Real Codebase

**Test ID**: TEST-E2E-004
**Feature Coverage**: Feature 5 (Gap Analysis)
**Priority**: P0
**Estimated Execution Time**: 1 minute (for MUSUHI 2.0 itself)

#### Test Steps

**Step 1: Analyze MUSUHI 2.0 Codebase (Brownfield)**
```bash
musuhi gap analyze --requirements docs/requirements/requirements.md --codebase packages/
```

**Expected Results**:
- Gap analysis completes in <60s (NFR-P.3)
- Gap report generated: `gap-report.md`
- All 5 gap types analyzed

**Step 2: Detect Missing Features**

**Expected Results**:
- List of requirements without implementation
- Severity levels assigned (Critical/High/Medium/Low)
- Recommendations provided (e.g., "Implement AC-X.Y")

**Step 3: Detect Undocumented Features**

**Expected Results**:
- List of code not covered by requirements
- Suggestions: Add requirement or deprecate code

**Step 4: Detect Conflicts**

**Expected Results**:
- List of requirements conflicting with existing code
- Resolution strategies (e.g., "Refactor code to align with AC-X.Y")

**Step 5: Verify Gap Report Format**

**Expected Results**:
- Markdown format (primary)
- JSON format (machine-readable)
- HTML format (web view)
- Coverage metrics included (% implemented requirements)

**Acceptance Criteria**:
- Analysis completes in <60s for MUSUHI 2.0 (~40,000 LOC)
- All 5 gap types detected correctly
- Gap report generated with recommendations

---

### 3.6 TEST-E2E-005: Platform Switching (Claude Code → Cursor)

**Test ID**: TEST-E2E-005
**Feature Coverage**: Feature 8 (Multi-Platform Integration)
**Priority**: P1
**Estimated Execution Time**: 2 minutes

#### Test Steps

**Step 1: Initialize Project on Claude Code**
```bash
# Using Claude Code CLI
musuhi init
```

**Expected Results**:
- Project initialized with `.claude/` directory
- Steering files created
- `musuhi.config.yaml` created with `platform: claude-code`

**Step 2: Create Spec on Claude Code**
```bash
# Invoke @requirements-analyst agent
@requirements-analyst "Create spec for user authentication"
```

**Expected Results**:
- Spec created in `specs/user-authentication.md`
- EARS format validated
- Traceability matrix updated

**Step 3: Switch to Cursor Platform**
```bash
# Change platform in config
musuhi config set platform cursor
```

**Expected Results**:
- `.cursor/` directory created
- Agent prompts adapted for Cursor platform
- `steering/`, `specs/`, `changes/` directories preserved (platform-agnostic)

**Step 4: Execute Agent on Cursor**
```bash
# Invoke @system-architect agent on Cursor
@system-architect "Generate architecture from specs/user-authentication.md"
```

**Expected Results**:
- Architecture generated by Cursor AI
- Same steering context read (platform-agnostic)
- Output written to `changes/` directory (platform-agnostic format)

**Step 5: Verify Context Preserved**

**Expected Results**:
- Steering files unchanged
- Specs unchanged
- Changes directory intact
- No data loss during platform switch

**Acceptance Criteria**:
- Platform switch completes without errors
- Context preserved (steering, specs, changes)
- Agents work on both platforms

---

### 3.7 TEST-E2E-006: Iterative Verification Workflow

**Test ID**: TEST-E2E-006
**Feature Coverage**: Feature 7 (Iterative Verification)
**Priority**: P1
**Estimated Execution Time**: 3 minutes

#### Test Steps

**Step 1: Enable Iterative Mode**
```bash
musuhi config set verification-mode enabled
```

**Expected Results**:
- Mode persisted to `.musuhi/verification-mode.json`
- Confirmation message displayed

**Step 2: Execute Multi-Task Change**
```bash
musuhi change execute "add-login-feature" --tasks tasks.md
```

**Expected Results**:
- Task 1 executed
- Prompt displayed: "Task 1 complete. Review results. [Continue/Revise/Rollback]"

**Step 3: Test Continue Option**
```
User selects: Continue
```

**Expected Results**:
- Task 1 marked complete in `tasks.md` (checkbox updated)
- Task 2 execution begins

**Step 4: Test Revise Option**
```
Task 2 completes with warnings
User selects: Revise
Provides revision instructions: "Add error handling for null values"
```

**Expected Results**:
- Task 2 re-executed with revised instructions
- Revised code generated
- Prompt displayed again for approval

**Step 5: Test Rollback Option**
```
Task 3 completes with errors
User selects: Rollback
```

**Expected Results**:
- Task 3 changes reverted (files restored to pre-execution state)
- Task 3 marked failed in `tasks.md`
- Workflow pauses

**Step 6: Resume from Checkpoint**
```bash
# Workflow interrupted (Ctrl+C)
# Resume later
musuhi change resume "add-login-feature"
```

**Expected Results**:
- Checkpoint loaded from `.musuhi/checkpoints/add-login-feature.json`
- Workflow resumes from last completed task
- Previous task results preserved

**Acceptance Criteria**:
- All 3 user actions work (Continue, Revise, Rollback)
- Checkpoints save and load correctly
- tasks.md checkboxes update automatically

---

### 3.8 TEST-E2E-007: Dashboard Real-Time Updates

**Test ID**: TEST-E2E-007
**Feature Coverage**: Feature 6 (Interactive Dashboard)
**Priority**: P1
**Estimated Execution Time**: 2 minutes

#### Test Steps

**Step 1: Launch Dashboard**
```bash
musuhi view
```

**Expected Results**:
- TUI dashboard launches
- 6 view components rendered:
  - Workflow Status (8-stage SDD)
  - Active Changes
  - Current Specs
  - Active Agents
  - P-Wave Visualization
  - Activity Logs

**Step 2: Execute Background Workflow**
```bash
# In separate terminal
musuhi change execute "add-login-feature"
```

**Expected Results**:
- Dashboard updates in real-time (<2s refresh, NFR-P.1)
- Workflow status changes from "Requirements" to "Design" to "Implementation"
- Active agents list updates (Requirements Analyst → System Architect → Software Developer)
- P-wave visualization shows progress (P0 → P1 → P2)

**Step 3: Test Keyboard Navigation**

**Test Cases**:
- Press `V`: View main dashboard ✅
- Press `L`: List active changes ✅
- Press `S`: Show specs ✅
- Press `A`: Show agents ✅
- Press `Q`: Quit ✅

**Expected Results**:
- All shortcuts work
- View changes reflected immediately
- No lag or stuttering

**Step 4: Verify Dashboard Refresh Performance**

**Test Method**:
- Measure refresh cycle time (2 seconds expected)
- Measure execution time (<100ms expected per NFR-P.1)

**Expected Results**:
- Refresh cycle: 2.0s ± 0.1s
- Execution time: <100ms (95th percentile)

**Acceptance Criteria**:
- Dashboard launches without errors
- Real-time updates work (<2s refresh)
- Keyboard navigation functional
- Performance meets NFR-P.1 (<100ms)

---

### 3.9 TEST-E2E-008: Constitutional Enforcement

**Test ID**: TEST-E2E-008
**Feature Coverage**: Feature 1 (Constitutional Governance)
**Priority**: P0
**Estimated Execution Time**: 2 minutes

#### Test Scenario 1: Violate Article 1 (Library-First)

**Test Steps**:
```yaml
# Requirement in specs/custom-logger.md
The system SHALL implement a custom logging library
```

**Execute Phase -1 Gate**:
```bash
musuhi validate specs/custom-logger.md
```

**Expected Results**:
- Phase -1 Gate FAILS
- Violation report generated:
  - Article 1 (Library-First): VIOLATED
  - Reason: "Custom implementation proposed instead of using existing library (winston, pino, bunyan)"
  - Recommendation: "Use winston or pino instead of custom logger"
- Requirement blocked (cannot proceed to design phase)

#### Test Scenario 2: Violate Article 2 (Test-First)

**Test Steps**:
```yaml
# Change proposal without test plan
changes/YYYY-MM-DD-add-feature/delta.md
  ADDED: src/new-feature.ts
  (No tests mentioned)
```

**Execute Phase -1 Gate**:
```bash
musuhi validate changes/YYYY-MM-DD-add-feature/
```

**Expected Results**:
- Phase -1 Gate FAILS
- Violation report:
  - Article 2 (Test-First): VIOLATED
  - Reason: "No test plan provided for new feature"
  - Recommendation: "Add tests/new-feature.test.ts with 80%+ coverage"

#### Test Scenario 3: Violate Article 5 (Simplicity-First)

**Test Steps**:
```yaml
# Requirement in specs/authentication.md
The system SHALL implement OAuth 2.0 with PKCE, JWT refresh tokens,
multi-factor authentication, and biometric fallback
```

**Execute Phase -1 Gate**:
```bash
musuhi validate specs/authentication.md
```

**Expected Results**:
- Phase -1 Gate FAILS
- Violation report:
  - Article 5 (Simplicity-First): VIOLATED
  - Reason: "Over-engineering detected. Too many authentication methods for MVP"
  - Recommendation: "Start with simple email/password authentication. Add OAuth later if needed"

#### Test Scenario 4: All Articles Pass

**Test Steps**:
```yaml
# Well-designed requirement
The system SHALL use winston library for logging (Article 1)
WHEN user logs in, the system SHALL log authentication event
Tests SHALL cover 80%+ of authentication code (Article 2)
```

**Execute Phase -1 Gate**:
```bash
musuhi validate specs/authentication-simple.md
```

**Expected Results**:
- Phase -1 Gate PASSES ✅
- Validation report:
  - Article 1 (Library-First): PASS (uses winston)
  - Article 2 (Test-First): PASS (test plan included)
  - Article 5 (Simplicity-First): PASS (simple design)
  - All 9 Articles: PASS
- Requirement approved for design phase

**Acceptance Criteria**:
- Phase -1 Gate blocks violations
- No bypass possible
- Violation reports provide actionable recommendations
- Valid requirements pass all checks

---

### 3.10 E2E Test Success Metrics

**Target**: All 8 E2E scenarios pass without errors

**Exit Criteria**:
- ✅ TEST-E2E-001: Complete SDD workflow (8 stages) ✅
- ✅ TEST-E2E-002: Multi-agent orchestration (4 patterns) ✅
- ✅ TEST-E2E-003: Parallel execution (50%+ time savings) ✅
- ✅ TEST-E2E-004: Gap analysis (<60s for 40K LOC) ✅
- ✅ TEST-E2E-005: Platform switching (Claude → Cursor) ✅
- ✅ TEST-E2E-006: Iterative verification (Continue/Revise/Rollback) ✅
- ✅ TEST-E2E-007: Dashboard real-time updates (<2s refresh) ✅
- ✅ TEST-E2E-008: Constitutional enforcement (Phase -1 Gate) ✅

---

## 4. Performance Validation

### 4.1 Performance Testing Objectives

**Goal**: Validate all 4 non-functional performance requirements (NFR-P.1 through NFR-P.4)

**Test Framework**: Vitest with performance benchmarks

**Test Location**: `tests/performance/`

### 4.2 TEST-PERF-001: Dashboard Refresh Performance (NFR-P.1)

**Test ID**: TEST-PERF-001
**Requirement**: NFR-P.1 - Dashboard response time <100ms (95th percentile)
**Priority**: P0
**Estimated Execution Time**: 5 minutes

#### Test Method

**Benchmark**: 1000 dashboard refresh cycles

```typescript
// tests/performance/dashboard-refresh.test.ts
import { DashboardTUI } from '@musuhi/dashboard';
import { performance } from 'perf_hooks';

test('NFR-P.1: Dashboard refresh <100ms (95th percentile)', async () => {
  const dashboard = new DashboardTUI('/test/project');
  await dashboard.initialize();

  const latencies: number[] = [];

  for (let i = 0; i < 1000; i++) {
    const start = performance.now();
    await dashboard.refresh(); // Trigger state update
    const end = performance.now();
    latencies.push(end - start);
  }

  // Calculate p50, p95, p99
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];

  console.log(`Dashboard Refresh Performance:
    p50: ${p50.toFixed(2)}ms
    p95: ${p95.toFixed(2)}ms
    p99: ${p99.toFixed(2)}ms`);

  expect(p95).toBeLessThan(100); // NFR-P.1 requirement
});
```

**Expected Results**:
- p50: <50ms
- p95: <100ms ✅ (NFR-P.1 compliance)
- p99: <150ms

**Acceptance Criteria**:
- p95 latency <100ms
- No memory leaks during 1000 cycles
- Dashboard remains responsive throughout test

---

### 4.3 TEST-PERF-002: Parallel Execution Time Savings (NFR-P.2)

**Test ID**: TEST-PERF-002
**Requirement**: NFR-P.2 - 50%+ time savings vs sequential execution
**Priority**: P0
**Estimated Execution Time**: 10 minutes

#### Test Method

**Benchmark**: Execute 30-task plan with P0/P1/P2 labels

**Task Plan**:
- 10 P0 tasks (no dependencies, execute in parallel)
- 15 P1 tasks (depend on P0, execute in parallel)
- 5 P2 tasks (depend on P1, execute in parallel)

**Sequential Time Calculation**:
```
Sequential = 10 + 15 + 5 = 30 time units
```

**Parallel Time Calculation**:
```
Parallel = max(P0) + max(P1) + max(P2) = 1 + 1 + 1 = 3 time units
(assuming each task takes 1 time unit)
```

**Expected Time Savings**:
```
Savings = (30 - 3) / 30 = 90% time savings
```

#### Test Code

```typescript
// tests/performance/parallel-execution.test.ts
import { ParallelExecutor, Task } from '@musuhi/parallel-executor';

test('NFR-P.2: Parallel execution 50%+ time savings', async () => {
  const tasks: Task[] = generateTestTasks(30); // 10 P0, 15 P1, 5 P2

  const executor = new ParallelExecutor();

  // Measure sequential time
  const sequentialStart = performance.now();
  await executor.executeSequential(tasks);
  const sequentialEnd = performance.now();
  const sequentialTime = sequentialEnd - sequentialStart;

  // Measure parallel time
  const parallelStart = performance.now();
  const result = await executor.executeParallel(tasks);
  const parallelEnd = performance.now();
  const parallelTime = parallelEnd - parallelStart;

  // Calculate time savings
  const timeSavings = ((sequentialTime - parallelTime) / sequentialTime) * 100;

  console.log(`Parallel Execution Performance:
    Sequential: ${sequentialTime.toFixed(0)}ms
    Parallel: ${parallelTime.toFixed(0)}ms
    Time Savings: ${timeSavings.toFixed(1)}%`);

  expect(timeSavings).toBeGreaterThanOrEqual(50); // NFR-P.2 requirement
  expect(result.metrics.timeSavings).toBeGreaterThanOrEqual(50);
});
```

**Expected Results**:
- Sequential time: ~30,000ms (30 tasks × 1s each)
- Parallel time: ~3,000ms (3 waves × 1s each)
- Time savings: 90% ✅ (exceeds 50% requirement)

**Acceptance Criteria**:
- Time savings ≥50%
- All tasks complete successfully
- No race conditions or conflicts

---

### 4.4 TEST-PERF-003: Gap Analysis Performance (NFR-P.3)

**Test ID**: TEST-PERF-003
**Requirement**: NFR-P.3 - Gap analysis <60s for 100K LOC
**Priority**: P0
**Estimated Execution Time**: 2 minutes

#### Test Method

**Benchmark**: Analyze large TypeScript project (e.g., VS Code or MUSUHI 2.0)

**Test Codebase**:
- **MUSUHI 2.0**: ~40,000 LOC (implementation + tests)
- **VS Code** (optional): ~100,000 LOC (if available)

#### Test Code

```typescript
// tests/performance/gap-analysis.test.ts
import { GapAnalyzer } from '@musuhi/gap-analyzer';
import { countLinesOfCode } from './utils';

test('NFR-P.3: Gap analysis <60s for 100K LOC', async () => {
  const codebasePath = '/path/to/large/codebase'; // VS Code or similar
  const requirementsPath = 'requirements.md';

  const loc = await countLinesOfCode(codebasePath);
  console.log(`Analyzing codebase with ${loc.toLocaleString()} lines of code`);

  const analyzer = new GapAnalyzer(requirementsPath, codebasePath);

  const start = performance.now();
  const report = await analyzer.analyze();
  const end = performance.now();
  const analysisTime = (end - start) / 1000; // Convert to seconds

  console.log(`Gap Analysis Performance:
    Lines of Code: ${loc.toLocaleString()}
    Analysis Time: ${analysisTime.toFixed(1)}s
    Time per 10K LOC: ${((analysisTime / loc) * 10000).toFixed(1)}s`);

  expect(analysisTime).toBeLessThan(60); // NFR-P.3 requirement
  expect(report.gaps.length).toBeGreaterThan(0); // Sanity check
});
```

**Expected Results** (for MUSUHI 2.0 ~40K LOC):
- Analysis time: <30s (well under 60s limit)
- Time per 10K LOC: <8s
- Gaps detected: 5-10 (expected for brownfield project)

**Expected Results** (for 100K LOC project):
- Analysis time: <60s ✅ (NFR-P.3 compliance)
- Time per 10K LOC: <6s
- Gaps detected: 20-50 (typical for large project)

**Acceptance Criteria**:
- Analysis completes in <60s for 100K LOC
- All 5 gap types detected
- Gap report generated successfully

---

### 4.5 TEST-PERF-004: Agent Routing Overhead (NFR-P.4)

**Test ID**: TEST-PERF-004
**Requirement**: NFR-P.4 - Agent routing overhead <200ms
**Priority**: P0
**Estimated Execution Time**: 3 minutes

#### Test Method

**Benchmark**: 100 agent invocations via orchestrator

**Test Scenario**: Sequential Chat pattern (Requirements Analyst → System Architect → Software Developer)

#### Test Code

```typescript
// tests/performance/agent-routing.test.ts
import { Orchestrator } from '@musuhi/multi-agent-orchestrator';

test('NFR-P.4: Agent routing overhead <200ms', async () => {
  const orchestrator = new Orchestrator();

  const routingTimes: number[] = [];

  for (let i = 0; i < 100; i++) {
    const start = performance.now();

    // Route message through orchestrator (pattern selection + agent invocation)
    await orchestrator.sendMessage({
      from: 'requirements-analyst',
      to: 'system-architect',
      content: 'Generate architecture from requirements.md',
      pattern: 'sequential',
    });

    const end = performance.now();
    routingTimes.push(end - start);
  }

  const avgRoutingTime = routingTimes.reduce((a, b) => a + b) / routingTimes.length;
  const maxRoutingTime = Math.max(...routingTimes);

  console.log(`Agent Routing Performance:
    Average: ${avgRoutingTime.toFixed(2)}ms
    Max: ${maxRoutingTime.toFixed(2)}ms`);

  expect(avgRoutingTime).toBeLessThan(200); // NFR-P.4 requirement
  expect(maxRoutingTime).toBeLessThan(500); // Sanity check
});
```

**Expected Results**:
- Average routing time: <100ms
- Maximum routing time: <200ms ✅ (NFR-P.4 compliance)
- No memory leaks during 100 invocations

**Acceptance Criteria**:
- Average routing time <200ms
- No performance degradation over 100 invocations
- All agent invocations successful

---

### 4.6 Performance Testing Summary

**Target**: All 4 NFR-P requirements validated

**Exit Criteria**:
- ✅ TEST-PERF-001: Dashboard refresh <100ms (95th percentile) ✅
- ✅ TEST-PERF-002: Parallel execution 50%+ time savings ✅
- ✅ TEST-PERF-003: Gap analysis <60s for 100K LOC ✅
- ✅ TEST-PERF-004: Agent routing overhead <200ms ✅

**Regression Prevention**:
- Add performance benchmarks to CI/CD pipeline
- Fail builds if performance degrades >10%
- Track performance metrics over time

---

## 5. Security Testing

### 5.1 Security Testing Objectives

**Goal**: Ensure MUSUHI 2.0 is secure by design

**Scope**:
1. OWASP Top 10 compliance checks
2. Constitutional security (Article 7: File Permissions)
3. No secrets in config/logs
4. File system isolation

**Test Framework**: Manual testing + automated security scans

**Test Location**: `tests/security/`

### 5.2 TEST-SEC-001: OWASP Top 10 Checks

**Test ID**: TEST-SEC-001
**Priority**: P0
**Estimated Execution Time**: 2 hours (manual + automated)

#### 5.2.1 OWASP-01: Injection

**Test Scenario**: Malicious YAML/Markdown parsing

**Test Steps**:
```yaml
# Malicious YAML in config.yaml
malicious_field: !!python/object/apply:os.system ["rm -rf /"]
```

**Expected Results**:
- YAML parser rejects malicious content
- No code execution
- Error logged: "Malicious YAML detected"

**Test Code**:
```typescript
// tests/security/injection.test.ts
import { parseYAML } from '@musuhi/core';

test('OWASP-01: Prevent YAML injection', () => {
  const maliciousYAML = `
    malicious: !!python/object/apply:os.system ["echo hacked"]
  `;

  expect(() => parseYAML(maliciousYAML)).toThrow('Malicious YAML');
});
```

**Acceptance Criteria**:
- No code execution from YAML
- No SQL injection (N/A - no database)
- Markdown parsing safe (unified/remark is safe by default)

---

#### 5.2.2 OWASP-02: Broken Authentication

**Test Scenario**: N/A (MUSUHI 2.0 is local tool, no authentication)

**Status**: Not Applicable

---

#### 5.2.3 OWASP-03: Sensitive Data Exposure

**Test Scenario**: Verify no credentials in config/logs

**Test Steps**:
1. Search for API keys in `.musuhi/config.yaml`
2. Search for secrets in `.musuhi/logs/*.log`
3. Verify steering files don't contain credentials

**Expected Results**:
- No API keys in config
- No secrets in logs
- Warning if credentials detected

**Test Code**:
```typescript
// tests/security/sensitive-data.test.ts
import { scanForSecrets } from './utils';

test('OWASP-03: No secrets in config/logs', async () => {
  const configSecrets = await scanForSecrets('.musuhi/config.yaml');
  const logSecrets = await scanForSecrets('.musuhi/logs/*.log');

  expect(configSecrets).toEqual([]);
  expect(logSecrets).toEqual([]);
});
```

**Acceptance Criteria**:
- No API keys, tokens, or passwords in config files
- No secrets logged
- Users manage credentials in platform configs (not MUSUHI)

---

#### 5.2.4 OWASP-04: XML External Entities (XXE)

**Test Scenario**: N/A (MUSUHI 2.0 doesn't parse XML)

**Status**: Not Applicable

---

#### 5.2.5 OWASP-05: Broken Access Control

**Test Scenario**: Verify file permission enforcement

**Test Steps**:
1. Attempt to read file outside project directory
2. Attempt to write to read-only file (constitution.md)
3. Verify file operations are scoped to project root

**Test Code**:
```typescript
// tests/security/access-control.test.ts
import { NodeFileSystem } from '@musuhi/core';

test('OWASP-05: Prevent directory traversal', async () => {
  const fs = new NodeFileSystem('/project/root');

  // Attempt to read outside project directory
  await expect(fs.read('../../etc/passwd')).rejects.toThrow('Access denied');
});

test('OWASP-05: Enforce read-only constitution', async () => {
  const fs = new NodeFileSystem('/project/root');

  // Attempt to modify constitution.md
  await expect(fs.write('steering/constitution.md', 'hacked')).rejects.toThrow('Read-only file');
});
```

**Acceptance Criteria**:
- No file access outside project directory
- Constitution.md is read-only
- File permissions enforced

---

#### 5.2.6 OWASP-06: Security Misconfiguration

**Test Scenario**: Verify secure default configuration

**Test Steps**:
1. Check default config.yaml for insecure settings
2. Verify no debug mode enabled in production
3. Ensure error messages don't expose sensitive info

**Expected Results**:
- Debug mode disabled by default
- Error messages are user-friendly (no stack traces in production)
- Secure defaults (e.g., file permissions, logging level)

**Acceptance Criteria**:
- Default config is secure
- No sensitive info in error messages
- Debug mode opt-in only

---

#### 5.2.7 OWASP-07: Cross-Site Scripting (XSS)

**Test Scenario**: N/A (MUSUHI 2.0 has no web UI)

**Status**: Not Applicable

---

#### 5.2.8 OWASP-08: Insecure Deserialization

**Test Scenario**: Verify safe JSON/YAML deserialization

**Test Steps**:
```typescript
// Malicious JSON with prototype pollution
const maliciousJSON = '{"__proto__": {"isAdmin": true}}';
```

**Test Code**:
```typescript
// tests/security/deserialization.test.ts
import { parseJSON } from '@musuhi/core';

test('OWASP-08: Prevent prototype pollution', () => {
  const maliciousJSON = '{"__proto__": {"isAdmin": true}}';

  const obj = parseJSON(maliciousJSON);

  expect(obj.isAdmin).toBeUndefined(); // Prototype pollution prevented
});
```

**Acceptance Criteria**:
- No prototype pollution
- YAML parser safe (yaml library is safe)
- JSON parser safe (native JSON.parse is safe)

---

#### 5.2.9 OWASP-09: Using Components with Known Vulnerabilities

**Test Scenario**: Run `npm audit` to detect vulnerable dependencies

**Test Steps**:
```bash
npm audit
npm audit fix  # Auto-fix if possible
```

**Expected Results**:
- 0 critical vulnerabilities
- 0 high vulnerabilities
- <5 medium vulnerabilities (acceptable if no fix available)

**Acceptance Criteria**:
- No critical or high vulnerabilities
- All dependencies up-to-date
- Regular security audits (monthly)

---

#### 5.2.10 OWASP-10: Insufficient Logging & Monitoring

**Test Scenario**: Verify audit logging for critical actions

**Test Steps**:
1. Execute Phase -1 Gate validation
2. Modify constitution.md (should fail)
3. Check `.musuhi/logs/audit.log` for events

**Expected Results**:
- Phase -1 Gate validations logged
- Constitution modification attempts logged
- Logs contain timestamp, action, result

**Test Code**:
```typescript
// tests/security/logging.test.ts
import { readAuditLog } from './utils';

test('OWASP-10: Audit logging for Phase -1 Gates', async () => {
  await runPhaseGateValidation('specs/test.md');

  const logs = await readAuditLog();

  expect(logs).toContain('Phase -1 Gate: validation started');
  expect(logs).toContain('Phase -1 Gate: validation passed');
});
```

**Acceptance Criteria**:
- All critical actions logged
- Logs include timestamp, action, result
- No sensitive data in logs

---

### 5.3 TEST-SEC-002: Constitutional Security (Article 7)

**Test ID**: TEST-SEC-002
**Requirement**: Article 7 - File Permissions (Prevent constitution override)
**Priority**: P0
**Estimated Execution Time**: 30 minutes

#### Test Scenario 1: Programmatic Modification of Constitution

**Test Steps**:
```typescript
// Attempt to modify constitution.md via code
import { NodeFileSystem } from '@musuhi/core';

const fs = new NodeFileSystem('/project/root');
await fs.write('steering/constitution.md', 'HACKED');
```

**Expected Results**:
- Write operation FAILS
- Error: "Constitution.md is read-only"
- File permissions prevent modification

**Test Code**:
```typescript
// tests/security/constitutional-security.test.ts
import { NodeFileSystem } from '@musuhi/core';

test('Article 7: Prevent programmatic constitution modification', async () => {
  const fs = new NodeFileSystem('/project/root');

  await expect(fs.write('steering/constitution.md', 'hacked')).rejects.toThrow('Read-only');
});
```

#### Test Scenario 2: Attempt to Bypass Phase -1 Gate

**Test Steps**:
```typescript
// Attempt to skip Phase -1 Gate validation
import { ChangeWorkflowManager } from '@musuhi/change-workflow';

const manager = new ChangeWorkflowManager('/project/root');
await manager.mergeChange('my-change', { skipValidation: true }); // Should fail
```

**Expected Results**:
- Merge operation FAILS
- Error: "Phase -1 Gate validation is mandatory"
- No bypass possible

**Acceptance Criteria**:
- Constitution.md cannot be modified programmatically
- Phase -1 Gate cannot be bypassed
- File permissions enforced (chmod 444)

---

### 5.4 Security Testing Summary

**Target**: No critical/high security vulnerabilities

**Exit Criteria**:
- ✅ OWASP Top 10 checks pass (applicable items)
- ✅ Constitutional security validated (Article 7)
- ✅ npm audit shows 0 critical/high vulnerabilities
- ✅ No secrets in config/logs
- ✅ File system isolation enforced

---

## 6. Integration Testing

### 6.1 Integration Testing Objectives

**Goal**: Validate interactions between packages

**Scope**: Cross-package workflows

**Test Framework**: Vitest (integration test suite)

**Test Location**: `tests/integration/`

### 6.2 TEST-INT-001: Constitutional Governance → Change Workflow

**Test ID**: TEST-INT-001
**Integration**: Feature 1 (Constitutional Governance) + Feature 2 (Change Workflow)
**Priority**: P0
**Estimated Execution Time**: 2 minutes

#### Test Scenario

**Workflow**: Phase -1 Gate validates change proposal before merge

**Test Steps**:

1. Create change proposal: `changes/YYYY-MM-DD-add-feature/proposal.md`
2. Add delta: `changes/YYYY-MM-DD-add-feature/delta.md` (ADDED/MODIFIED/REMOVED)
3. Execute Phase -1 Gate: `musuhi validate changes/YYYY-MM-DD-add-feature/`
4. If validation passes, merge change: `musuhi change merge add-feature`
5. If validation fails, reject change: `musuhi change reject add-feature`

**Expected Results**:
- Phase -1 Gate runs before merge
- Invalid changes blocked
- Valid changes merged successfully

**Test Code**:
```typescript
// tests/integration/constitutional-change-workflow.test.ts
import { PhaseGateValidator } from '@musuhi/constitutional-governance';
import { ChangeWorkflowManager } from '@musuhi/change-workflow';

test('INT-001: Phase -1 Gate blocks invalid changes', async () => {
  const gate = new PhaseGateValidator('/project/root');
  const manager = new ChangeWorkflowManager('/project/root');

  // Create invalid change (violates Article 1: Library-First)
  await manager.createChange('add-custom-logger', {
    proposal: 'Implement custom logging library',
  });

  // Validate (should fail)
  const result = await gate.validate('changes/add-custom-logger/');
  expect(result.passed).toBe(false);
  expect(result.violations).toContain('Article 1: Library-First');

  // Attempt merge (should fail)
  await expect(manager.mergeChange('add-custom-logger')).rejects.toThrow('Phase -1 Gate failed');
});
```

**Acceptance Criteria**:
- Phase -1 Gate integration works
- Invalid changes cannot be merged
- Error messages are actionable

---

### 6.3 TEST-INT-002: Multi-Agent Orchestrator → Platform Adapters

**Test ID**: TEST-INT-002
**Integration**: Feature 3 (Multi-Agent Orchestrator) + Feature 8 (Platform Adapters)
**Priority**: P0
**Estimated Execution Time**: 3 minutes

#### Test Scenario

**Workflow**: Orchestrator invokes agents via platform adapters

**Test Steps**:

1. Configure platform: `musuhi config set platform claude-code`
2. Invoke agent via orchestrator: `@requirements-analyst "Create spec for login"`
3. Verify platform adapter is used (ClaudeCodeAdapter)
4. Switch platform: `musuhi config set platform cursor`
5. Invoke agent again: `@system-architect "Generate architecture"`
6. Verify platform adapter switched (CursorAdapter)

**Expected Results**:
- Orchestrator uses correct platform adapter
- Agent invocations work on both platforms
- Context (steering files) is platform-agnostic

**Test Code**:
```typescript
// tests/integration/orchestrator-platform-adapter.test.ts
import { Orchestrator } from '@musuhi/multi-agent-orchestrator';
import { AdapterFactory } from '@musuhi/platform-adapters';

test('INT-002: Orchestrator uses correct platform adapter', async () => {
  const orchestrator = new Orchestrator('/project/root');

  // Set platform to Claude Code
  process.env.MUSUHI_PLATFORM = 'claude-code';
  const adapter1 = AdapterFactory.createAdapter('claude-code', '/project/root');
  await orchestrator.setAdapter(adapter1);

  // Invoke agent
  const response1 = await orchestrator.invokeAgent('requirements-analyst', {
    prompt: 'Create spec for login',
  });

  expect(response1.platform).toBe('claude-code');

  // Switch platform to Cursor
  process.env.MUSUHI_PLATFORM = 'cursor';
  const adapter2 = AdapterFactory.createAdapter('cursor', '/project/root');
  await orchestrator.setAdapter(adapter2);

  // Invoke agent again
  const response2 = await orchestrator.invokeAgent('system-architect', {
    prompt: 'Generate architecture',
  });

  expect(response2.platform).toBe('cursor');
});
```

**Acceptance Criteria**:
- Orchestrator adapts to platform changes
- Agent invocations work on all 8 platforms
- No platform-specific code in orchestrator

---

### 6.4 TEST-INT-003: Parallel Executor → Iterative Verification

**Test ID**: TEST-INT-003
**Integration**: Feature 4 (Parallel Executor) + Feature 7 (Iterative Verification)
**Priority**: P1
**Estimated Execution Time**: 3 minutes

#### Test Scenario

**Workflow**: Execute tasks in parallel with iterative verification checkpoints

**Test Steps**:

1. Enable iterative mode: `musuhi config set verification-mode enabled`
2. Create task plan with P-waves: `tasks.md` (P0/P1/P2)
3. Execute with parallel executor: `musuhi tasks execute --parallel --iterative tasks.md`
4. Verify checkpoint after each P-wave completion:
   - P0 wave completes → checkpoint → prompt user
   - P1 wave completes → checkpoint → prompt user
   - P2 wave completes → checkpoint → prompt user

**Expected Results**:
- Parallel execution works with iterative verification
- Checkpoints saved after each wave
- User can approve/revise/rollback entire wave

**Test Code**:
```typescript
// tests/integration/parallel-iterative.test.ts
import { ParallelExecutor } from '@musuhi/parallel-executor';
import { IterativeVerifier } from '@musuhi/iterative-verification';

test('INT-003: Parallel execution with iterative verification', async () => {
  const executor = new ParallelExecutor();
  const verifier = new IterativeVerifier('/project/root', 'tasks.md');
  await verifier.setMode('enabled');

  const tasks = loadTasksFromFile('tasks.md'); // 10 P0, 15 P1, 5 P2

  // Execute with checkpoints
  const result = await executor.executeWithVerification(tasks, verifier);

  expect(result.checkpoints.length).toBe(3); // P0, P1, P2
  expect(result.checkpoints[0].wave).toBe('P0');
  expect(result.checkpoints[1].wave).toBe('P1');
  expect(result.checkpoints[2].wave).toBe('P2');
});
```

**Acceptance Criteria**:
- Parallel execution integrates with iterative verification
- Checkpoints saved after each wave
- User can control execution flow

---

### 6.5 TEST-INT-004: Gap Analyzer → Change Workflow

**Test ID**: TEST-INT-004
**Integration**: Feature 5 (Gap Analyzer) + Feature 2 (Change Workflow)
**Priority**: P1
**Estimated Execution Time**: 2 minutes

#### Test Scenario

**Workflow**: Gap analysis generates change proposals

**Test Steps**:

1. Run gap analysis: `musuhi gap analyze --requirements requirements.md --codebase src/`
2. Gap report generated: `gap-report.md` (lists missing features, conflicts, deprecated)
3. Generate change proposals from gaps: `musuhi gap generate-changes gap-report.md`
4. Verify change proposals created in `changes/` directory:
   - `changes/YYYY-MM-DD-implement-missing-feature-1/`
   - `changes/YYYY-MM-DD-resolve-conflict-2/`
   - `changes/YYYY-MM-DD-deprecate-code-3/`

**Expected Results**:
- Gap analysis generates actionable recommendations
- Change proposals created automatically
- Proposals follow delta format (ADDED/MODIFIED/REMOVED)

**Test Code**:
```typescript
// tests/integration/gap-change-workflow.test.ts
import { GapAnalyzer } from '@musuhi/gap-analyzer';
import { ChangeWorkflowManager } from '@musuhi/change-workflow';

test('INT-004: Gap analysis generates change proposals', async () => {
  const analyzer = new GapAnalyzer('requirements.md', 'src/');
  const manager = new ChangeWorkflowManager('/project/root');

  // Run gap analysis
  const report = await analyzer.analyze();

  expect(report.gaps.length).toBeGreaterThan(0);

  // Generate change proposals
  await manager.generateChangesFromGaps(report.gaps);

  // Verify changes created
  const changes = await manager.listChanges();
  expect(changes.length).toBe(report.gaps.length);
});
```

**Acceptance Criteria**:
- Gap analysis integrates with change workflow
- Change proposals generated automatically
- Proposals are valid (pass Phase -1 Gate)

---

### 6.6 TEST-INT-005: Dashboard → All Packages

**Test ID**: TEST-INT-005
**Integration**: Feature 6 (Dashboard) aggregates state from all packages
**Priority**: P1
**Estimated Execution Time**: 3 minutes

#### Test Scenario

**Workflow**: Dashboard displays real-time state from all features

**Test Steps**:

1. Launch dashboard: `musuhi view`
2. Execute workflow in background:
   - Create change proposal (Feature 2)
   - Run Phase -1 Gate validation (Feature 1)
   - Execute parallel tasks (Feature 4)
   - Run gap analysis (Feature 5)
3. Verify dashboard updates in real-time:
   - Workflow status changes (8-stage SDD)
   - Active changes list updates
   - Agent status updates (Feature 3)
   - P-wave progress updates (Feature 4)
   - Gap report summary updates (Feature 5)

**Expected Results**:
- Dashboard aggregates state from all packages
- Real-time updates (<2s refresh)
- No missing data

**Test Code**:
```typescript
// tests/integration/dashboard-aggregation.test.ts
import { DashboardTUI } from '@musuhi/dashboard';
import { ChangeWorkflowManager } from '@musuhi/change-workflow';
import { ParallelExecutor } from '@musuhi/parallel-executor';

test('INT-005: Dashboard aggregates state from all packages', async () => {
  const dashboard = new DashboardTUI('/project/root');
  await dashboard.launch();

  const manager = new ChangeWorkflowManager('/project/root');
  const executor = new ParallelExecutor();

  // Execute workflow in background
  await manager.createChange('test-change', { proposal: 'Test' });
  await executor.execute(loadTasks());

  // Verify dashboard state updates
  await dashboard.waitForRefresh();

  const state = dashboard.getState();
  expect(state.activeChanges.length).toBe(1);
  expect(state.pwaveStatus.currentWave).toBe('P0');
});
```

**Acceptance Criteria**:
- Dashboard aggregates state from all features
- Real-time updates work
- No data loss or corruption

---

### 6.7 Integration Testing Summary

**Target**: All cross-package integrations validated

**Exit Criteria**:
- ✅ TEST-INT-001: Constitutional Governance → Change Workflow ✅
- ✅ TEST-INT-002: Multi-Agent Orchestrator → Platform Adapters ✅
- ✅ TEST-INT-003: Parallel Executor → Iterative Verification ✅
- ✅ TEST-INT-004: Gap Analyzer → Change Workflow ✅
- ✅ TEST-INT-005: Dashboard → All Packages ✅

---

## 7. User Acceptance Testing

### 7.1 UAT Objectives

**Goal**: Validate real-world usage scenarios

**Scope**: 6 UAT scenarios covering all 4 personas

**Test Method**: Manual testing with real users

**Test Location**: Beta testing with 10-20 users

### 7.2 UAT-001: New Project Initialization (Solo Developer)

**Test ID**: UAT-001
**Persona**: Alex (Solo Developer / Startup Founder)
**Priority**: P0
**Estimated Execution Time**: 15 minutes

#### Scenario

Alex wants to start a new SaaS project using MUSUHI 2.0 with Claude Code.

#### User Story

```
As a solo developer
I want to initialize a new project with MUSUHI 2.0
So that I can develop with AI assistance and avoid technical debt
```

#### Test Steps

1. Install MUSUHI 2.0: `npm install -g @musuhi/cli`
2. Initialize project: `musuhi init`
3. Review generated files:
   - `steering/structure.md`
   - `steering/tech.md`
   - `steering/product.md`
   - `steering/constitution.md`
4. Create first requirement: `specs/user-login.md` (using EARS format)
5. Invoke @requirements-analyst: `@requirements-analyst "Review specs/user-login.md"`
6. Implement feature: `@software-developer "Implement specs/user-login.md"`
7. Generate tests: `@test-engineer "Generate tests for specs/user-login.md"`

#### Expected Results

- Project initialized in <5 minutes
- Steering files are understandable and relevant
- EARS requirements validated correctly
- AI agents work without manual configuration

#### Success Criteria

- ✅ Time to first feature: <30 minutes
- ✅ User satisfaction: 8/10 or higher
- ✅ No critical errors or blockers

---

### 7.3 UAT-002: Brownfield Project Adoption (Legacy Modernization Team)

**Test ID**: UAT-002
**Persona**: Priya (Legacy Modernization Lead)
**Priority**: P0
**Estimated Execution Time**: 30 minutes

#### Scenario

Priya's team is migrating a 500K LOC Java monolith to microservices. They want to use MUSUHI 2.0 to detect gaps and manage the migration.

#### User Story

```
As a legacy modernization lead
I want to adopt MUSUHI 2.0 for an existing codebase
So that I can detect gaps and parallelize migration tasks
```

#### Test Steps

1. Initialize MUSUHI 2.0 in existing project: `musuhi init --brownfield`
2. Generate steering context from codebase: `@steering "Analyze codebase and generate steering files"`
3. Create migration requirements: `specs/microservices-migration.md`
4. Run gap analysis: `musuhi gap analyze --requirements specs/microservices-migration.md --codebase src/`
5. Review gap report: `gap-report.md` (missing features, conflicts, deprecated code)
6. Generate migration plan: `musuhi gap generate-changes gap-report.md`
7. Execute migration tasks in parallel: `musuhi tasks execute --parallel migration-tasks.md`
8. Monitor progress: `musuhi view` (dashboard)

#### Expected Results

- Gap analysis detects missing features and conflicts
- Migration plan generated with P-wave labels
- Parallel execution achieves 50%+ time savings
- Dashboard shows real-time progress

#### Success Criteria

- ✅ Gap analysis completes in <2 minutes for 500K LOC
- ✅ Migration plan is accurate and actionable
- ✅ Parallel execution works without errors
- ✅ User satisfaction: 8/10 or higher

---

### 7.4 UAT-003: Multi-Developer Collaboration (OSS Maintainer)

**Test ID**: UAT-003
**Persona**: Jordan (Open Source Maintainer)
**Priority**: P1
**Estimated Execution Time**: 45 minutes

#### Scenario

Jordan maintains a popular TypeScript library with 15 contributors. They want to use MUSUHI 2.0 to manage contributions and enforce code quality.

#### User Story

```
As an open source maintainer
I want to use MUSUHI 2.0 for code review
So that I can reject over-engineered PRs and maintain quality
```

#### Test Steps

1. Initialize MUSUHI 2.0: `musuhi init`
2. Configure Phase -1 Gates for PRs (GitHub Actions)
3. Contributor submits PR with change proposal: `changes/YYYY-MM-DD-add-feature/`
4. Phase -1 Gate validates PR: `musuhi validate changes/YYYY-MM-DD-add-feature/`
5. If validation fails, provide feedback to contributor
6. If validation passes, approve PR and merge
7. Archive change: `musuhi change archive add-feature`

#### Expected Results

- Phase -1 Gate blocks over-engineered PRs (Article 5)
- Contributors receive actionable feedback
- Approved PRs merge cleanly
- Change history tracked in `archive/`

#### Success Criteria

- ✅ 70%+ PR acceptance rate (high-quality contributions)
- ✅ <24 hour code review turnaround
- ✅ 100% EARS compliance for new features
- ✅ User satisfaction: 8/10 or higher

---

### 7.5 UAT-004: Platform Migration (Claude Code → Cursor)

**Test ID**: UAT-004
**Persona**: Alex (Solo Developer)
**Priority**: P1
**Estimated Execution Time**: 20 minutes

#### Scenario

Alex started development on Claude Code but wants to try Cursor for better IDE integration.

#### User Story

```
As a solo developer
I want to switch from Claude Code to Cursor
So that I can use a different AI platform without losing context
```

#### Test Steps

1. Start project on Claude Code: `musuhi init`
2. Create specs and implement features on Claude Code
3. Switch platform: `musuhi config set platform cursor`
4. Verify steering context preserved
5. Invoke agent on Cursor: `@system-architect "Generate architecture"`
6. Switch back to Claude Code: `musuhi config set platform claude-code`
7. Verify no data loss

#### Expected Results

- Platform switch completes without errors
- Steering files, specs, changes preserved
- Agents work on both platforms
- No context loss

#### Success Criteria

- ✅ Platform switch takes <2 minutes
- ✅ 100% context preserved (no data loss)
- ✅ Agents work on both platforms
- ✅ User satisfaction: 9/10 or higher (seamless)

---

### 7.6 UAT-005: Error Recovery (Rollback and Checkpoint Resume)

**Test ID**: UAT-005
**Persona**: Alex (Solo Developer)
**Priority**: P1
**Estimated Execution Time**: 15 minutes

#### Scenario

Alex enables iterative verification to catch errors early. A task fails, and Alex wants to rollback changes and resume from a checkpoint.

#### User Story

```
As a solo developer
I want to rollback failed tasks and resume from checkpoints
So that I can recover from errors without starting over
```

#### Test Steps

1. Enable iterative mode: `musuhi config set verification-mode enabled`
2. Execute multi-task workflow: `musuhi change execute "add-feature"`
3. Task 3 fails (AI generates buggy code)
4. User selects: `Rollback`
5. Task 3 changes reverted
6. Workflow interrupted (Ctrl+C)
7. Resume from checkpoint: `musuhi change resume "add-feature"`
8. Continue from Task 4

#### Expected Results

- Rollback reverts Task 3 changes (files restored)
- Checkpoint saves workflow state
- Resume continues from last completed task
- No data loss

#### Success Criteria

- ✅ Rollback works correctly (file changes reverted)
- ✅ Checkpoint saves and loads without errors
- ✅ Resume continues from correct task
- ✅ User satisfaction: 9/10 or higher (reliable recovery)

---

### 7.7 UAT-006: Constitutional Governance (Enterprise Team)

**Test ID**: UAT-006
**Persona**: Sarah (Enterprise Architect)
**Priority**: P0
**Estimated Execution Time**: 30 minutes

#### Scenario

Sarah's team must enforce constitutional principles (Library-First, Test-First, etc.) to maintain code quality. She wants to use Phase -1 Gates to block violations.

#### User Story

```
As an enterprise architect
I want to enforce constitutional principles automatically
So that I can maintain code quality across 50 developers
```

#### Test Steps

1. Initialize MUSUHI 2.0: `musuhi init`
2. Review constitution: `steering/constitution.md` (9 Articles)
3. Developer proposes change violating Article 1 (custom logger instead of library)
4. Phase -1 Gate validation: `musuhi validate changes/add-custom-logger/`
5. Validation FAILS with actionable feedback
6. Developer revises proposal (use winston library)
7. Phase -1 Gate validation: `musuhi validate changes/add-winston-logger/`
8. Validation PASSES
9. Merge change: `musuhi change merge add-winston-logger`

#### Expected Results

- Phase -1 Gate blocks violations
- Developers receive clear feedback
- Valid changes pass and merge
- Audit log tracks all validations

#### Success Criteria

- ✅ 90%+ Phase -1 Gate pass rate (after initial learning curve)
- ✅ 50% reduction in technical debt
- ✅ 100% audit compliance (traceability)
- ✅ User satisfaction: 9/10 or higher (effective governance)

---

### 7.8 UAT Summary

**Target**: All 6 UAT scenarios pass

**Exit Criteria**:
- ✅ UAT-001: New project initialization ✅
- ✅ UAT-002: Brownfield project adoption ✅
- ✅ UAT-003: Multi-developer collaboration ✅
- ✅ UAT-004: Platform migration ✅
- ✅ UAT-005: Error recovery ✅
- ✅ UAT-006: Constitutional governance ✅

**User Satisfaction Target**: 8/10 or higher (average across all scenarios)

---

## 8. Test Execution Plan

### 8.1 Timeline (4 Weeks)

#### Week 1: Test Failure Resolution + E2E Test Implementation

**Days 1-2**:
- Fix Gap Analyzer ConflictDetector tests (TEST-FIX-001)
- Fix Platform Adapters CLI detection tests (TEST-FIX-002)
- Re-run full test suite
- Target: 683/683 tests passing (100%)

**Days 3-5**:
- Implement E2E test scenarios (TEST-E2E-001 through TEST-E2E-008)
- Execute E2E tests
- Fix any issues found
- Target: All 8 E2E scenarios pass

#### Week 2: Performance Validation + Security Testing

**Days 6-8**:
- Execute performance benchmarks (TEST-PERF-001 through TEST-PERF-004)
- Validate all 4 NFR-P requirements
- Optimize if performance targets not met
- Target: All 4 NFRs validated

**Days 9-10**:
- Execute security tests (TEST-SEC-001, TEST-SEC-002)
- Run OWASP Top 10 checks
- Run npm audit
- Fix any vulnerabilities found
- Target: 0 critical/high vulnerabilities

#### Week 3: Integration Testing + UAT Preparation

**Days 11-13**:
- Execute integration tests (TEST-INT-001 through TEST-INT-005)
- Validate cross-package workflows
- Fix any integration issues
- Target: All 5 integration tests pass

**Days 14-15**:
- Prepare UAT environment
- Recruit 10-20 beta testers
- Provide UAT instructions
- Schedule UAT sessions

#### Week 4: User Acceptance Testing + Final Validation

**Days 16-19**:
- Execute UAT scenarios (UAT-001 through UAT-006)
- Collect user feedback
- Fix critical issues
- Target: All 6 UAT scenarios pass, 8/10 user satisfaction

**Day 20**:
- Final validation (re-run all tests)
- Generate test report
- Go/No-Go decision
- Target: 100% test pass rate, all acceptance criteria met

---

### 8.2 Resource Allocation

**Team**:
- 2 Test Engineers (40 hours/week each)
- 1 Software Developer (support for fixes, 20 hours/week)
- 1 QA Lead (oversight, 10 hours/week)

**Total Effort**: 220 hours (4 weeks × 55 hours/week)

**Budget**: $22,000 (220 hours × $100/hour average rate)

---

### 8.3 Test Execution Procedure

**For Each Test**:

1. **Setup**: Prepare test environment (clean state)
2. **Execute**: Run test according to test plan
3. **Record**: Log results (pass/fail, duration, notes)
4. **Debug**: If failed, investigate root cause
5. **Fix**: Implement fix and re-run test
6. **Verify**: Confirm fix doesn't break other tests
7. **Document**: Update test report

**Test Execution Order**:

1. Test failure resolution (Week 1, Days 1-2)
2. E2E tests (Week 1, Days 3-5)
3. Performance tests (Week 2, Days 6-8)
4. Security tests (Week 2, Days 9-10)
5. Integration tests (Week 3, Days 11-13)
6. UAT (Week 4, Days 16-19)
7. Final validation (Week 4, Day 20)

---

## 9. Risk Assessment

### 9.1 High-Risk Areas

#### Risk 1: Test Fixes Introduce Regressions

**Probability**: Medium (30%)

**Impact**: High (could break passing tests)

**Mitigation**:
- Run full test suite after each fix
- Code review all test fixes
- Track test coverage (ensure no decrease)

**Contingency**:
- Revert fix if regressions detected
- Investigate alternative fix approach

---

#### Risk 2: UAT Reveals Critical Usability Issues

**Probability**: Medium (40%)

**Impact**: High (could delay release)

**Mitigation**:
- Conduct early UAT with 2-3 users (Week 2)
- Fix critical issues before full UAT (Week 4)
- Provide clear documentation and tutorials

**Contingency**:
- Prioritize critical issues (P0)
- Defer non-critical issues to post-release
- Extend Phase 6 by 1 week if necessary

---

#### Risk 3: Performance Benchmarks Not Met

**Probability**: Low (15%)

**Impact**: Medium (NFRs not validated)

**Mitigation**:
- Run performance tests early (Week 2)
- Optimize immediately if targets not met
- Profile code to identify bottlenecks

**Contingency**:
- Extend Week 2 by 2 days for optimization
- Adjust NFR targets if fundamental limitations found

---

### 9.2 Medium-Risk Areas

#### Risk 4: Security Vulnerabilities in Dependencies

**Probability**: Medium (30%)

**Impact**: Medium (npm audit failures)

**Mitigation**:
- Run npm audit in Week 2
- Update dependencies to latest secure versions
- Review changelogs for breaking changes

**Contingency**:
- Find alternative libraries if fixes unavailable
- Document accepted risks (if low severity)

---

#### Risk 5: Integration Test Failures

**Probability**: Low (20%)

**Impact**: Medium (cross-package issues)

**Mitigation**:
- Design clear integration test scenarios
- Use realistic test data
- Test all cross-package workflows

**Contingency**:
- Fix integration issues in Week 3
- Re-run all integration tests after fixes

---

### 9.3 Low-Risk Areas

#### Risk 6: E2E Test Flakiness

**Probability**: Low (10%)

**Impact**: Low (annoying but fixable)

**Mitigation**:
- Use deterministic test data
- Add retry logic for flaky tests
- Isolate tests (no shared state)

**Contingency**:
- Quarantine flaky tests
- Investigate and fix within 24 hours

---

## 10. Go/No-Go Criteria

### 10.1 Go Criteria (Release Approved)

**All of the following must be TRUE**:

#### Code Quality
- ✅ 683/683 tests passing (100% pass rate)
- ✅ Code coverage ≥80%
- ✅ TypeScript strict mode passing (0 type errors)
- ✅ ESLint passing (0 errors)
- ✅ 0 critical bugs in production

#### Performance
- ✅ NFR-P.1: Dashboard refresh <100ms (95th percentile)
- ✅ NFR-P.2: Parallel execution 50%+ time savings
- ✅ NFR-P.3: Gap analysis <60s for 100K LOC
- ✅ NFR-P.4: Agent routing overhead <200ms

#### Security
- ✅ 0 critical/high vulnerabilities (npm audit)
- ✅ OWASP Top 10 checks pass (applicable items)
- ✅ Constitutional security validated (Article 7)

#### Integration
- ✅ All 5 integration tests pass
- ✅ Cross-package workflows validated
- ✅ No data loss or corruption

#### User Acceptance
- ✅ All 6 UAT scenarios pass
- ✅ User satisfaction ≥8/10 (average)
- ✅ 0 critical usability issues

#### Documentation
- ✅ Test plan complete and reviewed
- ✅ Test report generated
- ✅ All test results documented

---

### 10.2 No-Go Criteria (Release Blocked)

**ANY of the following is TRUE**:

#### Critical Blockers
- ❌ <95% test pass rate (650/683 or fewer tests passing)
- ❌ Any critical/high security vulnerabilities
- ❌ Any critical bugs in production
- ❌ Any NFR-P requirement not validated

#### Major Issues
- ❌ User satisfaction <7/10 (average)
- ❌ >3 critical usability issues
- ❌ Integration test failures (any of 5 tests)
- ❌ Code coverage <75%

#### Documentation Issues
- ❌ Test plan incomplete
- ❌ Test report not generated
- ❌ Critical tests not executed

---

### 10.3 Decision Process

**Step 1: Collect Metrics** (Day 20)
- Test pass rate
- Performance benchmark results
- Security audit results
- Integration test results
- UAT feedback and satisfaction scores

**Step 2: Review Go/No-Go Criteria** (Day 20)
- QA Lead reviews all criteria
- Test Engineers provide evidence for each criterion
- Software Developer confirms no critical bugs

**Step 3: Make Decision** (Day 20)
- If ALL Go Criteria met: **GO** (proceed to Phase 7)
- If ANY No-Go Criteria met: **NO-GO** (extend Phase 6)

**Step 4: Document Decision** (Day 20)
- Create Phase 6 Test Report
- Document all test results
- Provide recommendation for Phase 7

**Step 5: Communicate Decision** (Day 20)
- Notify stakeholders
- If NO-GO, provide remediation plan
- If GO, proceed to deployment preparation

---

## 11. Deliverables

### 11.1 Test Plan Document

**File**: `docs/testing/phase-6-test-plan.md` (this document)

**Status**: ✅ Complete

---

### 11.2 E2E Test Scenarios Document

**File**: `docs/testing/e2e-test-scenarios.md`

**Status**: To be created (Week 1, Day 3)

**Content**:
- Detailed test steps for all 8 E2E scenarios
- Expected results
- Acceptance criteria
- Test data

---

### 11.3 Performance Benchmarks Document

**File**: `docs/testing/performance-benchmarks.md`

**Status**: To be created (Week 2, Day 8)

**Content**:
- Benchmark results for all 4 NFR-P requirements
- Performance metrics (p50, p95, p99 latencies)
- Time savings analysis (parallel execution)
- Optimization recommendations (if needed)

---

### 11.4 Security Audit Report

**File**: `docs/testing/security-audit-report.md`

**Status**: To be created (Week 2, Day 10)

**Content**:
- OWASP Top 10 check results
- Constitutional security validation
- npm audit results
- Vulnerability remediation plan

---

### 11.5 UAT Results Document

**File**: `docs/testing/uat-results.md`

**Status**: To be created (Week 4, Day 19)

**Content**:
- UAT scenario results (pass/fail)
- User feedback and satisfaction scores
- Critical issues found
- Recommendations for improvements

---

### 11.6 Phase 6 Test Report

**File**: `docs/testing/phase-6-test-report.md`

**Status**: To be created (Week 4, Day 20)

**Content**:
- Overall test summary
- Test pass rate
- Performance validation results
- Security audit summary
- Integration test results
- UAT summary
- Go/No-Go decision
- Recommendations for Phase 7

---

## 12. Conclusion

This Phase 6 Testing Plan provides a comprehensive strategy for validating MUSUHI 2.0 before release. With 679/683 tests already passing (99.4%), Phase 6 focuses on:

1. **Fixing 7 remaining test failures** (Week 1)
2. **Expanding E2E test coverage** with 8 comprehensive workflows (Week 1)
3. **Validating 4 NFRs** for performance (Week 2)
4. **Ensuring security** with OWASP Top 10 checks (Week 2)
5. **Testing cross-package integration** (Week 3)
6. **Conducting UAT** with 10-20 beta users (Week 4)

**Success Criteria**:
- 683/683 tests passing (100%)
- All 4 NFRs validated
- 0 critical/high vulnerabilities
- All 6 UAT scenarios pass with 8/10 user satisfaction

**Timeline**: 4 weeks (estimated)

**Go/No-Go Decision**: Day 20 (end of Week 4)

---

**Document Status**: Draft

**Next Steps**:
1. Review this test plan with stakeholders
2. Begin Week 1 execution (test failure resolution)
3. Update this document as tests are executed
4. Generate final test report on Day 20

---

**Document Metadata**:
- **Version**: 1.0
- **Last Updated**: 2025-11-16
- **Status**: Draft - Pending Stakeholder Review
- **Next Review**: Week 4, Day 20 (Go/No-Go Decision)
