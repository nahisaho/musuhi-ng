# MUSUHI 2.0 技術スタック

## 概要

このドキュメントは、次世代仕様駆動開発（SDD）フレームワークであるMUSUHI 2.0の技術選択、開発ツール、技術的制約を定義します。すべての開発は、これらの技術的決定に従う必要があります。

**主要原則**: プラットフォーム非依存のコアとプラットフォーム固有のアダプター

## 実装ステータス

**現在のフェーズ**: フェーズ5（実装） - **ほぼ完了**（2025-11-16更新、全8機能提供完了、717/718テスト成功）

**完了済みフェーズ**:

- ✅ フェーズ1（調査）: 6つのSDDフレームワークを分析
- ✅ フェーズ2（要件）: EARS形式で91要件を定義
- ✅ フェーズ3（設計）: C4図と7つのADRを含む完全なアーキテクチャ
- ✅ フェーズ4（タスク）: P-waveラベリング付き127実装タスク

**フェーズ5実装ステータス**:

✅ **完了済みコンポーネント**:

- モノレポインフラストラクチャ（Project References付きpnpmワークスペース）
- TypeScript 5.3.3設定（strictモード、ESNextモジュール）
- 9つのArticleバリデーターすべて（憲法的ガバナンス）
- PhaseGateValidator（Phase -1ゲート適用）
- WorkflowEngine（8段階SDDワークフロー管理）
- コアパーサー（unified/remarkによるMarkdown、YAML）
- EARSバリデーター（5パターン検証）
- ファイルシステム抽象化（NodeFileSystem、ProjectStructure）
- CLIフレームワーク（3つのコマンド: init、validate、workflow）

🔄 **進行中**:

- 変更ワークフロー管理（Deltaフォーマット、specs/changes/archive）
- マルチエージェントオーケストレーション（9パターン）
- テストスイート（80%カバレッジ目標）

**技術決定確認済み**:

- すべての7つのADR承認済み（ADR-001からADR-007）
- 技術スタック最終決定かつ**実装済み**:
  - TypeScript 5.3.3（strictモード）✅
  - Node.js 18+（ESMモジュール）✅
  - pnpmワークスペース ✅
  - Vitest（ユニット + 統合テスト）✅
  - unified/remark（Markdown処理）✅
  - commander（CLI）✅
  - glob（ファイル操作）✅
- 8つのAIプラットフォーム向けに設計されたプラットフォームアダプター
- フェーズ1-3用TUIフレームワーク選定済み（blessed-contrib）

**実装タイムライン**:

- 合計期間: 並列実行で32週間（8ヶ月）
- P0基盤: 週1-8（23タスク）
- P1コア機能P0: 週9-16（48タスク）
- P2コア機能P1: 週17-24（38タスク）
- P3洗練と統合: 週25-32（18タスク）

## コア技術

### プログラミング言語

**主要言語**: Markdown + YAML（仕様ファイル）

- **バージョン**: CommonMark 0.30+（Markdown）、YAML 1.2
- **正当化**: 人間が読みやすく、バージョン管理に適し、AIが解析可能
- **使用例**:
  - 要件仕様（EARS形式）
  - アーキテクチャ決定記録（ADR）
  - エージェントプロンプトと設定
  - プロジェクトメモリ（steeringファイル）

**実装言語**: TypeScript（将来 - フェーズ5）

- **バージョン**: TypeScript 5.3+
- **正当化**: 型安全性、優れたツール、マルチプラットフォームサポート
- **使用例**:
  - プラットフォーム非依存のSDDコア
  - プラットフォームアダプター（8つのAIアシスタント）
  - エージェントランタイム実装
  - CLIツールとユーティリティ

**追加言語**:

- **Bash/Shell**: ビルドスクリプト、インストール、CI/CD自動化
- **Python**: オプション（PythonネイティブAIプラットフォーム統合用）
- **JavaScript**: 最小限（Node.jsランタイム相互運用のみ）

### 従来のフレームワークなし（ドキュメント駆動アーキテクチャ）

MUSUHI 2.0は**Webアプリケーションやモバイルアプリではありません**。8つのAIコーディングアシスタントで動作する**仕様駆動オーケストレーションフレームワーク**です。

**構築するもの**:

- SDDワークフロー管理のためのCLIツール
- ファイルベースの仕様システム（Markdown/YAML）
- エージェントオーケストレーションエンジン
- プラットフォームアダプター（8つのAIアシスタント）
- ターミナルUI（TUI）ダッシュボード
- 憲法的ガバナンスバリデーター

**構築しないもの**:

- Webフロントエンド（React/Vue/Angularなし）
- REST APIサーバー（Express/NestJSなし）
- データベースバックアップアプリケーション（ファイルベースストレージ）
- モバイルアプリ

## フレームワークとライブラリ

### コア依存関係（実装済み - フェーズ5）

#### ファイルシステムと解析

✅ **インストール済みかつアクティブ**:

- **@types/node** (20.11.0): Node.js型定義
- **glob** (10.3.10): プロジェクト構造分析のためのファイルパターンマッチング
- **unified** (11.0.4) + **remark**: Markdown AST解析/操作
  - `remark-parse` (11.0.0): MarkdownをASTに解析
  - `remark-stringify` (11.0.0): ASTをMarkdownにシリアライズ
  - `remark-frontmatter` (5.0.0): YAMLフロントマターをサポート
  - `remark-gfm` (4.0.0): GitHub Flavored Markdownサポート
  - `mdast-util-from-markdown` (2.0.0): MarkdownからASTへのユーティリティ
  - `mdast-util-to-markdown` (2.1.0): ASTからMarkdownへのユーティリティ
  - `@types/mdast` (4.0.3): Markdown AST用TypeScript型
- **yaml** (2.3.4): YAMLパーサー/シリアライザー（js-yamlを置き換え）

**正当化**: 仕様ファイルのための堅牢なMarkdown/YAML処理

**注**: fs-extraとgray-matterをネイティブNode.js fsとunified/yamlに置き換え

#### CLIとTUI

✅ **インストール済みかつアクティブ**（CLI）:

- **commander** (12.0.0): CLI引数解析 - `musuhi`コマンド構造を強化
- **inquirer** (9.2.0): インタラクティブCLIプロンプト - `musuhi init`のユーザー入力
- **chalk** (5.3.0): ターミナルカラー出力 - カラフルなCLIメッセージ
- **ora** (8.0.0): 長時間実行される操作用スピナー - ビジュアルフィードバック
- **@types/inquirer** (9.0.7): inquirer用TypeScript型

**正当化**: `musuhi`コマンド（init、validate、workflow）のためのリッチCLI体験

**TUIダッシュボード**（将来 - フェーズ5 P2）:

- **決定保留中**: ADR-006がTUIフレームワークを決定
- **オプション**: Ink（Reactベース）、blessed/blessed-contrib（低レベル）、tui-rs（Rust）
- **注**: ダッシュボードパッケージプレースホルダーは存在するが、まだ実装されていない

#### グラフと依存関係管理

- **graphlib**: P-waveラベリングのための有向非巡回グラフ（DAG）
- **viz.js**または**mermaid**: 依存関係グラフの可視化

**正当化**: 並列タスク実行にはDAG分析が必要（cc-sdd機能）

#### テスト

✅ **インストール済みかつアクティブ**:

- **Vitest** (1.2.0): ユニットおよび統合テスト
  - **正当化**: 高速、モダン、TypeScriptネイティブ、ESMファースト
  - **設定**: モノレポルートのvitest.config.ts
  - **カバレッジ**: 最低80%目標
  - **ステータス**: テストフレームワーク設定済み、テスト進行中

**将来のテスト**（E2E - フェーズ5 P3）:

- **Playwright**: CLIワークフローのE2Eテスト（まだインストールされていない）
- **@testing-library/react**（Inkを使用する場合）: TUI用コンポーネントテスト（条件付き）

**テストカバレッジ目標**: 最低80%（3:1テスト対要件比率 = 合計273テスト）

**現在のテストステータス**:

- ユニットテスト: 憲法的ガバナンスバリデーター用に開発中
- 統合テスト: Phase -1ゲートワークフロー用に計画中
- E2Eテスト: 完全なCLIコマンドワークフロー用に計画中

#### コード品質

- **ESLint**: TypeScriptプラグイン付きリンター
  - **設定**: `@typescript-eslint/recommended`
- **Prettier**: コードフォーマッター
  - **設定**: 標準Prettierデフォルト + Markdownサポート
- **Husky**: プリコミットフック
- **lint-staged**: ステージされたファイルのみでリンターを実行

**正当化**: コード品質と一貫したフォーマットの強制

#### AIプラットフォームSDK（マルチプラットフォームサポート）

**プラットフォーム非依存のコア**: AI SDKへの直接的な依存なし（抽象化レイヤー）

**プラットフォームアダプター**（8つのプラットフォーム、それぞれ専用アダプター）:

1. **Claude Code**（Anthropic CLI）
   - SDK: `@anthropic-ai/sdk`（TypeScript）
   - 統合: child_processを介した直接CLI呼び出し
   - ステータス: プライマリプラットフォーム（MUSUHI 2.0はClaude Codeを使用して開発）

2. **Cursor**（IDE）
   - SDK: Cursorの内部API（利用可能な場合）またはファイルベースのコンテキスト共有
   - 統合: 拡張APIまたは`.cursor/`ディレクトリ規約
   - ステータス: 高優先度（人気のAIファーストエディター）

3. **VS Code + GitHub Copilot**
   - SDK: VS Code拡張API + Copilot API（利用可能な場合）
   - 統合: カスタムVS Code拡張
   - ステータス: 高優先度（最大のユーザーベース）

4. **Zed**（エディター）
   - SDK: Zed拡張API
   - 統合: Zedプラグインシステム
   - ステータス: 中優先度（成長するコミュニティ）

5. **Windsurf IDE**
   - SDK: WindsurfのAI API（ドキュメント保留中）
   - 統合: プラグインまたは設定ファイル
   - ステータス: 中優先度（AIネイティブIDE）

6. **Codex CLI**（OpenAI）
   - SDK: `openai` npmパッケージ
   - 統合: child_processを介したCLIラッパー
   - ステータス: 中優先度（OpenAIのコード生成）

7. **Gemini CLI**（Google）
   - SDK: `@google/generative-ai` npmパッケージ
   - 統合: child_processを介したCLIラッパー
   - ステータス: 中優先度（GoogleのGeminiモデル）

8. **Qwen Code**（Alibaba）
   - SDK: QwenのAPIクライアント（ドキュメント保留中）
   - 統合: CLIラッパーまたはHTTP API
   - ステータス: 低優先度（新興プラットフォーム）

**アダプターパターン**:

```typescript
interface PlatformAdapter {
  name: string;
  version: string;
  initialize(): Promise<void>;
  invokeAgent(
    agent: AgentConfig,
    context: AgentContext
  ): Promise<AgentResponse>;
  readSteering(path: string): Promise<string>;
  writeDelta(path: string, delta: Delta): Promise<void>;
  enforcePhaseGate(gate: PhaseGate): Promise<GateResult>;
}
```

## 開発ツール

### パッケージ管理

- **パッケージマネージャー**: pnpm
  - **バージョン**: pnpm 8.x+
  - **正当化**: npmより高速、効率的なディスク使用量、厳格な依存関係解決
  - **ロックファイル**: `pnpm-lock.yaml`
  - **検討した代替**: npm（遅い）、yarn（厳格さが低い）

### ビルドツール

- **バンドラー**: 不要（Node.jsネイティブESMまたはCommonJS）
  - MUSUHI 2.0はCLIツールであり、ブラウザアプリではありません
  - TypeScriptはNode.js互換JavaScriptにコンパイルされます
- **トランスパイラー**: TypeScriptコンパイラ（tsc）
  - **設定**: strictモードの`tsconfig.json`
  - **ターゲット**: ES2022（Node.js 18+サポート）
- **タスクランナー**: npmスクリプト + Turborepo（モノレポが必要な場合）
  - **スクリプト**: `build`、`test`、`lint`、`format`、`dev`

**Webpack/Vite/Rollupなし**: CLI/TUIアプリケーションには該当しません

### バージョン管理

- **VCS**: Git
- **ブランチ戦略**: GitHub Flow（main + 機能ブランチ）
- **コミット規約**: Conventional Commits
  - 形式: `type(scope): description`
  - タイプ: `feat`、`fix`、`docs`、`refactor`、`test`、`chore`
  - 例: `feat(constitutional): implement Phase -1 Gate validator`

### テスト

**ユニットテスト**: Vitest

- **テストファイル**: `*.test.ts`（ソースと同じ場所に配置）
- **カバレッジ**: 最低80%（ステートメント、ブランチ、関数、行）
- **モック**: Vitest組み込みモック

**統合テスト**: Vitest

- **テストファイル**: `*.integration.test.ts`
- **戦略**: コンポーネント間のインタラクションをテスト（例: 憲法的ガバナンス + 変更ワークフロー）

**E2Eテスト**: Playwright（必要な場合）

- **テストファイル**: `*.e2e.test.ts`
- **戦略**: 完全なワークフローをテスト（例: 調査 → 要件 → 設計）

**テスト構成**:

```
tests/
├── unit/
│   ├── constitutional/
│   │   ├── AC-1.1.test.ts
│   │   └── ...
│   └── ...
├── integration/
│   ├── constitutional/
│   │   ├── AC-1.1.integration.test.ts
│   │   └── ...
│   └── ...
└── e2e/
    └── workflows/
        ├── sdd-8-stage-workflow.e2e.test.ts
        └── ...
```

### コード品質

**リンター**: ESLint

- **設定**: `.eslintrc.json`
  - `@typescript-eslint/eslint-plugin`
  - `@typescript-eslint/parser`
  - `eslint-config-prettier`（競合するルールを無効化）
- **ルール**: 厳格（`any`なし、未使用の変数なし、など）

**フォーマッター**: Prettier

- **設定**: `.prettierrc.json`
  - `printWidth: 100`
  - `semi: false`
  - `singleQuote: true`
  - `trailingComma: 'es5'`
  - Markdownフォーマット有効

**プリコミットフック**: Husky + lint-staged

- **フック**: `pre-commit`（ステージされたファイルをlint + format）
- **設定**: `.lintstagedrc.json`

**型チェック**: TypeScriptコンパイラ

- **設定**: `strict: true`の`tsconfig.json`
- **CIチェック**: `tsc --noEmit`（ビルドなしの型チェック）

## デプロイとインフラストラクチャ

### ホスティング

**該当なし**: MUSUHI 2.0はCLIツールであり、ホストされるサービスではありません

**配布**:

- **npm Registry**: npmパッケージとして公開（`@musuhi/core`）
- **GitHub Releases**: ダウンロード可能なCLIバイナリ（オプション）
- **プラットフォームマーケットプレイス**:
  - VS Code Marketplace（VS Code拡張用）
  - Cursor Extensions（利用可能な場合）
  - Zed Extensions（利用可能な場合）

### CI/CD

**パイプライン**: GitHub Actions

- **トリガー**: mainへのプッシュ、プルリクエスト
- **ステージ**:
  1. **Lint**: ESLint + Prettierチェック
  2. **型チェック**: `tsc --noEmit`
  3. **テスト**: Vitest（ユニット + 統合）
  4. **ビルド**: `tsc`（TypeScriptコンパイル）
  5. **E2E**（オプション）: Playwrightテスト
  6. **公開**（タグ時）: npmに公開

**設定**: `.github/workflows/ci.yml`

**デプロイ戦略**:

- **開発**: すべてのコミットで継続的インテグレーション
- **ステージング**: 該当なし（CLIツール）
- **本番**: セマンティックバージョニングリリース（例: v1.0.0、v1.1.0）
  - トリガー: Gitタグ（`git tag v1.0.0`）
  - 自動化: GitHub Actionsがnpmに公開

### モニタリングとロギング

**従来のAPMには該当なし**: MUSUHI 2.0はローカルCLIツールであり、サーバーではありません

**テレメトリ**（オプション、ユーザーオプトイン）:

- **ツール**: 使用状況分析のための最小限のテレメトリ（オプトインのみ）
- **データ**: 匿名化された使用パターン（使用されたエージェント、ワークフローステージの遷移）
- **プライバシー**: Article 8（プライバシーファースト）準拠 - PII、コードコンテンツなし
- **実装**: ADR決定保留中

**ロギング**:

- **ライブラリ**: `pino`または`winston`（構造化ロギング）
- **出力**: ローカルログファイル（`.musuhi/logs/`）
- **レベル**: `error`、`warn`、`info`、`debug`

## 技術的制約

### パフォーマンス要件

**非機能要件に基づく**（NFR-P.1からNFR-P.4）:

- **NFR-P.1**: ダッシュボード応答時間 < 100ms（95パーセンタイル）
  - **影響**: TUIは高度に最適化される必要があります（軽量フレームワークを選択）
- **NFR-P.2**: 並列実行がシーケンシャルと比較して50%+の時間節約を達成
  - **影響**: 効率的なDAGビルダーとタスクスケジューラー
- **NFR-P.3**: ギャップ分析が10K LOCコードベースに対して < 60秒で完了
  - **影響**: 高速ファイルスキャンとAST解析
- **NFR-P.4**: エージェントルーティングオーバーヘッド < 200ms
  - **影響**: オーケストレーションレイヤーの最小限のオーバーヘッド

### プラットフォームサポート

**Node.js**:

- **バージョン**: Node.js 18.x LTS以上
- **正当化**: 長期サポート、モダンES機能（トップレベルawaitなど）

**オペレーティングシステム**:

- **Linux**: プライマリ開発環境
- **macOS**: 完全サポート
- **Windows**: サポート（WSL2またはネイティブ経由）

**AIプラットフォーム**（8つのプラットフォーム）:

- Claude Code（Anthropic CLI）
- Cursor（IDE）
- VS Code + GitHub Copilot
- Zed（エディター）
- Windsurf IDE
- Codex CLI（OpenAI）
- Gemini CLI（Google）
- Qwen Code（Alibaba）

### セキュリティ要件

**非機能要件に基づく**（NFR-S.1からNFR-S.2）:

- **NFR-S.1**: 重要なアクションに明示的な人間の承認が必要
  - **影響**: ユーザー確認プロンプト（inquirerライブラリ）
  - **重要なアクション**: 変更のマージ、タスクの実行、ロールバック
- **NFR-S.2**: プログラムによる憲法の上書きを防止
  - **影響**: `steering/constitution.md`の読み取り専用ファイル権限
  - **強制**: 起動時のファイルシステム権限チェック

**追加セキュリティ**:

- **シークレットストレージなし**: MUSUHI 2.0はAPIキーを保存しません（ユーザーがプラットフォーム設定で管理）
- **ファイルシステム分離**: すべての操作はプロジェクトディレクトリにスコープ
- **監査ロギング**: すべてのフェーズ-1ゲート検証と重要なアクションをログ

### スケーラビリティ要件

**非機能要件に基づく**（NFR-SC.1からNFR-SC.2）:

- **NFR-SC.1**: 1000+の要件を < 10%のパフォーマンス低下で処理
  - **影響**: 効率的なファイル解析（ストリーミング、キャッシング）
- **NFR-SC.2**: リソース競合なく20の並行エージェントをサポート
  - **影響**: エージェントオーケストレーションは並列性をサポートする必要があります（ワーカースレッドまたは子プロセス）

## サードパーティサービス

**必須なし**: MUSUHI 2.0は完全にローカルで、クラウド依存性なし

**オプション統合**（ユーザー提供）:

- **Gitホスティング**: GitHub、GitLab、Bitbucket（バージョン管理用）
- **AIプラットフォーム**: ユーザーが独自のAPIキー/認証情報を提供
- **CI/CD**: GitHub Actions、GitLab CI、Jenkins（ユーザー設定）

## 技術決定とADR

### 確定した決定

#### ADR-001: 憲法強制アーキテクチャ

**決定**: フェーズ-1ゲートバリデーター付きのファイルベース憲法

- **理由**: 透明性、バージョン管理、人間が読める
- **代替**: データベース保存ルール、ハードコードされたロジック
- **日付**: 2025-11-15（要件分析から）
- **ソース**: spec-kit（9つのArticle）

#### ADR-002: ファイルベースストレージ（specs/、changes/、archive/）

**決定**: デルタ形式の2フォルダーモデル

- **理由**: シンプル、Git対応、データベースオーバーヘッドなし
- **代替**: データベース（複雑すぎる）、Gitブランチ（構造化が少ない）
- **日付**: 2025-11-15（要件分析から）
- **ソース**: OpenSpec

#### ADR-003: エージェントオーケストレーションパターン（9パターン）

**決定**: 9つのオーケストレーションパターンをサポート（Sequential、Group、Nestedなど）

- **理由**: 異なるワークフロータイプの柔軟性
- **代替**: 単一パターン（制限が多すぎる）
- **日付**: 2025-11-15（要件分析から）
- **ソース**: ag2（AutoGen 2）

#### ADR-004: 並列実行アルゴリズム（P-Waveラベリング）

**決定**: P0/P1/P2レベルのDAGベース依存関係解決

- **理由**: 明確なセマンティクス、50-70%の時間節約
- **代替**: 手動並列化（エラーが発生しやすい）
- **日付**: 2025-11-15（要件分析から）
- **ソース**: cc-sdd

#### ADR-005: ギャップ分析戦略（AST解析 + パターンマッチング）

**決定**: マルチ戦略ギャップ検出（欠落、競合、非推奨）

- **理由**: 高精度、複数の検出方法
- **代替**: 単純なgrep（誤検出が多すぎる）
- **日付**: 2025-11-15（要件分析から）
- **ソース**: cc-sdd

### 保留中の決定（フェーズ3: 設計）

#### ADR-006: ダッシュボードTUIフレームワーク

**オプション**:

1. **Ink**（CLI用React）
   - 長所: 馴染みのあるReact API、コンポーネントベース
   - 短所: シンプルなTUIにReactのオーバーヘッド
2. **blessed-contrib**（Node.js TUIライブラリ）
   - 長所: 軽量、成熟、リッチなウィジェット
   - 短所: 低レベルAPI、モダンでない
3. **tui-rs**（Rust TUIライブラリ）
   - 長所: 非常に高速、モダン
   - 短所: Rustツールチェーンが必要、より複雑なビルド

**決定日**: フェーズ3（設計）

#### ADR-007: マルチプラットフォーム抽象化レイヤー

**オプション**:

1. **統一アダプターインターフェース**（TypeScriptインターフェース、8つの実装）
   - 長所: クリーンな抽象化、型安全性
   - 短所: メンテナンスオーバーヘッド（8つのアダプター）
2. **プラグインシステム**（動的ロード）
   - 長所: 拡張可能、サードパーティアダプター
   - 短所: より複雑なアーキテクチャ

**決定日**: フェーズ3（設計）

#### ADR-008: EARS検証アルゴリズム

**オプション**:

1. **正規表現ベース**（パターンマッチング）
   - 長所: シンプル、高速
   - 短所: 複雑な文の精度が限定的
2. **ASTベース**（MarkdownをASTに解析、構造を検証）
   - 長所: より正確、拡張可能
   - 短所: 遅い、より複雑

**決定日**: フェーズ3（設計）

## 非推奨技術

**該当なし**: MUSUHI 2.0はグリーンフィールドプロジェクト（非推奨にするレガシー技術なし）

**将来の非推奨**（該当する場合）:

- 技術が段階的に廃止される際はここにドキュメント化
- 移行計画と期限を含める

## 開発環境セットアップ

### 前提条件

**必須**:

```bash
Node.js 18+ (LTS)         # JavaScriptランタイム
pnpm 8+                   # パッケージマネージャー
Git 2.x+                  # バージョン管理
```

**オプション**:

```bash
Docker                    # プラットフォームアダプターのテスト用（オプション）
VS Code                   # 推奨IDE
```

### クイックスタート

**リポジトリのクローン**:

```bash
git clone https://github.com/musuhi/musuhi2.git
cd musuhi2
```

**依存関係のインストール**:

```bash
pnpm install
```

**環境のセットアップ**:

```bash
# .envは不要（シークレットなし、クラウドサービスなし）
# MUSUHI 2.0は完全にローカル
```

**プロジェクトのビルド**（将来 - フェーズ5）:

```bash
pnpm build                # TypeScriptコンパイル
```

**テストの実行**（将来 - フェーズ6）:

```bash
pnpm test                 # ユニット + 統合テスト
pnpm test:e2e             # E2Eテスト
pnpm test:coverage        # カバレッジレポート
```

**開発モード**（将来 - フェーズ5）:

```bash
pnpm dev                  # ウォッチモード（ファイル変更時に自動リビルド）
```

**LintとFormat**:

```bash
pnpm lint                 # ESLintチェック
pnpm format               # Prettierフォーマット
pnpm type-check           # TypeScript型チェック
```

### IDE設定

**推奨IDE**: VS Code

**拡張機能**:

- `dbaeumer.vscode-eslint`（ESLint）
- `esbenp.prettier-vscode`（Prettier）
- `ms-vscode.vscode-typescript-next`（TypeScript）
- `yzhang.markdown-all-in-one`（Markdown編集）
- `redhat.vscode-yaml`（YAML編集）

**VS Code設定**（`.vscode/settings.json`）:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## プラットフォーム固有の設定

### Claude Code（プライマリプラットフォーム）

**設定**: `.claude/`ディレクトリ

- `agents/*.md`: 20のエージェントプロンプト
- `commands/*.md`: カスタムスラッシュコマンド
- `CLAUDE.md`: クイックスタートガイド

**Steeringアクセス**: エージェントは自動的に`steering/*.md`ファイルを読み取ります

### Cursor

**設定**: `.cursor/`ディレクトリ（将来）

- `.claude/`と同様の構造
- プラットフォーム固有のプロンプト適応

### VS Code + Copilot

**設定**: `.vscode/`ディレクトリ + カスタム拡張

- 拡張マニフェスト: `package.json`
- Steering統合: `steering/*.md`を読み取るカスタムコマンド

### Zed

**設定**: `.zed/`ディレクトリ（将来）

- Zedプラグインマニフェスト
- Zed拡張API経由のSteering統合

### Windsurf IDE

**設定**: `.windsurf/`ディレクトリ（将来）

- プラットフォーム固有の設定ファイル
- Steering統合（APIドキュメント保留中）

### Codex CLI / Gemini CLI / Qwen Code

**設定**: CLIラッパー

- child_process経由で呼び出し
- 入力プロンプトとしてsteeringコンテキストを渡す

## 技術的リスクと緩和策

### 高リスク領域

#### リスク1: マルチプラットフォーム抽象化の複雑さ

**リスク**: 8つのプラットフォームアダプターの維持にはコストがかかる可能性があります
**緩和策**:

- フェーズ1で3つのプラットフォーム（Claude Code、Cursor、VS Code+Copilot）から開始
- フェーズ2-3で残り5つのプラットフォームを追加
- プラットフォームアダプターへのコミュニティ貢献

**テスト戦略**: アダプターコントラクトテスト（すべてのアダプターが同じインターフェースを実装することを保証）

#### リスク2: TUIパフォーマンス（NFR-P.1: < 100ms）

**リスク**: TUIダッシュボードが大規模プロジェクトで100ms応答時間を超える可能性があります
**緩和策**:

- 軽量TUIフレームワークを選択（必要に応じてInkよりblessed）
- 遅延ロード（可視コンポーネントのみをレンダリング）
- キャッシング（高コストな計算をメモ化）

**テスト戦略**: 1000+要件でのパフォーマンスベンチマーク

#### リスク3: ギャップ分析の精度（誤検出/未検出）

**リスク**: ギャップ分析が競合を見逃したり、誤検出を報告したりする可能性があります
**緩和策**:

- マルチ戦略検出（AST + パターンマッチング + ML）
- ユーザー設定可能な感度しきい値
- 手動レビューワークフロー

**テスト戦略**: 検証のための既知の良いコードベースと悪いコードベース

### 中リスク領域

#### リスク4: EARS検証の精度

**リスク**: EARSバリデーターが有効な要件を誤ってフラグする可能性があります
**緩和策**:

- 多様なEARS例を含む包括的なテストスイート
- ユーザーオーバーライド（手動承認を許可）

**テスト戦略**: テストスイートに100+のEARS例

#### リスク5: 並列実行オーバーヘッド（NFR-P.4: < 200ms）

**リスク**: エージェントルーティングオーバーヘッドが200msを超える可能性があります
**緩和策**:

- オーケストレーションレイヤーの最適化（最小限のシリアライゼーション）
- ベンチマークとプロファイリング

**テスト戦略**: 20の並行エージェントでの負荷テスト

---

**ドキュメントメタデータ**:

- **バージョン**: 1.0
- **最終更新**: 2025-11-15（Steering Agentによる自動生成）
- **ステータス**: アクティブ
- **次回レビュー**: フェーズ3（設計）完了後

**関連ドキュメント**:

- プロジェクト構造: `steering/structure.md`
- 製品コンテキスト: `steering/product.md`
- SDDワークフロー: `steering/rules/workflow.md`
- 要件: `docs/requirements/requirements.md`
