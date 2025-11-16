/**
 * @musuhi-ng/platform-adapters
 * Multi-platform AI integration adapters for MUSUHI 2.0
 *
 * Implements Feature 8: Multi-Platform AI Integration
 * - AC-8.1: Platform-Agnostic Core
 * - AC-8.2: CLI Interface Support (Claude, Codex, Gemini, Qwen)
 * - AC-8.3: IDE Extension Support (VS Code, Cursor, Zed, Windsurf)
 * - AC-8.4: Unified Configuration
 * - AC-8.5: Context Sharing
 * - AC-8.6: Platform-Specific Optimizations
 * - AC-8.7: LLM Abstraction Layer
 * - AC-8.8: Auto-Detection
 * - AC-8.9: Compatibility Matrix
 *
 * @module @musuhi-ng/platform-adapters
 */

// Re-export types from @musuhi-ng/core
export type {
  PlatformType,
  AgentConfig,
  AgentContext,
  AgentResponse,
  Delta,
  PhaseGate,
  GateResult,
  IPlatformAdapter,
} from './types/index.js';

// Base adapter classes
export { BasePlatformAdapter, CLIAdapterBase } from './base/index.js';

// Platform adapter implementations
export {
  // CLI Adapters (AC-8.2)
  ClaudeCodeAdapter,
  CodexCLIAdapter,
  GeminiCLIAdapter,
  QwenCodeAdapter,
  // IDE Adapters (AC-8.3)
  CursorAdapter,
  VSCodeCopilotAdapter,
  ZedAdapter,
  WindsurfAdapter,
} from './adapters/index.js';

// Adapter factory (AC-8.8)
export { AdapterFactory } from './factory/index.js';

// LLM abstraction layer (AC-8.7)
export type { ILLMProvider, LLMConfig } from './llm/index.js';
export {
  ClaudeProvider,
  OpenAIProvider,
  GeminiProvider,
  QwenProvider,
} from './llm/index.js';
