/**
 * AC-8.3: IDE Extension Support
 * Windsurf IDE integration adapter (mock implementation)
 * @module @musuhi/platform-adapters/adapters
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
 * Windsurf IDE adapter (mock)
 *
 * NOTE: This is a simulated implementation. Real implementation would
 * use Windsurf platform API when available.
 *
 * Expected real API:
 * ```ts
 * import * as windsurf from '@windsurf/platform-api';
 * windsurf.invoke(agentName, context);
 * ```
 *
 * Features:
 * - AI-native development environment (simulated)
 * - Built-in SDD workflow support (simulated)
 * - Integrated code generation (simulated)
 */
export class WindsurfAdapter extends BasePlatformAdapter {
  readonly platform: PlatformType = 'windsurf';
  readonly version: string = '2.0.0';

  protected async doInitialize(): Promise<void> {
    console.log(`[windsurf] Adapter initialized (mock mode)`);
    console.log(
      `[windsurf] Real implementation requires Windsurf platform API`
    );
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke agent via Windsurf platform (mock)
   */
  async invokeAgent(
    agent: AgentConfig,
    context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    // Mock implementation
    console.log(
      `[windsurf] Mock: Invoking agent ${agent.name} via Windsurf platform`
    );
    console.log(`[windsurf] Mock: Context - ${context.cwd}`);

    return {
      status: 'success',
      message: `Mock: Windsurf agent ${agent.name} invoked successfully`,
      data: {
        agent: agent.name,
        mode: 'mock',
        platform: 'windsurf',
        features: ['ai-native-ide', 'sdd-workflow', 'code-generation'],
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
      `[windsurf] Mock: Phase -1 Gate validation for Articles [${gate.articles.join(', ')}]`
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
   * Windsurf capabilities
   * Note: TUI dashboard partially supported (use IDE panel instead)
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
