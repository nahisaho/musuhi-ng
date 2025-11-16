# ADR-007: マルチプラットフォームアダプターアーキテクチャ

**ステータス**: 承認済み
**日付**: 2025-11-15
**決定者**: System Architect AI、Product Manager
**タグ**: platform-adapters、abstraction、multi-platform、extensibility

---

## コンテキスト

MUSUHI 2.0は8つのAIコーディングプラットフォームで動作する必要があります。コアSDDロジックはプラットフォーム非依存である必要があります。

### サポートされるプラットフォーム

1. Claude Code（Anthropic CLI）
2. Cursor（AI-firstコードエディター）
3. VS Code + GitHub Copilot
4. Zed（高性能エディター）
5. Windsurf IDE
6. Codex CLI（OpenAI）
7. Gemini CLI（Google）
8. Qwen Code（Alibaba）

### 要件カバレッジ

- AC-8.1: プラットフォーム非依存コア
- AC-8.2: CLIインターフェースサポート（Claude、Codex、Gemini、Qwen）
- AC-8.3: IDE拡張サポート（VS Code、Cursor、Zed、Windsurf）
- AC-8.4: 統一設定（.musuhi/config.yaml）
- AC-8.5: コンテキスト共有（steering/、specs/、changes/）
- AC-8.6: プラットフォーム固有最適化
- AC-8.7: LLM抽象化レイヤー
- AC-8.8: 自動検出（Adapter Factory）
- AC-8.9: 互換性マトリクスドキュメント

---

## 決定

**8実装を持つ統一PlatformAdapterインターフェース**

### Adapterインターフェース

```typescript
interface PlatformAdapter {
  // メタデータ
  name: string;
  version: string;
  platform: Platform; // 'claude-code' | 'cursor' | 'vscode' | ...

  // ライフサイクル
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // エージェント呼び出し
  invokeAgent(agentName: string, context: AgentContext): Promise<AgentResponse>;

  // ファイル操作
  readSteering(filePath: string): Promise<string>;
  writeDelta(changePath: string, delta: Delta): Promise<void>;

  // 憲法強制
  enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;

  // プラットフォーム固有
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

### Adapter Factory（自動検出）

```typescript
class AdapterFactory {
  static detectPlatform(): Platform {
    // 環境変数をチェック
    if (process.env.CLAUDE_CODE) return 'claude-code';
    if (process.env.CURSOR) return 'cursor';

    // インストールされた拡張をチェック
    if (fs.existsSync('.cursor/')) return 'cursor';
    if (fs.existsSync('.vscode/extensions/github.copilot')) return 'vscode';

    // CLIの可用性をチェック
    if (execSync('which claude') !== '') return 'claude-code';
    if (execSync('which cursor') !== '') return 'cursor';

    // 設定にフォールバック
    const config = yaml.load('.musuhi/config.yaml');
    return config.platform || 'claude-code'; // デフォルト
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
        throw new Error(`サポートされていないプラットフォーム: ${platform}`);
    }
  }
}
```

### Adapter実装

**1. ClaudeCodeAdapter**（プライマリプラットフォーム）

```typescript
class ClaudeCodeAdapter implements PlatformAdapter {
  async invokeAgent(
    agentName: string,
    context: AgentContext
  ): Promise<AgentResponse> {
    // child_process経由でClaude Code CLIを呼び出し
    const result = execSync(
      `claude @${agentName} --context ${JSON.stringify(context)}`
    );
    return parseAgentResponse(result);
  }

  async readSteering(filePath: string): Promise<string> {
    // Claude Codeは.claude/ディレクトリを自動読み込み
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
    // Cursor拡張APIを使用
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
    // VS Code拡張APIを使用
    const vscode = require('vscode');
    return vscode.commands.executeCommand('copilot.invoke', agentName, context);
  }
}
```

**4-8**: Zed、Windsurf、Codex、Gemini、Qwen用の類似実装

### コンテキスト共有

**統一ディレクトリ構造**（すべてのプラットフォーム）:

```
project/
├── .musuhi/
│   └── config.yaml          # プラットフォーム非依存設定
├── steering/                # プロジェクトメモリ（共有）
│   ├── structure.md
│   ├── tech.md
│   ├── product.md
│   └── constitution.md
├── specs/                   # 承認された仕様（共有）
├── changes/                 # 変更提案（共有）
└── archive/                 # 履歴的変更（共有）
```

**設定形式**（`.musuhi/config.yaml`）:

```yaml
platform: claude-code # 自動検出または手動
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

## 検討した代替案

### 代替案1: プラグインシステム（動的読み込み）

**アプローチ**: プラットフォームアダプターをプラグインとして動的に読み込み

**利点**:

- 拡張可能（サードパーティアダプター）
- 新プラットフォームにコード変更不要

**欠点**:

- より複雑なアーキテクチャ
- セキュリティリスク（信頼できないプラグイン）
- 第5条（Simplicity）に違反

**却下**: 現在のニーズには過剰エンジニアリング。フェーズ1-3では8アダプターで十分。

---

### 代替案2: プラットフォーム固有フォーク

**アプローチ**: 各プラットフォーム用に個別のMUSUHI実装

**利点**:

- 抽象化レイヤーなし（プラットフォームごとにシンプル）

**欠点**:

- メンテナンス悪夢（8つのコードベース）
- 機能パリティ問題
- AC-8.1（プラットフォーム非依存コア）に違反

**却下**: コア要件失敗（プラットフォーム非依存）

---

### 代替案3: LangChain統合

**アプローチ**: LLM抽象化にLangChainを使用

**利点**:

- 成熟したLLM抽象化
- 多くのプロバイダーをサポート

**欠点**:

- Pythonのみ（MUSUHIはTypeScript）
- 我々のユースケースには過剰エンジニアリング
- 第5条（Simplicity）に違反

**却下**: TypeScriptネイティブソリューションを優先

---

## 結果

### 肯定的

- **プラットフォーム独立性**（AC-8.1）
- **8プラットフォーム全体で普遍的採用**
- **コンテキスト共有**（steering/、specs/、changes/）保持（AC-8.5）
- **自動検出**がオンボーディングを簡素化（AC-8.8）

### 否定的

- **メンテナンス負担**（8アダプターのメンテナンス）
- **軽減策**: フェーズ1で3アダプター（Claude Code、Cursor、VS Code）から開始、フェーズ3で残り5を追加

### プラットフォームロールアウト計画

- **フェーズ1**（1-2ヶ月）: Claude Code（プライマリ）
- **フェーズ3**（5-6ヶ月）: Cursor、VS Code+Copilot、Zed、Windsurf、Codex、Gemini、Qwen

---

## 実装

**コンポーネント**:

- `PlatformAdapter.ts`: インターフェース定義
- `AdapterFactory.ts`: 自動検出 + インスタンス化
- `ClaudeCodeAdapter.ts`: Claude Code CLI統合
- `CursorAdapter.ts`: Cursor拡張API
- `VSCodeCopilotAdapter.ts`: VS Code + Copilot
- `ZedAdapter.ts`: ZedプラグインAPI
- `WindsurfAdapter.ts`: WindsurfプラットフォームAPI
- `CodexCLIAdapter.ts`: OpenAI Codex CLIラッパー
- `GeminiCLIAdapter.ts`: Google Gemini CLIラッパー
- `QwenCodeAdapter.ts`: Alibaba Qwen API/CLIラッパー
- `CompatibilityMatrix.md`: プラットフォームごとの機能可用性

**トレーサビリティ**: AC-8.1～AC-8.9

---

## 互換性マトリクス

| 機能                      | Claude Code | Cursor | VS Code | Zed | Windsurf | Codex | Gemini | Qwen |
| ------------------------- | ----------- | ------ | ------- | --- | -------- | ----- | ------ | ---- |
| Constitutional Governance | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Change Workflow           | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Multi-Agent Orchestration | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Parallel Execution        | ✅          | ✅     | ✅      | ✅  | ✅       | ⚠️    | ⚠️     | ⚠️   |
| Gap Analysis              | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |
| Dashboard (TUI)           | ✅          | ✅     | ⚠️      | ✅  | ⚠️       | ✅    | ✅     | ✅   |
| Iterative Verification    | ✅          | ✅     | ✅      | ✅  | ✅       | ✅    | ✅     | ✅   |

**凡例**: ✅ 完全サポート、⚠️ 部分サポート（制限あり、文書化）

---

**ステータス**: 承認済み（優先度: P0、Claude Codeはフェーズ1、他はフェーズ3）
