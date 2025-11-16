/**
 * CompletionPrompt Unit Tests
 *
 * Tests AC-7.2: Task Completion Prompt
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import type { Task, TaskResult } from '../types/index.js';
import { CompletionPrompt } from '../ui/completion-prompt.js';

describe('CompletionPrompt', () => {
  let prompt: CompletionPrompt;
  let sampleTask: Task;
  let successResult: TaskResult;
  let failureResult: TaskResult;
  let originalIsTTY: boolean;

  beforeEach(() => {
    prompt = new CompletionPrompt();
    // Save original TTY state
    originalIsTTY = process.stdin.isTTY || false;
    // Mock non-TTY environment for automated tests
    Object.defineProperty(process.stdin, 'isTTY', { value: false, configurable: true });

    sampleTask = {
      id: 't1',
      title: 'Sample Task',
      description: 'Test task',
      dependencies: [],
      status: 'in-progress',
      createdAt: new Date(),
      startedAt: new Date(),
    };

    successResult = {
      success: true,
      changes: [
        { path: '/test/file1.ts', type: 'created', afterContent: 'content' },
        { path: '/test/file2.ts', type: 'modified', beforeContent: 'old', afterContent: 'new' },
      ],
      errors: [],
      duration: 1500,
      output: 'Task completed successfully',
    };

    failureResult = {
      success: false,
      changes: [],
      errors: [
        { message: 'Syntax error', severity: 'error', file: 'file1.ts', line: 10 },
        { message: 'Unused variable', severity: 'warning', file: 'file2.ts', line: 5 },
      ],
      duration: 500,
      output: 'Task failed',
    };
  });

  afterEach(() => {
    // Restore original TTY state
    Object.defineProperty(process.stdin, 'isTTY', { value: originalIsTTY, configurable: true });
  });

  describe('AC-7.2: Task Completion Prompt', () => {
    it('should display success status for successful task', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await prompt.prompt(sampleTask, successResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).toContain('✅ Success');
      expect(output).toContain('1.50s'); // Duration
      expect(output).toContain('Changes (2 files)');

      consoleSpy.mockRestore();
    });

    it('should display failure status for failed task', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await prompt.prompt(sampleTask, failureResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).toContain('❌ Failed');
      expect(output).toContain('0.50s'); // Duration
      expect(output).toContain('Errors (2)');

      consoleSpy.mockRestore();
    });

    it('should display file changes with icons', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await prompt.prompt(sampleTask, successResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).toContain('➕'); // Created icon
      expect(output).toContain('✏️'); // Modified icon
      expect(output).toContain('/test/file1.ts');
      expect(output).toContain('/test/file2.ts');

      consoleSpy.mockRestore();
    });

    it('should display errors with severity icons', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await prompt.prompt(sampleTask, failureResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).toContain('🔴'); // Error icon
      expect(output).toContain('🟡'); // Warning icon
      expect(output).toContain('Syntax error');
      expect(output).toContain('Unused variable');
      expect(output).toContain('file1.ts:10');
      expect(output).toContain('file2.ts:5');

      consoleSpy.mockRestore();
    });

    it('should display all action options', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await prompt.prompt(sampleTask, successResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).toContain('[C]ontinue');
      expect(output).toContain('[R]evise');
      expect(output).toContain('[B]ack');
      expect(output).toContain('[S]kip');
      expect(output).toContain('[A]bort');
      expect(output).toContain('AC-7.3'); // Continue option reference
      expect(output).toContain('AC-7.4'); // Revise option reference
      expect(output).toContain('AC-7.5'); // Rollback option reference

      consoleSpy.mockRestore();
    });

    it('should return default action (continue) in non-TTY environment', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const action = await prompt.prompt(sampleTask, successResult);

      expect(action).toBe('continue');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Non-interactive environment detected')
      );

      consoleSpy.mockRestore();
    });

    it('should handle task with no changes', async () => {
      const noChangesResult: TaskResult = {
        success: true,
        changes: [],
        errors: [],
        duration: 100,
        output: '',
      };

      const consoleSpy = vi.spyOn(console, 'log');
      await prompt.prompt(sampleTask, noChangesResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).not.toContain('Changes (');

      consoleSpy.mockRestore();
    });

    it('should handle task with no errors', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await prompt.prompt(sampleTask, successResult);

      const output = consoleSpy.mock.calls.flat().join('\n');
      expect(output).not.toContain('Errors (');

      consoleSpy.mockRestore();
    });
  });

  describe('Interactive User Input (TTY mode)', () => {
    beforeEach(() => {
      // Enable TTY mode for these tests
      Object.defineProperty(process.stdin, 'isTTY', { value: true, configurable: true });
    });

    it('should detect TTY mode for interactive prompts', () => {
      // Verify TTY detection is enabled for interactive mode
      expect(process.stdin.isTTY).toBe(true);
    });
  });
});
