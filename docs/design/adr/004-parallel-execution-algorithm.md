# ADR-004: Parallel Execution Implementation (P-wave)

**Status**: Accepted
**Date**: 2025-11-15
**Deciders**: System Architect AI, Product Manager
**Tags**: parallel-execution, performance, dag, p-wave

---

## Context

MUSUHI 2.0 must reduce development time by 50-70% through parallel task execution. Sequential execution is too slow for 100+ requirements.

### Requirements Coverage

- AC-4.1: P-Wave Labeling (P0/P1/P2)
- AC-4.2: Dependency Graph (DAG)
- AC-4.3: P0 Execution (concurrent)
- AC-4.4: P1 Execution (after P0)
- AC-4.5: P2+ Execution (sequential waves)
- AC-4.6: Time Savings Measurement (50%+)
- AC-4.7: Race Condition Prevention
- AC-4.8: Failure Handling (cancel dependent tasks)
- AC-4.9: Progress Monitoring

---

## Decision

**DAG-Based P-Wave Labeling with graphlib**

### Algorithm

1. **Dependency Analysis**: Parse `tasks.md` for task dependencies

   ```markdown
   - [ ] Task A (depends: none) → P0
   - [ ] Task B (depends: none) → P0
   - [ ] Task C (depends: Task A) → P1
   - [ ] Task D (depends: Task A, B) → P1
   - [ ] Task E (depends: Task C) → P2
   ```

2. **DAG Construction**: Build directed acyclic graph using `graphlib`

   ```typescript
   const graph = new graphlib.Graph();
   graph.setNode('Task A', { task: taskA });
   graph.setNode('Task B', { task: taskB });
   graph.setEdge('Task C', 'Task A'); // C depends on A
   ```

3. **P-Wave Labeling**: Assign wave based on longest dependency path

   ```typescript
   function labelPWave(dag: Graph): Map<string, number> {
     const waves = new Map<string, number>();
     const sorted = graphlib.alg.topsort(dag);
     for (const node of sorted) {
       const predecessors = dag.predecessors(node) || [];
       const maxPredWave = Math.max(
         ...predecessors.map((p) => waves.get(p) || 0)
       );
       waves.set(node, maxPredWave + 1);
     }
     return waves; // {Task A: 0, Task B: 0, Task C: 1, Task D: 1, Task E: 2}
   }
   ```

4. **Concurrent Execution**: Execute tasks in wave using worker threads

   ```typescript
   async function executePWave(wave: number, tasks: Task[]): Promise<Result[]> {
     return Promise.all(tasks.map((task) => executeTask(task))); // Parallel
   }
   ```

5. **Failure Handling**: Cancel dependent tasks on failure
   ```typescript
   if (task.failed) {
     const dependents = dag.successors(task.id);
     dependents.forEach((d) => cancelTask(d));
   }
   ```

### Expected Time Savings

**Example**:

- Sequential: 10 tasks × 10 min = 100 minutes
- Parallel: P0 (2 tasks, 10 min) + P1 (3 tasks, 10 min) + P2 (5 tasks, 10 min) = 30 minutes
- **Savings**: 70%

---

## Alternatives Considered

### Alternative 1: Manual P-Wave Labels

**Approach**: Developers manually label tasks as P0/P1/P2

**Rejected**: Error-prone, misses optimal parallelization, violates automation goal

### Alternative 2: Simple Dependency Count

**Approach**: P-wave = number of dependencies (task with 2 deps = P2)

**Rejected**: Inaccurate (longest path more correct), fails AC-4.1

### Alternative 3: No DAG (List-Based)

**Approach**: Maintain dependency lists without graph structure

**Rejected**: Circular dependency detection impossible, hard to compute longest path

---

## Consequences

### Positive

- **50-70% time savings** (NFR-P.2)
- Automatic P-wave labeling (no manual effort)
- Circular dependency detection (graphlib)

### Negative

- **Complexity**: DAG construction overhead
- **Mitigation**: Optimize with caching, lazy evaluation

### Performance Targets

- **NFR-P.2**: 50%+ time reduction (validated via benchmarks)
- **NFR-P.4**: <200ms agent routing overhead

---

## Implementation

**Technology**: graphlib (mature, well-tested DAG library)

**Components**:

- `DependencyAnalyzer.ts`: Parse tasks.md
- `DAGBuilder.ts`: Construct graph using graphlib
- `PWaveLabeler.ts`: Assign P0/P1/P2 labels
- `CircularDependencyDetector.ts`: Detect cycles (graphlib.alg.findCycles)
- `WaveScheduler.ts`: Schedule P-wave execution
- `ConcurrentExecutor.ts`: Execute tasks in parallel (worker threads)
- `FailureHandler.ts`: Cancel dependent tasks
- `ProgressTracker.ts`: Real-time progress
- `TimeMetricsCollector.ts`: Measure time savings

**Traceability**: AC-4.1 through AC-4.9

---

**Status**: Accepted (Priority: P1, Phase 2)
