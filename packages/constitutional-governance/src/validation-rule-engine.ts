/**
 * Validation Rule Engine
 * Executes validation rules and aggregates results
 * @module @musuhi/constitutional-governance
 */

import type {
  ValidationRule,
  ValidationContext,
  ValidationResult,
  Article,
} from '@musuhi/core';

/**
 * Aggregated validation result for multiple rules
 */
export interface AggregatedValidationResult {
  /** Overall validation status */
  valid: boolean;

  /** Article being validated */
  article: Article;

  /** Total rules executed */
  totalRules: number;

  /** Number of passing rules */
  passingRules: number;

  /** Number of failing rules */
  failingRules: number;

  /** Individual rule results */
  results: ValidationResult[];

  /** All errors */
  errors: ValidationResult[];

  /** All warnings */
  warnings: ValidationResult[];

  /** All info messages */
  infos: ValidationResult[];

  /** Auto-fix available */
  autoFixAvailable: boolean;

  /** Combined auto-fix content */
  autoFixContent?: string;
}

/**
 * Validation Rule Engine
 * Executes validation rules for constitutional articles
 */
export class ValidationRuleEngine {
  /**
   * Execute a single validation rule
   */
  async executeRule(
    rule: ValidationRule,
    context: ValidationContext
  ): Promise<ValidationResult> {
    try {
      return await rule.validator(context);
    } catch (error) {
      // If rule execution fails, return error result
      return {
        valid: false,
        message: `Rule execution failed: ${rule.name}`,
        details: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Execute multiple validation rules and aggregate results
   */
  async executeRules(
    rules: ValidationRule[],
    context: ValidationContext,
    article: Article
  ): Promise<AggregatedValidationResult> {
    // Execute all rules in parallel
    const results = await Promise.all(
      rules.map((rule) => this.executeRule(rule, context))
    );

    // Categorize results by severity
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    const infos: ValidationResult[] = [];

    let failingRules = 0;
    let autoFixAvailable = false;
    const autoFixContents: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i]!;
      const rule = rules[i]!;

      if (!result.valid) {
        failingRules++;

        // Categorize by severity
        if (rule.severity === 'error') {
          errors.push(result);
        } else if (rule.severity === 'warning') {
          warnings.push(result);
        } else {
          infos.push(result);
        }

        // Collect auto-fix content
        if (rule.autoFixable && result.autoFix) {
          autoFixAvailable = true;
          autoFixContents.push(result.autoFix);
        }
      }
    }

    const passingRules = rules.length - failingRules;

    return {
      valid: failingRules === 0,
      article,
      totalRules: rules.length,
      passingRules,
      failingRules,
      results,
      errors,
      warnings,
      infos,
      autoFixAvailable,
      autoFixContent: autoFixContents.length > 0 ? autoFixContents.join('\n') : undefined,
    };
  }

  /**
   * Execute rules with early termination on first error
   * Useful for strict mode validation
   */
  async executeRulesStrict(
    rules: ValidationRule[],
    context: ValidationContext,
    article: Article
  ): Promise<AggregatedValidationResult> {
    const results: ValidationResult[] = [];
    const errors: ValidationResult[] = [];
    const warnings: ValidationResult[] = [];
    const infos: ValidationResult[] = [];

    let failingRules = 0;
    let autoFixAvailable = false;
    const autoFixContents: string[] = [];

    for (let i = 0; i < rules.length; i++) {
      const rule = rules[i]!;
      const result = await this.executeRule(rule, context);
      results.push(result);

      if (!result.valid) {
        failingRules++;

        // Categorize by severity
        if (rule.severity === 'error') {
          errors.push(result);
          // Stop on first error in strict mode
          break;
        } else if (rule.severity === 'warning') {
          warnings.push(result);
        } else {
          infos.push(result);
        }

        // Collect auto-fix content
        if (rule.autoFixable && result.autoFix) {
          autoFixAvailable = true;
          autoFixContents.push(result.autoFix);
        }
      }
    }

    const passingRules = results.length - failingRules;

    return {
      valid: failingRules === 0,
      article,
      totalRules: rules.length,
      passingRules,
      failingRules,
      results,
      errors,
      warnings,
      infos,
      autoFixAvailable,
      autoFixContent: autoFixContents.length > 0 ? autoFixContents.join('\n') : undefined,
    };
  }

  /**
   * Validate if all rules have passed
   */
  isValid(result: AggregatedValidationResult): boolean {
    return result.valid && result.failingRules === 0;
  }

  /**
   * Check if result has errors
   */
  hasErrors(result: AggregatedValidationResult): boolean {
    return result.errors.length > 0;
  }

  /**
   * Check if result has warnings
   */
  hasWarnings(result: AggregatedValidationResult): boolean {
    return result.warnings.length > 0;
  }

  /**
   * Get summary message for aggregated result
   */
  getSummary(result: AggregatedValidationResult): string {
    if (result.valid) {
      return `All ${result.totalRules} rules passed for Article ${result.article}`;
    }

    const parts: string[] = [];
    if (result.errors.length > 0) {
      parts.push(`${result.errors.length} error(s)`);
    }
    if (result.warnings.length > 0) {
      parts.push(`${result.warnings.length} warning(s)`);
    }
    if (result.infos.length > 0) {
      parts.push(`${result.infos.length} info(s)`);
    }

    return `Article ${result.article}: ${result.failingRules}/${result.totalRules} rules failed (${parts.join(', ')})`;
  }
}
