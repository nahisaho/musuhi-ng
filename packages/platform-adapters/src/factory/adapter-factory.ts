/**
 * AC-8.8: Auto-Detection
 * Adapter factory with platform auto-detection
 * @module @musuhi-ng/platform-adapters/factory
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { PlatformType, IPlatformAdapter } from '../types/index.js';
import {
  ClaudeCodeAdapter,
  CursorAdapter,
  VSCodeCopilotAdapter,
  ZedAdapter,
  WindsurfAdapter,
  CodexCLIAdapter,
  GeminiCLIAdapter,
  QwenCodeAdapter,
} from '../adapters/index.js';

/**
 * Adapter factory for platform auto-detection and instantiation
 *
 * Implements AC-8.8: Auto-Detection
 * - Detects platform from environment variables
 * - Checks for installed extensions
 * - Verifies CLI availability
 * - Falls back to config file
 * - Defaults to claude-code
 */
export class AdapterFactory {
  /**
   * AC-8.8: Auto-detect the current AI platform
   *
   * Detection priority:
   * 1. Environment variables (highest priority)
   * 2. Installed IDE extensions/plugins
   * 3. CLI availability (which command)
   * 4. Config file (.musuhi/config.yaml)
   * 5. Default to claude-code (fallback)
   *
   * @param projectRoot - Project root directory
   * @returns Detected platform type
   */
  static detectPlatform(projectRoot: string = process.cwd()): PlatformType {
    // Priority 1: Environment variables
    const envPlatform = this.detectFromEnvironment();
    if (envPlatform) {
      console.log(`[AdapterFactory] Detected platform from env: ${envPlatform}`);
      return envPlatform;
    }

    // Priority 2: Installed extensions/plugins
    const extensionPlatform = this.detectFromExtensions(projectRoot);
    if (extensionPlatform) {
      console.log(
        `[AdapterFactory] Detected platform from extensions: ${extensionPlatform}`
      );
      return extensionPlatform;
    }

    // Priority 3: CLI availability
    const cliPlatform = this.detectFromCLI();
    if (cliPlatform) {
      console.log(`[AdapterFactory] Detected platform from CLI: ${cliPlatform}`);
      return cliPlatform;
    }

    // Priority 4: Config file
    const configPlatform = this.detectFromConfig(projectRoot);
    if (configPlatform) {
      console.log(
        `[AdapterFactory] Detected platform from config: ${configPlatform}`
      );
      return configPlatform;
    }

    // Priority 5: Default fallback
    console.log(`[AdapterFactory] Using default platform: claude-code`);
    return 'claude-code';
  }

  /**
   * Detect platform from environment variables
   * @returns Platform type or null
   */
  private static detectFromEnvironment(): PlatformType | null {
    if (process.env.CLAUDE_CODE || process.env.CLAUDE_CLI) {
      return 'claude-code';
    }

    if (process.env.CURSOR_IDE || process.env.CURSOR) {
      return 'cursor';
    }

    if (process.env.VSCODE_PID || process.env.VSCODE_IPC_HOOK) {
      // Check if Copilot is installed
      if (process.env.GITHUB_COPILOT || process.env.COPILOT_ENABLED) {
        return 'vscode-copilot';
      }
    }

    if (process.env.ZED_EDITOR || process.env.ZED) {
      return 'zed';
    }

    if (process.env.WINDSURF_IDE || process.env.WINDSURF) {
      return 'windsurf';
    }

    if (process.env.OPENAI_CODEX || process.env.CODEX_CLI) {
      return 'codex-cli';
    }

    if (process.env.GOOGLE_GEMINI || process.env.GEMINI_CLI) {
      return 'gemini-cli';
    }

    if (process.env.QWEN_CODE || process.env.QWEN_CLI) {
      return 'qwen-code';
    }

    return null;
  }

  /**
   * Detect platform from installed extensions/plugins
   * @param projectRoot - Project root directory
   * @returns Platform type or null
   */
  private static detectFromExtensions(
    projectRoot: string
  ): PlatformType | null {
    // Check for .cursor directory
    if (existsSync(join(projectRoot, '.cursor'))) {
      return 'cursor';
    }

    // Check for .vscode with Copilot extension
    const vscodePath = join(projectRoot, '.vscode');
    if (existsSync(vscodePath)) {
      // Look for Copilot extension marker
      const extensionsPath = join(vscodePath, 'extensions');
      if (
        existsSync(extensionsPath) &&
        existsSync(join(extensionsPath, 'github.copilot'))
      ) {
        return 'vscode-copilot';
      }
    }

    // Check for .zed directory
    if (existsSync(join(projectRoot, '.zed'))) {
      return 'zed';
    }

    // Check for .windsurf directory
    if (existsSync(join(projectRoot, '.windsurf'))) {
      return 'windsurf';
    }

    return null;
  }

  /**
   * Detect platform from CLI availability
   * @returns Platform type or null
   */
  private static detectFromCLI(): PlatformType | null {
    const cliCommands: Array<[string, PlatformType]> = [
      ['claude', 'claude-code'],
      ['cursor', 'cursor'],
      ['code', 'vscode-copilot'], // VS Code CLI
      ['zed', 'zed'],
      ['windsurf', 'windsurf'],
      ['codex', 'codex-cli'],
      ['gemini', 'gemini-cli'],
      ['qwen', 'qwen-code'],
    ];

    for (const [command, platform] of cliCommands) {
      try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return platform;
      } catch {
        // Command not found, continue
      }
    }

    return null;
  }

  /**
   * Detect platform from config file
   * @param projectRoot - Project root directory
   * @returns Platform type or null
   */
  private static detectFromConfig(projectRoot: string): PlatformType | null {
    const configPath = join(projectRoot, '.musuhi', 'config.yaml');

    if (!existsSync(configPath)) {
      return null;
    }

    try {
      // TODO: Use ConfigLoader from @musuhi-ng/core when available
      // For now, return null (config loading not implemented)
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Create platform adapter instance
   *
   * @param platform - Platform type (auto-detected or manual)
   * @param projectRoot - Project root directory
   * @returns Initialized platform adapter
   * @throws Error if platform is not supported
   */
  static createAdapter(
    platform: PlatformType,
    projectRoot: string = process.cwd()
  ): IPlatformAdapter {
    switch (platform) {
      case 'claude-code':
        return new ClaudeCodeAdapter(projectRoot);

      case 'cursor':
        return new CursorAdapter(projectRoot);

      case 'vscode-copilot':
        return new VSCodeCopilotAdapter(projectRoot);

      case 'zed':
        return new ZedAdapter(projectRoot);

      case 'windsurf':
        return new WindsurfAdapter(projectRoot);

      case 'codex-cli':
        return new CodexCLIAdapter(projectRoot);

      case 'gemini-cli':
        return new GeminiCLIAdapter(projectRoot);

      case 'qwen-code':
        return new QwenCodeAdapter(projectRoot);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  /**
   * Auto-detect and create adapter
   *
   * Convenience method that combines detection and instantiation
   *
   * @param projectRoot - Project root directory
   * @returns Initialized platform adapter
   */
  static async createAutoDetected(
    projectRoot: string = process.cwd()
  ): Promise<IPlatformAdapter> {
    const platform = this.detectPlatform(projectRoot);
    const adapter = this.createAdapter(platform, projectRoot);
    await adapter.initialize();
    return adapter;
  }
}
