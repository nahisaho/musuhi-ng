/**
 * Tests for UndocumentedFeatureDetector
 *
 * AC-5.3: Undocumented Features Detection
 * WHEN gap analyzer runs,
 * System SHALL detect code features with no corresponding requirements.
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Project } from 'ts-morph';
import { UndocumentedFeatureDetector } from '../detectors/undocumented-feature-detector.js';
import { ASTParser } from '../parsers/ast-parser.js';
import type { Requirement } from '../types/index.js';

describe('UndocumentedFeatureDetector - AC-5.3', () => {
  let detector: UndocumentedFeatureDetector;
  let astParser: ASTParser;

  beforeEach(() => {
    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 99,
        module: 99,
      },
    });

    astParser = new ASTParser('/test-project', project);
    detector = new UndocumentedFeatureDetector(astParser);
  });

  describe('AC-5.3.1: Detect code with no requirements', () => {
    it('should detect undocumented features when code exists but no requirement matches', () => {
      // Arrange: Create code with no matching requirement
      astParser.getProject().createSourceFile(
        '/src/undocumented-feature.ts',
        `
        export class UndocumentedFeature {
          doSomething() {
            return 'not documented';
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
      expect(gaps.length).toBeGreaterThan(0);
      const undocumentedGap = gaps.find((g) =>
        g.file?.includes('undocumented-feature.ts')
      );
      expect(undocumentedGap).toBeDefined();
      expect(undocumentedGap?.type).toBe('undocumented-feature');
    });

    it('should NOT detect documented features when requirement exists', () => {
      // Arrange: Create code with matching requirement
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
          keywords: ['constitution', 'file', 'parser'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const constitutionGap = gaps.find((g) =>
        g.file?.includes('constitution-parser.ts')
      );
      expect(constitutionGap).toBeUndefined();
    });

    it('should detect multiple undocumented features', () => {
      // Arrange: Create multiple undocumented files
      astParser.getProject().createSourceFile(
        '/src/feature-a.ts',
        `
        export function featureA() {
          return 'A';
        }
        `
      );

      astParser.getProject().createSourceFile(
        '/src/feature-b.ts',
        `
        export function featureB() {
          return 'B';
        }
        `
      );

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Other Feature',
          description: 'Different feature',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['other', 'different'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      expect(gaps.length).toBeGreaterThanOrEqual(2);
      const featureAGap = gaps.find((g) => g.file?.includes('feature-a.ts'));
      const featureBGap = gaps.find((g) => g.file?.includes('feature-b.ts'));
      expect(featureAGap).toBeDefined();
      expect(featureBGap).toBeDefined();
    });
  });

  describe('AC-5.3.2: Handle edge cases (tests, configs)', () => {
    it('should exclude test files from undocumented features', () => {
      // Arrange: Create test file
      astParser.getProject().createSourceFile(
        '/src/feature.test.ts',
        `
        describe('Feature', () => {
          it('should work', () => {
            expect(true).toBe(true);
          });
        });
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const testGap = gaps.find((g) => g.file?.includes('.test.ts'));
      expect(testGap).toBeUndefined();
    });

    it('should exclude spec files from undocumented features', () => {
      // Arrange: Create spec file
      astParser.getProject().createSourceFile(
        '/src/feature.spec.ts',
        `
        describe('Feature', () => {
          it('should work', () => {
            expect(true).toBe(true);
          });
        });
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const specGap = gaps.find((g) => g.file?.includes('.spec.ts'));
      expect(specGap).toBeUndefined();
    });

    it('should exclude config files from undocumented features', () => {
      // Arrange: Create config file
      astParser.getProject().createSourceFile(
        '/vite.config.ts',
        `
        export default {
          test: {
            globals: true
          }
        };
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const configGap = gaps.find((g) => g.file?.includes('config.ts'));
      expect(configGap).toBeUndefined();
    });

    it('should exclude type definition files from undocumented features', () => {
      // Arrange: Create type definition file
      astParser.getProject().createSourceFile(
        '/src/types.ts',
        `
        export interface User {
          id: string;
          name: string;
        }
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const typesGap = gaps.find((g) => g.file?.includes('types.ts'));
      expect(typesGap).toBeUndefined();
    });

    it('should exclude index.ts exports-only files', () => {
      // Arrange: Create index file with only exports
      astParser.getProject().createSourceFile(
        '/src/index.ts',
        `
        export { FeatureA } from './feature-a.js';
        export { FeatureB } from './feature-b.js';
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const indexGap = gaps.find((g) => g.file?.includes('index.ts'));
      expect(indexGap).toBeUndefined();
    });
  });

  describe('AC-5.3.3: Return correct gap objects', () => {
    it('should return gaps with correct structure', () => {
      // Arrange
      astParser.getProject().createSourceFile(
        '/src/undocumented.ts',
        `
        export class Undocumented {
          method() {
            return 'undocumented';
          }
        }
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const gap = gaps.find((g) => g.file?.includes('undocumented.ts'));
      expect(gap).toBeDefined();
      expect(gap).toMatchObject({
        type: 'undocumented-feature',
        file: expect.stringContaining('undocumented.ts'),
        description: expect.any(String),
        recommendation: expect.any(String),
        severity: expect.any(String),
      });
      expect(gap?.requirement).toBeUndefined(); // No requirement for undocumented
    });

    it('should include exported symbols in description', () => {
      // Arrange
      astParser.getProject().createSourceFile(
        '/src/feature.ts',
        `
        export class MyFeature {
          myMethod() {
            return 'test';
          }
        }

        export function myFunction() {
          return 'test';
        }
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const gap = gaps.find((g) => g.file?.includes('feature.ts'));
      expect(gap?.description).toContain('MyFeature');
      expect(gap?.description).toContain('myFunction');
    });

    it('should set appropriate severity for undocumented features', () => {
      // Arrange
      astParser.getProject().createSourceFile(
        '/src/undocumented.ts',
        `
        export class Undocumented {}
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const gap = gaps.find((g) => g.file?.includes('undocumented.ts'));
      expect(gap?.severity).toBe('medium'); // Default severity for undocumented
    });

    it('should include actionable recommendations', () => {
      // Arrange
      astParser.getProject().createSourceFile(
        '/src/undocumented.ts',
        `
        export class Undocumented {}
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      const gap = gaps.find((g) => g.file?.includes('undocumented.ts'));
      expect(gap?.recommendation).toMatch(
        /add.*requirement|document.*feature|remove.*unused/i
      );
    });
  });

  describe('AC-5.3.4: Edge cases', () => {
    it('should handle empty codebase', () => {
      // Act
      const gaps = detector.detect([]);

      // Assert
      expect(gaps).toHaveLength(0);
    });

    it('should handle files with no exports', () => {
      // Arrange: File with no exports
      astParser.getProject().createSourceFile(
        '/src/internal.ts',
        `
        function internalFunction() {
          return 'internal';
        }

        const value = 42;
        `
      );

      const requirements: Requirement[] = [];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      // Files with no exports are typically internal/utility files
      // They might still be flagged as undocumented
      const gap = gaps.find((g) => g.file?.includes('internal.ts'));
      if (gap) {
        expect(gap.severity).toBe('medium');
      }
    });

    it('should match requirements with partial keyword matches', () => {
      // Arrange: File that partially matches requirement keywords
      astParser.getProject().createSourceFile(
        '/src/constitution-helper.ts',
        `
        export class ConstitutionHelper {
          help() {
            return 'help';
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
          keywords: ['constitution'], // Partial match
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements);

      // Assert
      // Should NOT flag as undocumented because 'constitution' keyword matches
      const constitutionGap = gaps.find((g) =>
        g.file?.includes('constitution-helper.ts')
      );
      expect(constitutionGap).toBeUndefined();
    });
  });
});
