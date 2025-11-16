# ADR-007: Multi-Platform Adapter Architecture

**Status**: Accepted
**Date**: 2025-11-15
**Deciders**: System Architect AI, Product Manager
**Tags**: platform-adapters, abstraction, multi-platform, extensibility

---

## Context

MUSUHI 2.0 must work across 8 AI coding platforms. Core SDD logic must remain platform-agnostic.

### Supported Platforms

1. Claude Code (Anthropic CLI)
2. Cursor (AI-first code editor)
3. VS Code + GitHub Copilot
4. Zed (high-performance editor)
5. Windsurf IDE
6. Codex CLI (OpenAI)
7. Gemini CLI (Google)
8. Qwen Code (Alibaba)

### Requirements Coverage

- AC-8.1: Platform-Agnostic Core
- AC-8.2: CLI Interface Support (Claude, Codex, Gemini, Qwen)
- AC-8.3: IDE Extension Support (VS Code, Cursor, Zed, Windsurf)
- AC-8.4: Unified Configuration (.musuhi/config.yaml)
- AC-8.5: Context Sharing (steering/, specs/, changes/)
- AC-8.6: Platform-Specific Optimizations
- AC-8.7: LLM Abstraction Layer
- AC-8.8: Auto-Detection (Adapter Factory)
- AC-8.9: Compatibility Matrix Documentation

---

## Decision

**Unified PlatformAdapter Interface with 8 Implementations**

### Adapter Interface

```typescript
interface PlatformAdapter {
  // Metadata
  name: string;
  version: string;
  platform: Platform; // 'claude-code' | 'cursor' | 'vscode' | ...

  // Lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Agent Invocation
  invokeAgent(agentName: string, context: AgentContext): Promise<AgentResponse>;

  // File Operations
  readSteering(filePath: string): Promise<string>;
  writeDelta(changePath: string, delta: Delta): Promise<void>;

  // Constitutional Enforcement
  enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;

  // Platform-Specific
  getPlatformFeatures(): PlatformFeatures;
}

interface AgentContext {
  phase: SDDPhase;
  artifacts: string[];
  requirements: Requirement[];
  steeringContext: SteeringContext;
}

interface AgentResponse {
  success: boolean;
  output: string;
  artifacts: Artifact[];
  errors: Error[];
}
```

### Adapter Factory (Auto-Detection)

```typescript
class AdapterFactory {
  static detectPlatform(): Platform {
    // Check environment variables
    if (process.env.CLAUDE_CODE) return 'claude-code';
    if (process.env.CURSOR) return 'cursor';

    // Check installed extensions
    if (fs.existsSync('.cursor/')) return 'cursor';
    if (fs.existsSync('.vscode/extensions/github.copilot')) return 'vscode';

    // Check CLI availability
    if (execSync('which claude') !== '') return 'claude-code';
    if (execSync('which cursor') !== '') return 'cursor';

    // Fallback to config
    const config = yaml.load('.musuhi/config.yaml');
    return config.platform || 'claude-code'; // Default
  }

  static createAdapter(platform: Platform): PlatformAdapter {
    switch (platform) {
      case 'claude-code':
        return new ClaudeCodeAdapter();
      case 'cursor':
        return new CursorAdapter();
      case 'vscode':
        return new VSCodeCopilotAdapter();
      case 'zed':
        return new ZedAdapter();
      case 'windsurf':
        return new WindsurfAdapter();
      case 'codex':
        return new CodexCLIAdapter();
      case 'gemini':
        return new GeminiCLIAdapter();
      case 'qwen':
        return new QwenCodeAdapter();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
```

### Adapter Implementations

**1. ClaudeCodeAdapter** (Primary Platform)

```typescript
class ClaudeCodeAdapter implements PlatformAdapter {
  async invokeAgent(
    agentName: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    // Call Claude Code CLI via child_process
    const result = execSync(
      `claude @${agentName} --context ${JSON.stringify(context)}`
    );
    return parseAgentResponse(result);
  }

  async readSteering(filePath: string): Promise<string> {
    // Claude Code auto-reads .claude/ directory
    return fs.readFileSync(filePath, 'utf-8');
  }
}
```

**2. CursorAdapter**

```typescript
class CursorAdapter implements PlatformAdapter {
  async invokeAgent(
    agentName: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    // Use Cursor Extension API
    const cursor = require('@cursor/extension-api');
    return cursor.invoke(agentName, context);
  }
}
```

**3. VSCodeCopilotAdapter**

```typescript
class VSCodeCopilotAdapter implements PlatformAdapter {
  async invokeAgent(
    agentName: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    // Use VS Code Extension API
    const vscode = require('vscode');
    return vscode.commands.executeCommand('copilot.invoke', agentName, context);
  }
}
```

**4-8**: Similar implementations for Zed, Windsurf, Codex, Gemini, Qwen

### Context Sharing

**Unified Directory Structure** (all platforms):

```
project/
├── .musuhi/
│   └── config.yaml          # Platform-agnostic config
├── steering/                # Project memory (shared)
│   ├── structure.md
│   ├── tech.md
│   ├── product.md
│   └── constitution.md
├── specs/                   # Approved specs (shared)
├── changes/                 # Change proposals (shared)
└── archive/                 # Historical changes (shared)
```

**Config Format** (`.musuhi/config.yaml`):

```yaml
platform: claude-code # Auto-detected or manual
version: 2.0.0
constitutional_enforcement: true
dashboard:
  theme: dark
  refresh_interval: 2000 # ms
orchestration:
  default_pattern: sequential
parallel_execution:
  max_concurrency: 10
```

---

## Alternatives Considered

### Alternative 1: Plugin System (Dynamic Loading)

**Approach**: Load platform adapters dynamically as plugins

**Pros**:

- Extensible (third-party adapters)
- No code changes for new platforms

**Cons**:

- More complex architecture
- Security risk (untrusted plugins)
- Violates Article 5 (Simplicity)

**Rejected**: Over-engineered for current needs. 8 adapters sufficient for Phase 1-3.

---

### Alternative 2: Platform-Specific Forks

**Approach**: Separate MUSUHI implementation for each platform

**Pros**:

- No abstraction layer (simpler per-platform)

**Cons**:

- Maintenance nightmare (8 codebases)
- Feature parity issues
- Violates AC-8.1 (Platform-Agnostic Core)

**Rejected**: Fails core requirement (platform-agnostic)

---

### Alternative 3: LangChain Integration

**Approach**: Use LangChain for LLM abstraction

**Pros**:

- Mature LLM abstraction
- Supports many providers

**Cons**:

- Python-only (MUSUHI is TypeScript)
- Over-engineered for our use case
- Violates Article 5 (Simplicity)

**Rejected**: TypeScript-native solution preferred

---

## Consequences

### Positive

- **Platform independence** (AC-8.1)
- **Universal adoption** across 8 platforms
- **Context sharing** (steering/, specs/, changes/) preserved (AC-8.5)
- **Auto-detection** simplifies onboarding (AC-8.8)

### Negative

- **Maintenance burden** (8 adapters to maintain)
- **Mitigation**: Start with 3 adapters (Claude Code, Cursor, VS Code) in Phase 1, add remaining 5 in Phase 3

### Platform Rollout Plan

- **Phase 1** (Months 1-2): Claude Code (primary)
- **Phase 3** (Months 5-6): Cursor, VS Code+Copilot, Zed, Windsurf, Codex, Gemini, Qwen

---

## Implementation

**Components**:

- `PlatformAdapter.ts`: Interface definition
- `AdapterFactory.ts`: Auto-detection + instantiation
- `ClaudeCodeAdapter.ts`: Claude Code CLI integration
- `CursorAdapter.ts`: Cursor extension API
- `VSCodeCopilotAdapter.ts`: VS Code + Copilot
- `ZedAdapter.ts`: Zed plugin API
- `WindsurfAdapter.ts`: Windsurf platform API
- `CodexCLIAdapter.ts`: OpenAI Codex CLI wrapper
- `GeminiCLIAdapter.ts`: Google Gemini CLI wrapper
- `QwenCodeAdapter.ts`: Alibaba Qwen API/CLI wrapper
- `CompatibilityMatrix.md`: Feature availability per platform

**Traceability**: AC-8.1 through AC-8.9

---

## Compatibility Matrix

| Feature                   | Claude Code | Cursor | VS Code | Zed | Windsurf | Codex | Gemini | Qwen |
| ------------------------- | ----------- | ------ | ------- | --- | -------- | ----- | ------ | ---- |
| Constitutional Governance | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Change Workflow           | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Multi-Agent Orchestration | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Parallel Execution        | ✅          | ✅     | ✅      | ✅  | ✅       | ⚠️    | ⚠️     | ⚠️   |
| Gap Analysis              | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Dashboard (TUI)           | ✅          | ✅     | ⚠️      | ✅  | ⚠️       | ✅    | ✅     | ✅   |
| Iterative Verification    | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |

**Legend**: ✅ Full Support, ⚠️ Partial Support (limitations documented)

---

**Status**: Accepted (Priority: P0, Phase 1 for Claude Code, Phase 3 for others)
