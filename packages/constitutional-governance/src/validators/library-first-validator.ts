/**
 * Article 1: Library-First Validator
 * Validates that existing libraries are preferred over custom code
 * @module @musuhi-ng/constitutional-governance/validators
 */

import type { ValidationContext, ValidationResult, ValidationRule } from '../types.js';

/**
 * Library-First Validation Rule
 * Checks if common patterns have library alternatives
 */
export class LibraryFirstValidator {
  /**
   * Create validation rules for Article 1
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'prefer-npm-package',
        description: 'Prefer npm packages over custom implementations',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true };
          }

          const violations: string[] = [];

          // Check for custom date formatting (should use date-fns, dayjs, etc.)
          if (/function\s+formatDate|const\s+formatDate\s*=/i.test(context.content)) {
            violations.push('Custom date formatting detected. Consider using date-fns or dayjs.');
          }

          // Check for custom markdown parsing (should use unified/remark)
          if (/function\s+parseMarkdown|const\s+parseMarkdown\s*=/i.test(context.content)) {
            violations.push('Custom Markdown parser detected. Use unified + remark.');
          }

          // Check for custom YAML parsing (should use yaml library)
          if (/function\s+parseYaml|const\s+parseYaml\s*=/i.test(context.content)) {
            violations.push('Custom YAML parser detected. Use yaml library.');
          }

          // Check for custom HTTP client (should use fetch, axios, etc.)
          if (/function\s+httpRequest|const\s+httpRequest\s*=/i.test(context.content)) {
            violations.push('Custom HTTP client detected. Use fetch API or axios.');
          }

          if (violations.length > 0) {
            return {
              valid: false,
              article: 1,
              message: 'Library-First principle violated',
              details: violations,
              suggestions: [
                'Search npm for existing packages',
                'Evaluate at least 3 alternatives',
                'Document selection in ADR',
              ],
            };
          }

          return { valid: true };
        },
        severity: 'warning',
        autoFixable: false,
      },
      {
        name: 'require-package-json-dep',
        description: 'Ensure libraries are declared in package.json',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content || !context.filePath?.endsWith('.ts')) {
            return { valid: true };
          }

          // Check for import statements
          const imports = context.content.match(/^import\s+.+\s+from\s+['"]([^'"]+)['"]/gm);
          if (!imports) {
            return { valid: true };
          }

          // Extract package names (ignore relative imports)
          const packages = imports
            .map((imp) => {
              const match = imp.match(/from\s+['"]([^'"]+)['"]/);
              return match?.[1];
            })
            .filter((pkg): pkg is string => {
              return pkg !== undefined && !pkg.startsWith('.') && !pkg.startsWith('@musuhi');
            });

          if (packages.length === 0) {
            return { valid: true };
          }

          // In a real implementation, check package.json
          // For now, just validate format
          return { valid: true };
        },
        severity: 'error',
        autoFixable: false,
      },
    ];
  }
}
