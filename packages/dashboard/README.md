# @musuhi-ng/dashboard

Terminal UI (TUI) Dashboard for MUSUHI 2.0

## Overview

Feature 6: Interactive Dashboard (AC-6.1 through AC-6.9)

This package provides a blessed-contrib-based terminal dashboard for visualizing the 8-stage SDD workflow, active agents, P-wave parallel execution progress, and real-time system status.

## Implementation Status

**Current Phase**: Phase 5 P2 (Partial Implementation)

**Completed Components** (as of 2025-11-16):

✅ **Type Definitions** (100% complete):

- `types/workflow.ts` - WorkflowStage, StageProgress, workflow utilities
- `types/agent-status.ts` - AgentStatus, PWaveStatus, WaveProgress
- `types/dashboard.ts` - DashboardState, Change, Spec, LogEntry
- `types/index.ts` - Type exports barrel

✅ **Core Components** (100% complete):

- `core/event-bus.ts` - Real-time event broadcasting (AC-6.7)
- `core/refresh-timer.ts` - 2-second refresh cycle (AC-6.7)
- `core/navigation-handler.ts` - Keyboard navigation (AC-6.8, AC-6.9)
- `core/index.ts` - Core exports barrel

✅ **Tests** (100% coverage for completed components):

- `__tests__/event-bus.test.ts` - 8 tests, 100% coverage
- `__tests__/refresh-timer.test.ts` - 10 tests, 100% coverage, NFR-P.1 validation
- `__tests__/navigation-handler.test.ts` - 15 tests, 100% coverage

**Remaining Components** (to be implemented):

📋 **View Components** (Placeholder status):

- `views/workflow-status-view.ts` - AC-6.2 (Workflow Status View)
- `views/active-changes-view.ts` - AC-6.3 (Active Changes View)
- `views/current-specs-view.ts` - AC-6.4 (Current Specs View)
- `views/active-agents-view.ts` - AC-6.5 (Active Agent Status)
- `views/pwave-view.ts` - AC-6.6 (Parallel Execution Visualization)
- `views/log-view.ts` - Activity stream logs
- `views/index.ts` - View exports barrel

📋 **Main Dashboard** (Placeholder status):

- `dashboard-tui.ts` - AC-6.1 (Dashboard Launch, integration)

📋 **Integration Tests** (Pending):

- `__tests__/dashboard-tui.test.ts` - End-to-end TUI tests

## Architecture

### Technology Stack

- **TUI Framework**: blessed-contrib (Node.js)
- **Refresh Cycle**: 2 seconds (AC-6.7)
- **Performance Target**: <100ms refresh (NFR-P.1)

### Component Architecture

```
packages/dashboard/
├── src/
│   ├── types/              # Type definitions (DONE)
│   │   ├── dashboard.ts    # DashboardState, Change, Spec
│   │   ├── workflow.ts     # WorkflowStage, StageProgress
│   │   ├── agent-status.ts # AgentStatus, PWaveStatus
│   │   └── index.ts        # Type exports
│   ├── core/               # Core infrastructure (DONE)
│   │   ├── event-bus.ts    # Real-time events (AC-6.7)
│   │   ├── refresh-timer.ts # 2s refresh (AC-6.7)
│   │   ├── navigation-handler.ts # Keyboard nav (AC-6.8/6.9)
│   │   └── index.ts        # Core exports
│   ├── views/              # TUI view components (TODO)
│   │   ├── workflow-status-view.ts  # AC-6.2
│   │   ├── active-changes-view.ts   # AC-6.3
│   │   ├── current-specs-view.ts    # AC-6.4
│   │   ├── active-agents-view.ts    # AC-6.5
│   │   ├── pwave-view.ts            # AC-6.6
│   │   ├── log-view.ts              # Activity stream
│   │   └── index.ts                 # View exports
│   ├── dashboard-tui.ts    # Main TUI (TODO, AC-6.1)
│   ├── index.ts            # Package entry point
│   └── __tests__/          # Test suite
│       ├── event-bus.test.ts          # DONE (8 tests)
│       ├── refresh-timer.test.ts      # DONE (10 tests)
│       ├── navigation-handler.test.ts # DONE (15 tests)
│       └── dashboard-tui.test.ts      # TODO (integration)
├── package.json
├── tsconfig.json
└── README.md (this file)
```

## Acceptance Criteria Traceability

### Completed

- ✅ **AC-6.7**: Real-Time Updates - EventBus + RefreshTimer (2s refresh)
- ✅ **AC-6.8**: Interactive Navigation - NavigationHandler (arrow keys)
- ✅ **AC-6.9**: Command Shortcuts - NavigationHandler (V/L/S/A/Q shortcuts)

### In Progress

- 🔄 **AC-6.1**: Dashboard Launch - dashboard-tui.ts (stub)
- 🔄 **AC-6.2**: Workflow Status View - workflow-status-view.ts (stub)
- 🔄 **AC-6.3**: Active Changes View - active-changes-view.ts (stub)
- 🔄 **AC-6.4**: Current Specs View - current-specs-view.ts (stub)
- 🔄 **AC-6.5**: Active Agent Status - active-agents-view.ts (stub)
- 🔄 **AC-6.6**: Parallel Execution Visualization - pwave-view.ts (stub)

## Usage

**Note**: Full dashboard not yet operational. Core infrastructure is ready.

```typescript
import {
  EventBus,
  RefreshTimer,
  NavigationHandler,
  type DashboardState,
} from '@musuhi-ng/dashboard';

// Create event bus for real-time updates (AC-6.7)
const eventBus = new EventBus();

// Create refresh timer (2s cycle, AC-6.7)
const refreshTimer = new RefreshTimer(2000, async () => {
  // Fetch latest state
  const state = await fetchDashboardState();

  // Broadcast state update
  eventBus.emitStateChange(state);
});

// Create navigation handler (AC-6.8, AC-6.9)
const navHandler = new NavigationHandler();

// Handle keyboard input
process.stdin.on('keypress', (ch, key) => {
  // Navigation keys (AC-6.8)
  if (['up', 'down', 'left', 'right', 'enter', 'escape'].includes(key.name)) {
    navHandler.handleNavigation(key.name);
  }

  // Shortcut keys (AC-6.9)
  const command = navHandler.handleShortcut(ch);
  if (command === 'quit') {
    process.exit(0);
  }
});

// Start refresh cycle
refreshTimer.start();
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

**Current Test Coverage**: 100% for completed components (33 tests passing)

- EventBus: 8 tests ✅
- RefreshTimer: 10 tests ✅ (includes NFR-P.1 performance validation)
- NavigationHandler: 15 tests ✅

## Performance

**NFR-P.1**: Dashboard response time <100ms (95th percentile)

- ✅ RefreshTimer: <100ms execution time (validated in tests)
- ✅ EventBus: Minimal overhead (EventEmitter-based)
- ✅ NavigationHandler: Synchronous, <1ms latency

**AC-6.7**: Refresh every 2 seconds

- ✅ RefreshTimer: Configurable interval (default 2000ms)
- ✅ Performance tested with fake timers

## Dependencies

**Production**:

- `@musuhi-ng/core` - Core framework types
- `blessed` - TUI framework (for view components)
- `blessed-contrib` - TUI widgets (for view components)

**Development**:

- `@types/blessed` - TypeScript definitions
- `@types/node` - Node.js types
- `typescript` - Type-safe development
- `vitest` - Fast unit testing

## Next Steps

1. **Implement View Components** (AC-6.2 through AC-6.6):
   - WorkflowStatusView (blessed gauge + text)
   - ActiveChangesView (blessed table)
   - CurrentSpecsView (blessed table)
   - ActiveAgentsView (blessed table)
   - PWaveView (blessed bar chart)

2. **Implement Main Dashboard** (AC-6.1):
   - DashboardTUI orchestrator
   - Integrate all view components
   - Setup blessed screen and grid layout
   - Wire event bus to views

3. **Integration Tests**:
   - End-to-end dashboard launch test
   - View rendering tests
   - Keyboard interaction tests

4. **CLI Integration**:
   - Add `musuhi view` command to @musuhi-ng/cli
   - Launch dashboard from CLI

## License

MIT

## Related Documents

- **Requirements**: docs/requirements/requirements.md (AC-6.1 through AC-6.9)
- **Design**: docs/design/adr/006-dashboard-tui-framework.md
- **Architecture**: steering/structure.md (Dashboard section)
