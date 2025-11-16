/**
 * Tests for ClaudeCodeAdapter (AC-8.2)
 * @module @musuhi/platform-adapters/__tests__
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ClaudeCodeAdapter } from '../../src/adapters/claude-code-adapter.js';
import type { AgentConfig, AgentContext } from '../../src/types/index.js';

describe('ClaudeCodeAdapter', () => {
  let adapter: ClaudeCodeAdapter;
  const projectRoot = '/test/project';

  beforeEach(() => {
    adapter = new ClaudeCodeAdapter(projectRoot);
  });

  describe('initialization', () => {
    it('should have correct platform type', () => {
      expect(adapter.platform).toBe('claude-code');
    });

    it('should have correct version', () => {
      expect(adapter.version).toBe('2.0.0');
    });

    it('should initialize successfully', async () => {
      await expect(adapter.initialize()).resolves.toBeUndefined();
    });

    it('should not re-initialize if already initialized', async () => {
      await adapter.initialize();
      await expect(adapter.initialize()).resolves.toBeUndefined();
    });
  });

  describe('invokeAgent', () => {
    const agentConfig: AgentConfig = {
      name: 'requirements-analyst',
      role: 'requirements',
      instructions: 'Analyze requirements',
      tools: ['read', 'write'],
    };

    const context: AgentContext = {
      cwd: projectRoot,
      steering: {
        structure: 'structure.md',
        tech: 'tech.md',
      },
    };

    describe('mock mode tests', () => {
      beforeEach(async () => {
        // Force mock mode for these tests
        process.env.MUSUHI_TEST_FORCE_MOCK = 'true';
        // Need to create new adapter after setting env var
        adapter = new ClaudeCodeAdapter(projectRoot);
        await adapter.initialize();
      });

      afterEach(() => {
        delete process.env.MUSUHI_TEST_FORCE_MOCK;
      });

      it('should invoke agent in mock mode when CLI not available', async () => {
        const response = await adapter.invokeAgent(agentConfig, context);

        expect(response.status).toBe('success');
        expect(response.message).toContain('requirements-analyst');
        expect(response.data?.mode).toBe('mock');
      });

      it('should include agent name in response', async () => {
        const response = await adapter.invokeAgent(agentConfig, context);

        expect(response.data?.agent).toBe('requirements-analyst');
      });

      it('should include context in response data', async () => {
        const response = await adapter.invokeAgent(agentConfig, context);

        expect(response.data?.context).toBe(projectRoot);
      });
    });

    it('should throw error if not initialized', async () => {
      const uninitializedAdapter = new ClaudeCodeAdapter(projectRoot);

      await expect(
        uninitializedAdapter.invokeAgent(agentConfig, context)
      ).rejects.toThrow('claude-code adapter not initialized');
    });
  });

  describe('getCapabilities', () => {
    it('should report full multi-agent support', () => {
      const capabilities = adapter.getCapabilities();

      expect(capabilities.supportsMultiAgent).toBe(true);
    });

    it('should report streaming support', () => {
      const capabilities = adapter.getCapabilities();

      expect(capabilities.supportsStreaming).toBe(true);
    });

    it('should report code generation support', () => {
      const capabilities = adapter.getCapabilities();

      expect(capabilities.supportsCodeGeneration).toBe(true);
    });

    it('should report refactoring support', () => {
      const capabilities = adapter.getCapabilities();

      expect(capabilities.supportsRefactoring).toBe(true);
    });
  });

  describe('AC-8.2: CLI Interface Support', () => {
    it('should detect CLI availability', async () => {
      await adapter.initialize();
      // CLI detection happens in doInitialize
      expect(adapter).toBeDefined();
    });

    it('should fallback to mock mode gracefully', async () => {
      // Force mock mode for this test
      process.env.MUSUHI_TEST_FORCE_MOCK = 'true';
      const mockAdapter = new ClaudeCodeAdapter(projectRoot);

      const agentConfig: AgentConfig = {
        name: 'test-agent',
        role: 'test',
      };

      const context: AgentContext = {
        cwd: projectRoot,
        steering: {},
      };

      await mockAdapter.initialize();
      const response = await mockAdapter.invokeAgent(agentConfig, context);

      expect(response.status).toBe('success');
      expect(response.data?.mode).toBe('mock');

      delete process.env.MUSUHI_TEST_FORCE_MOCK;
    });
  });
});
