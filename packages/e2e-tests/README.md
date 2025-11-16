# @musuhi/e2e-tests

End-to-End test suite for MUSUHI 2.0, validating complete workflows across all 8 features.

## Overview

This package contains 8 comprehensive E2E test scenarios that validate the entire MUSUHI 2.0 system from end to end.

**Total Scenarios**: 8
**Total Test Cases**: 34+
**Estimated Execution Time**: ~19 minutes
**Automation Level**: 100%

## Test Scenarios

### TEST-E2E-001: Complete SDD Workflow ⭐
- **Duration**: 5 minutes
- **Coverage**: All 8 stages (Research → Monitoring)
- **Validates**:
  - Project initialization
  - Requirement specification (EARS format)
  - Change proposal creation
  - Task plan generation
  - Code implementation
  - Test generation
  - Change archival
  - Workflow status tracking

### TEST-E2E-002: Multi-Agent Orchestration Patterns
- **Duration**: 3 minutes
- **Coverage**: 4 orchestration patterns
- **Validates**:
  - Sequential Chat (A → B → C)
  - Group Chat (manager selects speaker)
  - Nested Chat (parent spawns sub-agents)
  - Swarm Pattern (parallel execution)

### TEST-E2E-003: Parallel Task Execution ⭐
- **Duration**: 2 minutes
- **Coverage**: P-wave labeling and parallel execution
- **Validates**:
  - Dependency graph construction
  - P-wave label assignment (P0/P1/P2/P3)
  - 50%+ time savings (NFR-P.2)
  - Task failure handling

### TEST-E2E-004: Gap Analysis on Real Codebase
- **Duration**: 1 minute
- **Coverage**: Brownfield gap detection
- **Validates**:
  - Missing feature detection
  - Undocumented feature detection
  - Conflict detection
  - Performance (<60s for 100K LOC, NFR-P.3)

### TEST-E2E-005: Platform Switching
- **Duration**: 2 minutes
- **Coverage**: Multi-platform support
- **Validates**:
  - Platform migration (Claude Code → Cursor)
  - Context preservation
  - Agent execution on new platform

### TEST-E2E-006: Iterative Verification Workflow
- **Duration**: 3 minutes
- **Coverage**: Task-by-task execution
- **Validates**:
  - Continue action (proceed to next task)
  - Revise action (provide revision instructions)
  - Rollback action (revert failed task)
  - Checkpoint save/resume

### TEST-E2E-007: Dashboard Real-Time Updates ⭐
- **Duration**: 2 minutes
- **Coverage**: Interactive TUI dashboard
- **Validates**:
  - Real-time updates (<2s refresh)
  - Keyboard navigation (V/L/S/A/Q)
  - Performance (<100ms refresh, NFR-P.1)

### TEST-E2E-008: Constitutional Enforcement ⭐
- **Duration**: 2 minutes
- **Coverage**: Phase -1 Gate validation
- **Validates**:
  - Article 1 violation (Library-First)
  - Article 2 violation (Test-First)
  - Article 5 violation (Simplicity-First)
  - Valid requirement approval

⭐ = Critical scenario (P0 priority)

## Running Tests

### Run all E2E tests
```bash
pnpm test
```

### Run specific scenario
```bash
pnpm test src/scenarios/sdd-workflow.e2e.test.ts
```

### Run with coverage
```bash
pnpm test:coverage
```

### Watch mode
```bash
pnpm test:watch
```

## Test Structure

```
packages/e2e-tests/
├── src/
│   ├── scenarios/
│   │   ├── sdd-workflow.e2e.test.ts         # TEST-E2E-001
│   │   ├── multi-agent.e2e.test.ts          # TEST-E2E-002
│   │   ├── parallel-execution.e2e.test.ts   # TEST-E2E-003
│   │   ├── gap-analysis.e2e.test.ts         # TEST-E2E-004
│   │   ├── platform-switching.e2e.test.ts   # TEST-E2E-005
│   │   ├── iterative-verification.e2e.test.ts # TEST-E2E-006
│   │   ├── dashboard.e2e.test.ts            # TEST-E2E-007
│   │   └── constitutional.e2e.test.ts       # TEST-E2E-008
│   ├── helpers/
│   │   ├── test-project-setup.ts            # Temp project creation
│   │   ├── file-assertions.ts               # File validation helpers
│   │   └── performance-metrics.ts           # Performance measurement
│   └── index.ts
├── package.json
├── vitest.config.ts
└── README.md
```

## Test Helpers

### `test-project-setup.ts`
- `createTestProject()`: Creates temporary test project
- `cleanupTestProject()`: Removes test project after completion

### `file-assertions.ts`
- `assertFileExists()`: Verifies file exists
- `assertDirectoryExists()`: Verifies directory exists
- `assertFileContains()`: Verifies file content
- `assertEARSFormat()`: Validates EARS requirement format

### `performance-metrics.ts`
- `PerformanceMetrics`: Measures execution time
- `createMetrics()`: Creates metrics instance
- `measure()`: Wraps async function with timing

## Performance Benchmarks

All E2E tests validate performance against non-functional requirements:

| NFR | Requirement | Target | Validated In |
|-----|-------------|--------|--------------|
| NFR-P.1 | Dashboard response time | < 100ms (95th percentile) | TEST-E2E-007 |
| NFR-P.2 | Parallel execution savings | 50%+ vs sequential | TEST-E2E-003 |
| NFR-P.3 | Gap analysis speed | < 60s for 100K LOC | TEST-E2E-004 |
| NFR-P.4 | Agent routing overhead | < 200ms | TEST-E2E-002 |

## Exit Criteria

All tests must pass with:
- ✅ 0 failures
- ✅ All acceptance criteria met
- ✅ All performance benchmarks met
- ✅ No critical bugs found

## CI/CD Integration

These tests should run:
- On every PR to `main`
- Before every release
- Nightly builds

**Recommended CI timeout**: 30 minutes

## Debugging

### Enable verbose logging
```bash
DEBUG=musuhi:* pnpm test
```

### Run single test
```bash
pnpm test -- -t "should execute complete 8-stage SDD workflow"
```

### Keep test artifacts
Set `KEEP_TEST_ARTIFACTS=1` to prevent cleanup.

## Contributing

When adding new E2E scenarios:
1. Follow naming convention: `TEST-E2E-XXX`
2. Include estimated execution time
3. Document acceptance criteria
4. Add performance metrics where applicable
5. Ensure proper cleanup in `afterEach()`

## License

MIT
