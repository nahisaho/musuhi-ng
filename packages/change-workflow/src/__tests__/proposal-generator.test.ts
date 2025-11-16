/**
 * Proposal Generator Tests
 * @module @musuhi-ng/change-workflow
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { ProposalGenerator } from '../proposal-generator.js';
import type { ProposalSections } from '../proposal-generator.js';
import type { ChangeProposal } from '../types.js';

describe('ProposalGenerator', () => {
  let generator: ProposalGenerator;

  beforeEach(() => {
    generator = new ProposalGenerator();
  });

  const createMockProposal = (overrides?: Partial<ChangeProposal>): ChangeProposal => {
    return {
      name: 'add-user-authentication',
      description: 'Add JWT-based user authentication',
      author: 'Test User',
      createdDate: '2024-01-15',
      status: 'draft',
      ...overrides,
    };
  };

  describe('generateProposal', () => {
    it('should generate proposal with all sections', () => {
      const metadata = createMockProposal();
      const sections: ProposalSections = {
        summary: 'Implement JWT authentication',
        motivation: 'Users need secure authentication',
        design: 'Use JWT tokens with refresh mechanism',
        testing: 'Unit and integration tests',
        deployment: 'Deploy to staging first',
        rollback: 'Revert to previous version',
        relatedArticles: [2, 3, 8],
      };

      const result = generator.generateProposal(metadata, sections);

      expect(result.metadata).toEqual(metadata);
      expect(result.content).toContain('# Change Proposal: add-user-authentication');
      expect(result.content).toContain('**Author**: Test User');
      expect(result.content).toContain('**Created**: 2024-01-15');
      expect(result.content).toContain('🟡 Draft');
      expect(result.content).toContain('## Summary');
      expect(result.content).toContain('Implement JWT authentication');
      expect(result.content).toContain('## Motivation');
      expect(result.content).toContain('Users need secure authentication');
      expect(result.content).toContain('## Design');
      expect(result.content).toContain('Use JWT tokens with refresh mechanism');
      expect(result.content).toContain('## Testing Strategy');
      expect(result.content).toContain('## Deployment Plan');
      expect(result.content).toContain('## Rollback Plan');
    });

    it('should include related constitutional articles', () => {
      const metadata = createMockProposal();
      const sections: ProposalSections = {
        relatedArticles: [1, 2, 3],
      };

      const result = generator.generateProposal(metadata, sections);

      expect(result.content).toContain('## Related Constitutional Articles');
      expect(result.content).toContain('Article 1: Library-First Development');
      expect(result.content).toContain('Article 2: Test-First Development');
      expect(result.content).toContain('Article 3: Security-First Development');
    });

    it('should use description as summary if summary not provided', () => {
      const metadata = createMockProposal({
        description: 'Default summary from description',
      });
      const sections: ProposalSections = {};

      const result = generator.generateProposal(metadata, sections);

      expect(result.content).toContain('## Summary');
      expect(result.content).toContain('Default summary from description');
    });

    it('should include custom sections', () => {
      const metadata = createMockProposal();
      const sections: ProposalSections = {
        customSections: {
          'Performance Impact': 'Expected 10% improvement',
          'Security Considerations': 'All data encrypted',
        },
      };

      const result = generator.generateProposal(metadata, sections);

      expect(result.content).toContain('## Performance Impact');
      expect(result.content).toContain('Expected 10% improvement');
      expect(result.content).toContain('## Security Considerations');
      expect(result.content).toContain('All data encrypted');
    });

    it('should include checklist section', () => {
      const metadata = createMockProposal();
      const sections: ProposalSections = {};

      const result = generator.generateProposal(metadata, sections);

      expect(result.content).toContain('## Checklist');
      expect(result.content).toContain('- [ ] Design reviewed');
      expect(result.content).toContain('- [ ] Tests written');
      expect(result.content).toContain('- [ ] Documentation updated');
      expect(result.content).toContain('- [ ] Constitutional Articles compliance verified');
      expect(result.content).toContain('- [ ] Phase -1 Gate passed');
    });

    it('should show correct status badge', () => {
      const statuses: Array<ChangeProposal['status']> = ['draft', 'review', 'approved', 'archived'];
      const expectedBadges = ['🟡 Draft', '🔵 In Review', '🟢 Approved', '⚫ Archived'];

      statuses.forEach((status, index) => {
        const metadata = createMockProposal({ status });
        const result = generator.generateProposal(metadata, {});

        expect(result.content).toContain(expectedBadges[index]);
      });
    });
  });

  describe('parseProposalMetadata', () => {
    it('should parse proposal metadata from content', () => {
      const content = `# Change Proposal: test-feature

---

## Metadata

- **Name**: test-feature
- **Author**: John Doe
- **Created**: 2024-01-20
- **Status**: 🟡 Draft

## Summary

This is a test feature description.

## Motivation

Test motivation
`;

      const metadata = generator.parseProposalMetadata(content);

      expect(metadata).not.toBeNull();
      expect(metadata!.name).toBe('test-feature');
      expect(metadata!.author).toBe('John Doe');
      expect(metadata!.createdDate).toBe('2024-01-20');
      expect(metadata!.status).toBe('draft');
      expect(metadata!.description).toContain('This is a test feature description');
    });

    it('should parse different status values', () => {
      const statuses = [
        { text: '🔵 In Review', expected: 'review' },
        { text: '🟢 Approved', expected: 'approved' },
        { text: '⚫ Archived', expected: 'archived' },
      ];

      statuses.forEach(({ text, expected }) => {
        const content = `# Change Proposal: test
- **Author**: Test
- **Created**: 2024-01-01
- **Status**: ${text}`;

        const metadata = generator.parseProposalMetadata(content);
        expect(metadata!.status).toBe(expected);
      });
    });

    it('should return null for invalid content', () => {
      const invalidContent = 'This is not a valid proposal';

      const metadata = generator.parseProposalMetadata(invalidContent);

      expect(metadata).toBeNull();
    });
  });

  describe('updateProposalStatus', () => {
    it('should update proposal status', () => {
      const content = `# Change Proposal: test
- **Status**: 🟡 Draft

Some content
`;

      const updated = generator.updateProposalStatus(content, 'approved');

      expect(updated).toContain('**Status**: 🟢 Approved');
      expect(updated).not.toContain('🟡 Draft');
    });

    it('should preserve other content when updating status', () => {
      const content = `# Change Proposal: test
- **Name**: test
- **Status**: 🟡 Draft
- **Author**: Test

## Summary
Test summary
`;

      const updated = generator.updateProposalStatus(content, 'review');

      expect(updated).toContain('**Name**: test');
      expect(updated).toContain('**Author**: Test');
      expect(updated).toContain('## Summary');
      expect(updated).toContain('Test summary');
    });
  });

  describe('extractRelatedArticles', () => {
    it('should extract article numbers from content', () => {
      const content = `
        This relates to Article 1 and Article 3.
        Also see Article 5 for more details.
        Article 1 is mentioned again.
      `;

      const articles = generator.extractRelatedArticles(content);

      expect(articles).toEqual([1, 3, 5]);
    });

    it('should ignore invalid article numbers', () => {
      const content = `
        Article 0, Article 10, Article 99 are invalid.
        Article 2 and Article 7 are valid.
      `;

      const articles = generator.extractRelatedArticles(content);

      expect(articles).toEqual([2, 7]);
    });

    it('should handle case insensitive matching', () => {
      const content = `
        article 1, Article 3, ARTICLE 5
      `;

      const articles = generator.extractRelatedArticles(content);

      expect(articles).toEqual([1, 3, 5]);
    });

    it('should return empty array if no articles found', () => {
      const content = 'No articles mentioned here';

      const articles = generator.extractRelatedArticles(content);

      expect(articles).toEqual([]);
    });
  });

  describe('generateTemplate', () => {
    it('should generate minimal proposal template', () => {
      const metadata = createMockProposal({
        description: 'Template test description',
      });

      const result = generator.generateTemplate(metadata);

      expect(result.content).toContain('# Change Proposal: add-user-authentication');
      expect(result.content).toContain('Template test description');
      expect(result.content).toContain('*TODO: Describe why this change is necessary*');
      expect(result.content).toContain('*TODO: Describe the technical design*');
      expect(result.content).toContain('*TODO: Describe testing strategy*');
      expect(result.content).toContain('*TODO: Describe deployment steps*');
      expect(result.content).toContain('*TODO: Describe rollback procedure*');
    });

    it('should include all standard sections in template', () => {
      const metadata = createMockProposal();

      const result = generator.generateTemplate(metadata);

      expect(result.content).toContain('## Motivation');
      expect(result.content).toContain('## Design');
      expect(result.content).toContain('## Testing Strategy');
      expect(result.content).toContain('## Deployment Plan');
      expect(result.content).toContain('## Rollback Plan');
      expect(result.content).toContain('## Checklist');
    });
  });
});
