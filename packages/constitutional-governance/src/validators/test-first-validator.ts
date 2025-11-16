/**
 * Article 2: Test-First Validator
 * Validates that tests exist before implementation
 * @module @musuhi/constitutional-governance/validators
 */

import type { ValidationContext, ValidationResult, ValidationRule } from '../types.js';

/**
 * Test-First Validation Rule
 * Checks if tests exist for implementation files
 */
export class TestFirstValidator {
  /**
   * Create validation rules for Article 2
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'require-test-file',
        description: 'Require test file for implementation files',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.filePath) {
            return { valid: true };
          }

          // Skip test files themselves
          if (
            context.filePath.includes('.test.') ||
            context.filePath.includes('.spec.') ||
            context.filePath.includes('__tests__')
          ) {
            return { valid: true };
          }

          // Skip type definition files
          if (context.filePath.endsWith('.d.ts') || context.filePath.includes('/types/')) {
            return { valid: true };
          }

          // Check if this is a new implementation file
          if (context.delta?.type === 'create' && context.filePath.endsWith('.ts')) {
            return {
              valid: false,
              article: 2,
              message: 'Test-First principle violated: No test file found',
              details: [
                `Creating ${context.filePath} without corresponding test file`,
                'Tests should be written before implementation',
              ],
              suggestions: [
                `Create ${context.filePath.replace(/\.ts$/, '.test.ts')} first`,
                'Write failing tests, then implement to pass them',
              ],
            };
          }

          return { valid: true };
        },
        severity: 'warning',
        autoFixable: false,
      },
      {
        name: 'minimum-test-coverage',
        description: 'Require minimum 80% test coverage',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          // In a real implementation, integrate with coverage tools
          // For now, just check if test file exists
          if (!context.filePath?.endsWith('.ts')) {
            return { valid: true };
          }

          if (
            context.filePath.includes('.test.') ||
            context.filePath.includes('.spec.') ||
            context.filePath.includes('__tests__')
          ) {
            return { valid: true };
          }

          // Check for describe/it/test statements in content
          if (context.content) {
            const hasTests =
              /describe\(|it\(|test\(/i.test(context.content) ||
              /expect\(/i.test(context.content);

            if (!hasTests && context.delta?.type === 'create') {
              return {
                valid: false,
                article: 2,
                message: 'Minimum test coverage not met',
                details: ['No test coverage found for new implementation'],
                suggestions: ['Add comprehensive unit tests', 'Aim for 80%+ coverage'],
              };
            }
          }

          return { valid: true };
        },
        severity: 'error',
        autoFixable: false,
      },
    ];
  }
}
