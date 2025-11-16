/**
 * Tests for AdapterFactory (AC-8.8)
 * @module @musuhi/platform-adapters/__tests__
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AdapterFactory } from '../../src/factory/adapter-factory.js';
import { ClaudeCodeAdapter } from '../../src/adapters/claude-code-adapter.js';
import { CursorAdapter } from '../../src/adapters/cursor-adapter.js';
import type { PlatformType } from '../../src/types/index.js';

describe('AdapterFactory', () => {
  const projectRoot = '/test/project';
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('AC-8.8: Platform Detection', () => {
    it('should detect claude-code from environment variable', () => {
      process.env.CLAUDE_CODE = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('claude-code');
    });

    it('should detect cursor from environment variable', () => {
      process.env.CURSOR_IDE = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('cursor');
    });

    it('should detect vscode-copilot from environment variables', () => {
      process.env.VSCODE_PID = '12345';
      process.env.GITHUB_COPILOT = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('vscode-copilot');
    });

    it('should detect zed from environment variable', () => {
      process.env.ZED_EDITOR = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('zed');
    });

    it('should detect windsurf from environment variable', () => {
      process.env.WINDSURF_IDE = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('windsurf');
    });

    it('should detect codex-cli from environment variable', () => {
      process.env.OPENAI_CODEX = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('codex-cli');
    });

    it('should detect gemini-cli from environment variable', () => {
      process.env.GOOGLE_GEMINI = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('gemini-cli');
    });

    it('should detect qwen-code from environment variable', () => {
      process.env.QWEN_CODE = '1';

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('qwen-code');
    });

    it('should default to claude-code when no detection matches', () => {
      // Clear all platform-related env vars
      delete process.env.CLAUDE_CODE;
      delete process.env.CURSOR_IDE;
      delete process.env.VSCODE_PID;

      const platform = AdapterFactory.detectPlatform(projectRoot);

      expect(platform).toBe('claude-code');
    });
  });

  describe('createAdapter', () => {
    it('should create ClaudeCodeAdapter for claude-code platform', () => {
      const adapter = AdapterFactory.createAdapter('claude-code', projectRoot);

      expect(adapter).toBeInstanceOf(ClaudeCodeAdapter);
      expect(adapter.platform).toBe('claude-code');
    });

    it('should create CursorAdapter for cursor platform', () => {
      const adapter = AdapterFactory.createAdapter('cursor', projectRoot);

      expect(adapter).toBeInstanceOf(CursorAdapter);
      expect(adapter.platform).toBe('cursor');
    });

    it('should create adapters for all 8 platforms', () => {
      const platforms: PlatformType[] = [
        'claude-code',
        'cursor',
        'vscode-copilot',
        'zed',
        'windsurf',
        'codex-cli',
        'gemini-cli',
        'qwen-code',
      ];

      platforms.forEach((platform) => {
        const adapter = AdapterFactory.createAdapter(platform, projectRoot);
        expect(adapter.platform).toBe(platform);
      });
    });

    it('should throw error for unsupported platform', () => {
      expect(() => {
        // @ts-expect-error Testing invalid platform
        AdapterFactory.createAdapter('invalid-platform', projectRoot);
      }).toThrow('Unsupported platform: invalid-platform');
    });
  });

  describe('createAutoDetected', () => {
    it('should auto-detect and initialize adapter', async () => {
      process.env.CLAUDE_CODE = '1';

      const adapter = await AdapterFactory.createAutoDetected(projectRoot);

      expect(adapter).toBeInstanceOf(ClaudeCodeAdapter);
      expect(adapter.platform).toBe('claude-code');
    });

    it('should initialize the created adapter', async () => {
      const adapter = await AdapterFactory.createAutoDetected(projectRoot);

      // Adapter should be initialized (no error when invoking)
      expect(adapter).toBeDefined();
    });
  });

  describe('AC-8.4: Unified Configuration', () => {
    it('should support all platforms with same project root', () => {
      const platforms: PlatformType[] = [
        'claude-code',
        'cursor',
        'vscode-copilot',
        'zed',
        'windsurf',
        'codex-cli',
        'gemini-cli',
        'qwen-code',
      ];

      platforms.forEach((platform) => {
        const adapter = AdapterFactory.createAdapter(platform, projectRoot);
        expect(adapter).toBeDefined();
      });
    });
  });

  describe('AC-8.5: Context Sharing', () => {
    it('should create adapters that share same project root', () => {
      const adapter1 = AdapterFactory.createAdapter('claude-code', projectRoot);
      const adapter2 = AdapterFactory.createAdapter('cursor', projectRoot);

      // Both adapters should use the same project root for context sharing
      expect(adapter1).toBeDefined();
      expect(adapter2).toBeDefined();
    });
  });
});
