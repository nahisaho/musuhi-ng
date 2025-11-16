# @musuhi-ng/iterative-verification

Task-by-task execution with human review checkpoints for early error detection.

## Overview

The Iterative Verification package provides a systematic approach to task execution with human-in-the-loop verification at each step. This enables early error detection (40% earlier according to AC-7.8 metrics) and gives users control over the execution workflow.

## Features

### AC-7.1: Task-by-Task Mode

Execute one task at a time with approval checkpoints.

```typescript
import { IterativeVerifier } from '@musuhi-ng/iterative-verification';

const verifier = new IterativeVerifier('/project/root', '/project/tasks.md');
await verifier.initialize();

await verifier.executeTasks(tasks);
```

### AC-7.2: Task Completion Prompt

Display task results and prompt for user action (Continue/Revise/Rollback).

```
==================================================================
Task Completed: Implement User Authentication
==================================================================

Status: ✅ Success
Duration: 2.45s

Changes (3 files):
  ➕ src/auth/login.ts
  ✏️  src/auth/index.ts
  ➕ src/auth/login.test.ts

Options:
  [C]ontinue  - Mark complete and proceed to next task
  [R]evise    - Provide revision instructions and re-execute
  [B]ack      - Rollback changes and mark task failed
  [S]kip      - Skip this task
  [A]bort     - Abort entire workflow
==================================================================
```

### AC-7.3: Continue Option

Mark task as complete and proceed to the next task.

### AC-7.4: Revise Option

Provide revision instructions and re-execute the task.

### AC-7.5: Rollback Option

Undo all file changes and mark the task as failed.

```typescript
import { RollbackManager } from '@musuhi-ng/iterative-verification';

const rollbackManager = new RollbackManager();
await rollbackManager.rollback(taskResult);
```

### AC-7.6: Resume from Checkpoint

Restart workflow from the last completed task after interruption.

```typescript
// Checkpoint is automatically saved after each task
const checkpoint = await checkpointManager.loadCheckpoint();

// Resume execution from checkpoint
await verifier.executeTasks(tasks);
```

### AC-7.7: Progress Checkboxes

Automatically update `tasks.md` checkboxes on task completion.

```markdown
<!-- Before -->

- [ ] Task 1: Implement authentication
- [ ] Task 2: Add tests

<!-- After Task 1 completes -->

- [x] Task 1: Implement authentication
- [ ] Task 2: Add tests
```

### AC-7.8: Error Detection Metrics

Track error detection rates and timing.

```typescript
const metrics = verifier.getMetrics();
console.log(`Total tasks: ${metrics.totalTasks}`);
console.log(`Tasks with errors: ${metrics.tasksWithErrors}`);
console.log(`Detection rate: ${metrics.detectionRate.toFixed(1)}%`);
console.log(
  `Average errors per task: ${metrics.averageErrorsPerTask.toFixed(2)}`
);

const stats = verifier.getDetectionStats();
console.log(`Errors caught: ${stats.errorsCaught}`);
console.log(`Catch rate: ${stats.catchRate.toFixed(1)}%`);
console.log(
  `Avg time to detection: ${stats.timeToDetection.toFixed(1)} minutes`
);
```

### AC-7.9: Mode Persistence

Save and apply verification mode preference.

```typescript
// Enable iterative mode (default)
await verifier.setMode('enabled');

// Disable iterative mode (auto-continue all tasks)
await verifier.setMode('disabled');

// Mode is persisted to .musuhi/verification-mode.json
```

## Architecture

### Components

- **TaskExecutor**: Executes tasks with optional verification checkpoints
- **CheckpointManager**: Manages checkpoint persistence for workflow resume
- **RollbackManager**: Reverts file changes when tasks need to be rolled back
- **MetricsTracker**: Collects error detection metrics
- **CompletionPrompt**: Displays task results and prompts for user action
- **RevisionPrompt**: Prompts for revision instructions
- **ProgressUpdater**: Updates tasks.md checkboxes
- **ModeStorage**: Persists verification mode preference

### Type Definitions

- **Task**: Task representation with status, dependencies, and results
- **TaskResult**: Execution result with changes, errors, duration
- **Checkpoint**: Checkpoint snapshot for workflow resume
- **VerificationMode**: `'enabled'` or `'disabled'`
- **UserAction**: `'continue'` | `'revise'` | `'rollback'` | `'skip'` | `'abort'`

## Usage Examples

### Basic Usage

```typescript
import { IterativeVerifier } from '@musuhi-ng/iterative-verification';
import type { Task } from '@musuhi-ng/iterative-verification';

const tasks: Task[] = [
  {
    id: 't1',
    title: 'Implement login feature',
    description: 'Create login component and authentication logic',
    dependencies: [],
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: 't2',
    title: 'Add login tests',
    description: 'Write unit and integration tests for login',
    dependencies: ['t1'],
    status: 'pending',
    createdAt: new Date(),
  },
];

const verifier = new IterativeVerifier('/path/to/project', '/path/to/tasks.md');
await verifier.initialize();

// Execute tasks with iterative verification
await verifier.executeTasks(tasks);

// Get metrics
const metrics = verifier.getMetrics();
console.log(`Completed ${metrics.totalTasks} tasks`);
console.log(`Error detection rate: ${metrics.detectionRate}%`);
```

### Rollback Example

```typescript
import { RollbackManager } from '@musuhi-ng/iterative-verification';
import type { TaskResult } from '@musuhi-ng/iterative-verification';

const rollbackManager = new RollbackManager();

const taskResult: TaskResult = {
  success: false,
  changes: [
    { path: '/src/auth/login.ts', type: 'created', afterContent: '...' },
    {
      path: '/src/auth/index.ts',
      type: 'modified',
      beforeContent: '...',
      afterContent: '...',
    },
  ],
  errors: [{ message: 'Syntax error', severity: 'error' }],
  duration: 1500,
  output: 'Task failed',
};

// Rollback all changes
await rollbackManager.rollback(taskResult);
// - /src/auth/login.ts is deleted
// - /src/auth/index.ts is restored to original content
```

### Checkpoint Resume Example

```typescript
import { CheckpointManager } from '@musuhi-ng/iterative-verification';

const checkpointManager = new CheckpointManager('/path/to/project');

// Load checkpoint from previous session
const checkpoint = await checkpointManager.loadCheckpoint();

if (checkpoint) {
  console.log(`Resuming from task: ${checkpoint.taskId}`);
  console.log(`Completed tasks: ${checkpoint.completedTasks.length}`);
  console.log(`Pending tasks: ${checkpoint.pendingTasks.length}`);
}

// Clear checkpoint when workflow completes
await checkpointManager.clearCheckpoint();
```

## Testing

Run tests with:

```bash
pnpm test
```

Run tests with coverage:

```bash
pnpm test:coverage
```

## Requirements Coverage

- ✅ AC-7.1: Task-by-Task Mode
- ✅ AC-7.2: Task Completion Prompt
- ✅ AC-7.3: Continue Option
- ✅ AC-7.4: Revise Option
- ✅ AC-7.5: Rollback Option
- ✅ AC-7.6: Resume from Checkpoint
- ✅ AC-7.7: Progress Checkboxes
- ✅ AC-7.8: Error Detection Metrics
- ✅ AC-7.9: Mode Persistence

## Expected Impact

- **40% earlier error detection** (AC-7.8)
- Reduced rework through immediate feedback
- User control over AI-generated code
- Safe rollback mechanism
- Automatic progress tracking

## License

MIT
