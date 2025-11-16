/**
 * AC-8.3: IDE Extension Support
 * Zed editor integration adapter (mock implementation)
 * @module @musuhi-ng/platform-adapters/adapters
 */

import { BasePlatformAdapter } from '../base/base-adapter.js';
import type {
  PlatformType,
  AgentConfig,
  AgentContext,
  AgentResponse,
  Delta,
  PhaseGate,
  GateResult,
} from '../types/index.js';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Zed editor adapter (mock)
 *
 * NOTE: This is a simulated implementation. Real implementation would
 * use Zed's extension/plugin API when available.
 *
 * Expected real API:
 * ```ts
 * import * as zed from '@zed/extension-api';
 * zed.invoke(agentName, context);
 * ```
 *
 * Features:
 * - Zed plugin system integration (simulated)
 * - High-performance collaborative editing (simulated)
 * - Built-in AI assistant (simulated)
 */
export class ZedAdapter extends BasePlatformAdapter {
  readonly platform: PlatformType = 'zed';
  readonly version: string = '2.0.0';

  protected async doInitialize(): Promise<void> {
    console.log(`[zed] Adapter initialized (mock mode)`);
    console.log(`[zed] Real implementation requires Zed extension API`);
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke agent via Zed plugin (mock)
   */
  async invokeAgent(
    agent: AgentConfig,
    context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    // Mock implementation
    console.log(`[zed] Mock: Invoking agent ${agent.name} via Zed plugin`);
    console.log(`[zed] Mock: Context - ${context.cwd}`);

    return {
      status: 'success',
      message: `Mock: Zed agent ${agent.name} invoked successfully`,
      data: {
        agent: agent.name,
        mode: 'mock',
        platform: 'zed',
        features: ['plugin-system', 'collaborative-editing', 'builtin-ai'],
      },
    };
  }

  /**
   * AC-8.5: Context Sharing
   * Read steering context file
   */
  async readSteering(path: string): Promise<string> {
    const fullPath = join(this.projectRoot, 'steering', path);
    return await readFile(fullPath, 'utf-8');
  }

  /**
   * AC-8.5: Context Sharing
   * Write delta (file changes)
   */
  async writeDelta(path: string, delta: Delta): Promise<void> {
    const fullPath = join(this.projectRoot, 'changes', path);

    if (delta.type === 'create' || delta.type === 'update') {
      if (!delta.content) {
        throw new Error('Delta content required for create/update');
      }
      await writeFile(fullPath, delta.content, 'utf-8');
    }
  }

  /**
   * AC-1.8: Constitutional Enforcement
   * Enforce Phase -1 Gate
   */
  async enforcePhaseGate(gate: PhaseGate): Promise<GateResult> {
    console.log(
      `[zed] Mock: Phase -1 Gate validation for Articles [${gate.articles.join(', ')}]`
    );

    return {
      status: 'approved',
      message: `Mock: Phase -1 Gate approved`,
      violations: [],
      suggestions: [],
    };
  }

  /**
   * AC-8.6: Platform-Specific Optimizations
   * Zed capabilities (all features supported)
   */
  getCapabilities() {
    return {
      supportsMultiAgent: true,
      supportsStreaming: true,
      supportsCodeGeneration: true,
      supportsRefactoring: true,
    };
  }
}
