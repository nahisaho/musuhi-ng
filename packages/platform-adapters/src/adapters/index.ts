/**
 * Platform adapter implementations
 * @module @musuhi-ng/platform-adapters/adapters
 */

// CLI Adapters (AC-8.2)
export { ClaudeCodeAdapter } from './claude-code-adapter.js';
export { CodexCLIAdapter } from './codex-cli-adapter.js';
export { GeminiCLIAdapter } from './gemini-cli-adapter.js';
export { QwenCodeAdapter } from './qwen-code-adapter.js';

// IDE Adapters (AC-8.3)
export { CursorAdapter } from './cursor-adapter.js';
export { VSCodeCopilotAdapter } from './vscode-copilot-adapter.js';
export { ZedAdapter } from './zed-adapter.js';
export { WindsurfAdapter } from './windsurf-adapter.js';
