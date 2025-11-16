/**
 * Validation Report Generator
 * Generates human-readable reports from validation results
 * @module @musuhi/constitutional-governance
 */

import type { AggregatedValidationResult } from './validation-rule-engine.js';

/**
 * Report format types
 */
export type ReportFormat = 'markdown' | 'json' | 'console';

/**
 * Report generation options
 */
export interface ReportOptions {
  /** Report format */
  format: ReportFormat;

  /** Include summary section */
  includeSummary?: boolean;

  /** Include details section */
  includeDetails?: boolean;

  /** Include suggestions section */
  includeSuggestions?: boolean;

  /** Use color in console output */
  useColor?: boolean;

  /** Verbose output (include passing rules) */
  verbose?: boolean;
}

/**
 * Generated report
 */
export interface GeneratedReport {
  /** Report format */
  format: ReportFormat;

  /** Report content */
  content: string;

  /** Validation passed */
  passed: boolean;

  /** Error count */
  errorCount: number;

  /** Warning count */
  warningCount: number;

  /** Info count */
  infoCount: number;
}

/**
 * Validation Report Generator
 * Generates reports from validation results in multiple formats
 */
export class ValidationReportGenerator {
  /**
   * Generate report from aggregated validation result
   */
  generateReport(
    result: AggregatedValidationResult,
    options: ReportOptions
  ): GeneratedReport {
    const {
      format,
      includeSummary = true,
      includeDetails = true,
      includeSuggestions = true,
      useColor = true,
      verbose = false,
    } = options;

    let content = '';

    switch (format) {
      case 'markdown':
        content = this.generateMarkdownReport(
          result,
          includeSummary,
          includeDetails,
          includeSuggestions,
          verbose
        );
        break;
      case 'json':
        content = this.generateJsonReport(result);
        break;
      case 'console':
        content = this.generateConsoleReport(
          result,
          includeSummary,
          includeDetails,
          includeSuggestions,
          useColor,
          verbose
        );
        break;
    }

    return {
      format,
      content,
      passed: result.valid,
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      infoCount: result.infos.length,
    };
  }

  /**
   * Generate Markdown format report
   */
  private generateMarkdownReport(
    result: AggregatedValidationResult,
    includeSummary: boolean,
    includeDetails: boolean,
    includeSuggestions: boolean,
    verbose: boolean
  ): string {
    const sections: string[] = [];

    // Title
    sections.push(`# Validation Report: Article ${result.article}`);
    sections.push('');

    // Summary
    if (includeSummary) {
      sections.push('## Summary');
      sections.push('');
      sections.push(`- **Status**: ${result.valid ? '✅ PASSED' : '❌ FAILED'}`);
      sections.push(`- **Total Rules**: ${result.totalRules}`);
      sections.push(`- **Passing Rules**: ${result.passingRules}`);
      sections.push(`- **Failing Rules**: ${result.failingRules}`);
      sections.push(`- **Errors**: ${result.errors.length}`);
      sections.push(`- **Warnings**: ${result.warnings.length}`);
      sections.push(`- **Info**: ${result.infos.length}`);
      sections.push('');
    }

    // Details
    if (includeDetails) {
      if (result.errors.length > 0) {
        sections.push('## ❌ Errors');
        sections.push('');
        result.errors.forEach((error, index) => {
          sections.push(`### Error ${index + 1}`);
          sections.push('');
          if (error.message) {
            sections.push(`**Message**: ${error.message}`);
            sections.push('');
          }
          if (error.details && error.details.length > 0) {
            sections.push('**Details**:');
            error.details.forEach((detail) => {
              sections.push(`- ${detail}`);
            });
            sections.push('');
          }
        });
      }

      if (result.warnings.length > 0) {
        sections.push('## ⚠️ Warnings');
        sections.push('');
        result.warnings.forEach((warning, index) => {
          sections.push(`### Warning ${index + 1}`);
          sections.push('');
          if (warning.message) {
            sections.push(`**Message**: ${warning.message}`);
            sections.push('');
          }
          if (warning.details && warning.details.length > 0) {
            sections.push('**Details**:');
            warning.details.forEach((detail) => {
              sections.push(`- ${detail}`);
            });
            sections.push('');
          }
        });
      }

      if (verbose && result.infos.length > 0) {
        sections.push('## ℹ️ Information');
        sections.push('');
        result.infos.forEach((info, index) => {
          sections.push(`### Info ${index + 1}`);
          sections.push('');
          if (info.message) {
            sections.push(`**Message**: ${info.message}`);
            sections.push('');
          }
        });
      }
    }

    // Suggestions
    if (includeSuggestions) {
      const allSuggestions: string[] = [];
      [...result.errors, ...result.warnings, ...result.infos].forEach((r) => {
        if (r.suggestions && r.suggestions.length > 0) {
          allSuggestions.push(...r.suggestions);
        }
      });

      if (allSuggestions.length > 0) {
        sections.push('## 💡 Suggestions');
        sections.push('');
        allSuggestions.forEach((suggestion) => {
          sections.push(`- ${suggestion}`);
        });
        sections.push('');
      }

      if (result.autoFixAvailable && result.autoFixContent) {
        sections.push('## 🔧 Auto-Fix Available');
        sections.push('');
        sections.push('```');
        sections.push(result.autoFixContent);
        sections.push('```');
        sections.push('');
      }
    }

    return sections.join('\n');
  }

  /**
   * Generate JSON format report
   */
  private generateJsonReport(result: AggregatedValidationResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Generate Console format report
   */
  private generateConsoleReport(
    result: AggregatedValidationResult,
    includeSummary: boolean,
    includeDetails: boolean,
    includeSuggestions: boolean,
    useColor: boolean,
    verbose: boolean
  ): string {
    const lines: string[] = [];

    // ANSI color codes
    const colors = {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
    };

    const color = (text: string, colorCode: string): string => {
      return useColor ? `${colorCode}${text}${colors.reset}` : text;
    };

    // Title
    lines.push('');
    lines.push(color(`╔══════════════════════════════════════════════════════════╗`, colors.bold));
    lines.push(
      color(`║  Validation Report: Article ${result.article.toString().padEnd(24)} ║`, colors.bold)
    );
    lines.push(color(`╚══════════════════════════════════════════════════════════╝`, colors.bold));
    lines.push('');

    // Summary
    if (includeSummary) {
      const statusIcon = result.valid ? '✅' : '❌';
      const statusText = result.valid ? 'PASSED' : 'FAILED';
      const statusColor = result.valid ? colors.green : colors.red;

      lines.push(color('Summary:', colors.bold));
      lines.push(`  Status: ${color(`${statusIcon} ${statusText}`, statusColor)}`);
      lines.push(`  Total Rules: ${result.totalRules}`);
      lines.push(`  Passing: ${color(result.passingRules.toString(), colors.green)}`);
      lines.push(`  Failing: ${color(result.failingRules.toString(), colors.red)}`);
      lines.push(
        `  Errors: ${color(result.errors.length.toString(), colors.red)} | ` +
          `Warnings: ${color(result.warnings.length.toString(), colors.yellow)} | ` +
          `Info: ${color(result.infos.length.toString(), colors.blue)}`
      );
      lines.push('');
    }

    // Details
    if (includeDetails) {
      if (result.errors.length > 0) {
        lines.push(color('❌ Errors:', colors.red));
        result.errors.forEach((error, index) => {
          lines.push(color(`  [${index + 1}] ${error.message || 'Error'}`, colors.red));
          if (error.details && error.details.length > 0) {
            error.details.forEach((detail) => {
              lines.push(`      - ${detail}`);
            });
          }
        });
        lines.push('');
      }

      if (result.warnings.length > 0) {
        lines.push(color('⚠️  Warnings:', colors.yellow));
        result.warnings.forEach((warning, index) => {
          lines.push(color(`  [${index + 1}] ${warning.message || 'Warning'}`, colors.yellow));
          if (warning.details && warning.details.length > 0) {
            warning.details.forEach((detail) => {
              lines.push(`      - ${detail}`);
            });
          }
        });
        lines.push('');
      }

      if (verbose && result.infos.length > 0) {
        lines.push(color('ℹ️  Information:', colors.blue));
        result.infos.forEach((info, index) => {
          lines.push(color(`  [${index + 1}] ${info.message || 'Info'}`, colors.blue));
        });
        lines.push('');
      }
    }

    // Suggestions
    if (includeSuggestions) {
      const allSuggestions: string[] = [];
      [...result.errors, ...result.warnings, ...result.infos].forEach((r) => {
        if (r.suggestions && r.suggestions.length > 0) {
          allSuggestions.push(...r.suggestions);
        }
      });

      if (allSuggestions.length > 0) {
        lines.push(color('💡 Suggestions:', colors.cyan));
        allSuggestions.forEach((suggestion) => {
          lines.push(`  - ${suggestion}`);
        });
        lines.push('');
      }

      if (result.autoFixAvailable) {
        lines.push(color('🔧 Auto-Fix Available', colors.green));
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  /**
   * Generate report for multiple validation results
   */
  generateMultiReport(
    results: AggregatedValidationResult[],
    options: ReportOptions
  ): GeneratedReport {
    const reports = results.map((result) => this.generateReport(result, options));

    const totalErrors = reports.reduce((sum, r) => sum + r.errorCount, 0);
    const totalWarnings = reports.reduce((sum, r) => sum + r.warningCount, 0);
    const totalInfos = reports.reduce((sum, r) => sum + r.infoCount, 0);
    const allPassed = reports.every((r) => r.passed);

    let combinedContent = '';

    if (options.format === 'json') {
      combinedContent = JSON.stringify(
        {
          summary: {
            passed: allPassed,
            totalArticles: results.length,
            totalErrors,
            totalWarnings,
            totalInfos,
          },
          results,
        },
        null,
        2
      );
    } else {
      combinedContent = reports.map((r) => r.content).join('\n---\n\n');
    }

    return {
      format: options.format,
      content: combinedContent,
      passed: allPassed,
      errorCount: totalErrors,
      warningCount: totalWarnings,
      infoCount: totalInfos,
    };
  }
}
