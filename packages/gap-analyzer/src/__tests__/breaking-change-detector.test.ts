/**
 * Tests for BreakingChangeDetector
 *
 * AC-5.6: Breaking Change Detection
 * WHEN gap analyzer runs,
 * System SHALL flag breaking changes and suggest migration strategies.
 *
 * @packageDocumentation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BreakingChangeDetector } from '../detectors/breaking-change-detector.js';
import { PatternMatcher } from '../parsers/pattern-matcher.js';
import type { Requirement } from '../types/index.js';

describe('BreakingChangeDetector - AC-5.6', () => {
  let detector: BreakingChangeDetector;
  let patternMatcher: PatternMatcher;

  beforeEach(() => {
    patternMatcher = new PatternMatcher();
    detector = new BreakingChangeDetector(patternMatcher);
  });

  describe('AC-5.6.1: Detect breaking changes', () => {
    it('should detect interface changes as breaking', () => {
      // Arrange: Requirement changes existing interface
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Update User Interface',
          description: 'User interface shall include phoneNumber field',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['user', 'interface', 'phonenumber'],
          featureNumber: 1,
        },
      ];

      const codebaseText = `
        export interface User {
          id: string;
          name: string;
          email: string;
          // No phoneNumber field
        }

        export function getUser(id: string): User {
          return { id, name: 'Test', email: 'test@example.com' };
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find(
        (g) => g.requirement === 'AC-1.1' && g.type === 'breaking-change'
      );
      expect(breakingGap).toBeDefined();
      expect(breakingGap?.description).toMatch(/interface.*user/i);
    });

    it('should detect function signature changes as breaking', () => {
      // Arrange: Requirement changes function signature
      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'Update API Signature',
          description: 'createUser function shall accept options parameter',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['createuser', 'function', 'options'],
          featureNumber: 2,
        },
      ];

      const codebaseText = `
        export function createUser(name: string, email: string) {
          return { name, email };
        }

        // Current usage
        const user = createUser('John', 'john@example.com');
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find(
        (g) => g.requirement === 'AC-2.1' && g.type === 'breaking-change'
      );
      expect(breakingGap).toBeDefined();
      expect(breakingGap?.description).toMatch(/signature.*createuser/i);
    });

    it('should detect API endpoint removal as breaking', () => {
      // Arrange: Requirement removes existing endpoint
      const requirements: Requirement[] = [
        {
          id: 'AC-3.1',
          feature: 'Remove Legacy Endpoint',
          description: 'System shall remove /api/v1/legacy endpoint',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['remove', 'api', 'legacy', 'endpoint'],
          featureNumber: 3,
        },
      ];

      const codebaseText = `
        app.get('/api/v1/legacy', (req, res) => {
          res.json({ message: 'Legacy endpoint' });
        });

        // Used by multiple clients
        fetch('/api/v1/legacy');
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find(
        (g) => g.requirement === 'AC-3.1' && g.type === 'breaking-change'
      );
      expect(breakingGap).toBeDefined();
      expect(breakingGap?.description).toMatch(/remove.*endpoint/i);
    });

    it('should detect class/method renames as breaking', () => {
      // Arrange: Requirement renames existing class
      const requirements: Requirement[] = [
        {
          id: 'AC-4.1',
          feature: 'Rename UserService',
          description: 'UserService class shall be renamed to UserManager',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['rename', 'userservice', 'usermanager'],
          featureNumber: 4,
        },
      ];

      const codebaseText = `
        export class UserService {
          getUser(id: string) {
            return { id };
          }
        }

        // Used in multiple places
        const service = new UserService();
        service.getUser('123');
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find(
        (g) => g.requirement === 'AC-4.1' && g.type === 'breaking-change'
      );
      expect(breakingGap).toBeDefined();
      expect(breakingGap?.description).toMatch(/rename.*userservice/i);
    });

    it('should detect behavior changes as breaking', () => {
      // Arrange: Requirement changes function behavior
      const requirements: Requirement[] = [
        {
          id: 'AC-5.1',
          feature: 'Change Validation Logic',
          description: 'Email validation shall require corporate domain',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['email', 'validation', 'corporate', 'domain'],
          featureNumber: 5,
        },
      ];

      const codebaseText = `
        export function validateEmail(email: string): boolean {
          // Current: accepts any valid email format
          return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
        }

        // Used by signup form
        if (validateEmail(userEmail)) {
          createAccount(userEmail);
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find(
        (g) => g.requirement === 'AC-5.1' && g.type === 'breaking-change'
      );
      expect(breakingGap).toBeDefined();
      expect(breakingGap?.description).toMatch(/validation.*email/i);
    });

    it('should NOT detect additive changes as breaking', () => {
      // Arrange: Requirement adds new optional field
      const requirements: Requirement[] = [
        {
          id: 'AC-6.1',
          feature: 'Add Optional Avatar Field',
          description: 'User interface may include optional avatar field',
          pattern: 'optional',
          priority: 'P1',
          keywords: ['user', 'avatar', 'optional'],
          featureNumber: 6,
        },
      ];

      const codebaseText = `
        export interface User {
          id: string;
          name: string;
          email: string;
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find(
        (g) => g.requirement === 'AC-6.1' && g.type === 'breaking-change'
      );
      // Additive changes with optional pattern should not be breaking
      expect(breakingGap).toBeUndefined();
    });
  });

  describe('AC-5.6.2: Suggest migration strategies', () => {
    it('should suggest deprecation strategy for interface changes', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Update User Interface',
          description: 'User interface shall include phoneNumber field',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['user', 'interface', 'phonenumber'],
          featureNumber: 1,
        },
      ];

      const codebaseText = `
        export interface User {
          id: string;
          name: string;
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(breakingGap?.recommendation).toMatch(
        /deprecat|migration|backward.?compatible|version/i
      );
    });

    it('should suggest adapter pattern for signature changes', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-2.1',
          feature: 'Change Function Signature',
          description: 'createUser shall accept options object',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['createuser', 'options', 'object'],
          featureNumber: 2,
        },
      ];

      const codebaseText = `
        export function createUser(name: string, email: string) {
          return { name, email };
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-2.1');
      expect(breakingGap?.recommendation).toMatch(
        /overload|adapter|wrapper|migration/i
      );
    });

    it('should suggest versioning for API endpoint changes', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-3.1',
          feature: 'Remove Legacy Endpoint',
          description: 'System shall remove /api/v1/legacy endpoint',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['remove', 'endpoint', 'legacy'],
          featureNumber: 3,
        },
      ];

      const codebaseText = `
        app.get('/api/v1/legacy', (req, res) => {
          res.json({ data: 'legacy' });
        });
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-3.1');
      expect(breakingGap?.recommendation).toMatch(/version|deprecat|sunset/i);
    });

    it('should suggest gradual rollout for behavior changes', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-4.1',
          feature: 'Change Validation Behavior',
          description: 'Email validation shall be stricter',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['validation', 'email', 'stricter'],
          featureNumber: 4,
        },
      ];

      const codebaseText = `
        export function validateEmail(email: string): boolean {
          return /^[^\\s@]+@[^\\s@]+$/.test(email);
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-4.1');
      expect(breakingGap?.recommendation).toMatch(
        /gradual|feature.?flag|rollout|phased/i
      );
    });

    it('should include effort estimation in recommendations', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-5.1',
          feature: 'Major Refactoring',
          description: 'System shall refactor core architecture',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['refactor', 'architecture', 'core'],
          featureNumber: 5,
        },
      ];

      const codebaseText = `
        export class CoreSystem {
          process() {
            // Complex logic used everywhere
          }
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-5.1');
      expect(breakingGap?.recommendation).toBeDefined();
      // Migration strategy should mention planning/effort
      expect(breakingGap?.recommendation).toMatch(
        /plan|effort|migration|gradual/i
      );
    });
  });

  describe('AC-5.6.3: Severity assessment', () => {
    it('should assign critical severity to P0 breaking changes', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Critical Breaking Change',
          description: 'Remove core API',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['remove', 'core', 'api'],
          featureNumber: 1,
        },
      ];

      const codebaseText = `
        export function coreAPI() {
          // Used everywhere
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(breakingGap?.severity).toBe('critical');
    });

    it('should assign high severity to P1 breaking changes', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-4.1',
          feature: 'Important Breaking Change',
          description: 'Change important API',
          pattern: 'ubiquitous',
          priority: 'P1',
          keywords: ['change', 'important', 'api'],
          featureNumber: 4,
        },
      ];

      const codebaseText = `
        export function importantAPI() {
          // Used in some places
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      const breakingGap = gaps.find((g) => g.requirement === 'AC-4.1');
      expect(breakingGap?.severity).toBe('high');
    });
  });

  describe('AC-5.6.4: Edge cases', () => {
    it('should handle empty codebase', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'New Feature',
          description: 'Add new feature',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['new', 'feature'],
          featureNumber: 1,
        },
      ];

      // Act
      const gaps = detector.detect(requirements, '');

      // Assert
      expect(gaps).toHaveLength(0); // No breaking changes in empty codebase
    });

    it('should handle requirements without breaking keywords', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Add New Feature',
          description: 'Add completely new feature',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['add', 'new', 'feature'],
          featureNumber: 1,
        },
      ];

      const codebaseText = `
        export function existingFeature() {
          return 'existing';
        }
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      // "Add" keyword should not trigger breaking change detection
      expect(gaps).toHaveLength(0);
    });

    it('should handle requirements with multiple breaking patterns', () => {
      // Arrange
      const requirements: Requirement[] = [
        {
          id: 'AC-1.1',
          feature: 'Remove and Rename',
          description: 'Remove oldAPI and rename newAPI',
          pattern: 'ubiquitous',
          priority: 'P0',
          keywords: ['remove', 'rename', 'oldapi', 'newapi'],
          featureNumber: 1,
        },
      ];

      const codebaseText = `
        export function oldAPI() {}
        export function newAPI() {}
      `;

      // Act
      const gaps = detector.detect(requirements, codebaseText);

      // Assert
      // Should detect as breaking change
      const breakingGap = gaps.find((g) => g.requirement === 'AC-1.1');
      expect(breakingGap).toBeDefined();
      expect(breakingGap?.description).toMatch(/remove|rename/i);
    });
  });
});
