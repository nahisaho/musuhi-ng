/**
 * Delta Manager
 * Manages spec file changes and deltas
 * @module @musuhi-ng/change-workflow
 */

import { promises as fs } from 'fs';
import * as path from 'path';

import type { ChangeDelta, DeltaOperation } from './types.js';

/**
 * Delta comparison result
 */
export interface DeltaComparison {
  /** Files added */
  added: string[];

  /** Files modified */
  modified: string[];

  /** Files removed */
  removed: string[];

  /** Total changes */
  totalChanges: number;
}

/**
 * Delta application result
 */
export interface DeltaApplicationResult {
  /** Application succeeded */
  success: boolean;

  /** Number of operations applied */
  appliedOperations: number;

  /** Errors encountered */
  errors: string[];

  /** Warnings */
  warnings: string[];
}

/**
 * Delta Manager
 * Manages change deltas for specification files
 */
export class DeltaManager {
  /**
   * Detect changes between two spec directories
   */
  async detectChanges(baseSpecsDir: string, changedSpecsDir: string): Promise<ChangeDelta> {
    const operations: DeltaOperation[] = [];
    const affectedSpecs: Set<string> = new Set();

    // Get all files from both directories
    const baseFiles = await this.getAllFiles(baseSpecsDir);
    const changedFiles = await this.getAllFiles(changedSpecsDir);

    const baseFileSet = new Set(baseFiles);
    const changedFileSet = new Set(changedFiles);

    // Detect ADDED files
    for (const file of changedFiles) {
      if (!baseFileSet.has(file)) {
        const fullPath = path.join(changedSpecsDir, file);
        const content = await fs.readFile(fullPath, 'utf-8');

        operations.push({
          type: 'ADDED',
          specPath: file,
          content,
        });

        affectedSpecs.add(file);
      }
    }

    // Detect REMOVED files
    for (const file of baseFiles) {
      if (!changedFileSet.has(file)) {
        operations.push({
          type: 'REMOVED',
          specPath: file,
          content: '',
        });

        affectedSpecs.add(file);
      }
    }

    // Detect MODIFIED files
    for (const file of changedFiles) {
      if (baseFileSet.has(file)) {
        const basePath = path.join(baseSpecsDir, file);
        const changedPath = path.join(changedSpecsDir, file);

        const baseContent = await fs.readFile(basePath, 'utf-8');
        const changedContent = await fs.readFile(changedPath, 'utf-8');

        if (baseContent !== changedContent) {
          operations.push({
            type: 'MODIFIED',
            specPath: file,
            content: changedContent,
          });

          affectedSpecs.add(file);
        }
      }
    }

    return {
      operations,
      affectedSpecs: Array.from(affectedSpecs).sort(),
    };
  }

  /**
   * Create a delta from a single operation
   */
  createDelta(operation: DeltaOperation): ChangeDelta {
    return {
      operations: [operation],
      affectedSpecs: [operation.specPath],
    };
  }

  /**
   * Merge multiple deltas into one
   */
  mergeDeltas(deltas: ChangeDelta[]): ChangeDelta {
    const allOperations: DeltaOperation[] = [];
    const allAffectedSpecs: Set<string> = new Set();

    for (const delta of deltas) {
      allOperations.push(...delta.operations);
      delta.affectedSpecs.forEach((spec) => allAffectedSpecs.add(spec));
    }

    // Remove duplicate operations (keep last one for each spec path)
    const operationMap = new Map<string, DeltaOperation>();
    for (const op of allOperations) {
      operationMap.set(op.specPath, op);
    }

    return {
      operations: Array.from(operationMap.values()),
      affectedSpecs: Array.from(allAffectedSpecs).sort(),
    };
  }

  /**
   * Apply delta to a target directory
   */
  async applyDelta(delta: ChangeDelta, targetDir: string): Promise<DeltaApplicationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let appliedOperations = 0;

    for (const operation of delta.operations) {
      try {
        const targetPath = path.join(targetDir, operation.specPath);

        switch (operation.type) {
          case 'ADDED':
          case 'MODIFIED':
            await this.ensureDirectoryExists(path.dirname(targetPath));
            await fs.writeFile(targetPath, operation.content, 'utf-8');
            appliedOperations++;
            break;

          case 'REMOVED':
            try {
              await fs.unlink(targetPath);
              appliedOperations++;
            } catch (error) {
              if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
                warnings.push(`File already removed: ${operation.specPath}`);
              } else {
                throw error;
              }
            }
            break;
        }
      } catch (error) {
        errors.push(
          `Failed to apply ${operation.type} for ${operation.specPath}: ${String(error)}`
        );
      }
    }

    return {
      success: errors.length === 0,
      appliedOperations,
      errors,
      warnings,
    };
  }

  /**
   * Compare two deltas
   */
  compareDelta(delta1: ChangeDelta, delta2: ChangeDelta): DeltaComparison {
    const specs1 = new Set(delta1.affectedSpecs);
    const specs2 = new Set(delta2.affectedSpecs);

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    // Files in delta2 but not in delta1 are added
    for (const spec of delta2.affectedSpecs) {
      if (!specs1.has(spec)) {
        added.push(spec);
      }
    }

    // Files in delta1 but not in delta2 are removed
    for (const spec of delta1.affectedSpecs) {
      if (!specs2.has(spec)) {
        removed.push(spec);
      }
    }

    // Files in both are potentially modified
    for (const spec of delta1.affectedSpecs) {
      if (specs2.has(spec)) {
        const op1 = delta1.operations.find((op) => op.specPath === spec);
        const op2 = delta2.operations.find((op) => op.specPath === spec);

        if (op1 && op2 && op1.content !== op2.content) {
          modified.push(spec);
        }
      }
    }

    return {
      added,
      modified,
      removed,
      totalChanges: added.length + modified.length + removed.length,
    };
  }

  /**
   * Serialize delta to JSON
   */
  serializeDelta(delta: ChangeDelta): string {
    return JSON.stringify(delta, null, 2);
  }

  /**
   * Deserialize delta from JSON
   */
  deserializeDelta(json: string): ChangeDelta {
    return JSON.parse(json) as ChangeDelta;
  }

  /**
   * Get delta summary
   */
  getDeltaSummary(delta: ChangeDelta): string {
    const addedCount = delta.operations.filter((op) => op.type === 'ADDED').length;
    const modifiedCount = delta.operations.filter((op) => op.type === 'MODIFIED').length;
    const removedCount = delta.operations.filter((op) => op.type === 'REMOVED').length;

    const parts: string[] = [];
    if (addedCount > 0) parts.push(`${addedCount} added`);
    if (modifiedCount > 0) parts.push(`${modifiedCount} modified`);
    if (removedCount > 0) parts.push(`${removedCount} removed`);

    return parts.length > 0
      ? `${delta.affectedSpecs.length} files affected: ${parts.join(', ')}`
      : 'No changes';
  }

  /**
   * Validate delta operations
   */
  validateDelta(delta: ChangeDelta): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for duplicate spec paths
    const specPaths = delta.operations.map((op) => op.specPath);
    const uniquePaths = new Set(specPaths);
    if (specPaths.length !== uniquePaths.size) {
      errors.push('Delta contains duplicate spec paths');
    }

    // Validate each operation
    for (const operation of delta.operations) {
      if (!operation.specPath) {
        errors.push('Operation missing specPath');
      }

      if (!['ADDED', 'MODIFIED', 'REMOVED'].includes(operation.type)) {
        errors.push(`Invalid operation type: ${operation.type}`);
      }

      if (operation.type !== 'REMOVED' && !operation.content) {
        errors.push(`${operation.type} operation for ${operation.specPath} missing content`);
      }
    }

    // Validate affectedSpecs matches operations
    const operationSpecs = new Set(delta.operations.map((op) => op.specPath));
    const affectedSpecsSet = new Set(delta.affectedSpecs);

    if (operationSpecs.size !== affectedSpecsSet.size) {
      errors.push('affectedSpecs does not match operation spec paths');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all files recursively from a directory
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      await fs.access(dir);
    } catch {
      return files;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(dir, fullPath);

      if (entry.isDirectory()) {
        const subFiles = await this.getAllFiles(fullPath);
        files.push(...subFiles.map((f) => path.join(relativePath, f)));
      } else if (entry.isFile()) {
        files.push(relativePath);
      }
    }

    return files;
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }
}
