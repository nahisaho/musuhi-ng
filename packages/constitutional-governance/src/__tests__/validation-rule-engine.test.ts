/**
 * Validation Rule Engine Tests
 * @module @musuhi/constitutional-governance
 */

import { describe, it, expect } from 'vitest';
import { ValidationRuleEngine } from '../validation-rule-engine.js';
import type { ValidationRule, ValidationContext, ValidationResult } from '@musuhi/core';
import { Article } from '@musuhi/core';

describe('ValidationRuleEngine', () => {
  let engine: ValidationRuleEngine;

  beforeEach(() => {
    engine = new ValidationRuleEngine();
  });

  describe('executeRule', () => {
    it('should execute a passing rule', async () => {
      const passingRule: ValidationRule = {
        name: 'test-rule',
        description: 'Test rule',
        severity: 'error',
        validator: async () => ({ valid: true }),
      };

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRule(passingRule, context);

      expect(result.valid).toBe(true);
    });

    it('should execute a failing rule', async () => {
      const failingRule: ValidationRule = {
        name: 'test-rule',
        description: 'Test rule',
        severity: 'error',
        validator: async () => ({
          valid: false,
          message: 'Validation failed',
        }),
      };

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRule(failingRule, context);

      expect(result.valid).toBe(false);
      expect(result.message).toBe('Validation failed');
    });

    it('should handle rule execution errors', async () => {
      const errorRule: ValidationRule = {
        name: 'error-rule',
        description: 'Rule that throws error',
        severity: 'error',
        validator: async () => {
          throw new Error('Rule execution failed');
        },
      };

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRule(errorRule, context);

      expect(result.valid).toBe(false);
      expect(result.message).toContain('Rule execution failed');
      expect(result.details).toBeDefined();
    });
  });

  describe('executeRules', () => {
    it('should execute multiple rules and aggregate results', async () => {
      const rules: ValidationRule[] = [
        {
          name: 'rule-1',
          description: 'Passing rule',
          severity: 'error',
          validator: async () => ({ valid: true }),
        },
        {
          name: 'rule-2',
          description: 'Failing rule',
          severity: 'warning',
          validator: async () => ({
            valid: false,
            message: 'Warning message',
          }),
        },
        {
          name: 'rule-3',
          description: 'Another passing rule',
          severity: 'info',
          validator: async () => ({ valid: true }),
        },
      ];

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRules(rules, context, Article.LibraryFirst);

      expect(result.totalRules).toBe(3);
      expect(result.passingRules).toBe(2);
      expect(result.failingRules).toBe(1);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(0);
      expect(result.warnings.length).toBe(1);
      expect(result.infos.length).toBe(0);
    });

    it('should categorize results by severity', async () => {
      const rules: ValidationRule[] = [
        {
          name: 'error-rule',
          description: 'Error rule',
          severity: 'error',
          validator: async () => ({
            valid: false,
            message: 'Error',
          }),
        },
        {
          name: 'warning-rule',
          description: 'Warning rule',
          severity: 'warning',
          validator: async () => ({
            valid: false,
            message: 'Warning',
          }),
        },
        {
          name: 'info-rule',
          description: 'Info rule',
          severity: 'info',
          validator: async () => ({
            valid: false,
            message: 'Info',
          }),
        },
      ];

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRules(rules, context, Article.TestFirst);

      expect(result.errors.length).toBe(1);
      expect(result.warnings.length).toBe(1);
      expect(result.infos.length).toBe(1);
      expect(result.failingRules).toBe(3);
    });

    it('should collect auto-fix content', async () => {
      const rules: ValidationRule[] = [
        {
          name: 'fixable-rule',
          description: 'Rule with auto-fix',
          severity: 'error',
          autoFixable: true,
          validator: async () => ({
            valid: false,
            message: 'Fix available',
            autoFix: 'Fixed content',
          }),
        },
      ];

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRules(rules, context, Article.SecurityFirst);

      expect(result.autoFixAvailable).toBe(true);
      expect(result.autoFixContent).toBe('Fixed content');
    });

    it('should return valid result when all rules pass', async () => {
      const rules: ValidationRule[] = [
        {
          name: 'rule-1',
          description: 'Passing rule 1',
          severity: 'error',
          validator: async () => ({ valid: true }),
        },
        {
          name: 'rule-2',
          description: 'Passing rule 2',
          severity: 'error',
          validator: async () => ({ valid: true }),
        },
      ];

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRules(rules, context, Article.DocumentationFirst);

      expect(result.valid).toBe(true);
      expect(result.failingRules).toBe(0);
      expect(result.passingRules).toBe(2);
    });
  });

  describe('executeRulesStrict', () => {
    it('should stop on first error in strict mode', async () => {
      const rules: ValidationRule[] = [
        {
          name: 'rule-1',
          description: 'Failing error rule',
          severity: 'error',
          validator: async () => ({
            valid: false,
            message: 'Error',
          }),
        },
        {
          name: 'rule-2',
          description: 'Should not execute',
          severity: 'error',
          validator: async () => ({ valid: true }),
        },
      ];

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRulesStrict(rules, context, Article.SimplicityFirst);

      expect(result.valid).toBe(false);
      expect(result.failingRules).toBe(1);
      expect(result.results.length).toBe(1); // Only first rule executed
    });

    it('should continue after warnings in strict mode', async () => {
      const rules: ValidationRule[] = [
        {
          name: 'rule-1',
          description: 'Failing warning rule',
          severity: 'warning',
          validator: async () => ({
            valid: false,
            message: 'Warning',
          }),
        },
        {
          name: 'rule-2',
          description: 'Should execute',
          severity: 'error',
          validator: async () => ({ valid: true }),
        },
      ];

      const context: ValidationContext = {
        projectRoot: '/test',
      };

      const result = await engine.executeRulesStrict(
        rules,
        context,
        Article.PerformanceFirst
      );

      expect(result.results.length).toBe(2); // Both rules executed
      expect(result.warnings.length).toBe(1);
    });
  });

  describe('utility methods', () => {
    it('isValid should return true for valid result', () => {
      const result = {
        valid: true,
        article: Article.AccessibilityFirst,
        totalRules: 2,
        passingRules: 2,
        failingRules: 0,
        results: [],
        errors: [],
        warnings: [],
        infos: [],
        autoFixAvailable: false,
      };

      expect(engine.isValid(result)).toBe(true);
    });

    it('hasErrors should detect errors', () => {
      const result = {
        valid: false,
        article: Article.PrivacyFirst,
        totalRules: 1,
        passingRules: 0,
        failingRules: 1,
        results: [],
        errors: [{ valid: false, message: 'Error' }],
        warnings: [],
        infos: [],
        autoFixAvailable: false,
      };

      expect(engine.hasErrors(result)).toBe(true);
    });

    it('hasWarnings should detect warnings', () => {
      const result = {
        valid: false,
        article: Article.IntegrationFirst,
        totalRules: 1,
        passingRules: 0,
        failingRules: 1,
        results: [],
        errors: [],
        warnings: [{ valid: false, message: 'Warning' }],
        infos: [],
        autoFixAvailable: false,
      };

      expect(engine.hasWarnings(result)).toBe(true);
    });

    it('getSummary should generate correct summary for passing result', () => {
      const result = {
        valid: true,
        article: Article.LibraryFirst,
        totalRules: 5,
        passingRules: 5,
        failingRules: 0,
        results: [],
        errors: [],
        warnings: [],
        infos: [],
        autoFixAvailable: false,
      };

      const summary = engine.getSummary(result);

      expect(summary).toContain('All 5 rules passed');
      expect(summary).toContain('Article 1');
    });

    it('getSummary should generate correct summary for failing result', () => {
      const result = {
        valid: false,
        article: Article.TestFirst,
        totalRules: 5,
        passingRules: 2,
        failingRules: 3,
        results: [],
        errors: [{ valid: false, message: 'Error 1' }],
        warnings: [{ valid: false, message: 'Warning 1' }],
        infos: [{ valid: false, message: 'Info 1' }],
        autoFixAvailable: false,
      };

      const summary = engine.getSummary(result);

      expect(summary).toContain('3/5 rules failed');
      expect(summary).toContain('1 error(s)');
      expect(summary).toContain('1 warning(s)');
      expect(summary).toContain('1 info(s)');
    });
  });
});
