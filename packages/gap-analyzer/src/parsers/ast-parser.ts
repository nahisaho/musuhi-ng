/**
 * AST Parser
 *
 * Parses TypeScript/JavaScript codebases using ts-morph for high-accuracy
 * gap analysis. Implements AC-5.2 (Missing Features) and AC-5.3 (Undocumented Features).
 *
 * @packageDocumentation
 */

import { Project, SourceFile, Symbol as _TsMorphSymbol } from 'ts-morph';
import path from 'node:path';
import type {
  Requirement,
  CodeFile,
  ExportedSymbol,
  SupportedLanguage,
} from '../types/index.js';

/**
 * AST Parser for TypeScript/JavaScript codebases
 *
 * AC-5.2: Missing Features Detection - Searches codebase for requirement implementations
 * AC-5.3: Undocumented Features - Finds code with no corresponding requirements
 *
 * Uses ts-morph library for robust AST parsing (Article 1: Library-First)
 */
export class ASTParser {
  private project: Project;
  private codebasePath: string;

  /**
   * Creates a new AST parser instance
   *
   * @param codebasePath - Root path of the codebase to analyze
   * @param project - Optional ts-morph Project instance (for testing)
   */
  constructor(codebasePath: string, project?: Project) {
    this.codebasePath = codebasePath;

    if (project) {
      // Use provided project (for testing)
      this.project = project;
    } else {
      // Initialize ts-morph Project
      // AC-5.2: Use AST parsing for high-accuracy detection
      try {
        this.project = new Project({
          tsConfigFilePath: path.join(codebasePath, 'tsconfig.json'),
          skipAddingFilesFromTsConfig: false,
        });
      } catch {
        // If no tsconfig.json, create project without it
        this.project = new Project({
          compilerOptions: {
            target: 99, // ESNext
            module: 99, // ESNext
          },
        });
        // Add all TypeScript/JavaScript files manually
        this.project.addSourceFilesAtPaths(`${codebasePath}/**/*.{ts,tsx,js,jsx}`);
      }
    }
  }

  /**
   * Get the underlying ts-morph Project instance
   *
   * @returns The Project instance
   */
  getProject(): Project {
    return this.project;
  }

  /**
   * AC-5.2: Find implementation for a requirement
   *
   * Searches the codebase AST for code implementing the given requirement.
   * Returns true if implementation found, false otherwise.
   *
   * @param requirement - Requirement to search for
   * @returns True if implementation found
   */
  findImplementation(requirement: Requirement): boolean {
    const sourceFiles = this.project.getSourceFiles();

    // Search for requirement keywords in AST
    for (const file of sourceFiles) {
      // Skip test files for implementation search
      if (this.isTestFile(file.getFilePath())) {
        continue;
      }

      // Check if file contains implementation
      if (this.fileContainsPattern(file, requirement.keywords)) {
        return true;
      }

      // Check if expected files exist
      if (requirement.expectedFiles) {
        for (const expectedPattern of requirement.expectedFiles) {
          if (this.matchesPattern(file.getFilePath(), expectedPattern)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * AC-5.3: Find undocumented features
   *
   * Identifies code files/exports that have no corresponding requirements.
   * Returns list of file paths with undocumented features.
   *
   * @param requirements - All requirements to check against
   * @returns Array of file paths with undocumented features
   */
  findUndocumentedFeatures(requirements: Requirement[]): string[] {
    const undocumented: string[] = [];
    const sourceFiles = this.project.getSourceFiles();

    for (const file of sourceFiles) {
      // Skip test files and config files
      if (this.isTestFile(file.getFilePath()) || this.isConfigFile(file.getFilePath())) {
        continue;
      }

      // Get exported symbols from file
      const exports = this.extractExportedSymbols(file);

      // Check if any exported symbol lacks a requirement
      for (const exportSymbol of exports) {
        if (exportSymbol.isFeature && !this.hasRequirement(exportSymbol.name, requirements)) {
          // Only report each file once
          if (!undocumented.includes(file.getFilePath())) {
            undocumented.push(file.getFilePath());
          }
        }
      }
    }

    return undocumented;
  }

  /**
   * AC-5.3: Find undocumented features with symbol details
   *
   * Identifies code files/exports that have no corresponding requirements.
   * Returns file paths with undocumented features and their symbols.
   *
   * @param requirements - All requirements to check against
   * @returns Array of objects with file paths and undocumented symbols
   */
  findUndocumentedFeaturesWithSymbols(requirements: Requirement[]): Array<{ file: string; symbols: ExportedSymbol[] }> {
    const undocumented: Array<{ file: string; symbols: ExportedSymbol[] }> = [];
    const sourceFiles = this.project.getSourceFiles();

    for (const file of sourceFiles) {
      // Skip test files and config files
      if (this.isTestFile(file.getFilePath()) || this.isConfigFile(file.getFilePath())) {
        continue;
      }

      // Get exported symbols from file
      const exports = this.extractExportedSymbols(file);

      // Collect undocumented symbols
      const undocumentedSymbols = exports.filter(
        exportSymbol => exportSymbol.isFeature && !this.hasRequirement(exportSymbol.name, requirements)
      );

      if (undocumentedSymbols.length > 0) {
        undocumented.push({
          file: file.getFilePath(),
          symbols: undocumentedSymbols,
        });
      }
    }

    return undocumented;
  }

  /**
   * Extract exported symbols from a source file
   *
   * AC-5.3: Used to identify undocumented features
   *
   * @param file - Source file to analyze
   * @returns Array of exported symbols
   */
  extractExportedSymbols(file: SourceFile): ExportedSymbol[] {
    const symbols: ExportedSymbol[] = [];

    // Extract exported classes
    file.getClasses().forEach((classDecl) => {
      if (classDecl.isExported()) {
        symbols.push({
          name: classDecl.getName() || 'anonymous',
          type: 'class',
          isExported: true,
          line: classDecl.getStartLineNumber(),
          documentation: classDecl.getJsDocs()[0]?.getDescription() || undefined,
          isFeature: this.isLikelyFeature(classDecl.getName() || ''),
        });
      }
    });

    // Extract exported functions
    file.getFunctions().forEach((funcDecl) => {
      if (funcDecl.isExported()) {
        const funcName = funcDecl.getName() || 'anonymous';
        symbols.push({
          name: funcName,
          type: 'function',
          isExported: true,
          line: funcDecl.getStartLineNumber(),
          documentation: funcDecl.getJsDocs()[0]?.getDescription() || undefined,
          // Functions are features unless they're utility functions
          isFeature: funcName !== 'anonymous' && !this.isUtilityFunction(funcName),
        });
      }
    });

    // Extract exported interfaces
    file.getInterfaces().forEach((interfaceDecl) => {
      if (interfaceDecl.isExported()) {
        symbols.push({
          name: interfaceDecl.getName(),
          type: 'interface',
          isExported: true,
          line: interfaceDecl.getStartLineNumber(),
          documentation: interfaceDecl.getJsDocs()[0]?.getDescription() || undefined,
          isFeature: this.isLikelyFeature(interfaceDecl.getName()),
        });
      }
    });

    // Extract exported type aliases
    file.getTypeAliases().forEach((typeAlias) => {
      if (typeAlias.isExported()) {
        symbols.push({
          name: typeAlias.getName(),
          type: 'type',
          isExported: true,
          line: typeAlias.getStartLineNumber(),
          documentation: typeAlias.getJsDocs()[0]?.getDescription() || undefined,
          isFeature: this.isLikelyFeature(typeAlias.getName()),
        });
      }
    });

    return symbols;
  }

  /**
   * Parse a source file to extract metadata
   *
   * @param filePath - Path to file to parse
   * @returns CodeFile metadata
   */
  async parseFile(filePath: string): Promise<CodeFile> {
    const sourceFile = this.project.getSourceFile(filePath);
    if (!sourceFile) {
      throw new Error(`File not found: ${filePath}`);
    }

    const exports = this.extractExportedSymbols(sourceFile);
    const imports = sourceFile
      .getImportDeclarations()
      .map((imp) => imp.getModuleSpecifierValue());

    return {
      path: filePath,
      relativePath: path.relative(this.codebasePath, filePath),
      extension: path.extname(filePath),
      language: this.detectLanguage(filePath),
      linesOfCode: sourceFile.getEndLineNumber(),
      exports,
      imports,
      hasTests: this.hasCorrespondingTestFile(filePath),
      testFile: this.findTestFile(filePath),
    };
  }

  /**
   * Check if file contains any of the given keywords
   *
   * @param file - Source file to check
   * @param keywords - Keywords to search for
   * @returns True if file contains at least one keyword
   */
  private fileContainsPattern(file: SourceFile, keywords: string[]): boolean {
    const text = file.getFullText();
    const lowerText = text.toLowerCase();

    return keywords.some((keyword) => {
      const lowerKeyword = keyword.toLowerCase();

      // Check in code text
      if (lowerText.includes(lowerKeyword)) {
        return true;
      }

      // Check in symbol names (classes, functions, etc.)
      const symbols = this.extractExportedSymbols(file);
      return symbols.some((symbol) => symbol.name.toLowerCase().includes(lowerKeyword));
    });
  }

  /**
   * Check if given feature name has a corresponding requirement
   *
   * @param featureName - Feature name to check
   * @param requirements - All requirements
   * @returns True if requirement exists
   */
  private hasRequirement(featureName: string, requirements: Requirement[]): boolean {
    const lowerFeatureName = featureName.toLowerCase();

    return requirements.some((req) =>
      req.keywords.some((keyword) => {
        const lowerKeyword = keyword.toLowerCase();
        return (
          lowerFeatureName.includes(lowerKeyword) || lowerKeyword.includes(lowerFeatureName)
        );
      })
    );
  }

  /**
   * Check if path matches a glob pattern
   *
   * @param filePath - File path to check
   * @param pattern - Glob pattern
   * @returns True if path matches pattern
   */
  private matchesPattern(filePath: string, pattern: string): boolean {
    // Simple glob matching (can be enhanced with micromatch library)
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\//g, '\\/');
    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  }

  /**
   * Check if file is a test file
   *
   * @param filePath - File path to check
   * @returns True if test file
   */
  private isTestFile(filePath: string): boolean {
    const testPatterns = [
      /\.test\.(ts|tsx|js|jsx)$/,
      /\.spec\.(ts|tsx|js|jsx)$/,
      /__tests__\//,
      /test\//,
      /tests\//,
    ];
    return testPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Check if file is a configuration file
   *
   * @param filePath - File path to check
   * @returns True if config file
   */
  private isConfigFile(filePath: string): boolean {
    const configPatterns = [
      /\.config\.(ts|js)$/,
      /tsconfig\.json$/,
      /package\.json$/,
      /vite\.config/,
      /vitest\.config/,
    ];
    return configPatterns.some((pattern) => pattern.test(filePath));
  }

  /**
   * Check if function is a utility function (non-feature)
   *
   * @param _name - Function name (future use for pattern matching)
   * @returns True if utility function
   */
  private isUtilityFunction(_name: string): boolean {
    // @ts-ignore - Future use: pattern matching against name parameter
    const _utilityPatterns = [
      /^get[A-Z]/,  // getters
      /^set[A-Z]/,  // setters
      /^is[A-Z]/,   // boolean checks
      /^has[A-Z]/,  // boolean checks
      /^to[A-Z]/,   // converters
      /^from[A-Z]/, // converters
      /^create[A-Z]/, // factories (actually could be features)
      /Utils?$/,
      /Helper$/,
    ];

    // Most utility functions have these patterns, but exported functions are likely features
    return false; // For now, treat all exported functions as features
  }

  /**
   * Heuristic to determine if symbol name represents a feature
   *
   * @param name - Symbol name
   * @returns True if likely a feature
   */
  private isLikelyFeature(name: string): boolean {
    // Skip utility types and common non-feature names
    const nonFeaturePatterns = [
      /^Props$/i,
      /^State$/i,
      /^Config$/i,
      /^Options$/i,
      /^Args$/i,
      /^Params$/i,
      /^Type$/i,
      /^Interface$/i,
    ];

    if (nonFeaturePatterns.some((pattern) => pattern.test(name))) {
      return false;
    }

    // All classes, services, and major components are features
    const featurePatterns = [
      /Manager$/,
      /Service$/,
      /Controller$/,
      /Handler$/,
      /Provider$/,
      /Engine$/,
      /Analyzer$/,
      /Detector$/,
      /Generator$/,
      /Validator$/,
      /Executor$/,
      /Orchestrator$/,
      /Parser$/,
      /Feature$/,
      /Component$/,
      /Module$/,
      /Factory$/,
      /Builder$/,
      /Adapter$/,
      /Facade$/,
      /Strategy$/,
    ];

    // If matches common feature pattern, it's a feature
    if (featurePatterns.some((pattern) => pattern.test(name))) {
      return true;
    }

    // Classes starting with capital letter are likely features
    if (/^[A-Z][a-z]/.test(name)) {
      return true;
    }

    return false;
  }

  /**
   * Check if file has a corresponding test file
   *
   * @param filePath - Source file path
   * @returns True if test file exists
   */
  private hasCorrespondingTestFile(filePath: string): boolean {
    return this.findTestFile(filePath) !== undefined;
  }

  /**
   * Find corresponding test file for a source file
   *
   * @param filePath - Source file path
   * @returns Test file path if found
   */
  private findTestFile(filePath: string): string | undefined {
    const dir = path.dirname(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));

    const testPatterns = [
      path.join(dir, `${baseName}.test.ts`),
      path.join(dir, `${baseName}.spec.ts`),
      path.join(dir, '__tests__', `${baseName}.test.ts`),
    ];

    for (const testPath of testPatterns) {
      if (this.project.getSourceFile(testPath)) {
        return testPath;
      }
    }

    return undefined;
  }

  /**
   * Detect language from file extension
   *
   * @param filePath - File path
   * @returns Detected language
   */
  private detectLanguage(filePath: string): SupportedLanguage {
    const ext = path.extname(filePath);
    switch (ext) {
      case '.ts':
      case '.tsx':
        return 'typescript';
      case '.js':
      case '.jsx':
        return 'javascript';
      default:
        return 'unknown';
    }
  }

  /**
   * Get all source files in the project
   *
   * @returns Array of source files
   */
  getSourceFiles(): SourceFile[] {
    return this.project.getSourceFiles();
  }

  /**
   * Get total lines of code in the project
   *
   * @returns Total LOC
   */
  getTotalLinesOfCode(): number {
    return this.project.getSourceFiles().reduce((total, file) => {
      return total + file.getEndLineNumber();
    }, 0);
  }
}
