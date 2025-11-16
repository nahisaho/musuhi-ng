/**
 * Tests for YAMLParser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { YAMLParser } from '../yaml-parser.js';

describe('YAMLParser', () => {
  let parser: YAMLParser;

  beforeEach(() => {
    parser = new YAMLParser();
  });

  describe('parse', () => {
    it('should parse simple YAML', () => {
      const yaml = `name: Test
version: 1.0
enabled: true`;

      const result = parser.parse<{ name: string; version: string; enabled: boolean }>(yaml);

      expect(result.data.name).toBe('Test');
      expect(result.data.version).toBe(1.0);
      expect(result.data.enabled).toBe(true);
    });

    it('should parse nested YAML', () => {
      const yaml = `project:
  name: MUSUHI
  version: 2.0
  features:
    - constitutional-governance
    - multi-agent-orchestration`;

      const result = parser.parse(yaml);

      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('project');
    });

    it('should parse arrays', () => {
      const yaml = `items:
  - id: 1
    name: First
  - id: 2
    name: Second`;

      const result = parser.parse(yaml);

      expect(result.data).toHaveProperty('items');
    });

    it('should throw on invalid YAML', () => {
      const yaml = `invalid:
  - missing close bracket
  [unclosed`;

      expect(() => parser.parse(yaml)).toThrow();
    });
  });

  describe('stringify', () => {
    it('should stringify object to YAML', () => {
      const data = {
        name: 'Test',
        version: 1.0,
        enabled: true,
      };

      const yaml = parser.stringify(data);

      expect(yaml).toContain('name: Test');
      expect(yaml).toContain('version: 1');
      expect(yaml).toContain('enabled: true');
    });

    it('should stringify nested objects', () => {
      const data = {
        project: {
          name: 'MUSUHI',
          features: ['feature1', 'feature2'],
        },
      };

      const yaml = parser.stringify(data);

      expect(yaml).toContain('project:');
      expect(yaml).toContain('name: MUSUHI');
      expect(yaml).toContain('features:');
    });
  });

  describe('validate', () => {
    it('should validate correct YAML', () => {
      const yaml = `name: Test
version: 1.0`;

      const result = parser.validate(yaml);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should detect invalid YAML syntax', () => {
      const yaml = `name: Test
version: [unclosed
  array`;

      const result = parser.validate(yaml);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('parseWithSchema', () => {
    it('should validate required fields', () => {
      const yaml = `name: Test
version: 1.0`;

      const schema = {
        required: ['name', 'version', 'description'],
      };

      const result = parser.parseWithSchema(yaml, schema);

      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.message.includes('description'))).toBe(true);
    });

    it('should pass with all required fields', () => {
      const yaml = `name: Test
version: 1.0
description: A test`;

      const schema = {
        required: ['name', 'version', 'description'],
      };

      const result = parser.parseWithSchema(yaml, schema);

      expect(result.errors).toBeUndefined();
    });
  });

  describe('extractFrontmatter', () => {
    it('should extract frontmatter from markdown', () => {
      const markdown = `---
title: Test Document
version: 1.0
---

# Content`;

      const frontmatter = parser.extractFrontmatter<{ title: string; version: number }>(markdown);

      expect(frontmatter).toBeDefined();
      expect(frontmatter?.title).toBe('Test Document');
      expect(frontmatter?.version).toBe(1.0);
    });

    it('should return undefined when no frontmatter', () => {
      const markdown = `# Content

No frontmatter here.`;

      const frontmatter = parser.extractFrontmatter(markdown);

      expect(frontmatter).toBeUndefined();
    });

    it('should handle invalid frontmatter', () => {
      const markdown = `---
invalid: [unclosed
---

# Content`;

      const frontmatter = parser.extractFrontmatter(markdown);

      expect(frontmatter).toBeUndefined();
    });
  });

  describe('addFrontmatter', () => {
    it('should add frontmatter to markdown', () => {
      const markdown = `# Content

Some text.`;

      const frontmatter = {
        title: 'Test',
        version: 1.0,
      };

      const result = parser.addFrontmatter(markdown, frontmatter);

      expect(result).toContain('---');
      expect(result).toContain('title: Test');
      expect(result).toContain('version: 1');
      expect(result).toContain('# Content');
    });

    it('should replace existing frontmatter', () => {
      const markdown = `---
old: value
---

# Content`;

      const frontmatter = {
        new: 'value',
      };

      const result = parser.addFrontmatter(markdown, frontmatter);

      expect(result).not.toContain('old');
      expect(result).toContain('new: value');
      expect(result).toContain('# Content');
    });
  });

  describe('parseStream', () => {
    it('should parse multiple YAML documents', () => {
      const yaml = `---
name: Document 1
---
name: Document 2
---
name: Document 3`;

      const result = parser.parseStream<{ name: string }>(yaml);

      expect(result.data).toHaveLength(3);
      expect(result.data[0]?.name).toBe('Document 1');
      expect(result.data[1]?.name).toBe('Document 2');
      expect(result.data[2]?.name).toBe('Document 3');
    });
  });
});
