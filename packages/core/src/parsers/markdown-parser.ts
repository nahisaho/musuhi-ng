/**
 * Markdown Parser
 * Uses unified + remark for parsing and stringifying Markdown
 * Based on ADR-003 and Article 1 (Library-First)
 * @module @musuhi-ng/core/parsers
 */

import type { Root, Content, Heading } from 'mdast';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

/**
 * Frontmatter data (YAML)
 */
export interface Frontmatter {
  [key: string]: unknown;
}

/**
 * Markdown section (heading + content)
 */
export interface MarkdownSection {
  /** Section heading level (1-6) */
  level: number;

  /** Section title */
  title: string;

  /** Section content (raw markdown) */
  content: string;

  /** Child sections */
  children: MarkdownSection[];

  /** Start line number */
  startLine?: number;

  /** End line number */
  endLine?: number;
}

/**
 * Parsed markdown document
 */
export interface ParsedMarkdown {
  /** Frontmatter data (if present) */
  frontmatter?: Frontmatter;

  /** Document title (first h1) */
  title?: string;

  /** Document sections */
  sections: MarkdownSection[];

  /** Raw AST */
  ast: Root;
}

/**
 * Markdown parser options
 */
export interface MarkdownParserOptions {
  /** Parse frontmatter */
  parseFrontmatter?: boolean;

  /** Parse GFM (GitHub Flavored Markdown) */
  parseGfm?: boolean;

  /** Extract sections */
  extractSections?: boolean;
}

/**
 * Markdown Parser
 * Provides parsing and stringifying for Markdown documents
 */
export class MarkdownParser {
  constructor() {
    // No initialization needed
  }

  /**
   * Parse markdown string to AST
   */
  parse(markdown: string, options?: MarkdownParserOptions): ParsedMarkdown {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    let processor: any = unified().use(remarkParse);

    if (options?.parseFrontmatter !== false) {
      processor = processor.use(remarkFrontmatter, ['yaml']);
    }

    if (options?.parseGfm !== false) {
      processor = processor.use(remarkGfm);
    }

    const ast = processor.parse(markdown) as Root;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    const result: ParsedMarkdown = {
      ast,
      sections: [],
    };

    // Extract frontmatter
    if (options?.parseFrontmatter !== false) {
      result.frontmatter = this.extractFrontmatter(ast);
    }

    // Extract title (first h1)
    result.title = this.extractTitle(ast);

    // Extract sections
    if (options?.extractSections !== false) {
      result.sections = this.extractSections(ast);
    }

    return result;
  }

  /**
   * Stringify AST to markdown
   */
  stringify(ast: Root): string {
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const processor: any = unified().use(remarkStringify).use(remarkGfm);

    const markdown = processor.stringify(ast);
    return markdown;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  }

  /**
   * Extract frontmatter from AST
   */
  private extractFrontmatter(ast: Root): Frontmatter | undefined {
    const frontmatterNode = ast.children.find((node) => node.type === 'yaml');

    if (!frontmatterNode || frontmatterNode.type !== 'yaml') {
      return undefined;
    }

    try {
      // Simple YAML parsing for frontmatter
      const lines = frontmatterNode.value.split('\n');
      const data: Frontmatter = {};

      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match && match[1] && match[2]) {
          const key = match[1];
          const value = match[2];
          // Simple value parsing
          if (value === 'true') {
            data[key] = true;
          } else if (value === 'false') {
            data[key] = false;
          } else if (/^\d+$/.test(value)) {
            data[key] = parseInt(value, 10);
          } else if (/^\d+\.\d+$/.test(value)) {
            data[key] = parseFloat(value);
          } else {
            // Remove quotes if present
            data[key] = value.replace(/^["']|["']$/g, '');
          }
        }
      }

      return data;
    } catch {
      return undefined;
    }
  }

  /**
   * Extract title (first h1) from AST
   */
  private extractTitle(ast: Root): string | undefined {
    const h1 = ast.children.find(
      (node): node is Heading => node.type === 'heading' && node.depth === 1
    );

    if (!h1) {
      return undefined;
    }

    return this.extractTextFromNode(h1);
  }

  /**
   * Extract sections from AST
   */
  private extractSections(ast: Root): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    let currentSection: MarkdownSection | null = null;
    const sectionStack: MarkdownSection[] = [];

    for (const node of ast.children) {
      if (node.type === 'heading') {
        const heading = node;
        const title = this.extractTextFromNode(heading);
        const level = heading.depth;

        const section: MarkdownSection = {
          level,
          title,
          content: '',
          children: [],
          startLine: heading.position?.start.line,
          endLine: heading.position?.end.line,
        };

        // Find parent section
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1]!.level >= level) {
          sectionStack.pop();
        }

        if (sectionStack.length === 0) {
          // Top-level section
          sections.push(section);
        } else {
          // Nested section
          const parent = sectionStack[sectionStack.length - 1];
          if (parent) {
            parent.children.push(section);
          }
        }

        sectionStack.push(section);
        currentSection = section;
      } else if (currentSection) {
        // Add content to current section
        currentSection.endLine = node.position?.end.line;
      }
    }

    return sections;
  }

  /**
   * Extract text content from node
   */
  private extractTextFromNode(node: Content): string {
    if ('children' in node) {
      return node.children.map((child) => this.extractTextFromNode(child as Content)).join('');
    }

    if (node.type === 'text') {
      return node.value;
    }

    return '';
  }

  /**
   * Find section by title
   */
  findSection(sections: MarkdownSection[], title: string): MarkdownSection | undefined {
    for (const section of sections) {
      if (section.title === title) {
        return section;
      }

      const found = this.findSection(section.children, title);
      if (found) {
        return found;
      }
    }

    return undefined;
  }

  /**
   * Get all headings from sections
   */
  getAllHeadings(sections: MarkdownSection[]): string[] {
    const headings: string[] = [];

    for (const section of sections) {
      headings.push(section.title);
      headings.push(...this.getAllHeadings(section.children));
    }

    return headings;
  }

  /**
   * Extract EARS requirements from markdown
   * Looks for patterns: WHEN, WHILE, IF...THEN, WHERE, SHALL
   */
  extractEARSRequirements(markdown: string): string[] {
    const requirements: string[] = [];
    const lines = markdown.split('\n');

    // EARS patterns
    const patterns = [
      /WHEN\s+.+,\s+the\s+.+\s+SHALL\s+.+/i,
      /WHILE\s+.+,\s+the\s+.+\s+SHALL\s+.+/i,
      /IF\s+.+,\s+THEN\s+the\s+.+\s+SHALL\s+.+/i,
      /WHERE\s+.+,\s+the\s+.+\s+SHALL\s+.+/i,
      /The\s+.+\s+SHALL\s+.+/i,
    ];

    for (const line of lines) {
      const trimmed = line.trim();

      for (const pattern of patterns) {
        if (pattern.test(trimmed)) {
          requirements.push(trimmed);
          break;
        }
      }
    }

    return requirements;
  }
}
