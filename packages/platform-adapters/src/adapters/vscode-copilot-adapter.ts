/**
 * AC-8.3: IDE Extension Support
 * VS Code + GitHub Copilot integration adapter (mock implementation)
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
 * VS Code + GitHub Copilot adapter (mock)
 *
 * NOTE: This is a simulated implementation. Real implementation would
 * require a VS Code extension that integrates with GitHub Copilot API.
 *
 * Expected real API:
 * ```ts
 * import * as vscode from 'vscode';
 * vscode.commands.executeCommand('copilot.invoke', agentName, context);
 * ```
 *
 * Features:
 * - Copilot Chat integration (simulated)
 * - Sidebar panel (simulated - TUI not available in IDE)
 * - Inline code suggestions (simulated)
 */
export class VSCodeCopilotAdapter extends BasePlatformAdapter {
  readonly platform: PlatformType = 'vscode-copilot';
  readonly version: string = '2.0.0';

  protected async doInitialize(): Promise<void> {
    console.log(`[vscode-copilot] Adapter initialized (mock mode)`);
    console.log(
      `[vscode-copilot] Real implementation requires VS Code extension API`
    );
  }

  /**
   * AC-3.1: Multi-Agent Orchestration
   * Invoke agent via Copilot Chat (mock)
   */
  async invokeAgent(
    agent: AgentConfig,
    context: AgentContext
  ): Promise<AgentResponse> {
    this.ensureInitialized();

    // Mock implementation
    console.log(
      `[vscode-copilot] Mock: Invoking agent ${agent.name} via Copilot Chat`
    );
    console.log(`[vscode-copilot] Mock: Context - ${context.cwd}`);

    return {
      status: 'success',
      message: `Mock: VS Code Copilot agent ${agent.name} invoked successfully`,
      data: {
        agent: agent.name,
        mode: 'mock',
        platform: 'vscode-copilot',
        features: ['copilot-chat', 'inline-suggestions', 'sidebar-panel'],
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
      `[vscode-copilot] Mock: Phase -1 Gate validation for Articles [${gate.articles.join(', ')}]`
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
   * VS Code + Copilot capabilities
   * Note: TUI dashboard partially supported (use sidebar instead)
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
