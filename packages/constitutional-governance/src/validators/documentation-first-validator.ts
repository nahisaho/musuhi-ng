/**
 * Article 4: Documentation-First Validator
 * Ensures code has proper documentation before implementation
 * @module @musuhi/constitutional-governance/validators
 */

import type { ValidationRule, ValidationContext, ValidationResult } from '../types.js';

/**
 * Documentation-First Validator
 * Enforces Article 4: All code must have documentation
 */
export class DocumentationFirstValidator {
  /**
   * Create validation rules for Article 4
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'require-jsdoc-comments',
        description: 'All exported functions, classes, and types must have JSDoc documentation',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true, message: 'No content to validate' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check for exported functions without JSDoc
          const exportedFunctions = context.content.matchAll(
            /export\s+(?:async\s+)?function\s+(\w+)/g
          );
          for (const match of exportedFunctions) {
            const functionName = match[1];
            const beforeFunction = context.content.substring(0, match.index);
            const lines = beforeFunction.split('\n');
            const previousLine = lines[lines.length - 1]?.trim();

            if (!previousLine?.endsWith('*/')) {
              details.push(`Function '${functionName}' is missing JSDoc documentation`);
              suggestions.push(
                `Add JSDoc comment before function '${functionName}' describing its purpose, parameters, and return value`
              );
            }
          }

          // Check for exported classes without JSDoc
          const exportedClasses = context.content.matchAll(/export\s+class\s+(\w+)/g);
          for (const match of exportedClasses) {
            const className = match[1];
            const beforeClass = context.content.substring(0, match.index);
            const lines = beforeClass.split('\n');
            const previousLine = lines[lines.length - 1]?.trim();

            if (!previousLine?.endsWith('*/')) {
              details.push(`Class '${className}' is missing JSDoc documentation`);
              suggestions.push(
                `Add JSDoc comment before class '${className}' describing its purpose and usage`
              );
            }
          }

          // Check for exported interfaces/types without JSDoc
          const exportedTypes = context.content.matchAll(
            /export\s+(?:interface|type)\s+(\w+)/g
          );
          for (const match of exportedTypes) {
            const typeName = match[1];
            const beforeType = context.content.substring(0, match.index);
            const lines = beforeType.split('\n');
            const previousLine = lines[lines.length - 1]?.trim();

            if (!previousLine?.endsWith('*/')) {
              details.push(`Type '${typeName}' is missing JSDoc documentation`);
              suggestions.push(
                `Add JSDoc comment before type '${typeName}' describing its purpose`
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 4,
              message: `Documentation-First principle violated: ${details.length} items missing documentation`,
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 4,
            message: 'All exported items have documentation',
          };
        },
        severity: 'error',
      },
      {
        name: 'require-readme',
        description: 'New packages must have a README.md file',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.filePath) {
            return { valid: true, message: 'No file path provided' };
          }

          // Check if creating a new package without README
          if (
            context.filePath.includes('/packages/') &&
            context.filePath.endsWith('package.json') &&
            context.delta?.type === 'create'
          ) {
            const packageDir = context.filePath.substring(
              0,
              context.filePath.lastIndexOf('/')
            );
            const readmePath = `${packageDir}/README.md`;

            return {
              valid: true,
              article: 4,
              message: 'Consider adding README.md for new package',
              suggestions: [
                `Create ${readmePath} documenting the package purpose, installation, and usage`,
              ],
            };
          }

          return {
            valid: true,
            article: 4,
            message: 'README check not applicable',
          };
        },
        severity: 'warning',
      },
      {
        name: 'require-module-docstring',
        description: 'TypeScript files must have module-level documentation',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.filePath || !context.content) {
            return { valid: true, message: 'No file path or content provided' };
          }

          const details: string[] = [];
          const suggestions: string[] = [];

          // Check if TypeScript file has module-level documentation
          if (
            context.filePath.endsWith('.ts') &&
            !context.filePath.includes('.test.') &&
            !context.filePath.includes('__tests__')
          ) {
            const lines = context.content.split('\n');
            let hasModuleDoc = false;

            // Check first few lines for module documentation
            for (let i = 0; i < Math.min(10, lines.length); i++) {
              const line = lines[i]?.trim();
              if (line?.includes('@module')) {
                hasModuleDoc = true;
                break;
              }
            }

            if (!hasModuleDoc) {
              details.push('File is missing module-level documentation');
              suggestions.push(
                'Add a module-level JSDoc comment at the top of the file with @module tag'
              );
            }
          }

          if (details.length > 0) {
            return {
              valid: false,
              article: 4,
              message: 'Module documentation missing',
              details,
              suggestions,
            };
          }

          return {
            valid: true,
            article: 4,
            message: 'Module has proper documentation',
          };
        },
        severity: 'warning',
      },
    ];
  }
}
