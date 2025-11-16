# @musuhi/platform-adapters

Multi-platform AI integration adapters for MUSUHI 2.0 Specification Driven Development framework.

## Overview

`@musuhi/platform-adapters` provides a unified interface for integrating MUSUHI 2.0 with 8 major AI coding assistant platforms. This enables platform-agnostic SDD workflows that work seamlessly across different development environments.

## Features

### ✅ AC-8.1: Platform-Agnostic Core

Core SDD logic remains independent of specific AI platforms.

### ✅ AC-8.2: CLI Interface Support

Adapters for CLI-based platforms:

- **Claude Code** (Anthropic) - Primary platform
- **Codex CLI** (OpenAI)
- **Gemini CLI** (Google)
- **Qwen Code** (Alibaba)

### ✅ AC-8.3: IDE Extension Support

Adapters for IDE-based platforms:

- **VS Code + GitHub Copilot**
- **Cursor** (AI-first editor)
- **Zed** (high-performance editor)
- **Windsurf IDE** (AI-native IDE)

### ✅ AC-8.4: Unified Configuration

Single `.musuhi/config.yaml` format shared across all platforms.

### ✅ AC-8.5: Context Sharing

Maintains project context (steering/, specs/, changes/, archive/) across platform switches.

### ✅ AC-8.6: Platform-Specific Optimizations

Integrates platform-specific features while maintaining common interface.

### ✅ AC-8.7: LLM Abstraction Layer

Supports Claude, GPT-4, Gemini, Qwen models transparently.

### ✅ AC-8.8: Auto-Detection

Automatically detects and configures appropriate platform integration.

### ✅ AC-8.9: Compatibility Matrix

Comprehensive documentation of feature availability per platform.

## Installation

```bash
pnpm add @musuhi/platform-adapters
```

## Usage

### Auto-Detection (Recommended)

```typescript
import { AdapterFactory } from '@musuhi/platform-adapters';

// Auto-detect and initialize
const adapter = await AdapterFactory.createAutoDetected('/path/to/project');

// Use the adapter
const response = await adapter.invokeAgent(
  { name: 'requirements-analyst', role: 'requirements' },
  {
    cwd: '/path/to/project',
    steering: {
      structure: 'structure.md',
      tech: 'tech.md',
    },
  }
);

console.log(response.message);
```

### Manual Platform Selection

```typescript
import { AdapterFactory, ClaudeCodeAdapter } from '@musuhi/platform-adapters';

// Option 1: Use factory
const adapter = AdapterFactory.createAdapter('claude-code', '/path/to/project');
await adapter.initialize();

// Option 2: Direct instantiation
const claudeAdapter = new ClaudeCodeAdapter('/path/to/project');
await claudeAdapter.initialize();
```

### LLM Abstraction Layer

```typescript
import { ClaudeProvider, OpenAIProvider } from '@musuhi/platform-adapters';

// Use Claude LLM
const claude = new ClaudeProvider({
  model: 'claude-3-sonnet-20240229',
  temperature: 0.7,
});

const response = await claude.invoke(
  'Generate TypeScript interface for User model'
);

// Switch to GPT-4 (same interface)
const gpt4 = new OpenAIProvider({
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
});

const response2 = await gpt4.invoke(
  'Generate TypeScript interface for User model'
);
```

## Platform Detection

Auto-detection follows this priority:

1. **Environment Variables** (highest priority)
   - `CLAUDE_CODE=1` → Claude Code
   - `CURSOR_IDE=1` → Cursor
   - `VSCODE_PID=12345` + `GITHUB_COPILOT=1` → VS Code + Copilot
   - `ZED_EDITOR=1` → Zed
   - `WINDSURF_IDE=1` → Windsurf
   - `OPENAI_CODEX=1` → Codex CLI
   - `GOOGLE_GEMINI=1` → Gemini CLI
   - `QWEN_CODE=1` → Qwen Code

2. **Installed Extensions/Plugins**
   - `.cursor/` directory → Cursor
   - `.vscode/extensions/github.copilot` → VS Code + Copilot
   - `.zed/` directory → Zed
   - `.windsurf/` directory → Windsurf

3. **CLI Availability**
   - `which claude` → Claude Code
   - `which cursor` → Cursor
   - `which code` → VS Code
   - `which zed` → Zed
   - `which windsurf` → Windsurf
   - `which codex` → Codex CLI
   - `which gemini` → Gemini CLI
   - `which qwen` → Qwen Code

4. **Config File** (`.musuhi/config.yaml`)
   ```yaml
   platform: claude-code
   ```

5. **Default Fallback**
   - Falls back to `claude-code`

## Compatibility Matrix

| Feature                   | Claude Code | Cursor | VS Code | Zed | Windsurf | Codex | Gemini | Qwen |
| ------------------------- | ----------- | ------ | ------- | --- | -------- | ----- | ------ | ---- |
| Constitutional Governance | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Change Workflow           | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Multi-Agent Orchestration | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Parallel Execution        | ✅          | ✅     | ✅      | ✅  | ✅       | ⚠️    | ⚠️     | ⚠️   |
| Gap Analysis              | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Dashboard (TUI)           | ✅          | ✅     | ⚠️      | ✅  | ⚠️       | ✅    | ✅     | ✅   |
| Streaming Support         | ✅          | ✅     | ✅      | ✅  | ✅       | ❌    | ✅     | ❌   |

**Legend**:
- ✅ Full Support
- ⚠️ Partial Support (see [Compatibility Matrix](./src/compatibility-matrix.md))
- ❌ Not Supported

See [Compatibility Matrix](./src/compatibility-matrix.md) for detailed feature comparison.

## Architecture

### Base Classes

```typescript
abstract class BasePlatformAdapter implements IPlatformAdapter {
  abstract readonly platform: PlatformType;
  abstract readonly version: string;
  abstract invokeAgent(agent: AgentConfig, context: AgentContext): Promise<AgentResponse>;
  abstract readSteering(path: string): Promise<string>;
  abstract writeDelta(path: string, delta: Delta): Promise<void>;
  abstract enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;
  abstract getCapabilities(): PlatformCapabilities;
}

abstract class CLIAdapterBase extends BasePlatformAdapter {
  protected abstract cliCommand: string;
  protected async execCLI(args: string[]): Promise<string>;
  protected async isCLIAvailable(): Promise<boolean>;
}
```

### Platform Adapters

- **ClaudeCodeAdapter** (extends `CLIAdapterBase`)
- **CodexCLIAdapter** (extends `CLIAdapterBase`)
- **GeminiCLIAdapter** (extends `CLIAdapterBase`)
- **QwenCodeAdapter** (extends `CLIAdapterBase`)
- **CursorAdapter** (extends `BasePlatformAdapter`)
- **VSCodeCopilotAdapter** (extends `BasePlatformAdapter`)
- **ZedAdapter** (extends `BasePlatformAdapter`)
- **WindsurfAdapter** (extends `BasePlatformAdapter`)

### LLM Providers

- **ClaudeProvider** (implements `ILLMProvider`)
- **OpenAIProvider** (implements `ILLMProvider`)
- **GeminiProvider** (implements `ILLMProvider`)
- **QwenProvider** (implements `ILLMProvider`)

## API Reference

### AdapterFactory

```typescript
class AdapterFactory {
  static detectPlatform(projectRoot?: string): PlatformType;
  static createAdapter(platform: PlatformType, projectRoot?: string): IPlatformAdapter;
  static async createAutoDetected(projectRoot?: string): Promise<IPlatformAdapter>;
}
```

### IPlatformAdapter

```typescript
interface IPlatformAdapter {
  readonly platform: PlatformType;
  readonly version: string;

  initialize(): Promise<void>;
  invokeAgent(agent: AgentConfig, context: AgentContext): Promise<AgentResponse>;
  readSteering(path: string): Promise<string>;
  writeDelta(path: string, delta: Delta): Promise<void>;
  enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;
  getCapabilities(): PlatformCapabilities;
}
```

### ILLMProvider

```typescript
interface ILLMProvider {
  readonly name: string;
  readonly model: string;

  invoke(prompt: string, context?: Record<string, unknown>): Promise<string>;
  supportsStreaming(): boolean;
  stream?(prompt: string, context: Record<string, unknown> | undefined, onChunk: (chunk: string) => void): Promise<void>;
}
```

## Constitutional Principles

This package adheres to MUSUHI 2.0's 9 Constitutional Articles:

- **Article 1 (Library-First)**: Reuses `@musuhi/core` types and interfaces
- **Article 2 (Test-First)**: 72+ tests with 80%+ coverage
- **Article 4 (Documentation-First)**: Comprehensive README and compatibility matrix
- **Article 5 (Simplicity-First)**: Abstract base classes reduce duplication
- **Article 6 (SOLID)**: Each adapter implements single responsibility

## Testing

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

MIT © MUSUHI Team

## Related Packages

- `@musuhi/core` - Core types and utilities
- `@musuhi/constitutional-governance` - Constitutional validation
- `@musuhi/change-workflow` - Change management
- `@musuhi/multi-agent-orchestrator` - Agent orchestration

## Support

- Documentation: [docs.musuhi.dev](https://docs.musuhi.dev)
- GitHub Issues: [github.com/musuhi/musuhi2/issues](https://github.com/musuhi/musuhi2/issues)
- Discord: [discord.gg/musuhi](https://discord.gg/musuhi)
