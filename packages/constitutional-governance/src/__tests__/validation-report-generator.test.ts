/**
 * Validation Report Generator Tests
 * @module @musuhi-ng/constitutional-governance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ValidationReportGenerator } from '../validation-report-generator.js';
import type { AggregatedValidationResult } from '../validation-rule-engine.js';
import { Article } from '@musuhi-ng/core';

describe('ValidationReportGenerator', () => {
  let generator: ValidationReportGenerator;

  beforeEach(() => {
    generator = new ValidationReportGenerator();
  });

  const createMockResult = (overrides?: Partial<AggregatedValidationResult>): AggregatedValidationResult => {
    return {
      valid: true,
      article: Article.LibraryFirst,
      totalRules: 3,
      passingRules: 3,
      failingRules: 0,
      results: [],
      errors: [],
      warnings: [],
      infos: [],
      autoFixAvailable: false,
      ...overrides,
    };
  };

  describe('generateReport - Markdown format', () => {
    it('should generate markdown report for passing validation', () => {
      const result = createMockResult();

      const report = generator.generateReport(result, { format: 'markdown' });

      expect(report.format).toBe('markdown');
      expect(report.passed).toBe(true);
      expect(report.content).toContain('# Validation Report: Article 1');
      expect(report.content).toContain('✅ PASSED');
      expect(report.content).toContain('**Total Rules**: 3');
      expect(report.content).toContain('**Passing Rules**: 3');
    });

    it('should generate markdown report for failing validation with errors', () => {
      const result = createMockResult({
        valid: false,
        failingRules: 1,
        passingRules: 2,
        errors: [
          {
            valid: false,
            message: 'Test error message',
            details: ['Error detail 1', 'Error detail 2'],
          },
        ],
      });

      const report = generator.generateReport(result, { format: 'markdown' });

      expect(report.passed).toBe(false);
      expect(report.errorCount).toBe(1);
      expect(report.content).toContain('❌ FAILED');
      expect(report.content).toContain('## ❌ Errors');
      expect(report.content).toContain('Test error message');
      expect(report.content).toContain('Error detail 1');
    });

    it('should include warnings section', () => {
      const result = createMockResult({
        valid: false,
        failingRules: 1,
        warnings: [
          {
            valid: false,
            message: 'Test warning',
            details: ['Warning detail'],
          },
        ],
      });

      const report = generator.generateReport(result, { format: 'markdown' });

      expect(report.warningCount).toBe(1);
      expect(report.content).toContain('## ⚠️ Warnings');
      expect(report.content).toContain('Test warning');
    });

    it('should include suggestions section', () => {
      const result = createMockResult({
        valid: false,
        failingRules: 1,
        errors: [
          {
            valid: false,
            message: 'Error',
            suggestions: ['Suggestion 1', 'Suggestion 2'],
          },
        ],
      });

      const report = generator.generateReport(result, { format: 'markdown' });

      expect(report.content).toContain('## 💡 Suggestions');
      expect(report.content).toContain('Suggestion 1');
      expect(report.content).toContain('Suggestion 2');
    });

    it('should include auto-fix section when available', () => {
      const result = createMockResult({
        valid: false,
        failingRules: 1,
        autoFixAvailable: true,
        autoFixContent: 'Fixed code here',
        errors: [{ valid: false, message: 'Error' }],
      });

      const report = generator.generateReport(result, { format: 'markdown' });

      expect(report.content).toContain('## 🔧 Auto-Fix Available');
      expect(report.content).toContain('Fixed code here');
    });

    it('should respect includeSummary option', () => {
      const result = createMockResult();

      const report = generator.generateReport(result, {
        format: 'markdown',
        includeSummary: false,
      });

      expect(report.content).not.toContain('## Summary');
    });

    it('should respect includeDetails option', () => {
      const result = createMockResult({
        valid: false,
        errors: [{ valid: false, message: 'Error' }],
      });

      const report = generator.generateReport(result, {
        format: 'markdown',
        includeDetails: false,
      });

      expect(report.content).not.toContain('## ❌ Errors');
    });
  });

  describe('generateReport - JSON format', () => {
    it('should generate JSON report', () => {
      const result = createMockResult();

      const report = generator.generateReport(result, { format: 'json' });

      expect(report.format).toBe('json');
      expect(report.passed).toBe(true);

      const parsed = JSON.parse(report.content);
      expect(parsed.valid).toBe(true);
      expect(parsed.article).toBe(Article.LibraryFirst);
      expect(parsed.totalRules).toBe(3);
    });

    it('should include all result data in JSON', () => {
      const result = createMockResult({
        valid: false,
        errors: [{ valid: false, message: 'Error' }],
        warnings: [{ valid: false, message: 'Warning' }],
      });

      const report = generator.generateReport(result, { format: 'json' });

      const parsed = JSON.parse(report.content);
      expect(parsed.errors).toHaveLength(1);
      expect(parsed.warnings).toHaveLength(1);
    });
  });

  describe('generateReport - Console format', () => {
    it('should generate console report for passing validation', () => {
      const result = createMockResult();

      const report = generator.generateReport(result, { format: 'console' });

      expect(report.format).toBe('console');
      expect(report.passed).toBe(true);
      expect(report.content).toContain('Validation Report: Article 1');
      expect(report.content).toContain('PASSED');
    });

    it('should generate console report with errors', () => {
      const result = createMockResult({
        valid: false,
        failingRules: 1,
        errors: [{ valid: false, message: 'Console error' }],
      });

      const report = generator.generateReport(result, { format: 'console' });

      expect(report.content).toContain('❌ Errors:');
      expect(report.content).toContain('Console error');
    });

    it('should support color option', () => {
      const result = createMockResult();

      const reportWithColor = generator.generateReport(result, {
        format: 'console',
        useColor: true,
      });

      const reportWithoutColor = generator.generateReport(result, {
        format: 'console',
        useColor: false,
      });

      // With color should contain ANSI codes
      expect(reportWithColor.content).toContain('\x1b[');
      // Without color should not contain ANSI codes
      expect(reportWithoutColor.content).not.toContain('\x1b[');
    });

    it('should include info section in verbose mode', () => {
      const result = createMockResult({
        valid: false,
        infos: [{ valid: false, message: 'Info message' }],
      });

      const reportVerbose = generator.generateReport(result, {
        format: 'console',
        verbose: true,
      });

      const reportNonVerbose = generator.generateReport(result, {
        format: 'console',
        verbose: false,
      });

      expect(reportVerbose.content).toContain('ℹ️  Information:');
      expect(reportNonVerbose.content).not.toContain('ℹ️  Information:');
    });
  });

  describe('generateMultiReport', () => {
    it('should generate combined report for multiple results', () => {
      const results: AggregatedValidationResult[] = [
        createMockResult({ article: Article.LibraryFirst }),
        createMockResult({ article: Article.TestFirst }),
        createMockResult({
          article: Article.SecurityFirst,
          valid: false,
          errors: [{ valid: false, message: 'Error' }],
        }),
      ];

      const report = generator.generateMultiReport(results, { format: 'markdown' });

      expect(report.format).toBe('markdown');
      expect(report.passed).toBe(false); // One failed
      expect(report.errorCount).toBe(1);
      expect(report.content).toContain('Article 1');
      expect(report.content).toContain('Article 2');
      expect(report.content).toContain('Article 3');
    });

    it('should generate JSON multi-report with summary', () => {
      const results: AggregatedValidationResult[] = [
        createMockResult({ article: Article.LibraryFirst }),
        createMockResult({
          article: Article.TestFirst,
          valid: false,
          errors: [{ valid: false, message: 'Error' }],
          warnings: [{ valid: false, message: 'Warning' }],
        }),
      ];

      const report = generator.generateMultiReport(results, { format: 'json' });

      const parsed = JSON.parse(report.content);
      expect(parsed.summary).toBeDefined();
      expect(parsed.summary.passed).toBe(false);
      expect(parsed.summary.totalArticles).toBe(2);
      expect(parsed.summary.totalErrors).toBe(1);
      expect(parsed.summary.totalWarnings).toBe(1);
    });

    it('should count totals correctly across multiple reports', () => {
      const results: AggregatedValidationResult[] = [
        createMockResult({
          valid: false,
          errors: [{ valid: false }],
        }),
        createMockResult({
          valid: false,
          errors: [{ valid: false }],
          warnings: [{ valid: false }, { valid: false }],
        }),
        createMockResult({
          valid: false,
          infos: [{ valid: false }],
        }),
      ];

      const report = generator.generateMultiReport(results, { format: 'markdown' });

      expect(report.errorCount).toBe(2);
      expect(report.warningCount).toBe(2);
      expect(report.infoCount).toBe(1);
    });
  });
});
