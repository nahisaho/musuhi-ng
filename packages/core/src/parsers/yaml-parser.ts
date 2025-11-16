/**
 * YAML Parser
 * Uses yaml library for parsing and stringifying YAML
 * Based on ADR-004 and Article 1 (Library-First)
 * @module @musuhi/core/parsers
 */

import YAML from 'yaml';

/**
 * YAML parser options
 */
export interface YAMLParserOptions {
  /** Indent size (default: 2) */
  indent?: number;

  /** Allow duplicate keys */
  allowDuplicateKeys?: boolean;

  /** Strict mode */
  strict?: boolean;

  /** Schema version (default: 1.2) */
  version?: '1.1' | '1.2';
}

/**
 * YAML parsing result
 */
export interface YAMLParseResult<T = unknown> {
  /** Parsed data */
  data: T;

  /** Parsing errors (if any) */
  errors?: YAMLError[];

  /** Parsing warnings (if any) */
  warnings?: YAMLError[];
}

/**
 * YAML error
 */
export interface YAMLError {
  /** Error message */
  message: string;

  /** Line number */
  line?: number;

  /** Column number */
  column?: number;

  /** Error code */
  code?: string;
}

/**
 * YAML Parser
 * Provides parsing and stringifying for YAML documents
 */
export class YAMLParser {
  private options: YAMLParserOptions;

  constructor(options: YAMLParserOptions = {}) {
    this.options = {
      indent: 2,
      allowDuplicateKeys: false,
      strict: true,
      version: '1.2',
      ...options,
    };
  }

  /**
   * Parse YAML string to object
   */
  parse<T = unknown>(yaml: string): YAMLParseResult<T> {
    const errors: YAMLError[] = [];
    const warnings: YAMLError[] = [];

    try {
      const data = YAML.parse(yaml, {
        strict: this.options.strict,
        uniqueKeys: !this.options.allowDuplicateKeys,
        version: this.options.version,
      }) as T;

      return {
        data,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      if (error instanceof Error) {
        const yamlError: YAMLError = {
          message: error.message,
        };

        // Extract line/column info if available
        const match = error.message.match(/at line (\d+), column (\d+)/);
        if (match) {
          yamlError.line = parseInt(match[1]!, 10);
          yamlError.column = parseInt(match[2]!, 10);
        }

        errors.push(yamlError);
      }

      throw new Error(`Failed to parse YAML: ${errors[0]?.message ?? 'Unknown error'}`);
    }
  }

  /**
   * Stringify object to YAML
   */
  stringify(data: unknown): string {
    try {
      return YAML.stringify(data, {
        indent: this.options.indent,
        lineWidth: 100,
        minContentWidth: 0,
      });
    } catch (error) {
      throw new Error(
        `Failed to stringify to YAML: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Validate YAML structure
   */
  validate(yaml: string): {
    valid: boolean;
    errors?: YAMLError[];
  } {
    try {
      YAML.parse(yaml, {
        strict: true,
        uniqueKeys: true,
      });

      return { valid: true };
    } catch (error) {
      const errors: YAMLError[] = [];

      if (error instanceof Error) {
        const yamlError: YAMLError = {
          message: error.message,
        };

        const match = error.message.match(/at line (\d+), column (\d+)/);
        if (match) {
          yamlError.line = parseInt(match[1]!, 10);
          yamlError.column = parseInt(match[2]!, 10);
        }

        errors.push(yamlError);
      }

      return {
        valid: false,
        errors,
      };
    }
  }

  /**
   * Parse YAML with schema validation
   */
  parseWithSchema<T = unknown>(
    yaml: string,
    schema: {
      required?: string[];
      properties?: Record<string, unknown>;
    }
  ): YAMLParseResult<T> {
    const result = this.parse<T>(yaml);

    if (!result.data || typeof result.data !== 'object') {
      throw new Error('Invalid YAML: data must be an object');
    }

    const errors: YAMLError[] = result.errors ? [...result.errors] : [];

    // Validate required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in result.data)) {
          errors.push({
            message: `Missing required field: ${field}`,
            code: 'REQUIRED_FIELD_MISSING',
          });
        }
      }
    }

    if (errors.length > 0) {
      return {
        ...result,
        errors,
      };
    }

    return result;
  }

  /**
   * Extract frontmatter from markdown
   * Looks for YAML between --- delimiters
   */
  extractFrontmatter<T = unknown>(markdown: string): T | undefined {
    const match = markdown.match(/^---\n([\s\S]*?)\n---/);

    if (!match || !match[1]) {
      return undefined;
    }

    try {
      return this.parse<T>(match[1]).data;
    } catch {
      return undefined;
    }
  }

  /**
   * Add frontmatter to markdown
   */
  addFrontmatter(markdown: string, frontmatter: unknown): string {
    const yaml = this.stringify(frontmatter).trim();

    // Remove existing frontmatter if present
    const withoutFrontmatter = markdown.replace(/^---\n[\s\S]*?\n---\n/, '');

    return `---\n${yaml}\n---\n\n${withoutFrontmatter}`;
  }

  /**
   * Parse YAML stream (multiple documents)
   */
  parseStream<T = unknown>(yaml: string): YAMLParseResult<T[]> {
    try {
      const docs = YAML.parseAllDocuments(yaml, {
        strict: this.options.strict,
        uniqueKeys: !this.options.allowDuplicateKeys,
      });

      const data = docs.map((doc) => doc.toJSON() as T);

      return { data };
    } catch (error) {
      throw new Error(
        `Failed to parse YAML stream: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
