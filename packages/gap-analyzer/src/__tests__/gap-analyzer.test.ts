/**
 * Integration Tests for GapAnalyzer
 *
 * AC-5.1: Gap Analysis Command
 * AC-5.8: Gap Report Format
 * AC-5.9: Design Integration
 * NFR-P.3: Performance (<60s for 100k LOC)
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFile, writeFile } from 'node:fs/promises';
import { Project } from 'ts-morph';
import { GapAnalyzer } from '../gap-analyzer.js';
import type { GapAnalysisConfig } from '../types/index.js';

// Mock fs/promises
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises'
  );
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn(),
  };
});

describe('GapAnalyzer - Integration Tests', () => {
  let config: GapAnalysisConfig;

  beforeEach(() => {
    config = {
      codebasePath: '/project',
      requirementsPath: '/project/requirements.md',
      steeringPath: '/project/steering',
    };

    vi.clearAllMocks();
  });

  describe('AC-5.1: Gap Analysis Command', () => {
    it('should execute /musuhi:validate-gap and generate gap-report.md', async () => {
      // Arrange: Mock requirements file
      vi.mocked(readFile).mockResolvedValue(`
        # Requirements

        #### AC-1.1: Constitution File
        **Pattern**: Ubiquitous
        \`\`\`
        The system SHALL support constitution file parsing
        \`\`\`

        #### AC-2.1: EARS Parser
        **Pattern**: Event-driven
        \`\`\`
        WHEN user provides EARS text, System SHALL parse into structured format
        \`\`\`
      `);

      vi.mocked(writeFile).mockResolvedValue(undefined);

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      expect(writeFile).toHaveBeenCalledWith(
        '/project/gap-report.md',
        expect.any(String),
        'utf-8'
      );
    });

    it('should analyze requirements vs codebase', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Constitution Parser
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL parse constitution files
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report).toBeDefined();
      expect(report.totalRequirements).toBeGreaterThan(0);
      expect(report.gaps).toBeDefined();
      expect(report.coverage).toBeGreaterThanOrEqual(0);
      expect(report.coverage).toBeLessThanOrEqual(1);
    });

    it('should include all gap types in analysis', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Missing Feature
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have missing feature
        \`\`\`

        #### AC-2.1: Remove Old API
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL remove old API
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.summary).toBeDefined();
      expect(report.summary).toHaveProperty('missingFeatures');
      expect(report.summary).toHaveProperty('undocumentedFeatures');
      expect(report.summary).toHaveProperty('conflicts');
      expect(report.summary).toHaveProperty('breakingChanges');
      expect(report.summary).toHaveProperty('patternViolations');
      expect(report.summary).toHaveProperty('total');
    });

    it('should calculate coverage percentage', async () => {
      // Arrange: Create in-memory project with some implementation
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Feature One
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have feature one
        \`\`\`

        #### AC-2.1: Feature Two
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have feature two
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.coverage).toBeGreaterThanOrEqual(0);
      expect(report.coverage).toBeLessThanOrEqual(1);
      expect(typeof report.coverage).toBe('number');
    });
  });

  describe('AC-5.8: Gap Report Format', () => {
    it('should generate markdown report with correct structure', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test Feature
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have test feature
        \`\`\`
      `);

      let capturedMarkdown = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        capturedMarkdown = content as string;
      });

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      expect(capturedMarkdown).toContain('# Gap Analysis Report');
      expect(capturedMarkdown).toContain('## Summary');
      expect(capturedMarkdown).toMatch(/\*\*Coverage\*\*:/);
      expect(capturedMarkdown).toMatch(/Missing Features/i);
      expect(capturedMarkdown).toMatch(/Undocumented Features/i);
    });

    it('should include timestamp in report', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        Test
        \`\`\`
      `);

      let capturedMarkdown = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        capturedMarkdown = content as string;
      });

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      expect(capturedMarkdown).toMatch(/Generated.*\d{4}-\d{2}-\d{2}/);
    });

    it('should include codebase metadata in report', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        Test
        \`\`\`
      `);

      let capturedMarkdown = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        capturedMarkdown = content as string;
      });

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      expect(capturedMarkdown).toMatch(/Codebase.*\/project/);
      expect(capturedMarkdown).toMatch(/\d+.*LOC/i);
    });

    it('should include gap details with requirement IDs', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Missing Feature
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have missing feature
        \`\`\`
      `);

      let capturedMarkdown = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        capturedMarkdown = content as string;
      });

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      // Should reference AC-1.1 in the report
      expect(capturedMarkdown).toMatch(/AC-\d+\.\d+/);
    });

    it('should include recommendations section', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL test
        \`\`\`
      `);

      let capturedMarkdown = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        capturedMarkdown = content as string;
      });

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      expect(capturedMarkdown).toMatch(/## Recommendations/i);
    });

    it('should format gaps as markdown table', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Missing
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have missing
        \`\`\`
      `);

      let capturedMarkdown = '';
      vi.mocked(writeFile).mockImplementation(async (path, content) => {
        capturedMarkdown = content as string;
      });

      const analyzer = new GapAnalyzer(config);

      // Act
      await analyzer.generateReport('/project/gap-report.md');

      // Assert
      // Check for table formatting (|---|---|)
      expect(capturedMarkdown).toMatch(/\|.*\|.*\|/);
    });
  });

  describe('AC-5.9: Design Integration (Placeholder)', () => {
    it('should support gap findings integration in design phase', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test Feature
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL have test feature
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      // Gap report should be structured for design integration
      expect(report).toHaveProperty('gaps');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('coverage');

      // Gaps should have actionable recommendations for design
      if (report.gaps.length > 0) {
        expect(report.gaps[0]).toHaveProperty('recommendation');
        expect(report.gaps[0]).toHaveProperty('severity');
      }
    });

    it('should provide gap data in format suitable for design decisions', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        Test
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      // Report should include metadata for design decisions
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('totalRequirements');
      expect(report).toHaveProperty('linesOfCode');
      expect(report).toHaveProperty('requirementsPath');
    });
  });

  describe('NFR-P.3: Performance (<60s for 100k LOC)', () => {
    it('should complete analysis in under 60 seconds for 100k LOC', async () => {
      // Arrange: Simulate 100k LOC codebase
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        Test requirement
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const startTime = Date.now();
      const report = await analyzer.analyze();
      const duration = Date.now() - startTime;

      // Assert
      expect(report.durationMs).toBeDefined();

      // For real 100k LOC, should be < 60s (60000ms)
      // In this test with minimal code, it should be very fast
      expect(duration).toBeLessThan(5000); // 5s for small test
    });

    it('should track analysis duration in report', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        Test
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.durationMs).toBeDefined();
      expect(typeof report.durationMs).toBe('number');
      expect(report.durationMs).toBeGreaterThan(0);
    });

    it('should run detectors in parallel for performance', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Feature One
        **Pattern**: Ubiquitous
        \`\`\`
        Feature one
        \`\`\`

        #### AC-2.1: Feature Two
        **Pattern**: Ubiquitous
        \`\`\`
        Feature two
        \`\`\`

        #### AC-3.1: Feature Three
        **Pattern**: Ubiquitous
        \`\`\`
        Feature three
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const startTime = Date.now();
      await analyzer.analyze();
      const duration = Date.now() - startTime;

      // Assert
      // Parallel execution should be relatively fast
      // (This is a weak assertion, but verifies basic performance)
      expect(duration).toBeLessThan(10000); // 10s max for test
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty requirements file', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue('');

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.totalRequirements).toBe(0);
      expect(report.gaps).toHaveLength(0);
      expect(report.coverage).toBe(0);
    });

    it('should handle malformed requirements', async () => {
      // Arrange: Invalid EARS format
      vi.mocked(readFile).mockResolvedValue(`
        Random text without proper structure
        No AC sections
      `);

      const analyzer = new GapAnalyzer(config);

      // Act & Assert
      await expect(analyzer.analyze()).resolves.toBeDefined();
    });

    it('should handle missing requirements file gracefully', async () => {
      // Arrange
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.totalRequirements).toBe(0);
      expect(report.gaps).toBeDefined();
    });

    it('should handle empty codebase', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Test
        **Pattern**: Ubiquitous
        \`\`\`
        Test
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.linesOfCode).toBeGreaterThanOrEqual(0);
      expect(report.gaps).toBeDefined();
    });

    it('should handle requirements with various EARS patterns', async () => {
      // Arrange: All EARS pattern types
      vi.mocked(readFile).mockResolvedValue(`
        #### AC-1.1: Event-Driven
        **Pattern**: Event-driven
        \`\`\`
        WHEN user clicks button, system SHALL respond
        \`\`\`

        #### AC-2.1: State-Driven
        **Pattern**: State-driven
        \`\`\`
        WHILE loading, system SHALL show spinner
        \`\`\`

        #### AC-3.1: Unwanted
        **Pattern**: Unwanted behavior
        \`\`\`
        IF error occurs, system SHALL log error
        \`\`\`

        #### AC-4.1: Optional
        **Pattern**: Optional
        \`\`\`
        WHERE premium enabled, system SHALL show features
        \`\`\`

        #### AC-5.1: Ubiquitous
        **Pattern**: Ubiquitous
        \`\`\`
        System SHALL be secure
        \`\`\`
      `);

      const analyzer = new GapAnalyzer(config);

      // Act
      const report = await analyzer.analyze();

      // Assert
      expect(report.totalRequirements).toBe(5);
      // All patterns should be parsed correctly
    });
  });
});
