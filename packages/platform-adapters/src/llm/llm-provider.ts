/**
 * AC-8.7: LLM Abstraction Layer
 * Base interface and types for LLM providers
 * @module @musuhi/platform-adapters/llm
 */

/**
 * LLM provider interface
 * Abstracts differences between Claude, GPT-4, Gemini, Qwen models
 */
export interface ILLMProvider {
  /** Provider name (e.g., 'claude', 'gpt-4', 'gemini', 'qwen') */
  readonly name: string;

  /** Model version (e.g., 'claude-3-opus-20240229') */
  readonly model: string;

  /**
   * Invoke LLM with prompt
   * @param prompt - Input prompt
   * @param context - Additional context (optional)
   * @returns Promise resolving to generated response
   */
  invoke(
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<string>;

  /**
   * Check if provider supports streaming responses
   * @returns true if streaming is supported
   */
  supportsStreaming(): boolean;

  /**
   * Stream response (if supported)
   * @param prompt - Input prompt
   * @param context - Additional context (optional)
   * @param onChunk - Callback for each response chunk
   * @returns Promise resolving when stream completes
   */
  stream?(
    prompt: string,
    context: Record<string, unknown> | undefined,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}

/**
 * LLM configuration options
 */
export interface LLMConfig {
  /** API key (from environment variable or config) */
  apiKey?: string;

  /** Model version override */
  model?: string;

  /** Temperature (0.0 - 1.0) */
  temperature?: number;

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Additional provider-specific options */
  options?: Record<string, unknown>;
}
