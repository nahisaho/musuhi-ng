/**
 * Article 6: Performance-First Validator
 * Ensures code meets performance budgets and best practices
 * @module @musuhi-ng/constitutional-governance/validators
 */

import type { ValidationRule, ValidationContext, ValidationResult } from '../types.js';

/**
 * Performance-First Validator
 * Enforces Article 6: Performance budgets and optimization
 */
export class PerformanceFirstValidator {
  /**
   * Create validation rules for Article 6
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'avoid-synchronous-fs',
        description: 'Avoid blocking synchronous file system operations',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for synchronous file system operations
          const syncFsPatterns = [
            { pattern: /fs\.readFileSync/g, suggestion: 'Use fs.promises.readFile()' },
            { pattern: /fs\.writeFileSync/g, suggestion: 'Use fs.promises.writeFile()' },
            { pattern: /fs\.readdirSync/g, suggestion: 'Use fs.promises.readdir()' },
            { pattern: /fs\.statSync/g, suggestion: 'Use fs.promises.stat()' },
            { pattern: /fs\.mkdirSync/g, suggestion: 'Use fs.promises.mkdir()' },
            { pattern: /fs\.unlinkSync/g, suggestion: 'Use fs.promises.unlink()' },
          ];

          for (const { pattern, suggestion } of syncFsPatterns) {
            const matches = context.content.match(pattern);
            if (matches) {
              details.push(
                `Synchronous file system operation detected: ${matches[0]}`
              );
              suggestions.push(suggestion);
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 6,
              message: `Performance-First principle violated: ${details.length} blocking operations found`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 6,
            message: 'No blocking file system operations detected',
          };
        },
        severity: 'error',
      },
      {
        name: 'avoid-inefficient-loops',
        description: 'Avoid inefficient patterns in loops',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for inefficient array operations in loops
          if (/for\s*\([^)]+\)\s*\{[^}]*\.push\(/s.test(context.content)) {
            // This is a simple heuristic - might need refinement
            const hasNestedPush = /for\s*\([^)]+\)\s*\{[^}]*for\s*\([^)]+\)\s*\{[^}]*\.push\(/s.test(
              context.content
            );
            if (hasNestedPush) {
              details.push('Nested loops with array push operations detected');
              suggestions.push('Consider using map/filter/reduce or pre-allocating arrays');
            }
          }

          // Check for repeated DOM queries in loops
          if (
            /for\s*\([^)]+\)\s*\{[^}]*(?:document\.querySelector|document\.getElementById)/s.test(
              context.content
            )
          ) {
            details.push('DOM queries inside loops detected');
            suggestions.push('Cache DOM references outside the loop');
          }

          // Check for string concatenation in loops
          if (/for\s*\([^)]+\)\s*\{[^}]*\+=\s*['"`]/s.test(context.content)) {
            details.push('String concatenation in loop detected');
            suggestions.push('Use array.join() or template literals instead');
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 6,
              message: 'Inefficient loop patterns detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 6,
            message: 'No inefficient loop patterns detected',
          };
        },
        severity: 'warning',
      },
      {
        name: 'check-bundle-size-imports',
        description: 'Optimize imports to reduce bundle size',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for entire library imports instead of specific imports
          const inefficientImports = [
            {
              pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"]lodash['"]/g,
              suggestion: "Import specific functions: import { debounce } from 'lodash'",
            },
            {
              pattern: /import\s+\w+\s+from\s+['"]moment['"]/g,
              suggestion: "Consider using 'date-fns' or 'dayjs' for smaller bundle size",
            },
            {
              pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"]rxjs['"]/g,
              suggestion: "Import specific operators: import { map } from 'rxjs/operators'",
            },
          ];

          for (const { pattern, suggestion } of inefficientImports) {
            const matches = context.content.match(pattern);
            if (matches) {
              details.push(`Inefficient import detected: ${matches[0]}`);
              suggestions.push(suggestion);
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 6,
              message: 'Bundle size can be optimized',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 6,
            message: 'Imports are optimized for bundle size',
          };
        },
        severity: 'warning',
      },
      {
        name: 'avoid-memory-leaks',
        description: 'Prevent memory leaks from uncleaned resources',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for event listeners without cleanup
          if (/addEventListener\s*\(/g.test(context.content)) {
            if (!/removeEventListener\s*\(/g.test(context.content)) {
              details.push('addEventListener found without corresponding removeEventListener');
              suggestions.push(
                'Add cleanup logic to remove event listeners (e.g., in useEffect cleanup or componentWillUnmount)'
              );
            }
          }

          // Check for setInterval without clearInterval
          if (/setInterval\s*\(/g.test(context.content)) {
            if (!/clearInterval\s*\(/g.test(context.content)) {
              details.push('setInterval found without corresponding clearInterval');
              suggestions.push('Store interval ID and clear it in cleanup function');
            }
          }

          // Check for setTimeout without clearTimeout
          const setTimeoutCount = (context.content.match(/setTimeout\s*\(/g) || []).length;
          const clearTimeoutCount = (context.content.match(/clearTimeout\s*\(/g) || []).length;
          if (setTimeoutCount > clearTimeoutCount && setTimeoutCount > 2) {
            details.push('Multiple setTimeout calls without corresponding clearTimeout');
            suggestions.push('Consider storing timeout IDs and clearing them in cleanup');
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 6,
              message: 'Potential memory leaks detected',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 6,
            message: 'No obvious memory leak patterns detected',
          };
        },
        severity: 'warning',
      },
      {
        name: 'prefer-async-await',
        description: 'Use async/await instead of long promise chains',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for promise chains that could use async/await
          const promiseChainPattern = /\.then\s*\([^)]*\)\s*\.then\s*\([^)]*\)\s*\.then/g;
          const matches = context.content.match(promiseChainPattern);

          if (matches && matches.length > 0) {
            details.push(`${matches.length} long promise chains detected`);
            suggestions.push('Consider using async/await for better readability and debugging');
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 6,
              message: 'Code readability can be improved',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 6,
            message: 'Async code follows best practices',
          };
        },
        severity: 'info',
      },
    ];
  }
}
