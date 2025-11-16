/**
 * Tests for MissingFeatureDetector
 *
 * AC-5.2: Missing Features Detection
 * WHEN gap analyzer runs,
 * System SHALL detect requirements with no implementation in codebase.
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { MissingFeatureDetector } from '../detectors/missing-feature-detector.js';
import { ASTParser } from '../parsers/ast-parser.js';
import type { Requirement } from '../types/index.js';

describe('MissingFeatureDetector - AC-5.2', () => {
  let detector: MissingFeatureDetector;
  let astParser: ASTParser;

  beforeEach(() => {
    // Create temporary in-memory project for testing
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 99, // ESNext
        module: 99, // ESNext
      },
    });

    astParser = new ASTParser('/test-project', project);
    detector = new MissingFeatureDetector(astParser);
  });

  describe('AC-5.2.1: Detect requirements with no implementation', () => {
    it('should detect missing features when no matching code exists', () => {
      // Arrange: Create a simple file with unrelated content
      astParser.getProject().createSourceFile(
        '/src/unrelated.ts',
        `
        export function unrelatedFunction() {
          return 'unrelated';
        }
        `
      );

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Constitution File',
          description: 'System shall support constitution file',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['constitution', 'file'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(1);
      expect(gaps[0]).toMatchObject({
        type: 'missing-feature',
        requirement: 'AC-1.1',
        description: expect.stringContaining('Constitution File'),
        severity: 'critical', // P0 = critical
      });
    });

    it('should NOT detect missing features when implementation exists', () => {
      // Arrange: Create file with matching keywords
      astParser.getProject().createSourceFile(
        '/src/constitution-parser.ts',
        `
        export class ConstitutionParser {
          parseConstitutionFile(content: string) {
            return { constitution: content };
          }
        }
        `
      );

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Constitution File',
          description: 'System shall support constitution file',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['constitution', 'file'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(0);
    });

    it('should detect multiple missing features', () => {
      // Arrange: Create file with only one feature
      astParser.getProject().createSourceFile(
        '/src/ears-parser.ts',
        `
        export function parseEARS(text: string) {
          return { ears: text };
        }
        `
      );

      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'EARS Parser',
          description: 'Parse EARS patterns',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['ears', 'parser'],
          featureNumber: 2,
        },
        {
          id: 'AC-3.1',
          feature: 'Steering Validator',
          description: 'Validate steering files',
          pattern: 'ubiquitous',
          priority: 'P1',
          keywords: ['steering', 'validator'],
          featureNumber: 3,
        },
        {
          id: 'AC-4.1',
          feature: 'API Generator',
          description: 'Generate API from spec',
          pattern: 'ubiquitous',
          priority: 'P2',
          keywords: ['api', 'generator'],
          featureNumber: 4,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(2); // AC-3.1 and AC-4.1 missing
      expect(gaps.map((g) => g.requirement)).toContain('AC-3.1');
      expect(gaps.map((g) => g.requirement)).toContain('AC-4.1');
      expect(gaps.map((g) => g.requirement)).not.toContain('AC-2.1'); // implemented
    });
  });

  describe('AC-5.2.2: Return correct gap objects', () => {
    it('should return gaps with correct structure', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Constitution File',
          description: 'System shall support constitution file',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['constitution', 'file'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(1);
      expect(gaps[0]).toMatchObject({
        type: 'missing-feature',
        requirement: 'AC-1.1',
        description: expect.any(String),
        recommendation: expect.any(String),
        severity: expect.any(String),
      });
      expect(gaps[0].file).toBeUndefined(); // No file for missing features
    });

    it('should set correct severity based on priority', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'P0 Feature',
          description: 'High priority',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['p0test'],
          featureNumber: 1,
        },
        {
          id: 'AC-4.1',
          feature: 'P1 Feature',
          description: 'Medium priority',
          pattern: 'ubiquitous',
          priority: 'P1',
          keywords: ['p1test'],
          featureNumber: 4,
        },
        {
          id: 'AC-7.1',
          feature: 'P2 Feature',
          description: 'Low priority',
          pattern: 'ubiquitous',
          priority: 'P2',
          keywords: ['p2test'],
          featureNumber: 7,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(3);
      const p0Gap = gaps.find((g) => g.requirement === 'AC-1.1');
      const p1Gap = gaps.find((g) => g.requirement === 'AC-4.1');
      const p2Gap = gaps.find((g) => g.requirement === 'AC-7.1');

      expect(p0Gap?.severity).toBe('critical');
      expect(p1Gap?.severity).toBe('high');
      expect(p2Gap?.severity).toBe('medium');
    });

    it('should include actionable recommendations', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Constitution File',
          description: 'System shall support constitution file',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['constitution', 'file'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps[0].recommendation).toContain('Implement');
      expect(gaps[0].recommendation).toContain('Constitution File');
    });
  });

  describe('AC-5.2.3: Edge cases', () => {
    it('should handle empty requirements list', () => {
      // Act
      const gaps = detector.detect([]);

      // Assert
      expect(gaps).toHaveLength(0);
    });

    it('should handle requirements with missing keywords', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Test Feature',
          description: 'Test description',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: [], // Empty keywords
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(1); // Should still detect as missing
    });

    it('should match keywords case-insensitively', () => {
      // Arrange: File with UPPERCASE keywords
      astParser.getProject().createSourceFile(
        '/src/CONSTITUTION-PARSER.ts',
        `
        export function PARSE_CONSTITUTION_FILE() {
          return {};
        }
        `
      );

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Constitution File',
          description: 'System shall support constitution file',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['constitution', 'file'], // lowercase
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps).toHaveLength(0); // Should find implementation
    });
  });
});
