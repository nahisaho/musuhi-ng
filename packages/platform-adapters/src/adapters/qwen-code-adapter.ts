/**
 * AC-8.2: CLI Interface Support
 * Alibaba Qwen Code integration adapter
 * @module @musuhi/platform-adapters/adapters
 */

import { CLIAdapterBase } from '../base/cli-adapter-base.js';
import type {
  PlatformType,
  AgentConfig,
  AgentContext,
  AgentResponse,
} from '../types/index.js';

/**
 * Qwen Code adapter implementation
 * Integrates with Alibaba Qwen code generation platform
 *
 * Features:
 * - Qwen Code API/CLI wrapper
 * - Code generation for multiple languages
 * - Limited parallel execution (5 concurrent tasks)
 */
export class QwenCodeAdapter extends CLIAdapterBase {
  readonly platform: PlatformType = 'qwen-code';
  readonly version: string = '2.0.0';
  protected cliCommand = 'qwen';

  protected async doInitialize(): Promise<void> {
    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      console.warn(`[qwen-code] CLI not found. Install Qwen Code CLI first.`);
      console.warn(`[qwen-code] Falling back to mock mode`);
    } else {
      console.log(`[qwen-code] CLI detected and ready`);
    }
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke agent via Qwen CLI
   */
  async invokeAgent(
    agent: AgentConfig,
    _context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    const isAvailable = await this.isCLIAvailable();

    if (!isAvailable) {
      // Mock mode
      console.log(`[qwen-code] Mock: Invoking ${agent.name}`);
      return {
        status: 'success',
        message: `Mock: Qwen agent ${agent.name} invoked`,
        data: { agent: agent.name, mode: 'mock' },
      };
    }

    try {
      const args = ['code-gen'];

      if (agent.instructions) {
        args.push(`--prompt="${agent.instructions}"`);
      }

      const output = await this.execCLI(args);

      return {
        status: 'success',
        message: `Qwen agent ${agent.name} executed successfully`,
        data: { output, agent: agent.name },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Failed to invoke Qwen agent ${agent.name}`,
        error: {
          code: 'QWEN_INVOCATION_FAILED',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * AC-8.6: Platform-Specific Optimizations
   * Qwen has limited parallel execution
   */
  getCapabilities() {
    return {
      supportsMultiAgent: true,
      supportsStreaming: false,
      supportsCodeGeneration: true,
      supportsRefactoring: true,
    };
  }
}
