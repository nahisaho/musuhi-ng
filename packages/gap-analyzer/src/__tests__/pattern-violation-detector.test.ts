/**
 * Tests for PatternViolationDetector
 *
 * AC-5.7: Pattern Violation Detection
 * WHEN gap analyzer runs,
 * System SHALL check requirements against steering/structure.md patterns.
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { PatternViolationDetector } from '../detectors/pattern-violation-detector.js';
import type { Requirement } from '../types/index.js';

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

describe('PatternViolationDetector - AC-5.7', () => {
  let detector: PatternViolationDetector;

  beforeEach(() => {
    detector = new PatternViolationDetector();
    vi.clearAllMocks();
  });

  describe('AC-5.7.1: Detect pattern violations', () => {
    it('should detect directory structure violations', async () => {
      // Arrange: Steering defines structure, requirement violates it
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Directory Organization
        - \`src/features/\` - Feature-based organization
        - \`src/shared/\` - Shared utilities
        - All features must be in \`features/\` directory

        ## Coding Standards
        - Use TypeScript for all source files
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Add Components Directory',
          description: 'Create src/components/ for UI components',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['components', 'directory', 'ui'],
          expectedFiles: ['src/components/Button.tsx'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find(
        (g) => g.requirement === 'AC-1.1' && g.type === 'pattern-violation'
      );
      expect(violationGap).toBeDefined();
      expect(violationGap?.description).toMatch(/components.*features/i);
    });

    it('should detect naming convention violations', async () => {
      // Arrange: Steering defines naming conventions
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Naming Conventions
        - Components: PascalCase (e.g., UserProfile.tsx)
        - Hooks: camelCase with "use" prefix (e.g., useAuth.ts)
        - Files: kebab-case for non-component files
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'Add user_profile Component',
          description: 'Create user_profile.tsx component',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['user', 'profile', 'component'],
          expectedFiles: ['src/user_profile.tsx'], // snake_case violation
          featureNumber: 2,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-2.1');
      expect(violationGap).toBeDefined();
      expect(violationGap?.description).toMatch(/naming.*pascalcase/i);
    });

    it('should detect architectural pattern violations', async () => {
      // Arrange: Steering defines layered architecture
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Architecture
        - **Pattern**: Layered Architecture
        - **Layers**: Presentation, Business, Data Access
        - **Rule**: Business logic must be in services/, not in components/
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-3.1',
          feature: 'Add Business Logic in Component',
          description: 'UserComponent shall handle authentication logic',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['component', 'authentication', 'logic'],
          featureNumber: 3,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-3.1');
      expect(violationGap).toBeDefined();
      expect(violationGap?.description).toMatch(/business.*service/i);
    });

    it('should detect technology stack violations', async () => {
      // Arrange: Steering defines approved technologies
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Technology Stack
        - **Testing**: Vitest only (no Jest)
        - **State Management**: Zustand (no Redux)
        - **Build Tool**: Vite
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-4.1',
          feature: 'Add Jest Tests',
          description: 'System shall use Jest for unit tests',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['jest', 'tests', 'unit'],
          featureNumber: 4,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-4.1');
      expect(violationGap).toBeDefined();
      expect(violationGap?.description).toMatch(/vitest.*jest/i);
    });

    it('should NOT detect violations when requirements align with steering', async () => {
      // Arrange: Requirement matches steering patterns
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Directory Organization
        - \`src/features/\` - Feature-based organization
        - All features must be in \`features/\` directory
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-5.1',
          feature: 'Add User Feature',
          description: 'Create user feature in features/ directory',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['user', 'feature', 'features'],
          expectedFiles: ['src/features/user/index.ts'],
          featureNumber: 5,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-5.1');
      expect(violationGap).toBeUndefined();
    });
  });

  describe('AC-5.7.2: Integrate with steering/structure.md', () => {
    it('should read steering/structure.md file', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure
        Test content
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Test',
          description: 'Test',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['test'],
          featureNumber: 1,
        },
      ];

      // Act
      await detector.detect(requirements, '/project/steering');

      // Assert
      expect(readFile).toHaveBeenCalledWith(
        expect.stringContaining('structure.md'),
        'utf-8'
      );
    });

    it('should handle missing steering file gracefully', async () => {
      // Arrange: File read fails
      vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Test',
          description: 'Test',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['test'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      // Should not throw, returns empty or minimal gaps
      expect(gaps).toBeDefined();
    });

    it('should parse steering patterns from markdown', async () => {
      // Arrange: Complex steering document
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Directory Organization
        - \`packages/*/src\` - Source code
        - \`packages/*/dist\` - Build output

        ## Naming Conventions
        - **Files**: kebab-case
        - **Classes**: PascalCase

        ## Architecture Patterns
        - Feature-based modules
        - Dependency injection
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Add MyClass',
          description: 'Create my-class.ts file',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['myclass', 'file'],
          expectedFiles: ['packages/core/src/my-class.ts'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      // Should correctly parse and apply patterns
      expect(gaps).toBeDefined();
    });
  });

  describe('AC-5.7.3: Suggest compliance recommendations', () => {
    it('should suggest aligning with steering patterns', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Directory Organization
        - \`src/features/\` - Feature-based organization
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Add Components',
          description: 'Create components/ directory',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['components'],
          expectedFiles: ['src/components/Button.tsx'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(violationGap?.recommendation).toMatch(
        /align.*steering|follow.*pattern|update.*requirement/i
      );
    });

    it('should reference specific steering patterns in recommendations', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Naming Conventions
        - Components must use PascalCase
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'Add user_button',
          description: 'Create user_button.tsx',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['user', 'button'],
          expectedFiles: ['src/user_button.tsx'],
          featureNumber: 2,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-2.1');
      expect(violationGap?.recommendation).toContain('PascalCase');
    });

    it('should set appropriate severity for pattern violations', async () => {
      // Arrange: P0 requirement violating critical pattern
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Critical Patterns
        - All code must follow feature-based structure
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Violate Structure',
          description: 'Add code outside features/',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['code', 'outside'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      const violationGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(violationGap?.severity).toMatch(/high|critical/i);
    });
  });

  describe('AC-5.7.4: Edge cases', () => {
    it('should handle empty requirements', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure
        Content
      `);

      // Act
      const gaps = await detector.detect([], '/project/steering');

      // Assert
      expect(gaps).toHaveLength(0);
    });

    it('should handle empty steering file', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue('');

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Test',
          description: 'Test',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['test'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      // No violations when no patterns defined
      expect(gaps).toHaveLength(0);
    });

    it('should handle requirements without expectedFiles', async () => {
      // Arrange
      vi.mocked(readFile).mockResolvedValue(`
        # Project Structure

        ## Patterns
        - Feature-based organization
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Abstract Requirement',
          description: 'General requirement without files',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['abstract'],
          // No expectedFiles
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = await detector.detect(requirements, '/project/steering');

      // Assert
      // Should not throw error
      expect(gaps).toBeDefined();
    });

    it('should handle malformed steering markdown', async () => {
      // Arrange: Invalid markdown structure
      vi.mocked(readFile).mockResolvedValue(`
        Random text without structure
        ### Inconsistent headers
        - Bullet without context
      `);

      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Test',
          description: 'Test',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['test'],
          featureNumber: 1,
        },
      ];

      // Act & Assert
      await expect(
        detector.detect(requirements, '/project/steering')
      ).resolves.toBeDefined();
    });
  });
});
