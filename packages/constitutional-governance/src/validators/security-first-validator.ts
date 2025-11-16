/**
 * Article 3: Security-First Validator
 * Validates security best practices (OWASP Top 10)
 * @module @musuhi-ng/constitutional-governance/validators
 */

import type { ValidationContext, ValidationResult, ValidationRule } from '../types.js';

/**
 * Security-First Validation Rule
 * Checks for common security vulnerabilities
 */
export class SecurityFirstValidator {
  /**
   * Create validation rules for Article 3
   */
  static createRules(): ValidationRule[] {
    return [
      {
        name: 'no-eval',
        description: 'Prevent use of eval() and similar dangerous functions',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true };
          }

          const violations: string[] = [];

          // Check for eval()
          if (/\beval\s*\(/i.test(context.content)) {
            violations.push('eval() detected - potential code injection vulnerability');
          }

          // Check for Function constructor
          if (/new\s+Function\s*\(/i.test(context.content)) {
            violations.push('Function constructor detected - potential code injection');
          }

          if (violations.length > 0) {
            return {
              valid: false,
              article: 3,
              message: 'Security-First principle violated: Dangerous functions',
              details: violations,
              suggestions: [
                'Avoid eval() and Function constructor',
                'Use safer alternatives like JSON.parse()',
              ],
            };
          }

          return { valid: true };
        },
        severity: 'error',
        autoFixable: false,
      },
      {
        name: 'no-sql-injection',
        description: 'Prevent SQL injection vulnerabilities',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true };
          }

          const violations: string[] = [];

          // Check for string concatenation in SQL queries
          if (/(?:SELECT|INSERT|UPDATE|DELETE).*\+\s*['"`]/i.test(context.content)) {
            violations.push('SQL string concatenation detected - use parameterized queries');
          }

          // Check for template literals in SQL
          if (/(?:SELECT|INSERT|UPDATE|DELETE).*\$\{/i.test(context.content)) {
            violations.push('Template literals in SQL - use parameterized queries');
          }

          if (violations.length > 0) {
            return {
              valid: false,
              article: 3,
              message: 'Security-First principle violated: SQL injection risk',
              details: violations,
              suggestions: [
                'Use parameterized queries or prepared statements',
                'Never concatenate user input into SQL',
              ],
            };
          }

          return { valid: true };
        },
        severity: 'error',
        autoFixable: false,
      },
      {
        name: 'no-hardcoded-secrets',
        description: 'Prevent hardcoded secrets and credentials',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true };
          }

          const violations: string[] = [];

          // Check for common secret patterns
          const secretPatterns = [
            { pattern: /(?:password|passwd|pwd)\s*=\s*['"][^'"]+['"]/i, name: 'password' },
            { pattern: /(?:api[_-]?key)\s*=\s*['"][^'"]+['"]/i, name: 'API key' },
            { pattern: /(?:secret|token)\s*=\s*['"][^'"]+['"]/i, name: 'secret/token' },
            {
              pattern: /(?:private[_-]?key)\s*=\s*['"]-----BEGIN/i,
              name: 'private key',
            },
          ];

          for (const { pattern, name } of secretPatterns) {
            if (pattern.test(context.content)) {
              violations.push(`Hardcoded ${name} detected`);
            }
          }

          if (violations.length > 0) {
            return {
              valid: false,
              article: 3,
              message: 'Security-First principle violated: Hardcoded secrets',
              details: violations,
              suggestions: [
                'Use environment variables for secrets',
                'Use secret management tools (e.g., HashiCorp Vault)',
                'Never commit secrets to version control',
              ],
            };
          }

          return { valid: true };
        },
        severity: 'error',
        autoFixable: false,
      },
      {
        name: 'no-command-injection',
        description: 'Prevent command injection vulnerabilities',
        validator: async (context: ValidationContext): Promise<ValidationResult> => {
          if (!context.content) {
            return { valid: true };
          }

          const violations: string[] = [];

          // Check for shell command execution with user input
          if (/exec\s*\([^)]*\$\{|exec\s*\([^)]*\+/i.test(context.content)) {
            violations.push('Command execution with string interpolation detected');
          }

          if (/spawn\s*\([^)]*\$\{|spawn\s*\([^)]*\+/i.test(context.content)) {
            violations.push('Process spawn with string interpolation detected');
          }

          if (violations.length > 0) {
            return {
              valid: false,
              article: 3,
              message: 'Security-First principle violated: Command injection risk',
              details: violations,
              suggestions: [
                'Use array-based command arguments',
                'Sanitize and validate all user inputs',
                'Avoid shell: true in child_process',
              ],
            };
          }

          return { valid: true };
        },
        severity: 'error',
        autoFixable: false,
      },
    ];
  }
}
