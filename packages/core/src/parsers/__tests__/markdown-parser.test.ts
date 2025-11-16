/**
 * Tests for MarkdownParser
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { MarkdownParser } from '../markdown-parser.js';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('parse', () => {
    it('should parse simple markdown', () => {
      const markdown = '# Hello World\n\nThis is a test.';
      const result = parser.parse(markdown);

      expect(result.title).toBe('Hello World');
      expect(result.ast).toBeDefined();
      expect(result.ast.type).toBe('root');
    });

    it('should extract frontmatter', () => {
      const markdown = `---
title: Test Document
version: 1.0
---

# Content`;

      const result = parser.parse(markdown, { parseFrontmatter: true });

      expect(result.frontmatter).toBeDefined();
      expect(result.frontmatter?.title).toBe('Test Document');
      expect(result.frontmatter?.version).toBe(1.0);
    });

    it('should extract sections', () => {
      const markdown = `# Title

## Section 1

Content 1

## Section 2

Content 2

### Subsection 2.1

Nested content`;

      const result = parser.parse(markdown, { extractSections: true });

      expect(result.sections.length).toBeGreaterThanOrEqual(1);
      // Check that sections were extracted
      const titles = parser.getAllHeadings(result.sections);
      expect(titles).toContain('Section 1');
      expect(titles).toContain('Section 2');
      expect(titles).toContain('Subsection 2.1');
    });
  });

  describe('extractEARSRequirements', () => {
    it('should extract WHEN pattern', () => {
      const markdown = `WHEN the user clicks the button, the system SHALL display a confirmation dialog.`;

      const requirements = parser.extractEARSRequirements(markdown);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toContain('WHEN');
      expect(requirements[0]).toContain('SHALL');
    });

    it('should extract WHILE pattern', () => {
      const markdown = `WHILE the user is logged in, the system SHALL show the dashboard.`;

      const requirements = parser.extractEARSRequirements(markdown);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toContain('WHILE');
    });

    it('should extract IF-THEN pattern', () => {
      const markdown = `IF an error occurs, THEN the system SHALL log the error and notify the user.`;

      const requirements = parser.extractEARSRequirements(markdown);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toContain('IF');
      expect(requirements[0]).toContain('THEN');
    });

    it('should extract WHERE pattern', () => {
      const markdown = `WHERE dark mode is enabled, the system SHALL use dark theme colors.`;

      const requirements = parser.extractEARSRequirements(markdown);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toContain('WHERE');
    });

    it('should extract ubiquitous pattern', () => {
      const markdown = `The system SHALL validate all user inputs.`;

      const requirements = parser.extractEARSRequirements(markdown);

      expect(requirements).toHaveLength(1);
      expect(requirements[0]).toContain('The');
      expect(requirements[0]).toContain('SHALL');
    });

    it('should extract multiple requirements', () => {
      const markdown = `
# Requirements

WHEN the user submits a form, the system SHALL validate all fields.

WHILE processing, the system SHALL display a loading indicator.

The system SHALL log all transactions.
`;

      const requirements = parser.extractEARSRequirements(markdown);

      expect(requirements).toHaveLength(3);
    });
  });

  describe('findSection', () => {
    it('should find section by title', () => {
      const markdown = `# Main

## Section A

## Section B

### Nested`;

      const result = parser.parse(markdown);
      const found = parser.findSection(result.sections, 'Section B');

      expect(found).toBeDefined();
      expect(found?.title).toBe('Section B');
      expect(found?.children).toHaveLength(1);
    });

    it('should find nested section', () => {
      const markdown = `# Main

## Section A

### Nested Section`;

      const result = parser.parse(markdown);
      const found = parser.findSection(result.sections, 'Nested Section');

      expect(found).toBeDefined();
      expect(found?.title).toBe('Nested Section');
    });

    it('should return undefined for non-existent section', () => {
      const markdown = `# Main

## Section A`;

      const result = parser.parse(markdown);
      const found = parser.findSection(result.sections, 'Non-existent');

      expect(found).toBeUndefined();
    });
  });

  describe('getAllHeadings', () => {
    it('should get all headings from sections', () => {
      const markdown = `# Main

## Section 1

### Subsection 1.1

## Section 2`;

      const result = parser.parse(markdown);
      const headings = parser.getAllHeadings(result.sections);

      expect(headings.length).toBeGreaterThanOrEqual(3);
      expect(headings).toContain('Section 1');
      expect(headings).toContain('Subsection 1.1');
      expect(headings).toContain('Section 2');
    });
  });

  describe('stringify', () => {
    it('should stringify AST back to markdown', () => {
      const markdown = '# Title\n\nParagraph text.';

      const parsed = parser.parse(markdown);
      const stringified = parser.stringify(parsed.ast);

      expect(stringified).toContain('# Title');
      expect(stringified).toContain('Paragraph text.');
    });
  });
});
