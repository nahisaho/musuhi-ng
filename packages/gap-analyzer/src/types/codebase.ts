/**
 * Codebase Metadata Types
 *
 * Defines types for codebase analysis and metadata extraction.
 *
 * @packageDocumentation
 */

/**
 * Supported programming languages for AST parsing
 */
export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'java'
  | 'go'
  | 'rust'
  | 'unknown';

/**
 * Codebase metadata extracted during analysis
 *
 * Contains high-level information about the codebase structure
 * for gap analysis and conflict detection.
 */
export interface CodebaseMetadata {
  /** Root path of the codebase */
  rootPath: string;

  /** Primary programming language */
  primaryLanguage: SupportedLanguage;

  /** Total lines of code (excluding comments/blanks) */
  linesOfCode: number;

  /** Total number of files analyzed */
  fileCount: number;

  /** File type distribution */
  fileTypes: Map<string, number>;

  /** Directory structure patterns detected */
  directoryPatterns: DirectoryPattern[];

  /** Architectural patterns detected */
  architecturalPatterns: string[];

  /** Dependencies detected (package.json, requirements.txt, etc.) */
  dependencies: Dependency[];

  /** Whether project uses TypeScript */
  usesTypeScript?: boolean;

  /** Whether project uses testing framework */
  usesTests?: boolean;

  /** Testing framework detected (jest, vitest, pytest, etc.) */
  testFramework?: string;

  /** Build tool detected (webpack, vite, maven, gradle, etc.) */
  buildTool?: string;
}

/**
 * Directory pattern detected in codebase
 *
 * AC-5.4: Conflict Detection
 * Used to detect conflicts like "uses requirements/ but spec says specs/"
 */
export interface DirectoryPattern {
  /** Pattern name (e.g., "specs-folder", "src-structure") */
  name: string;

  /** Detected path pattern */
  pattern: string;

  /** Whether this pattern matches steering expectations */
  matchesSteering: boolean;

  /** Conflict description if pattern doesn't match */
  conflict?: string;
}

/**
 * Dependency information
 */
export interface Dependency {
  /** Dependency name */
  name: string;

  /** Dependency version */
  version: string;

  /** Dependency type (runtime, dev, peer) */
  type: 'runtime' | 'dev' | 'peer';

  /** Source file (package.json, requirements.txt, etc.) */
  source: string;
}

/**
 * Code file metadata
 */
export interface CodeFile {
  /** Absolute file path */
  path: string;

  /** Relative path from codebase root */
  relativePath: string;

  /** File extension */
  extension: string;

  /** Programming language */
  language: SupportedLanguage;

  /** Lines of code */
  linesOfCode: number;

  /** Exported symbols (classes, functions, interfaces) */
  exports: ExportedSymbol[];

  /** Imported dependencies */
  imports: string[];

  /** Whether file has tests */
  hasTests: boolean;

  /** Associated test file path */
  testFile?: string;
}

/**
 * Exported symbol from a code file
 *
 * AC-5.3: Undocumented Features
 * Used to detect code with no corresponding requirements
 */
export interface ExportedSymbol {
  /** Symbol name */
  name: string;

  /** Symbol type */
  type: 'class' | 'function' | 'interface' | 'type' | 'constant' | 'variable';

  /** Whether symbol is exported */
  isExported: boolean;

  /** JSDoc or docstring comment */
  documentation?: string;

  /** Line number where symbol is defined */
  line: number;

  /** Whether symbol appears to be a feature (heuristic) */
  isFeature: boolean;
}

/**
 * AST node representation
 *
 * Simplified AST node for cross-language parsing
 */
export interface ASTNode {
  /** Node type */
  type: string;

  /** Node name/identifier */
  name?: string;

  /** Child nodes */
  children: ASTNode[];

  /** Source location */
  location: {
    line: number;
    column: number;
  };

  /** Node metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Result of AST parsing for a file
 */
export interface ASTParseResult {
  /** File path */
  filePath: string;

  /** Root AST node */
  ast?: ASTNode;

  /** Exported symbols extracted from AST */
  exports: ExportedSymbol[];

  /** Parsing errors */
  errors: ASTParseError[];

  /** Whether parsing was successful */
  success: boolean;
}

/**
 * Error encountered during AST parsing
 */
export interface ASTParseError {
  /** File path where error occurred */
  filePath: string;

  /** Line number */
  line: number;

  /** Error message */
  message: string;

  /** Error severity */
  severity: 'error' | 'warning';
}
