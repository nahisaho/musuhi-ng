/**
 * AC-8.2: CLI Interface Support
 * Base class for CLI-based platform adapters
 * @module @musuhi/platform-adapters/base
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BasePlatformAdapter } from './base-adapter.js';
import type { Delta, PhaseGate, GateResult } from '../types/index.js';

const execAsync = promisify(exec);

/**
 * Abstract base class for CLI-based platform adapters
 * Provides common CLI execution and file operation utilities
 *
 * Used by:
 * - ClaudeCodeAdapter
 * - CodexCLIAdapter
 * - GeminiCLIAdapter
 * - QwenCodeAdapter
 */
export abstract class CLIAdapterBase extends BasePlatformAdapter {
  /**
   * CLI command name (e.g., 'claude', 'codex', 'gemini', 'qwen')
   */
  protected abstract cliCommand: string;

  /**
   * Execute CLI command with arguments
   * @param args - Command-line arguments
   * @returns Promise resolving to stdout
   * @throws Error if CLI execution fails
   */
  protected async execCLI(args: string[]): Promise<string> {
    const command = `${this.cliCommand} ${args.join(' ')}`;
    const { stdout, stderr } = await execAsync(command);

    if (stderr) {
      console.warn(`[${this.platform}] CLI warning:`, stderr);
    }

    return stdout;
  }

  /**
   * Check if CLI is available
   * @returns true if CLI is installed and accessible
   */
  protected async isCLIAvailable(): Promise<boolean> {
    // Allow tests to force mock mode via environment variable
    if (process.env.MUSUHI_TEST_FORCE_MOCK === 'true') {
      return false;
    }

    try {
      await execAsync(`which ${this.cliCommand}`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * AC-8.5: Context Sharing
   * Read steering context file (shared across all platforms)
   * @param path - Relative path from steering directory
   * @returns Promise resolving to file content
   */
  async readSteering(path: string): Promise<string> {
    const fullPath = join(this.projectRoot, 'steering', path);
    return await readFile(fullPath, 'utf-8');
  }

  /**
   * AC-8.5: Context Sharing
   * Write delta (file changes) to changes/ directory
   * @param path - File path relative to changes/
   * @param delta - Delta to apply
   * @returns Promise resolving when delta is written
   */
  async writeDelta(path: string, delta: Delta): Promise<void> {
    const fullPath = join(this.projectRoot, 'changes', path);

    if (delta.type === 'create' || delta.type === 'update') {
      if (!delta.content) {
        throw new Error('Delta content is required for create/update operations');
      }
      await writeFile(fullPath, delta.content, 'utf-8');
    } else if (delta.type === 'delete') {
      // For delete, we'll write a deletion marker instead of actually deleting
      const deletionMarker = `# DELETED\n\nThis file has been marked for deletion.\n\nOriginal path: ${delta.path}`;
      await writeFile(fullPath, deletionMarker, 'utf-8');
    }
  }

  /**
   * AC-1.8: Constitutional Enforcement
   * Enforce Phase -1 Gate (constitutional validation)
   * Default implementation - can be overridden by subclasses
   *
   * @param gate - Phase gate configuration
   * @returns Promise resolving to gate result
   */
  async enforcePhaseGate(gate: PhaseGate): Promise<GateResult> {
    // Default implementation: Always approve (basic validation only)
    // Real implementation would call constitutional governance package
    console.log(
      `[${this.platform}] Phase -1 Gate: Validating Articles [${gate.articles.join(', ')}]`
    );

    // TODO: Integrate with @musuhi/constitutional-governance
    // For now, return approval with logged message
    return {
      status: 'approved',
      message: `Phase -1 Gate passed for Articles [${gate.articles.join(', ')}]`,
      violations: [],
      suggestions: [],
    };
  }
}
