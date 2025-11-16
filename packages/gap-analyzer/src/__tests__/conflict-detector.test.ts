/**
 * Tests for ConflictDetector
 *
 * AC-5.4: Conflict Detection
 * WHEN gap analyzer runs,
 * System SHALL detect requirements that conflict with existing patterns.
 *
 * @packageDocumentation
 */

import { describe, it, expect } from 'vitest';
import { ConflictDetector } from '../detectors/conflict-detector.js';
import type { Requirement, CodebaseMetadata } from '../types/index.js';

describe('ConflictDetector - AC-5.4', () => {
  let detector: ConflictDetector;

  beforeEach(() => {
    detector = new ConflictDetector();
  });

  describe('AC-5.4.1: Detect requirement conflicts', () => {
    it('should detect directory pattern conflicts', () => {
      // Arrange: Requirement expects "specs/" but codebase uses "requirements/"
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Requirements in specs/ directory',
          description: 'Requirements shall be in specs/ directory',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['specs', 'directory'],
          expectedFiles: ['specs/requirements.md'],
          featureNumber: 1,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [
          {
            name: 'Requirements documentation',
            pattern: 'requirements',
            matchesSteering: false,
          },
        ],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      expect(gaps.length).toBeGreaterThan(0);
      const conflictGap = gaps.find(
        (g) => g.requirement === 'AC-1.1' && g.type === 'conflict'
      );
      expect(conflictGap).toBeDefined();
      expect(conflictGap?.description).toContain('specs/');
      expect(conflictGap?.description).toContain('requirements/');
    });

    it('should detect technology stack conflicts', () => {
      // Arrange: Requirement expects Jest but codebase uses Vitest
      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'Jest Testing Framework',
          description: 'System shall use Jest for testing',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['jest', 'testing'],
          featureNumber: 2,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest', // Conflict: requirement wants Jest
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      const conflictGap = gaps.find(
        (g) => g.requirement === 'AC-2.1' && g.type === 'conflict'
      );
      expect(conflictGap).toBeDefined();
      expect(conflictGap?.description).toMatch(/jest.*vitest/i);
    });

    it('should detect architectural pattern conflicts', () => {
      // Arrange: Requirement expects layered architecture but codebase uses feature-based
      const requirements: Requirement[] = [
        {
          id: 'AC-3.1',
          feature: 'Layered Architecture',
          description: 'System shall use layered architecture (controllers/, services/, repositories/)',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['layered', 'architecture', 'controllers', 'services'],
          featureNumber: 3,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [
          {
            name: 'Feature-based organization',
            pattern: 'features',
            matchesSteering: false,
          },
        ],
        architecturalPatterns: [
          'Feature-Based Architecture',
        ],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      const conflictGap = gaps.find(
        (g) => g.requirement === 'AC-3.1' && g.type === 'conflict'
      );
      expect(conflictGap).toBeDefined();
      expect(conflictGap?.description).toMatch(/layered.*feature-based/i);
    });

    it('should NOT detect conflicts when patterns match', () => {
      // Arrange: Requirement matches existing patterns
      const requirements: Requirement[] = [
        {
          id: 'AC-4.1',
          feature: 'TypeScript Usage',
          description: 'System shall use TypeScript',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['typescript'],
          featureNumber: 4,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true, // Matches requirement
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      const conflictGap = gaps.find((g) => g.requirement === 'AC-4.1');
      expect(conflictGap).toBeUndefined();
    });
  });

  describe('AC-5.4.2: Suggest correct reconciliation', () => {
    it('should suggest updating requirement for directory conflicts', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Requirements in specs/',
          description: 'Requirements shall be in specs/ directory',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['specs', 'directory'],
          expectedFiles: ['specs/requirements.md'],
          featureNumber: 1,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [
          {
            name: 'Requirements documentation',
            pattern: 'requirements',
            matchesSteering: false,
          },
        ],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      const conflictGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(conflictGap?.recommendation).toMatch(
        /update.*requirement|align.*codebase/i
      );
    });

    it('should suggest technology migration for framework conflicts', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'Jest Testing',
          description: 'System shall use Jest',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['jest'],
          featureNumber: 2,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      const conflictGap = gaps.find((g) => g.requirement === 'AC-2.1');
      expect(conflictGap?.recommendation).toMatch(
        /migrate|update requirement|refactor/i
      );
    });

    it('should set appropriate severity based on conflict impact', () => {
      // Arrange: P0 requirement with conflict should have high severity
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Critical Architecture',
          description: 'System shall use specific architecture',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['architecture'],
          featureNumber: 1,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [],
        architecturalPatterns: [
          'Different Architecture',
        ],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      const conflictGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(conflictGap?.severity).toMatch(/high|critical/i);
    });
  });

  describe('AC-5.4.3: Edge cases', () => {
    it('should handle empty requirements', () => {
      // Arrange
      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect([], metadata);

      // Assert
      expect(gaps).toHaveLength(0);
    });

    it('should handle requirements without expectedFiles', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Generic Feature',
          description: 'Some feature',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['generic'],
          // No expectedFiles
          featureNumber: 1,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [],
        architecturalPatterns: [],
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      // Should not throw error, might or might not detect conflicts
      expect(gaps).toBeDefined();
    });

    it('should handle metadata with empty patterns', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Feature',
          description: 'Some feature',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['feature'],
          featureNumber: 1,
        },
      ];

      const metadata: CodebaseMetadata = {
        rootPath: '/project',
        primaryLanguage: 'typescript',
        linesOfCode: 10000,
        fileCount: 50,
        fileTypes: new Map([['ts', 50]]),
        directoryPatterns: [], // Empty
        architecturalPatterns: [], // Empty
        dependencies: [],
        usesTypeScript: true,
        usesTests: true,
        testFramework: 'vitest',
        buildTool: 'vite',
      };

      // Act
      const gaps = detector.detect(requirements, metadata);

      // Assert
      expect(gaps).toBeDefined();
    });
  });
});
