/**
 * EARS Requirements Validator
 * Validates requirements follow EARS format
 * @module @musuhi-ng/core/validators
 */

import type { EARSPattern, EARSRequirement, EARSValidation } from '../types/ears.js';

/**
 * EARS Format Validator
 * Validates that requirements follow EARS patterns
 */
export class EARSValidator {
  /**
   * EARS pattern regular expressions
   */
  private static readonly PATTERNS: Record<EARSPattern, RegExp> = {
    'event-driven': /^WHEN\s+.+,\s+the\s+\S+\s+SHALL\s+.+$/i,
    'state-driven': /^WHILE\s+.+,\s+the\s+\S+\s+SHALL\s+.+$/i,
    'unwanted-behavior': /^IF\s+.+,\s+THEN\s+the\s+\S+\s+SHALL\s+.+$/i,
    optional: /^WHERE\s+.+,\s+the\s+\S+\s+SHALL\s+.+$/i,
    ubiquitous: /^The\s+\S+\s+SHALL\s+.+$/i,
  };

  /**
   * Validate a requirement statement
   */
  static validate(statement: string): EARSValidation {
    const trimmed = statement.trim();
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if it matches any EARS pattern
    let matchedPattern: EARSPattern | undefined;

    for (const [pattern, regex] of Object.entries(this.PATTERNS)) {
      if (regex.test(trimmed)) {
        matchedPattern = pattern as EARSPattern;
        break;
      }
    }

    if (!matchedPattern) {
      errors.push('Statement does not match any EARS pattern');
      errors.push(
        'Valid patterns: WHEN/WHILE/IF-THEN/WHERE [condition], the [system] SHALL [response]'
      );
      errors.push('Or: The [system] SHALL [requirement]');

      return {
        valid: false,
        errors,
      };
    }

    // Pattern-specific validation
    switch (matchedPattern) {
      case 'event-driven':
        if (!trimmed.includes(',')) {
          errors.push('Event-driven pattern requires comma after WHEN clause');
        }
        break;

      case 'state-driven':
        if (!trimmed.includes(',')) {
          errors.push('State-driven pattern requires comma after WHILE clause');
        }
        break;

      case 'unwanted-behavior':
        if (!trimmed.includes('IF')) {
          errors.push('Unwanted behavior pattern requires IF keyword');
        }
        if (!trimmed.includes('THEN')) {
          errors.push('Unwanted behavior pattern requires THEN keyword');
        }
        break;

      case 'optional':
        if (!trimmed.includes(',')) {
          errors.push('Optional pattern requires comma after WHERE clause');
        }
        break;
    }

    // Check for SHALL keyword
    if (!/ SHALL /i.test(trimmed)) {
      errors.push('EARS requirement must contain SHALL keyword');
    }

    // Check for "the [system]" pattern
    if (!/the\s+\S+\s+SHALL/i.test(trimmed)) {
      warnings.push('Consider using "the [system] SHALL" pattern for clarity');
    }

    // Check statement is not too vague
    if (trimmed.split(' ').length < 5) {
      warnings.push('Requirement may be too vague - consider adding more detail');
    }

    // Check statement is not too long
    if (trimmed.length > 300) {
      warnings.push('Requirement may be too long - consider splitting into multiple requirements');
    }

    return {
      valid: errors.length === 0,
      pattern: matchedPattern,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Validate an EARS requirement object
   */
  static validateRequirement(requirement: EARSRequirement): EARSValidation {
    const validation = this.validate(requirement.statement);

    // Additional checks for requirement object
    if (validation.pattern && validation.pattern !== requirement.pattern) {
      return {
        valid: false,
        pattern: validation.pattern,
        errors: [
          `Pattern mismatch: requirement declares '${requirement.pattern}' but statement matches '${validation.pattern}'`,
        ],
      };
    }

    return validation;
  }

  /**
   * Extract pattern from statement
   */
  static detectPattern(statement: string): EARSPattern | undefined {
    for (const [pattern, regex] of Object.entries(this.PATTERNS)) {
      if (regex.test(statement.trim())) {
        return pattern as EARSPattern;
      }
    }
    return undefined;
  }

  /**
   * Check if statement is valid EARS format
   */
  static isValid(statement: string): boolean {
    return this.validate(statement).valid;
  }

  /**
   * Get all supported patterns
   */
  static getSupportedPatterns(): EARSPattern[] {
    return Object.keys(this.PATTERNS) as EARSPattern[];
  }

  /**
   * Get pattern description
   */
  static getPatternDescription(pattern: EARSPattern): string {
    const descriptions: Record<EARSPattern, string> = {
      'event-driven': 'WHEN [event], the [system] SHALL [response]',
      'state-driven': 'WHILE [state], the [system] SHALL [response]',
      'unwanted-behavior': 'IF [error], THEN the [system] SHALL [response]',
      optional: 'WHERE [feature enabled], the [system] SHALL [response]',
      ubiquitous: 'The [system] SHALL [requirement]',
    };

    return descriptions[pattern];
  }

  /**
   * Suggest corrections for invalid statement
   */
  static suggestCorrections(statement: string): string[] {
    const suggestions: string[] = [];
    const trimmed = statement.trim();

    // Check if it's missing SHALL
    if (!/ SHALL /i.test(trimmed)) {
      suggestions.push('Add SHALL keyword: "the [system] SHALL [action]"');
    }

    // Check if it starts with a condition word
    const startsWithCondition = /^(WHEN|WHILE|IF|WHERE|The)\s+/i.test(trimmed);
    if (!startsWithCondition) {
      suggestions.push('Start with WHEN, WHILE, IF, WHERE, or "The [system]"');
    }

    // Check if it has "the [system]"
    if (!/the\s+\S+\s+/i.test(trimmed)) {
      suggestions.push('Include "the [system name]" to identify what is being specified');
    }

    // Suggest patterns based on content
    if (/when|occurs|happens|triggers/i.test(trimmed)) {
      suggestions.push('Consider event-driven pattern: WHEN [event], the [system] SHALL...');
    }

    if (/while|during|as long as/i.test(trimmed)) {
      suggestions.push('Consider state-driven pattern: WHILE [state], the [system] SHALL...');
    }

    if (/if|error|fail|invalid/i.test(trimmed)) {
      suggestions.push(
        'Consider unwanted behavior pattern: IF [error], THEN the [system] SHALL...'
      );
    }

    if (/optional|feature|enabled|disabled/i.test(trimmed)) {
      suggestions.push('Consider optional pattern: WHERE [feature], the [system] SHALL...');
    }

    if (suggestions.length === 0) {
      suggestions.push('Review EARS patterns and choose the most appropriate one');
      suggestions.push('Ensure the requirement is testable and unambiguous');
    }

    return suggestions;
  }
}
