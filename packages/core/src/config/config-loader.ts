/**
 * Config Loader Implementation
 * Loads and validates .musuhi/config.yaml configuration
 * @module @musuhi-ng/core/config
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { YAMLParser } from '../parsers/yaml-parser.js';
import type { PlatformType } from '../types/index.js';

/**
 * MUSUHI configuration schema
 */
export interface MUSUHIConfig extends Record<string, unknown> {
  version: string;
  projectName?: string;
  projectRoot?: string;
  platform?: PlatformType;
  [key: string]: unknown;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: MUSUHIConfig = {
  version: '2.0.0',
  projectName: 'MUSUHI Project',
  platform: 'claude-code',
};

/**
 * Configuration validation error
 */
export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * Configuration loader
 * Loads, validates, and merges configuration from .musuhi/config.yaml
 */
export class ConfigLoader {
  private yamlParser: YAMLParser;
  private configPath: string;
  private config: MUSUHIConfig | null = null;

  constructor(projectRoot: string) {
    this.yamlParser = new YAMLParser();
    this.configPath = path.join(projectRoot, '.musuhi', 'config.yaml');
  }

  /**
   * Load configuration from file
   * @returns Loaded and validated configuration
   */
  async load(): Promise<MUSUHIConfig> {
    try {
      // Check if config file exists
      const exists = await this.fileExists(this.configPath);
      if (!exists) {
        // Return default config if file doesn't exist
        this.config = { ...DEFAULT_CONFIG };
        return this.config;
      }

      // Read config file
      const content = await fs.readFile(this.configPath, 'utf-8');

      // Parse YAML
      const parseResult = this.yamlParser.parse<MUSUHIConfig>(content);

      // Validate and merge with defaults
      this.config = this.validate(parseResult.data);

      // Apply platform-specific overrides
      this.config = this.applyPlatformOverrides(this.config);

      return this.config;
    } catch (error) {
      throw new ConfigValidationError(
        `Failed to load configuration from ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get current configuration (must call load() first)
   * @returns Current configuration
   */
  getConfig(): MUSUHIConfig {
    if (!this.config) {
      throw new ConfigValidationError('Configuration not loaded. Call load() first.');
    }
    return this.config;
  }

  /**
   * Save configuration to file
   * @param config - Configuration to save
   */
  async save(config: MUSUHIConfig): Promise<void> {
    try {
      // Validate config
      const validatedConfig = this.validate(config);

      // Create .musuhi directory if it doesn't exist
      const dirPath = path.dirname(this.configPath);
      await fs.mkdir(dirPath, { recursive: true });

      // Serialize to YAML
      const yaml = this.yamlParser.stringify(validatedConfig);

      // Write to file
      await fs.writeFile(this.configPath, yaml, 'utf-8');

      this.config = validatedConfig;
    } catch (error) {
      throw new ConfigValidationError(
        `Failed to save configuration to ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Update specific configuration values
   * @param updates - Partial configuration updates
   */
  async update(updates: Partial<MUSUHIConfig>): Promise<void> {
    if (!this.config) {
      throw new ConfigValidationError('Configuration not loaded. Call load() first.');
    }

    const updatedConfig = this.deepMerge(this.config, updates);
    await this.save(updatedConfig);
  }

  /**
   * Validate configuration schema
   * @param config - Configuration to validate
   * @returns Validated configuration merged with defaults
   */
  private validate(config: unknown): MUSUHIConfig {
    if (typeof config !== 'object' || config === null) {
      throw new ConfigValidationError('Configuration must be an object');
    }

    const cfg = config as Record<string, unknown>;

    // Validate version
    if (cfg.version && typeof cfg.version !== 'string') {
      throw new ConfigValidationError('version must be a string');
    }

    // Validate platform
    if (cfg.platform) {
      const validPlatforms: PlatformType[] = [
        'claude-code',
        'cursor',
        'vscode-copilot',
        'zed',
        'windsurf',
        'codex-cli',
        'gemini-cli',
        'qwen-code',
      ];
      if (!validPlatforms.includes(cfg.platform as PlatformType)) {
        throw new ConfigValidationError(
          `Invalid platform: ${cfg.platform}. Must be one of: ${validPlatforms.join(', ')}`
        );
      }
    }

    // Merge with defaults
    return this.deepMerge(DEFAULT_CONFIG, cfg);
  }

  /**
   * Apply platform-specific configuration overrides
   * @param config - Base configuration
   * @returns Configuration with platform overrides applied
   */
  private applyPlatformOverrides(config: MUSUHIConfig): MUSUHIConfig {
    // Return config as-is (platform overrides can be added later if needed)
    return config;
  }

  /**
   * Deep merge two objects
   * @param target - Target object
   * @param source - Source object
   * @returns Merged object
   */
  private deepMerge(target: MUSUHIConfig, source: Record<string, unknown>): MUSUHIConfig {
    const result: MUSUHIConfig = { ...target };

    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = this.deepMerge(
          targetValue as MUSUHIConfig,
          sourceValue as Record<string, unknown>
        );
      } else {
        result[key] = sourceValue;
      }
    }

    return result;
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
   * Get configuration file path
   * @returns Path to config file
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Detect current platform
   * @returns Detected platform
   */
  static detectPlatform(): PlatformType {
    // Check environment variables
    if (process.env.CLAUDE_CODE) {
      return 'claude-code';
    }
    if (process.env.CURSOR_IDE) {
      return 'cursor';
    }
    if (process.env.VSCODE_PID || process.env.VSCODE_IPC_HOOK) {
      return 'vscode-copilot';
    }
    if (process.env.ZED_EDITOR) {
      return 'zed';
    }
    if (process.env.WINDSURF_IDE) {
      return 'windsurf';
    }

    // Default to claude-code
    return 'claude-code';
  }
}
