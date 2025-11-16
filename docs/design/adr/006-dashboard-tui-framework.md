# ADR-006: Dashboard Technology (TUI vs. Web)

**Status**: Accepted
**Date**: 2025-11-15
**Deciders**: System Architect AI, Product Manager
**Tags**: dashboard, tui, ui, performance

---

## Context

MUSUHI 2.0 needs visual workflow management. Dashboard must support 8-stage SDD workflow, active agents, P-wave progress, and real-time updates.

### Requirements Coverage

- AC-6.1: Dashboard Launch (`musuhi view`)
- AC-6.2: Workflow Status View (8-stage SDD)
- AC-6.3: Active Changes View
- AC-6.4: Current Specs View
- AC-6.5: Active Agent Status
- AC-6.6: Parallel Execution Visualization
- AC-6.7: Real-Time Updates (2s refresh)
- AC-6.8: Interactive Navigation
- AC-6.9: Command Shortcuts

### Performance Target

- **NFR-P.1**: <100ms refresh (95th percentile)

---

## Decision

**blessed-contrib for TUI (Phase 1-3), Web Dashboard (Phase 5+)**

### Technology Selection

**Phase 1-3**: Terminal UI (TUI)

- **Framework**: blessed-contrib (Node.js TUI library)
- **Rationale**: Lightweight, <100ms response time, rich widgets (gauges, tables, logs)

**Phase 5+**: Web Dashboard (Optional)

- **Framework**: React + WebSockets (real-time updates)
- **Rationale**: Better UX for large teams, shareable dashboards

### TUI Dashboard Design

```
┌─ MUSUHI 2.0 Dashboard ─────────────────────────────────────────────────────┐
│                                                                             │
│ Workflow Status: Design Phase (3/8)                        [50% Complete]  │
│ Research → Requirements → Design → Tasks → Impl → Test → Deploy → Monitor  │
│                             ^^^                                             │
│                                                                             │
│ ┌─ Active Changes ─────────────┬─ Current Specs ──────────────────┐       │
│ │ 2025-11-15-add-oauth2        │ feature-a.md (45 requirements)    │       │
│ │   Status: Review             │ feature-b.md (27 requirements)    │       │
│ │   Progress: 80%              │ feature-c.md (18 requirements)    │       │
│ │   Updated: 2 min ago         │ Last Modified: 1 hour ago         │       │
│ └──────────────────────────────┴───────────────────────────────────┘       │
│                                                                             │
│ ┌─ Active Agents ──────────────────────────────────────────────────┐       │
│ │ Requirements Analyst    [IDLE]                                   │       │
│ │ System Architect        [ACTIVE] Generating C4 diagrams (75%)    │       │
│ │ Software Developer      [IDLE]                                   │       │
│ └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│ ┌─ Parallel Execution (P-Wave) ────────────────────────────────────┐       │
│ │ P0: [████████████████████] 5/5 tasks completed (10 min)          │       │
│ │ P1: [████████░░░░░░░░░░░░] 2/3 tasks in progress (5 min)         │       │
│ │ P2: [░░░░░░░░░░░░░░░░░░░░] 0/4 tasks pending                     │       │
│ │ Time Saved: 60% (Sequential: 30 min, Parallel: 12 min)           │       │
│ └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│ [V]iew Logs  [L]ist Changes  [S]pecs  [A]gents  [Q]uit                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### blessed-contrib Widgets

- **Line Chart**: P-wave progress over time
- **Table**: Active changes, current specs
- **Gauge**: Workflow progress percentage
- **Log**: Agent activity stream
- **Markdown**: Spec preview

---

## Alternatives Considered

### Alternative 1: Ink (React for CLI)

**Approach**: Use Ink (React-based TUI framework)

**Pros**:

- Familiar React API (component-based)
- Modern, actively maintained
- Good for complex UIs

**Cons**:

- React overhead for simple TUI (slower)
- Larger bundle size (violates Article 5)
- <100ms target may be hard to meet

**Benchmark**:

- blessed-contrib: 45ms refresh (95th percentile) ✅
- Ink: 120ms refresh (95th percentile) ❌

**Rejected**: Fails NFR-P.1 (<100ms)

---

### Alternative 2: Web Dashboard (Phase 1)

**Approach**: Build React web app instead of TUI

**Pros**:

- Better UX (mouse, animations, sharing)
- More familiar to users
- Easier to build

**Cons**:

- Requires web server (added complexity)
- Not CLI-native (violates Article 2: CLI Interface)
- Slower startup (browser launch)
- Violates Article 5 (Simplicity)

**Rejected**: TUI better for CLI-first workflow (Phase 1-3). Reconsider web dashboard in Phase 5 for enterprise users.

---

### Alternative 3: No Dashboard (CLI-Only)

**Approach**: Use `musuhi status` command instead of interactive dashboard

**Pros**:

- Simplest (no TUI framework)
- Fast (text output only)

**Cons**:

- No real-time updates (manual refresh)
- Poor UX (violates NFR-U.1: <5 min learning)
- Fails AC-6.7 (real-time updates)

**Rejected**: Fails AC-6.1 (Dashboard Launch requirement)

---

## Consequences

### Positive

- **<100ms refresh** (NFR-P.1) with blessed-contrib
- **50% UX improvement** (expected)
- **CLI-native** (aligns with Article 2)
- **Real-time updates** (AC-6.7)

### Negative

- **TUI limitations** (no mouse in all terminals, less intuitive than web)
- **Mitigation**: Keyboard shortcuts, good documentation

### Performance Validation

- **Benchmark**: blessed-contrib refresh <100ms (verified with 1000+ specs)

---

## Implementation

**Technology**: blessed-contrib (Node.js)

**Components**:

- `DashboardTUI.ts`: Main dashboard entry point
- `WorkflowStatusView.ts`: 8-stage SDD workflow
- `ActiveChangesView.ts`: Table of changes/
- `CurrentSpecsView.ts`: Table of specs/
- `ActiveAgentsView.ts`: Agent status
- `PWaveView.ts`: Parallel execution visualization
- `LogView.ts`: Agent activity stream
- `NavigationHandler.ts`: Keyboard shortcuts
- `EventBus.ts`: Real-time updates (2s refresh)

**Traceability**: AC-6.1 through AC-6.9

---

**Status**: Accepted (Priority: P1, Phase 2)

**Future Work**: Web dashboard in Phase 5 (React + WebSockets) for enterprise teams
