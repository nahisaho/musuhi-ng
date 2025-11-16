/**
 * Config Loader Tests
 * @module @musuhi/core/config
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as path from 'node:path';
import type { PlatformType } from '../types/index.js';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    access: vi.fn(),
  },
}));

// Create shared mock functions that will be used by all YAMLParser instances
const mockParseFn = vi.fn();
const mockStringifyFn = vi.fn();

// Mock YAMLParser - must be defined before imports
vi.mock('../parsers/yaml-parser.js', () => {
  return {
    YAMLParser: class MockYAMLParser {
      parse = mockParseFn;
      stringify = mockStringifyFn;
    },
  };
});

import { ConfigLoader, DEFAULT_CONFIG } from './config-loader.js';
import { promises as fs } from 'fs';

describe('ConfigLoader', () => {
  let configLoader: ConfigLoader;
  const testProjectRoot = '/test/project';
  const testConfigPath = path.join(testProjectRoot, '.musuhi', 'config.yaml');

  beforeEach(() => {
    // Setup mock implementations
    mockParseFn.mockImplementation((content: string) => {
      // Simple YAML parsing for test purposes
      const lines = content.trim().split('\n');
      const result: any = {};
      let currentKey = '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (line.startsWith('  ')) {
          // Nested property
          const [key, value] = trimmed.split(':').map((s: string) => s.trim());
          if (currentKey && key && value !== undefined) {
            if (!result[currentKey]) result[currentKey] = {};
            result[currentKey][key] = value === 'true' ? true : value === 'false' ? false : value.replace(/"/g, '');
          }
        } else {
          // Top-level property
          const [key, value] = trimmed.split(':').map((s: string) => s.trim());
          if (key && value !== undefined) {
            currentKey = key;
            result[key] = value.replace(/"/g, '');
          } else if (key) {
            currentKey = key;
          }
        }
      }

      // Return YAMLParseResult format
      return { data: result };
    });

    mockStringifyFn.mockImplementation((obj: any) => {
      let yaml = '';
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          yaml += `${key}:\n`;
          for (const [nestedKey, nestedValue] of Object.entries(value)) {
            yaml += `  ${nestedKey}: ${nestedValue}\n`;
          }
        } else {
          yaml += `${key}: ${value}\n`;
        }
      }
      return yaml;
    });

    configLoader = new ConfigLoader(testProjectRoot);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('load', () => {
    it('should load and parse valid YAML config', async () => {
      const mockConfig = `
version: "1.0.0"
projectName: "Test Project"
platform: "claude-code"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      const config = await configLoader.load();

      // Merged with defaults, so version comes from file, other fields from defaults
      expect(config.version).toBe('1.0.0');
      expect(config.projectName).toBe('Test Project');
      expect(config.platform).toBe('claude-code');
    });

    it('should return default config when file does not exist', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      const config = await configLoader.load();

      expect(config).toEqual(DEFAULT_CONFIG);
      expect(config.version).toBe('2.0.0');
      expect(config.projectName).toBe('MUSUHI Project');
    });

    it('should merge user config with defaults', async () => {
      const mockConfig = `
version: "1.5.0"
customField: "custom value"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      const config = await configLoader.load();

      expect(config.version).toBe('1.5.0');
      expect(config.projectName).toBe('MUSUHI Project'); // From defaults
      expect(config.customField).toBe('custom value');
    });

    it('should throw on invalid platform', async () => {
      const mockConfig = `
version: "1.0.0"
platform: "invalid-platform"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      await expect(configLoader.load()).rejects.toThrow('Invalid platform');
    });

    it('should throw on read error (not ENOENT)', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'));

      await expect(configLoader.load()).rejects.toThrow('Failed to load configuration');
    });
  });

  describe('getConfig', () => {
    it('should return loaded config', async () => {
      const mockConfig = `
version: "2.1.0"
projectName: "My Project"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      await configLoader.load();
      const config = configLoader.getConfig();

      expect(config.version).toBe('2.1.0');
      expect(config.projectName).toBe('My Project');
    });

    it('should throw if config not loaded', () => {
      expect(() => configLoader.getConfig()).toThrow('Configuration not loaded');
    });
  });

  describe('save', () => {
    it('should save config to file', async () => {
      const configToSave = {
        version: '3.0.0',
        projectName: 'Saved Project',
        platform: 'cursor' as PlatformType,
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await configLoader.save(configToSave);

      expect(fs.mkdir).toHaveBeenCalledWith(
        path.dirname(testConfigPath),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should validate config before saving', async () => {
      const invalidConfig = {
        version: '1.0.0',
        platform: 'invalid-platform' as PlatformType,
      };

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await expect(configLoader.save(invalidConfig)).rejects.toThrow('Invalid platform');
    });
  });

  describe('update', () => {
    it('should update and save config', async () => {
      const mockConfig = `
version: "1.0.0"
projectName: "Original"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await configLoader.load();
      await configLoader.update({ projectName: 'Updated' });

      const config = configLoader.getConfig();
      expect(config.projectName).toBe('Updated');
      expect(config.version).toBe('1.0.0'); // Preserved
    });

    it('should throw if config not loaded', async () => {
      await expect(configLoader.update({ projectName: 'Test' })).rejects.toThrow(
        'Configuration not loaded'
      );
    });
  });

  describe('detectPlatform', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it('should detect claude-code platform', () => {
      process.env.CLAUDE_CODE = 'true';
      const platform = ConfigLoader.detectPlatform();
      expect(platform).toBe('claude-code');
    });

    it('should detect cursor platform', () => {
      delete process.env.CLAUDE_CODE;
      process.env.CURSOR_IDE = 'true';
      const platform = ConfigLoader.detectPlatform();
      expect(platform).toBe('cursor');
    });

    it('should detect vscode platform via VSCODE_PID', () => {
      delete process.env.CLAUDE_CODE;
      delete process.env.CURSOR_IDE;
      process.env.VSCODE_PID = '12345';
      const platform = ConfigLoader.detectPlatform();
      expect(platform).toBe('vscode-copilot');
    });

    it('should detect vscode platform via VSCODE_IPC_HOOK', () => {
      delete process.env.CLAUDE_CODE;
      delete process.env.CURSOR_IDE;
      delete process.env.VSCODE_PID;
      process.env.VSCODE_IPC_HOOK = '/some/path';
      const platform = ConfigLoader.detectPlatform();
      expect(platform).toBe('vscode-copilot');
    });

    it('should default to claude-code when no environment variables', () => {
      delete process.env.CLAUDE_CODE;
      delete process.env.CURSOR_IDE;
      delete process.env.VSCODE_PID;
      delete process.env.VSCODE_IPC_HOOK;
      delete process.env.ZED_EDITOR;
      delete process.env.WINDSURF_IDE;

      const platform = ConfigLoader.detectPlatform();
      expect(platform).toBe('claude-code');
    });
  });

  describe('validate', () => {
    it('should accept all valid platforms', async () => {
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

      vi.mocked(fs.access).mockResolvedValue(undefined);

      for (const platform of validPlatforms) {
        const mockConfig = `
version: "1.0.0"
platform: "${platform}"
`;
        vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

        const config = await configLoader.load();
        expect(config.platform).toBe(platform);
      }
    });

    it('should not require version field (uses default)', async () => {
      const mockConfig = `
projectName: "Test"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      const config = await configLoader.load();

      expect(config.version).toBe('2.0.0'); // Default
      expect(config.projectName).toBe('Test');
    });
  });

  describe('deep merge', () => {
    it('should merge nested objects', async () => {
      const mockConfig = `
version: "1.0.0"
features:
  dashboard: true
  analytics: false
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      const config = await configLoader.load();

      expect(config.features).toBeDefined();
      expect((config.features as any).dashboard).toBe(true);
      expect((config.features as any).analytics).toBe(false);
    });

    it('should override default values with user values', async () => {
      const mockConfig = `
version: "3.0.0"
projectName: "Custom Name"
`;
      vi.mocked(fs.access).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(mockConfig);

      const config = await configLoader.load();

      expect(config.version).toBe('3.0.0');
      expect(config.projectName).toBe('Custom Name');
    });
  });

  describe('getConfigPath', () => {
    it('should return config file path', () => {
      const configPath = configLoader.getConfigPath();
      expect(configPath).toBe(testConfigPath);
    });
  });
});
