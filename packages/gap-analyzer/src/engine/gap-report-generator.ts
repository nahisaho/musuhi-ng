/**
 * Gap Report Generator
 *
 * AC-5.8: Gap Report Format
 * Generates markdown gap analysis reports with comprehensive findings.
 *
 * @packageDocumentation
 */

import type { GapReport } from '../types/index.js';
import type { Recommendation} from './recommendation-engine.js';

/**
 * Gap Report Generator
 *
 * AC-5.8: Generates gap-report.md with:
 * - Summary
 * - Requirements Not Met (Missing Features)
 * - Undocumented Features
 * - Conflicts
 * - Breaking Changes
 * - Recommendations
 *
 * Creates comprehensive, human-readable gap analysis reports.
 */
export class GapReportGenerator {
  /**
   * Generate gap report in Markdown format
   *
   * AC-5.8: Main report generation logic
   * Produces structured markdown document with all gap findings.
   *
   * @param report - Gap analysis report data
   * @param recommendations - Optional recommendations to include
   * @returns Formatted markdown report
   */
  generate(report: GapReport, recommendations?: Recommendation[]): string {
    let markdown = '';

    // Header
    markdown += this.generateHeader(report);

    // Summary
    markdown += this.generateSummary(report);

    // Missing Features (AC-5.2)
    markdown += this.generateMissingFeatures(report);

    // Undocumented Features (AC-5.3)
    markdown += this.generateUndocumentedFeatures(report);

    // Conflicts (AC-5.4)
    markdown += this.generateConflicts(report);

    // Breaking Changes (AC-5.6)
    markdown += this.generateBreakingChanges(report);

    // Pattern Violations (AC-5.7)
    markdown += this.generatePatternViolations(report);

    // Recommendations (AC-5.5)
    if (recommendations) {
      markdown += this.generateRecommendations(recommendations);
    }

    // Footer
    markdown += this.generateFooter(report);

    return markdown;
  }

  /**
   * Generate report header
   *
   * @param report - Gap report data
   * @returns Markdown header
   */
  private generateHeader(report: GapReport): string {
    let markdown = '# Gap Analysis Report\n\n';

    markdown += `**Generated**: ${report.timestamp.toISOString()}\n`;
    markdown += `**Codebase**: ${report.codebasePath} (${report.linesOfCode.toLocaleString()} LOC)\n`;
    markdown += `**Requirements**: ${report.totalRequirements} AC`;

    if (report.requirementsPath) {
      markdown += ` (${report.requirementsPath})`;
    }

    markdown += `\n`;

    if (report.durationMs) {
      markdown += `**Analysis Duration**: ${(report.durationMs / 1000).toFixed(2)}s\n`;
    }

    markdown += `\n`;

    return markdown;
  }

  /**
   * Generate summary section
   *
   * AC-5.8: Summary with coverage metrics
   *
   * @param report - Gap report data
   * @returns Markdown summary
   */
  private generateSummary(report: GapReport): string {
    let markdown = '## Summary\n\n';

    markdown += `- **Coverage**: ${(report.coverage * 100).toFixed(1)}% (${Math.round((report.totalRequirements * report.coverage))}/${report.totalRequirements} requirements implemented)\n`;
    markdown += `- **Missing Features**: ${report.summary.missingFeatures}\n`;
    markdown += `- **Undocumented Features**: ${report.summary.undocumentedFeatures}\n`;
    markdown += `- **Conflicts**: ${report.summary.conflicts}\n`;
    markdown += `- **Breaking Changes**: ${report.summary.breakingChanges}\n`;
    markdown += `- **Pattern Violations**: ${report.summary.patternViolations}\n`;
    markdown += `- **Total Gaps**: ${report.summary.total}\n\n`;

    // Coverage indicator
    if (report.coverage >= 0.9) {
      markdown += `✅ **Excellent coverage** (>90%)\n\n`;
    } else if (report.coverage >= 0.7) {
      markdown += `⚠️ **Good coverage** (70-90%)\n\n`;
    } else if (report.coverage >= 0.5) {
      markdown += `⚠️ **Moderate coverage** (50-70%)\n\n`;
    } else {
      markdown += `❌ **Low coverage** (<50%) - Significant gaps detected\n\n`;
    }

    return markdown;
  }

  /**
   * Generate missing features section
   *
   * AC-5.8: Requirements Not Met
   *
   * @param report - Gap report data
   * @returns Markdown section
   */
  private generateMissingFeatures(report: GapReport): string {
    const missingFeatures = report.gaps.filter((g) => g.type === 'missing-feature');

    if (missingFeatures.length === 0) {
      return `## Missing Features (0)\n\n✅ All requirements are implemented.\n\n`;
    }

    let markdown = `## Missing Features (${missingFeatures.length})\n\n`;
    markdown += `| Requirement | Feature | Recommendation | Severity |\n`;
    markdown += `|-------------|---------|----------------|----------|\n`;

    for (const gap of missingFeatures) {
      const feature = gap.description.replace(` (NOT FOUND in codebase)`, '');
      markdown += `| ${gap.requirement || 'N/A'} | ${feature} | ${gap.recommendation} | ${gap.severity} |\n`;
    }

    markdown += `\n`;

    return markdown;
  }

  /**
   * Generate undocumented features section
   *
   * AC-5.8: Undocumented Features
   *
   * @param report - Gap report data
   * @returns Markdown section
   */
  private generateUndocumentedFeatures(report: GapReport): string {
    const undocumented = report.gaps.filter((g) => g.type === 'undocumented-feature');

    if (undocumented.length === 0) {
      return `## Undocumented Features (0)\n\n✅ All code has corresponding requirements.\n\n`;
    }

    let markdown = `## Undocumented Features (${undocumented.length})\n\n`;
    markdown += `| File | Recommendation |\n`;
    markdown += `|------|----------------|\n`;

    for (const gap of undocumented) {
      const file = gap.file || 'Unknown';
      markdown += `| ${file} | ${gap.recommendation} |\n`;
    }

    markdown += `\n`;

    return markdown;
  }

  /**
   * Generate conflicts section
   *
   * AC-5.8: Conflicts
   *
   * @param report - Gap report data
   * @returns Markdown section
   */
  private generateConflicts(report: GapReport): string {
    const conflicts = report.gaps.filter((g) => g.type === 'conflict');

    if (conflicts.length === 0) {
      return `## Conflicts (0)\n\n✅ No conflicts detected.\n\n`;
    }

    let markdown = `## Conflicts (${conflicts.length})\n\n`;
    markdown += `| Requirement | Conflict | Resolution | Severity |\n`;
    markdown += `|-------------|----------|------------|----------|\n`;

    for (const gap of conflicts) {
      markdown += `| ${gap.requirement || 'N/A'} | ${gap.description} | ${gap.recommendation} | ${gap.severity} |\n`;
    }

    markdown += `\n`;

    return markdown;
  }

  /**
   * Generate breaking changes section
   *
   * AC-5.8: Breaking Changes
   *
   * @param report - Gap report data
   * @returns Markdown section
   */
  private generateBreakingChanges(report: GapReport): string {
    const breakingChanges = report.gaps.filter((g) => g.type === 'breaking-change');

    if (breakingChanges.length === 0) {
      return `## Breaking Changes (0)\n\n✅ No breaking changes detected.\n\n`;
    }

    let markdown = `## Breaking Changes (${breakingChanges.length})\n\n`;
    markdown += `| Requirement | Impact | Migration Strategy |\n`;
    markdown += `|-------------|--------|--------------------|\n`;

    for (const gap of breakingChanges) {
      markdown += `| ${gap.requirement || 'N/A'} | ${gap.description} | ${gap.recommendation} |\n`;
    }

    markdown += `\n`;

    // Add detailed breaking change information if available
    if (report.breakingChanges && report.breakingChanges.length > 0) {
      markdown += `### Detailed Breaking Change Analysis\n\n`;

      for (const bc of report.breakingChanges) {
        markdown += `#### ${bc.requirement}: ${bc.affected}\n\n`;
        markdown += `**Type**: ${bc.changeType}\n\n`;
        markdown += `**Description**: ${bc.description}\n\n`;
        markdown += `**Migration Strategy**:\n${bc.migrationStrategy}\n\n`;
        markdown += `**Version Impact**: ${bc.versionImpact.toUpperCase()}\n\n`;
        markdown += `---\n\n`;
      }
    }

    return markdown;
  }

  /**
   * Generate pattern violations section
   *
   * AC-5.8: Pattern Violations
   *
   * @param report - Gap report data
   * @returns Markdown section
   */
  private generatePatternViolations(report: GapReport): string {
    const violations = report.gaps.filter((g) => g.type === 'pattern-violation');

    if (violations.length === 0) {
      return `## Pattern Violations (0)\n\n✅ All requirements comply with architectural patterns.\n\n`;
    }

    let markdown = `## Pattern Violations (${violations.length})\n\n`;
    markdown += `| Requirement | Violation | Recommendation | Severity |\n`;
    markdown += `|-------------|-----------|----------------|----------|\n`;

    for (const gap of violations) {
      markdown += `| ${gap.requirement || 'N/A'} | ${gap.description} | ${gap.recommendation} | ${gap.severity} |\n`;
    }

    markdown += `\n`;

    return markdown;
  }

  /**
   * Generate recommendations section
   *
   * AC-5.8: Recommendations
   *
   * @param recommendations - Recommendations from engine
   * @returns Markdown section
   */
  private generateRecommendations(recommendations: Recommendation[]): string {
    if (recommendations.length === 0) {
      return `## Recommendations (0)\n\n✅ No gaps to address.\n\n`;
    }

    let markdown = `## Recommendations (${recommendations.length})\n\n`;

    // Group by type
    const byType = new Map<string, Recommendation[]>();
    for (const rec of recommendations) {
      const existing = byType.get(rec.type) || [];
      existing.push(rec);
      byType.set(rec.type, existing);
    }

    // Generate section for each type
    byType.forEach((recs, type) => {
      markdown += `### ${type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ')} (${recs.length})\n\n`;

      for (const rec of recs) {
        markdown += `- **${rec.description}**\n`;
        markdown += `  - Priority: ${rec.priority}\n`;
        markdown += `  - Rationale: ${rec.rationale}\n`;

        if (rec.estimatedEffort) {
          markdown += `  - Estimated Effort: ${rec.estimatedEffort} hours (${(rec.estimatedEffort / 8).toFixed(1)} days)\n`;
        }

        markdown += `\n`;
      }
    });

    // Add summary
    const totalEffort = recommendations.reduce((sum, rec) => sum + (rec.estimatedEffort || 0), 0);
    markdown += `### Summary\n\n`;
    markdown += `- **Total Recommendations**: ${recommendations.length}\n`;
    markdown += `- **Total Estimated Effort**: ${totalEffort} hours (${(totalEffort / 8).toFixed(1)} days)\n\n`;

    return markdown;
  }

  /**
   * Generate report footer
   *
   * @param _report - Gap report data (future use for statistics)
   * @returns Markdown footer
   */
  private generateFooter(_report: GapReport): string {
    let markdown = '---\n\n';
    markdown += '**Next Steps**:\n\n';
    markdown += '1. Review all gaps and prioritize by severity\n';
    markdown += '2. Address critical and high-priority gaps first\n';
    markdown += '3. Plan breaking changes migration if needed\n';
    markdown += '4. Update requirements or code to resolve conflicts\n';
    markdown += '5. Re-run gap analysis after changes to verify coverage\n\n';

    markdown += '*Report generated by MUSUHI 2.0 Gap Analyzer*\n';

    return markdown;
  }

  /**
   * Generate JSON format report
   *
   * Alternative to markdown for programmatic consumption
   *
   * @param report - Gap report data
   * @param recommendations - Optional recommendations
   * @returns JSON string
   */
  generateJSON(report: GapReport, recommendations?: Recommendation[]): string {
    const jsonReport = {
      ...report,
      recommendations: recommendations || [],
      timestamp: report.timestamp.toISOString(),
    };

    return JSON.stringify(jsonReport, null, 2);
  }

  /**
   * Generate HTML format report
   *
   * Alternative to markdown for web viewing
   *
   * @param report - Gap report data
   * @param recommendations - Optional recommendations
   * @returns HTML string
   */
  generateHTML(report: GapReport, recommendations?: Recommendation[]): string {
    const markdown = this.generate(report, recommendations);

    // Simple markdown to HTML conversion
    // In production, use a proper markdown library like marked
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Gap Analysis Report</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .critical { color: #d32f2f; }
    .high { color: #f57c00; }
    .medium { color: #fbc02d; }
    .low { color: #388e3c; }
  </style>
</head>
<body>
${markdown.replace(/\n/g, '<br>')}
</body>
</html>`;

    return html;
  }
}
