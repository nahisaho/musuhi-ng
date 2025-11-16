/**
 * Context Manager Implementation
 * Loads and caches steering context files (structure.md, tech.md, product.md, constitution.md)
 * @module @musuhi-ng/core/context
 */

import { promises as fs } from 'fs';
import * as path from 'path';

import { MarkdownParser, type ParsedMarkdown } from '../parsers/markdown-parser.js';

/**
 * Steering context files
 */
export interface SteeringContext {
  /** Project structure and architecture patterns */
  structure?: string;

  /** Technology stack and development tools */
  tech?: string;

  /** Business context and product purpose */
  product?: string;

  /** Constitutional governance rules (9 Articles) */
  constitution?: string;
}

/**
 * Context loading error
 */
export class ContextLoadError extends Error {
  constructor(
    message: string,
    public readonly filePath?: string
  ) {
    super(message);
    this.name = 'ContextLoadError';
  }
}

/**
 * Context Manager
 * Manages steering context files and provides caching
 */
export class ContextManager {
  private projectRoot: string;
  private steeringDir: string;
  private markdownParser: MarkdownParser;
  private cache: SteeringContext;
  private cacheTimestamps: Map<string, number>;
  private cacheTTL: number; // Time to live in milliseconds

  constructor(projectRoot: string, cacheTTL = 60000) {
    this.projectRoot = projectRoot;
    this.steeringDir = path.join(projectRoot, 'steering');
    this.markdownParser = new MarkdownParser();
    this.cache = {};
    this.cacheTimestamps = new Map();
    this.cacheTTL = cacheTTL;
  }

  /**
   * Load all steering context files
   * @param forceReload - Force reload even if cached
   * @returns Steering context
   */
  async loadAll(forceReload = false): Promise<SteeringContext> {
    const context: SteeringContext = {};

    // Load each steering file
    context.structure = await this.load('structure.md', forceReload);
    context.tech = await this.load('tech.md', forceReload);
    context.product = await this.load('product.md', forceReload);
    context.constitution = await this.load('constitution.md', forceReload);

    return context;
  }

  /**
   * Load a specific steering context file
   * @param fileName - File name (e.g., 'structure.md')
   * @param forceReload - Force reload even if cached
   * @returns File content
   */
  async load(fileName: string, forceReload = false): Promise<string | undefined> {
    const filePath = path.join(this.steeringDir, fileName);
    const cacheKey = fileName;

    // Check cache validity
    if (!forceReload && this.isCacheValid(cacheKey)) {
      const cachedValue = this.getCachedValue(cacheKey);
      if (cachedValue !== undefined) {
        return cachedValue;
      }
    }

    try {
      // Check if file exists
      const exists = await this.fileExists(filePath);
      if (!exists) {
        // File doesn't exist, return undefined (not an error for optional files)
        this.updateCache(cacheKey, undefined);
        return undefined;
      }

      // Read file
      const content = await fs.readFile(filePath, 'utf-8');

      // Update cache
      this.updateCache(cacheKey, content);

      return content;
    } catch (error) {
      throw new ContextLoadError(
        `Failed to load steering file ${fileName}: ${error instanceof Error ? error.message : String(error)}`,
        filePath
      );
    }
  }

  /**
   * Get structure context
   * @param forceReload - Force reload even if cached
   * @returns Structure content
   */
  async getStructure(forceReload = false): Promise<string | undefined> {
    return this.load('structure.md', forceReload);
  }

  /**
   * Get tech context
   * @param forceReload - Force reload even if cached
   * @returns Tech content
   */
  async getTech(forceReload = false): Promise<string | undefined> {
    return this.load('tech.md', forceReload);
  }

  /**
   * Get product context
   * @param forceReload - Force reload even if cached
   * @returns Product content
   */
  async getProduct(forceReload = false): Promise<string | undefined> {
    return this.load('product.md', forceReload);
  }

  /**
   * Get constitution context
   * @param forceReload - Force reload even if cached
   * @returns Constitution content
   */
  async getConstitution(forceReload = false): Promise<string | undefined> {
    return this.load('constitution.md', forceReload);
  }

  /**
   * Parse markdown file and extract sections
   * @param fileName - File name
   * @param forceReload - Force reload even if cached
   * @returns Parsed markdown data with AST and metadata
   */
  async parseMarkdown(fileName: string, forceReload = false): Promise<ParsedMarkdown | null> {
    const content = await this.load(fileName, forceReload);
    if (!content) {
      return null;
    }
    return this.markdownParser.parse(content);
  }

  /**
   * Check if steering directory exists
   * @returns True if steering directory exists
   */
  async steeringDirectoryExists(): Promise<boolean> {
    return this.fileExists(this.steeringDir);
  }

  /**
   * Get steering directory path
   * @returns Steering directory path
   */
  getSteeringDir(): string {
    return this.steeringDir;
  }

  /**
   * Get project root path
   * @returns Project root path
   */
  getProjectRoot(): string {
    return this.projectRoot;
  }

  /**
   * Clear all cached context
   */
  clearCache(): void {
    this.cache = {};
    this.cacheTimestamps.clear();
  }

  /**
   * Clear cache for a specific file
   * @param fileName - File name to clear cache for
   */
  clearCacheFor(fileName: string): void {
    const cacheKey = fileName;
    delete this.cache[cacheKey as keyof SteeringContext];
    this.cacheTimestamps.delete(cacheKey);
  }

  /**
   * Set cache TTL (time to live)
   * @param ttl - TTL in milliseconds
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }

  /**
   * Get cache TTL
   * @returns TTL in milliseconds
   */
  getCacheTTL(): number {
    return this.cacheTTL;
  }

  /**
   * Check if cache is valid for a given key
   * @param key - Cache key
   * @returns True if cache is valid
   */
  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps.get(key);
    if (!timestamp) {
      return false;
    }
    const age = Date.now() - timestamp;
    return age < this.cacheTTL;
  }

  /**
   * Get cached value
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  private getCachedValue(key: string): string | undefined {
    return this.cache[key as keyof SteeringContext];
  }

  /**
   * Update cache with new value
   * @param key - Cache key
   * @param value - Value to cache
   */
  private updateCache(key: string, value: string | undefined): void {
    if (key === 'structure' || key === 'structure.md') {
      this.cache.structure = value;
      this.cacheTimestamps.set('structure.md', Date.now());
    } else if (key === 'tech' || key === 'tech.md') {
      this.cache.tech = value;
      this.cacheTimestamps.set('tech.md', Date.now());
    } else if (key === 'product' || key === 'product.md') {
      this.cache.product = value;
      this.cacheTimestamps.set('product.md', Date.now());
    } else if (key === 'constitution' || key === 'constitution.md') {
      this.cache.constitution = value;
      this.cacheTimestamps.set('constitution.md', Date.now());
    }
  }

  /**
   * Check if file exists
   * @param filePath - Path to check
   * @returns True if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Watch steering files for changes
   * @param callback - Callback to invoke when files change
   * @returns Unwatch function
   */
  watchSteeringFiles(callback: (fileName: string) => void): () => void {
    const watchers: AbortController[] = [];
    const files = ['structure.md', 'tech.md', 'product.md', 'constitution.md'];

    for (const file of files) {
      const filePath = path.join(this.steeringDir, file);
      const abortController = new AbortController();

      void (async (): Promise<void> => {
        try {
          const watcher = fs.watch(filePath, { signal: abortController.signal });
          for await (const event of watcher) {
            if (event.eventType === 'change') {
              this.clearCacheFor(file);
              callback(file);
            }
          }
        } catch {
          // File doesn't exist or watching stopped, skip
        }
      })();

      watchers.push(abortController);
    }

    // Return unwatch function
    return () => {
      for (const controller of watchers) {
        controller.abort();
      }
    };
  }
}
