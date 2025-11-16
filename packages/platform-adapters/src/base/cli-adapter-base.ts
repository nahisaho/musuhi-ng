/**
 * AC-8.2: CLI Interface Support
 * Base class for CLI-based platform adapters
 * @module @musuhi-ng/platform-adapters/base
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { BasePlatformAdapter } from './base-adapter.js';
import type { Delta, PhaseGate, GateResult } from '../types/index.js';
import { ConstitutionLoader, PhaseGateValidator } from '@musuhi-ng/constitutional-governance';
import { NodeFileSystem } from '@musuhi-ng/core';
import type { ValidationContext } from '@musuhi-ng/constitutional-governance';

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
    // eslint-disable-next-line no-console
    console.log(
      `[${this.platform}] Phase -1 Gate: Validating Articles [${gate.articles.join(', ')}]`
    );

    try {
      // Load constitution from steering/constitution.md
      const constitutionPath = join(this.projectRoot, 'steering', 'constitution.md');
      const fsManager = new NodeFileSystem();
      const loader = new ConstitutionLoader(fsManager, constitutionPath);
      const articles = await loader.load();

      // Create Phase Gate Validator
      const validator = new PhaseGateValidator(articles);

      // Create validation context from gate data
      const context: ValidationContext = {
        type: 'design', // Default to design context
        files: gate.context.change ? [
          {
            path: gate.context.change.path,
            content: gate.context.change.content ?? '',
            operation: gate.context.change.type,
          }
        ] : [],
        changes: gate.context.change ? [gate.context.change] : [],
        metadata: {
          timestamp: new Date(),
          author: 'platform-adapter',
          ...gate.context.metadata,
        },
      };

      // Validate using PhaseGateValidator
      const validationResult = await validator.validate(context, gate.articles);

      // Convert PhaseMinusOneGate result to GateResult format
      const hasFailures = validationResult.validations.some(v => v.status === 'fail');
      const hasWarnings = validationResult.validations.some(v => v.status === 'warning');

      const violations = validationResult.validations
        .filter(v => v.status === 'fail')
        .flatMap(v => v.errors.map(error => ({
          article: v.article,
          reason: error,
        })));

      const suggestions = validationResult.validations
        .filter(v => v.status === 'warning')
        .flatMap(v => v.warnings);

      return {
        status: hasFailures ? 'rejected' : hasWarnings ? 'needs-review' : 'approved',
        message: `Phase -1 Gate ${validationResult.status}: ${validationResult.validations.length} articles validated`,
        violations: violations.length > 0 ? violations : undefined,
        suggestions: suggestions.length > 0 ? suggestions : undefined,
      };
    } catch (error) {
      // If constitution file is missing or validation fails, return error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // eslint-disable-next-line no-console
      console.error(`[${this.platform}] Phase -1 Gate validation failed:`, errorMessage);

      return {
        status: 'rejected',
        message: `Phase -1 Gate validation error: ${errorMessage}`,
        violations: [{
          article: 0,
          reason: `Validation system error: ${errorMessage}`,
        }],
        suggestions: ['Ensure steering/constitution.md exists and is properly formatted'],
      };
    }
  }
}
