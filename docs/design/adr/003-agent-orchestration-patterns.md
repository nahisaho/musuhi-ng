# ADR-003: Multi-Agent Orchestration Pattern Selection

**Status**: Accepted
**Date**: 2025-11-15
**Deciders**: System Architect AI, Product Manager
**Tags**: orchestration, multi-agent, conversation-patterns

---

## Context

MUSUHI 2.0 requires coordination of 20 specialized AI agents across complex workflows. Different tasks require different communication patterns.

### Requirements Coverage

- AC-3.1: Sequential Chat (A → B → C)
- AC-3.2: Group Chat (round-robin/dynamic speaker selection)
- AC-3.3: Nested Chat (hierarchical delegation)
- AC-3.4: Swarm Pattern (autonomous coordination)
- AC-3.5: AutoPattern (automatic selection)
- AC-3.6: UserProxy Agent (human-in-the-loop)
- AC-3.7: Tool Registration
- AC-3.8: Capability Discovery
- AC-3.9: Conversation History

---

## Decision

**9 Orchestration Patterns (ag2-inspired)**

1. **Sequential Chat**: Linear handoff (Requirements Analyst → System Architect → Project Manager)
2. **Group Chat**: Manager selects next speaker based on task
3. **Nested Chat**: Parent agents spawn sub-agents for subtasks
4. **Swarm Pattern**: Parallel autonomous agent coordination
5. **Finite State Machine**: State-driven transitions (Draft → Review → Approved)
6. **Hierarchical**: Parent-child agent trees
7. **UserProxy Agent**: Human approval gates
8. **Tool Registration**: Agents register callable functions
9. **AutoPattern**: Automatic pattern selection based on task complexity

### Pattern Selector Algorithm

```typescript
selectPattern(task: Task): OrchestrationPattern {
  if (task.requiresHumanApproval) return 'UserProxy'
  if (task.subtasks.length > 0) return 'Nested'
  if (task.dependencies.length === 0 && task.subtasks.length > 3) return 'Swarm'
  if (task.agents.length > 5) return 'Group'
  return 'Sequential'
}
```

---

## Alternatives Considered

### Alternative 1: Single Sequential Pattern

**Rejected**: Too limiting for complex workflows (AC-3.5 requires flexibility)

### Alternative 2: Custom DSL for Patterns

**Rejected**: Over-engineering (violates Article 5), 9 patterns sufficient

### Alternative 3: OpenAI Swarm Library

**Rejected**: Python-only, not TypeScript-compatible

---

## Consequences

### Positive

- 40% faster multi-agent workflows (expected)
- Flexibility for different task types
- Human-in-the-loop control

### Negative

- Complexity in pattern selection logic
- **Mitigation**: Unit tests for each pattern, AutoPattern heuristics

---

## Implementation

**Components**:

- `PatternSelector.ts`: AutoPattern logic
- `SequentialChat.ts`: Linear handoff
- `GroupChat.ts`: Manager-driven speaker selection
- `NestedChat.ts`: Hierarchical delegation
- `SwarmPattern.ts`: Autonomous coordination
- `UserProxyAgent.ts`: Human approval gates
- `ToolRegistry.ts`: Function registration
- `CapabilityRegistry.ts`: Agent skill discovery
- `ConversationHistory.ts`: Message persistence

**Traceability**: AC-3.1 through AC-3.9

---

**Status**: Accepted (Priority: P0, Phase 1)
