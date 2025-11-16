/**
 * Article 5: Simplicity-First Validator
 * Ensures code maintains low complexity (cyclomatic complexity < 10)
 * @module @musuhi-ng/constitutional-governance/validators
 */

import type { ValidationRule, ValidationContext, ValidationResult } from '../types.js';

/**
 * Simplicity-First Validator
 * Enforces Article 5: Code complexity limits
 */
export class SimplicityFirstValidator {
  /**
   * Calculate cyclomatic complexity of a function
   */
  private static calculateComplexity(functionBody: string): number {
    let complexity = 1; // Base complexity

    // Count decision points
    const decisionPoints = [
      /\bif\s*\(/g, // if statements
      /\belse\s+if\s*\(/g, // else if
      /\bfor\s*\(/g, // for loops
      /\bwhile\s*\(/g, // while loops
      /\bcase\s+/g, // switch cases
      /\?\s*.*\s*:/g, // ternary operators
      /&&/g, // logical AND
      /\|\|/g, // logical OR
      /\bcatch\s*\(/g, // catch blocks
    ];

    for (const pattern of decisionPoints) {
      const matches = functionBody.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }

  /**
   * Extract functions from code
   */
  private static extractFunctions(
    content: string
  ): Array<{ name: string; body: string; complexity: number }> {
    const functions: Array<{ name: string; body: string; complexity: number }> = [];

    // Match function declarations and expressions
    const functionPattern =
      /(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    const arrowFunctionPattern = /const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    const methodPattern =
      /(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;

    // Extract regular functions
    let match;
    while ((match = functionPattern.exec(content)) !== null) {
      const name = match[1] || '';
      const body = match[2] || '';
      const complexity = this.calculateComplexity(body);
      functions.push({ name, body, complexity });
    }

    // Extract arrow functions
    while ((match = arrowFunctionPattern.exec(content)) !== null) {
      const name = match[1] || '';
      const body = match[2] || '';
      const complexity = this.calculateComplexity(body);
      functions.push({ name, body, complexity });
    }

    // Extract class methods
    while ((match = methodPattern.exec(content)) !== null) {
      const name = match[1] || '';
      const body = match[2] || '';
      // Skip constructor and obvious non-methods
      if (name && !['class', 'interface', 'type', 'if', 'for', 'while'].includes(name)) {
        const complexity = this.calculateComplexity(body);
        functions.push({ name, body, complexity });
      }
    }

    return functions;
  }

  /**
   * Create validation rules for Article 5
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'limit-cyclomatic-complexity',
        description: 'Functions must have cyclomatic complexity below 10',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];
          const COMPLEXITY_LIMIT = 10;

          const functions = this.extractFunctions(context.content);

          for (const func of functions) {
            if (func.complexity > COMPLEXITY_LIMIT) {
              details.push(
                `Function '${func.name}' has cyclomatic complexity of ${func.complexity} (limit: ${COMPLEXITY_LIMIT})`
              );
              suggestions.push(
                `Refactor '${func.name}' by extracting complex logic into smaller helper functions`
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 5,
              message: `Simplicity-First principle violated: ${details.length} functions exceed complexity limit`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 5,
            message: 'All functions meet complexity requirements',
          };
        },
        severity: 'error',
      },
      {
        name: 'limit-function-length',
        description: 'Functions should be under 50 lines',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];
          const LINE_LIMIT = 50;

          const functions = this.extractFunctions(context.content);

          for (const func of functions) {
            const lineCount = func.body.split('\n').length;
            if (lineCount > LINE_LIMIT) {
              details.push(
                `Function '${func.name}' has ${lineCount} lines (recommended limit: ${LINE_LIMIT})`
              );
              suggestions.push(
                `Consider breaking '${func.name}' into smaller, focused functions`
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 5,
              message: `${details.length} functions are too long`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 5,
            message: 'All functions are appropriately sized',
          };
        },
        severity: 'warning',
      },
      {
        name: 'limit-nesting-depth',
        description: 'Code nesting depth should not exceed 4 levels',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];
          const MAX_NESTING = 4;

          const functions = this.extractFunctions(context.content);

          for (const func of functions) {
            let maxDepth = 0;
            let currentDepth = 0;

            for (const char of func.body) {
              if (char === '{') {
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
              } else if (char === '}') {
                currentDepth--;
              }
            }

            if (maxDepth > MAX_NESTING) {
              details.push(
                `Function '${func.name}' has nesting depth of ${maxDepth} (limit: ${MAX_NESTING})`
              );
              suggestions.push(
                `Reduce nesting in '${func.name}' by using early returns or extracting nested logic`
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 5,
              message: `${details.length} functions have excessive nesting`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 5,
            message: 'All functions have acceptable nesting depth',
          };
        },
        severity: 'warning',
      },
      {
        name: 'limit-parameter-count',
        description: 'Functions should have no more than 5 parameters',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];
          const PARAM_LIMIT = 5;

          // Match function signatures
          const functionSignatures = context.content.matchAll(
            /(?:function|const)\s+(\w+)\s*\(([^)]*)\)/g
          );

          for (const match of functionSignatures) {
            const name = match[1] || '';
            const params = match[2] || '';
            const paramCount = params
              .split(',')
              .filter((p) => p.trim().length > 0).length;

            if (paramCount > PARAM_LIMIT) {
              details.push(
                `Function '${name}' has ${paramCount} parameters (limit: ${PARAM_LIMIT})`
              );
              suggestions.push(
                `Refactor '${name}' to use an options object instead of multiple parameters`
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 5,
              message: `${details.length} functions have too many parameters`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 5,
            message: 'All functions have acceptable parameter counts',
          };
        },
        severity: 'warning',
      },
    ];
  }
}
