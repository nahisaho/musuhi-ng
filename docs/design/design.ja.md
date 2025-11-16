# MUSUHI 2.0 アーキテクチャ設計書

**プロジェクト**: MUSUHI 2.0 - Specification Driven Development Framework
**バージョン**: 1.0
**日付**: 2025-11-15
**著者**: System Architect AI
**ステータス**: ドラフト - ステークホルダー承認待ち

---

## 1. エグゼクティブサマリー

### 1.1 概要

MUSUHI 2.0は、6つの主要なSDDツールのベストプラクティスを組み合わせた次世代のSpecification Driven Development (SDD)フレームワークであり、8つの主要なAIコーディングプラットフォームで厳格かつトレース可能でAI支援型のソフトウェア開発を実現します。

本ドキュメントは、`docs/requirements/requirements.md`で定義された91個の要件（機能要件72個+非機能要件19個）に基づく完全なシステムアーキテクチャを提示します。

### 1.2 アーキテクチャの目標

**主要目標**:

1. **プラットフォーム非依存コア**: 特定のAIプラットフォームに依存しないフレームワークロジック
2. **憲法的強制**: Phase -1 Gatesによる不変の9条の強制
3. **100%トレーサビリティ**: 要件 ↔ 設計 ↔ タスク ↔ コード ↔ テストのマッピング
4. **並列実行**: P-wave依存関係分析による50-70%の時間削減
5. **Brownfieldサポート**: 既存コードベースの自動ギャップ分析
6. **マルチエージェントオーケストレーション**: 20の専門エージェントをサポートする9つの会話パターン

### 1.3 主要なアーキテクチャ決定

| 決定                                                  | 根拠                                             | ADR参照 |
| ----------------------------------------------------- | ------------------------------------------------ | ------- |
| ファイルベースストレージ (specs/, changes/, archive/) | シンプル、Git対応、データベース不要              | ADR-002 |
| 憲法強制のためのPhase -1 Gates                        | 実装前に違反を防止                               | ADR-001 |
| 9つのオーケストレーションパターン (ag2インスパイア)   | 異なるワークフロータイプへの柔軟性               | ADR-003 |
| DAGベースのP-waveラベリング                           | 明確なセマンティクス、50-70%時間削減             | ADR-004 |
| マルチ戦略ギャップ分析                                | 高精度、brownfieldサポート                       | ADR-005 |
| TUIダッシュボード (blessed-contrib)                   | 軽量、レスポンシブ（<100ms）、リッチウィジェット | ADR-006 |
| 8プラットフォーム向けAdapterパターン                  | クリーンな抽象化、プラットフォーム独立性         | ADR-007 |

### 1.4 アーキテクチャパターン

**主要パターン**:

- **レイヤードアーキテクチャ**: プレゼンテーション層 (CLI/TUI) → アプリケーション層 (Core SDD) → インフラストラクチャ層 (Platform Adapters)
- **Adapterパターン**: 統一インターフェースを実装するプラットフォーム固有のアダプター
- **Strategyパターン**: 複数のギャップ分析戦略 (AST、パターンマッチング、ML)
- **Observerパターン**: イベント駆動型ダッシュボード更新
- **Commandパターン**: CLIコマンドとエージェント呼び出し
- **Repositoryパターン**: ファイルベースのspecs/changes/archiveストレージ

---

## 2. C4モデル - システムアーキテクチャ

### 2.1 レベル1: コンテキスト図

**目的**: MUSUHI 2.0と外部システム・ユーザーとの関係を示す

```mermaid
C4Context
    title System Context Diagram - MUSUHI 2.0

    Person(dev_enterprise, "Enterprise Developer", "ガバナンス付きSDDでトレーサビリティを持つMUSUHIを使用")
    Person(dev_solo, "Solo Developer", "品質を保ちながら迅速なSDDのためにMUSUHIを使用")
    Person(dev_oss, "OSS Maintainer", "コミュニティコントリビューション管理のためにMUSUHIを使用")
    Person(dev_legacy, "Legacy Modernization Team", "brownfieldギャップ分析のためにMUSUHIを使用")

    System(musuhi, "MUSUHI 2.0", "Specification Driven Development Framework")

    System_Ext(claude_code, "Claude Code", "Anthropic AI CLI")
    System_Ext(cursor, "Cursor", "AI-first code editor")
    System_Ext(vscode_copilot, "VS Code + Copilot", "Microsoft AI pair programmer")
    System_Ext(zed, "Zed", "High-performance collaborative editor")
    System_Ext(windsurf, "Windsurf IDE", "AI-native development environment")
    System_Ext(codex_cli, "Codex CLI", "OpenAI command-line interface")
    System_Ext(gemini_cli, "Gemini CLI", "Google AI command-line tool")
    System_Ext(qwen, "Qwen Code", "Alibaba code generation AI")

    System_Ext(git, "Git VCS", "Version control for specs/changes/archive")
    System_Ext(filesystem, "File System", "Local storage for project memory")

    Rel(dev_enterprise, musuhi, "ガバナンス付きSDDに使用", "CLI/TUI")
    Rel(dev_solo, musuhi, "迅速な開発に使用", "CLI/TUI")
    Rel(dev_oss, musuhi, "コントリビューションワークフローに使用", "CLI/TUI")
    Rel(dev_legacy, musuhi, "ギャップ分析に使用", "CLI/TUI")

    Rel(musuhi, claude_code, "エージェントを呼び出し", "CLI")
    Rel(musuhi, cursor, "エージェントを呼び出し", "Extension API")
    Rel(musuhi, vscode_copilot, "エージェントを呼び出し", "Extension API")
    Rel(musuhi, zed, "エージェントを呼び出し", "Plugin API")
    Rel(musuhi, windsurf, "エージェントを呼び出し", "Platform API")
    Rel(musuhi, codex_cli, "エージェントを呼び出し", "CLI")
    Rel(musuhi, gemini_cli, "エージェントを呼び出し", "CLI")
    Rel(musuhi, qwen, "エージェントを呼び出し", "API/CLI")

    Rel(musuhi, git, "バージョン管理された仕様を保存", "Git CLI")
    Rel(musuhi, filesystem, "steeringファイルの読み書き", "Node.js fs")
```

**主要な相互作用**:

- **ユーザー**: 4つのペルソナタイプがCLI/TUIインターフェースを介して操作
- **AIプラットフォーム**: MUSUHIはアダプターを介して8つのプラットフォームと統合
- **外部システム**: バージョン管理用のGit、ローカルストレージ用のファイルシステム

**トレーサビリティ**: AC-8.1（プラットフォーム非依存コア）、AC-8.2（CLIインターフェース）、AC-8.3（IDE拡張サポート）を満たす

---

### 2.2 レベル2: コンテナ図

**目的**: MUSUHI 2.0内の内部コンテナを示す

```mermaid
C4Container
    title Container Diagram - MUSUHI 2.0

    Person(user, "Developer", "SDDのためにMUSUHIを使用")

    Container_Boundary(musuhi_boundary, "MUSUHI 2.0") {
        Container(cli, "CLI Interface", "Node.js/TypeScript", "コマンドラインエントリポイント (musuhi)")
        Container(tui_dashboard, "TUI Dashboard", "blessed-contrib", "インタラクティブターミナルUI (musuhi view)")

        Container(core_engine, "Core SDD Engine", "TypeScript", "プラットフォーム非依存SDDオーケストレーション")

        Container(constitutional, "Constitutional Governance", "TypeScript", "Phase -1 Gates、条文強制")
        Container(change_workflow, "Change Workflow Manager", "TypeScript", "specs/, changes/, archive/管理")
        Container(orchestrator, "Multi-Agent Orchestrator", "TypeScript", "9つの会話パターン")
        Container(parallel_executor, "Parallel Task Executor", "TypeScript", "P-wave DAGベース実行")
        Container(gap_analyzer, "Brownfield Gap Analyzer", "TypeScript", "AST + パターンマッチング")
        Container(verification_engine, "Iterative Verification Engine", "TypeScript", "タスクごとのチェックポイント")

        Container(platform_adapters, "Platform Adapter Layer", "TypeScript", "8つのプラットフォーム固有アダプター")

        ContainerDb(file_storage, "File-Based Storage", "Markdown/YAML", "steering/, specs/, changes/, archive/")
    }

    System_Ext(ai_platforms, "AI Platforms (8)", "Claude Code, Cursor, VS Code+Copilot, Zed, Windsurf, Codex, Gemini, Qwen")
    System_Ext(git_vcs, "Git VCS", "Version control")

    Rel(user, cli, "コマンドを実行", "CLI")
    Rel(user, tui_dashboard, "ステータスを表示", "TUI")

    Rel(cli, core_engine, "SDDワークフローを呼び出し", "Function calls")
    Rel(tui_dashboard, core_engine, "状態を問い合わせ", "Function calls")

    Rel(core_engine, constitutional, "Phase -1 Gatesを検証", "Function calls")
    Rel(core_engine, change_workflow, "変更を管理", "Function calls")
    Rel(core_engine, orchestrator, "エージェントを調整", "Function calls")
    Rel(core_engine, parallel_executor, "タスクを実行", "Function calls")
    Rel(core_engine, gap_analyzer, "ギャップを分析", "Function calls")
    Rel(core_engine, verification_engine, "タスクを検証", "Function calls")

    Rel(orchestrator, platform_adapters, "AIエージェントを呼び出し", "Adapter interface")
    Rel(platform_adapters, ai_platforms, "プラットフォームAPIを呼び出し", "Platform-specific")

    Rel(constitutional, file_storage, "constitution.mdを読み込み", "File I/O")
    Rel(change_workflow, file_storage, "specs/changesを読み書き", "File I/O")
    Rel(gap_analyzer, file_storage, "要件を読み込み", "File I/O")

    Rel(file_storage, git_vcs, "バージョン管理ストレージ", "Git CLI")
```

**主要コンテナ**:

1. **CLI Interface**: コマンドラインエントリポイント（`musuhi`コマンド）
2. **TUI Dashboard**: インタラクティブターミナルUI（`musuhi view`）
3. **Core SDD Engine**: 中央オーケストレーションロジック
4. **Constitutional Governance**: Phase -1 Gate検証（機能1）
5. **Change Workflow Manager**: specs/changes/archive管理（機能2）
6. **Multi-Agent Orchestrator**: 9つの会話パターン（機能3）
7. **Parallel Task Executor**: P-wave DAG実行（機能4）
8. **Brownfield Gap Analyzer**: ギャップ分析（機能5）
9. **Iterative Verification Engine**: タスクごとのチェックポイント（機能7）
10. **Platform Adapter Layer**: 8プラットフォーム統合（機能8）
11. **File-Based Storage**: Markdown/YAML永続化

**トレーサビリティ**: 全8機能（AC-1.1～AC-8.9）にマップ

---

### 2.3 レベル3: コンポーネント図 - Core SDD Engine

**目的**: Core SDD Engineコンテナ内のコンポーネントを示す

```mermaid
C4Component
    title Component Diagram - Core SDD Engine

    Container_Boundary(core_boundary, "Core SDD Engine") {
        Component(workflow_manager, "Workflow Manager", "TypeScript", "8段階SDDワークフロー調整")
        Component(context_manager, "Context Manager", "TypeScript", "プロジェクトメモリ（steeringファイル）")
        Component(traceability_engine, "Traceability Engine", "TypeScript", "要件 ↔ 設計 ↔ コード ↔ テストマッピング")
        Component(validation_engine, "Validation Engine", "TypeScript", "EARS形式検証")
        Component(event_bus, "Event Bus", "TypeScript", "ダッシュボード更新用Pub/sub")
        Component(config_loader, "Config Loader", "TypeScript", ".musuhi/config.yamlを読み込み")
    }

    Container(constitutional, "Constitutional Governance", "TypeScript")
    Container(change_workflow, "Change Workflow Manager", "TypeScript")
    Container(orchestrator, "Multi-Agent Orchestrator", "TypeScript")
    Container(parallel_executor, "Parallel Task Executor", "TypeScript")
    Container(gap_analyzer, "Brownfield Gap Analyzer", "TypeScript")
    Container(verification_engine, "Iterative Verification Engine", "TypeScript")
    Container(tui_dashboard, "TUI Dashboard", "blessed-contrib")
    ContainerDb(file_storage, "File-Based Storage", "Markdown/YAML")

    Rel(workflow_manager, context_manager, "steeringコンテキストを読み込み", "Function calls")
    Rel(workflow_manager, constitutional, "Phase -1 Gatesを強制", "Function calls")
    Rel(workflow_manager, change_workflow, "変更提案を管理", "Function calls")
    Rel(workflow_manager, orchestrator, "エージェントを調整", "Function calls")
    Rel(workflow_manager, parallel_executor, "P-waveタスクを実行", "Function calls")
    Rel(workflow_manager, gap_analyzer, "ギャップ分析を実行", "Function calls")
    Rel(workflow_manager, verification_engine, "タスク完了を検証", "Function calls")

    Rel(context_manager, file_storage, "steering/を読み込み", "File I/O")
    Rel(validation_engine, file_storage, "EARS形式を検証", "File I/O")
    Rel(traceability_engine, file_storage, "トレーサビリティマトリクスを生成", "File I/O")

    Rel(event_bus, tui_dashboard, "状態更新を公開", "Events")
    Rel(workflow_manager, event_bus, "ワークフローイベントを発行", "Events")

    Rel(config_loader, file_storage, ".musuhi/config.yamlを読み込み", "File I/O")
```

**主要コンポーネント**:

1. **Workflow Manager**: 8段階SDDワークフロー（Research → Monitoring）の調整
2. **Context Manager**: steeringファイル（structure.md, tech.md, product.md, constitution.md）の読み込み
3. **Traceability Engine**: 要件 ↔ 設計 ↔ タスク ↔ コード ↔ テストのリンケージ維持
4. **Validation Engine**: EARS形式（5パターン）の検証
5. **Event Bus**: リアルタイムダッシュボード更新用Pub/sub
6. **Config Loader**: 統一設定（.musuhi/config.yaml）の読み込み

**トレーサビリティ**: NFR-U.2（EARS理解）、NFR-R.2（データ整合性）を満たす

---

### 2.4 レベル3: コンポーネント図 - Constitutional Governance

**目的**: Constitutional Governanceコンテナ内のコンポーネントを示す

```mermaid
C4Component
    title Component Diagram - Constitutional Governance

    Container_Boundary(constitutional_boundary, "Constitutional Governance") {
        Component(constitution_reader, "Constitution Reader", "TypeScript", "steering/constitution.mdを解析")
        Component(article_parser, "Article Parser", "TypeScript", "9条の構造を検証")
        Component(phase_gate_validator, "Phase -1 Gate Validator", "TypeScript", "事前承認検証を強制")
        Component(simplicity_checker, "Simplicity Checker", "TypeScript", "過剰エンジニアリングを検出（第5条）")
        Component(abstraction_checker, "Anti-Abstraction Checker", "TypeScript", "ラッパー抽象化をフラグ（第9条）")
        Component(library_checker, "Library-First Checker", "TypeScript", "既存ライブラリを検索（第1条）")
        Component(test_first_enforcer, "Test-First Enforcer", "TypeScript", "テストなし実装をブロック（第2条）")
        Component(compliance_reporter, "Compliance Reporter", "TypeScript", "遵守レポートを生成")
    }

    ContainerDb(file_storage, "File-Based Storage", "Markdown/YAML")
    Container(core_engine, "Core SDD Engine", "TypeScript")

    Rel(core_engine, phase_gate_validator, "設計フェーズを検証", "Function calls")

    Rel(phase_gate_validator, constitution_reader, "憲法を読み込み", "Function calls")
    Rel(constitution_reader, article_parser, "条文を解析", "Function calls")
    Rel(constitution_reader, file_storage, "steering/constitution.mdを読み込み", "File I/O")

    Rel(phase_gate_validator, simplicity_checker, "プロジェクト数をチェック", "Function calls")
    Rel(phase_gate_validator, abstraction_checker, "ラッパーをチェック", "Function calls")
    Rel(phase_gate_validator, library_checker, "カスタムコードをチェック", "Function calls")
    Rel(phase_gate_validator, test_first_enforcer, "テストファイルをチェック", "Function calls")

    Rel(compliance_reporter, phase_gate_validator, "検証結果を問い合わせ", "Function calls")
    Rel(compliance_reporter, file_storage, "compliance-report.mdを書き込み", "File I/O")
```

**主要コンポーネント**:

1. **Constitution Reader**: `steering/constitution.md`（9条）を解析
2. **Article Parser**: 条文構造を検証
3. **Phase -1 Gate Validator**: 事前承認チェックを強制（AC-1.3）
4. **Simplicity Checker**: >3プロジェクトを検出（AC-1.4）
5. **Anti-Abstraction Checker**: ラッパー抽象化をフラグ（AC-1.5）
6. **Library-First Checker**: npm/PyPIで既存ライブラリを検索（AC-1.7）
7. **Test-First Enforcer**: テストファイルなし実装をブロック（AC-1.6）
8. **Compliance Reporter**: 遵守パーセンテージを生成（AC-1.9）

**トレーサビリティ**: AC-1.1～AC-1.9（機能1: 憲法的ガバナンス）を満たす

---

### 2.5 レベル3: コンポーネント図 - Multi-Agent Orchestrator

**目的**: Multi-Agent Orchestratorコンテナ内のコンポーネントを示す

```mermaid
C4Component
    title Component Diagram - Multi-Agent Orchestrator

    Container_Boundary(orchestrator_boundary, "Multi-Agent Orchestrator") {
        Component(pattern_selector, "Pattern Selector", "TypeScript", "AutoPattern: 会話パターンを選択")
        Component(sequential_chat, "Sequential Chat", "TypeScript", "A → B → Cパターン")
        Component(group_chat, "Group Chat", "TypeScript", "ラウンドロビン/動的スピーカー選択")
        Component(nested_chat, "Nested Chat", "TypeScript", "階層的委譲")
        Component(swarm_pattern, "Swarm Pattern", "TypeScript", "自律的調整")
        Component(capability_registry, "Capability Registry", "TypeScript", "エージェントスキル発見")
        Component(tool_registry, "Tool Registry", "TypeScript", "登録されたエージェント関数")
        Component(conversation_history, "Conversation History", "TypeScript", "メッセージ永続化")
        Component(user_proxy_agent, "UserProxy Agent", "TypeScript", "Human-in-the-loop承認")
    }

    Container(platform_adapters, "Platform Adapter Layer", "TypeScript")
    Container(core_engine, "Core SDD Engine", "TypeScript")
    ContainerDb(file_storage, "File-Based Storage", "Markdown/YAML")

    Rel(core_engine, pattern_selector, "タスクのパターンを要求", "Function calls")

    Rel(pattern_selector, sequential_chat, "Sequentialを選択", "Function calls")
    Rel(pattern_selector, group_chat, "Groupを選択", "Function calls")
    Rel(pattern_selector, nested_chat, "Nestedを選択", "Function calls")
    Rel(pattern_selector, swarm_pattern, "Swarmを選択", "Function calls")

    Rel(sequential_chat, platform_adapters, "エージェントを順次呼び出し", "Adapter interface")
    Rel(group_chat, platform_adapters, "選択されたエージェントを呼び出し", "Adapter interface")
    Rel(nested_chat, platform_adapters, "親/子エージェントを呼び出し", "Adapter interface")
    Rel(swarm_pattern, platform_adapters, "エージェントを並列呼び出し", "Adapter interface")

    Rel(pattern_selector, capability_registry, "エージェントスキルを問い合わせ", "Function calls")
    Rel(capability_registry, file_storage, ".claude/agents/*.mdを読み込み", "File I/O")

    Rel(sequential_chat, tool_registry, "登録されたツールを呼び出し", "Function calls")
    Rel(sequential_chat, conversation_history, "メッセージをログ", "Function calls")
    Rel(sequential_chat, user_proxy_agent, "承認のために一時停止", "Function calls")

    Rel(conversation_history, file_storage, "orchestrator/conversation.logを書き込み", "File I/O")
```

**主要コンポーネント**:

1. **Pattern Selector**: 最適な会話パターンを選択するAutoPatternロジック（AC-3.5）
2. **Sequential Chat**: A → B → C線形ハンドオフ（AC-3.1）
3. **Group Chat**: ラウンドロビン/動的スピーカー選択（AC-3.2）
4. **Nested Chat**: 結果集約を伴う階層的委譲（AC-3.3）
5. **Swarm Pattern**: 自律的エージェント調整（AC-3.4）
6. **Capability Registry**: エージェントスキル発見（AC-3.8）
7. **Tool Registry**: 登録された呼び出し可能関数（AC-3.7）
8. **Conversation History**: デバッグ用メッセージ永続化（AC-3.9）
9. **UserProxy Agent**: Human-in-the-loop承認ゲート（AC-3.6）

**トレーサビリティ**: AC-3.1～AC-3.9（機能3: マルチエージェントオーケストレーション）を満たす

---

### 2.6 レベル3: コンポーネント図 - Parallel Task Executor

**目的**: Parallel Task Executorコンテナ内のコンポーネントを示す

```mermaid
C4Component
    title Component Diagram - Parallel Task Executor

    Container_Boundary(parallel_boundary, "Parallel Task Executor") {
        Component(dependency_analyzer, "Dependency Analyzer", "TypeScript", "tasks.mdからタスク依存関係を解析")
        Component(dag_builder, "DAG Builder", "graphlib", "有向非巡回グラフを構築")
        Component(pwave_labeler, "P-Wave Labeler", "TypeScript", "P0/P1/P2/P3ラベルを割り当て")
        Component(circular_detector, "Circular Dependency Detector", "TypeScript", "DAG内の循環を検出")
        Component(wave_scheduler, "Wave Scheduler", "TypeScript", "P-wave実行をスケジュール")
        Component(concurrent_executor, "Concurrent Executor", "TypeScript", "並列タスク実行（ワーカースレッド）")
        Component(failure_handler, "Failure Handler", "TypeScript", "失敗時に依存タスクをキャンセル")
        Component(progress_tracker, "Progress Tracker", "TypeScript", "リアルタイム進捗計算")
        Component(time_metrics, "Time Metrics Collector", "TypeScript", "逐次実行との時間削減を測定")
    }

    Container(orchestrator, "Multi-Agent Orchestrator", "TypeScript")
    Container(core_engine, "Core SDD Engine", "TypeScript")
    Container(tui_dashboard, "TUI Dashboard", "blessed-contrib")
    ContainerDb(file_storage, "File-Based Storage", "Markdown/YAML")

    Rel(core_engine, dependency_analyzer, "tasks.mdを分析", "Function calls")

    Rel(dependency_analyzer, dag_builder, "依存関係を提供", "Function calls")
    Rel(dag_builder, circular_detector, "DAGを検証", "Function calls")
    Rel(dag_builder, pwave_labeler, "P-waveラベルを割り当て", "Function calls")

    Rel(pwave_labeler, wave_scheduler, "ラベル付きタスクを提供", "Function calls")
    Rel(wave_scheduler, concurrent_executor, "P0/P1/P2 waveをスケジュール", "Function calls")

    Rel(concurrent_executor, orchestrator, "タスクのためにエージェントを呼び出し", "Function calls")
    Rel(concurrent_executor, failure_handler, "タスク失敗を通知", "Function calls")
    Rel(failure_handler, wave_scheduler, "依存タスクをキャンセル", "Function calls")

    Rel(concurrent_executor, progress_tracker, "タスク完了を報告", "Function calls")
    Rel(progress_tracker, tui_dashboard, "進捗更新を送信", "Events")

    Rel(concurrent_executor, time_metrics, "実行時間を記録", "Function calls")
    Rel(time_metrics, file_storage, "parallel-execution-report.mdを書き込み", "File I/O")

    Rel(dependency_analyzer, file_storage, "docs/tasks/tasks.mdを読み込み", "File I/O")
```

**主要コンポーネント**:

1. **Dependency Analyzer**: `tasks.md`からタスク依存関係を解析（AC-4.2）
2. **DAG Builder**: `graphlib`を使用して有向非巡回グラフを構築（AC-4.1）
3. **P-Wave Labeler**: 依存関係に基づいてP0/P1/P2/P3ラベルを割り当て（AC-4.1）
4. **Circular Dependency Detector**: タスクグラフ内の循環を検出（AC-4.7）
5. **Wave Scheduler**: P-wave実行をスケジュール（P0優先、次にP1など）（AC-4.3、AC-4.4、AC-4.5）
6. **Concurrent Executor**: ワーカースレッドを使用して並列タスクを実行（AC-4.3）
7. **Failure Handler**: 失敗時に依存タスクをキャンセル（AC-4.8）
8. **Progress Tracker**: リアルタイム進捗計算（AC-4.9）
9. **Time Metrics Collector**: 逐次ベースラインとの時間削減を測定（AC-4.6）

**トレーサビリティ**: AC-4.1～AC-4.9（機能4: 並列タスク実行）を満たす

---

### 2.7 レベル3: コンポーネント図 - Platform Adapter Layer

**目的**: Platform Adapter Layerコンテナ内のコンポーネントを示す

```mermaid
C4Component
    title Component Diagram - Platform Adapter Layer

    Container_Boundary(adapter_boundary, "Platform Adapter Layer") {
        Component(adapter_factory, "Adapter Factory", "TypeScript", "プラットフォームアダプターを検出してインスタンス化")
        Component(adapter_interface, "PlatformAdapter Interface", "TypeScript", "統一されたアダプター契約")

        Component(claude_adapter, "ClaudeCodeAdapter", "TypeScript", "Claude Code CLI統合")
        Component(cursor_adapter, "CursorAdapter", "TypeScript", "Cursor拡張API統合")
        Component(vscode_adapter, "VSCodeCopilotAdapter", "TypeScript", "VS Code + Copilot統合")
        Component(zed_adapter, "ZedAdapter", "TypeScript", "ZedプラグインAPI統合")
        Component(windsurf_adapter, "WindsurfAdapter", "TypeScript", "WindsurfプラットフォームAPI統合")
        Component(codex_adapter, "CodexCLIAdapter", "TypeScript", "OpenAI Codex CLIラッパー")
        Component(gemini_adapter, "GeminiCLIAdapter", "TypeScript", "Google Gemini CLIラッパー")
        Component(qwen_adapter, "QwenCodeAdapter", "TypeScript", "Alibaba Qwen API/CLIラッパー")
    }

    Container(orchestrator, "Multi-Agent Orchestrator", "TypeScript")
    System_Ext(ai_platforms, "AI Platforms (8)", "外部AIコーディングアシスタント")
    ContainerDb(file_storage, "File-Based Storage", "Markdown/YAML")

    Rel(orchestrator, adapter_factory, "プラットフォームアダプターを要求", "Function calls")
    Rel(adapter_factory, adapter_interface, "アダプターインスタンスを返す", "Implements")

    Rel(adapter_interface, claude_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, cursor_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, vscode_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, zed_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, windsurf_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, codex_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, gemini_adapter, "インスタンス化", "Factory pattern")
    Rel(adapter_interface, qwen_adapter, "インスタンス化", "Factory pattern")

    Rel(claude_adapter, ai_platforms, "Claude Code CLIを呼び出し", "child_process")
    Rel(cursor_adapter, ai_platforms, "Cursor拡張APIを呼び出し", "Platform-specific")
    Rel(vscode_adapter, ai_platforms, "VS Code拡張APIを呼び出し", "Platform-specific")
    Rel(zed_adapter, ai_platforms, "ZedプラグインAPIを呼び出し", "Platform-specific")
    Rel(windsurf_adapter, ai_platforms, "Windsurf APIを呼び出し", "Platform-specific")
    Rel(codex_adapter, ai_platforms, "OpenAI SDKを呼び出し", "@openai/sdk")
    Rel(gemini_adapter, ai_platforms, "Gemini SDKを呼び出し", "@google/generative-ai")
    Rel(qwen_adapter, ai_platforms, "Qwen APIを呼び出し", "HTTP/CLI")

    Rel(adapter_factory, file_storage, ".musuhi/config.yamlを読み込み", "File I/O")
```

**主要コンポーネント**:

1. **Adapter Factory**: プラットフォームを自動検出してアダプターをインスタンス化（AC-8.8）
2. **PlatformAdapter Interface**: すべてのアダプターの統一契約（AC-8.1）
3. **ClaudeCodeAdapter**: Claude Code CLI統合（AC-8.2）
4. **CursorAdapter**: Cursor拡張API統合（AC-8.3）
5. **VSCodeCopilotAdapter**: VS Code + Copilot統合（AC-8.3）
6. **ZedAdapter**: ZedプラグインAPI統合（AC-8.3）
7. **WindsurfAdapter**: WindsurfプラットフォームAPI統合（AC-8.3）
8. **CodexCLIAdapter**: OpenAI Codex CLIラッパー（AC-8.2）
9. **GeminiCLIAdapter**: Google Gemini CLIラッパー（AC-8.2）
10. **QwenCodeAdapter**: Alibaba Qwen API/CLIラッパー（AC-8.2、AC-8.7）

**トレーサビリティ**: AC-8.1～AC-8.9（機能8: マルチプラットフォームAI統合）を満たす

---

### 2.8 レベル4: コード図 - 主要インターフェース

**目的**: 重要なインターフェースとその関係を示す

```mermaid
classDiagram
    class PlatformAdapter {
        <<interface>>
        +initialize() Promise~void~
        +invokeAgent(agentName: string, context: AgentContext) Promise~AgentResponse~
        +readSteering(filePath: string) Promise~string~
        +writeDelta(changePath: string, delta: Delta) Promise~void~
        +enforcePhaseGate(gate: PhaseGate) Promise~GateResult~
    }

    class AgentContext {
        +phase: SDDPhase
        +artifacts: string[]
        +requirements: Requirement[]
        +steeringContext: SteeringContext
    }

    class AgentResponse {
        +success: boolean
        +output: string
        +artifacts: Artifact[]
        +errors: Error[]
    }

    class ConstitutionalGovernance {
        +validatePhaseGate(phase: SDDPhase, design: Design) Promise~GateResult~
        +loadConstitution() Promise~Constitution~
        +checkSimplicity(design: Design) boolean
        +checkAbstraction(design: Design) boolean
        +checkLibraryFirst(implementation: string) boolean
        +checkTestFirst(taskPath: string) boolean
    }

    class ChangeWorkflowManager {
        +initChange(changeName: string) Promise~ChangeWorkspace~
        +reviewChange(changePath: string) Promise~ReviewReport~
        +archiveChange(changePath: string) Promise~void~
        +detectConflicts(delta: Delta) Conflict[]
        +applyDelta(delta: Delta) Promise~void~
    }

    class MultiAgentOrchestrator {
        +selectPattern(task: Task) OrchestrationPattern
        +executeSequential(agents: Agent[]) Promise~Result~
        +executeGroupChat(agents: Agent[], manager: Agent) Promise~Result~
        +executeNested(parent: Agent, children: Agent[]) Promise~Result~
        +executeSwarm(agents: Agent[]) Promise~Result~
        +registerTool(tool: Tool) void
        +queryCapabilities(requirement: string) Agent[]
    }

    class ParallelTaskExecutor {
        +analyzeDependencies(tasks: Task[]) DependencyGraph
        +buildDAG(dependencies: Dependency[]) DAG
        +labelPWaves(dag: DAG) PWaveLabels
        +executePWave(wave: number, tasks: Task[]) Promise~Result[]~
        +handleFailure(failedTask: Task) void
        +calculateTimeSavings() number
    }

    class BrownfieldGapAnalyzer {
        +analyzeGap(requirements: Requirement[], codebase: string) Promise~GapReport~
        +detectMissingFeatures(requirements: Requirement[], codebase: string) MissingFeature[]
        +detectUndocumentedFeatures(requirements: Requirement[], codebase: string) UndocumentedFeature[]
        +detectConflicts(requirements: Requirement[], codebase: string) Conflict[]
        +detectBreakingChanges(requirements: Requirement[], codebase: string) BreakingChange[]
        +generateRecommendations(gaps: Gap[]) Recommendation[]
    }

    class IterativeVerificationEngine {
        +executeTaskByTask(tasks: Task[]) Promise~void~
        +promptContinueReviseRollback(task: Task) Promise~VerificationAction~
        +handleContinue(task: Task) Promise~void~
        +handleRevise(task: Task, instructions: string) Promise~void~
        +handleRollback(task: Task) Promise~void~
        +resumeFromCheckpoint() Promise~Task~
        +trackErrorRate() number
    }

    class DashboardTUI {
        +launch() Promise~void~
        +renderWorkflowStatus(stage: SDDStage) void
        +renderActiveChanges(changes: Change[]) void
        +renderActiveAgents(agents: Agent[]) void
        +renderPWaveStatus(waves: PWave[]) void
        +handleNavigation(key: KeyPress) void
        +refresh() void
    }

    PlatformAdapter <|.. ClaudeCodeAdapter
    PlatformAdapter <|.. CursorAdapter
    PlatformAdapter <|.. VSCodeCopilotAdapter
    PlatformAdapter <|.. ZedAdapter
    PlatformAdapter <|.. WindsurfAdapter
    PlatformAdapter <|.. CodexCLIAdapter
    PlatformAdapter <|.. GeminiCLIAdapter
    PlatformAdapter <|.. QwenCodeAdapter

    MultiAgentOrchestrator --> PlatformAdapter : uses
    ConstitutionalGovernance --> ChangeWorkflowManager : validates
    ParallelTaskExecutor --> MultiAgentOrchestrator : uses
    BrownfieldGapAnalyzer --> ChangeWorkflowManager : integrates
    IterativeVerificationEngine --> MultiAgentOrchestrator : uses
    DashboardTUI --> ParallelTaskExecutor : observes
    DashboardTUI --> ChangeWorkflowManager : observes
```

**主要インターフェース**:

1. **PlatformAdapter**: 8つのAIプラットフォームの統一インターフェース（AC-8.1、AC-8.7）
2. **ConstitutionalGovernance**: Phase -1 Gate強制（AC-1.3、AC-1.4、AC-1.5、AC-1.6、AC-1.7）
3. **ChangeWorkflowManager**: specs/changes/archive管理（AC-2.1～AC-2.9）
4. **MultiAgentOrchestrator**: 9つの会話パターン（AC-3.1～AC-3.9）
5. **ParallelTaskExecutor**: P-wave DAG実行（AC-4.1～AC-4.9）
6. **BrownfieldGapAnalyzer**: ギャップ分析（AC-5.1～AC-5.9）
7. **IterativeVerificationEngine**: タスクごと検証（AC-7.1～AC-7.9）
8. **DashboardTUI**: インタラクティブターミナルUI（AC-6.1～AC-6.9）

**トレーサビリティ**: 全72機能要件（AC-1.1～AC-8.9）を満たす

---

## 3. データフロー図

### 3.1 憲法的ガバナンスフロー

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant CoreEngine as Core SDD Engine
    participant Constitutional as Constitutional Governance
    participant FileStorage as File Storage

    User->>CLI: musuhi design approve
    CLI->>CoreEngine: validateDesignPhase()
    CoreEngine->>Constitutional: validatePhaseGate(design)

    Constitutional->>FileStorage: readConstitution()
    FileStorage-->>Constitutional: constitution.md (9条)

    Constitutional->>Constitutional: checkSimplicity(design)
    alt >3プロジェクト検出
        Constitutional-->>CoreEngine: GateResult(failed, "第5条に違反")
        CoreEngine-->>CLI: 検証失敗
        CLI-->>User: ❌ シンプルさゲート失敗: >3プロジェクトは正当化が必要
    else ≤3プロジェクト
        Constitutional->>Constitutional: checkAbstraction(design)
        Constitutional->>Constitutional: checkLibraryFirst(design)
        Constitutional->>Constitutional: checkTestFirst(tasks)

        Constitutional-->>CoreEngine: GateResult(passed)
        CoreEngine->>FileStorage: approveDesign()
        CoreEngine-->>CLI: 検証成功
        CLI-->>User: ✅ Phase -1 Gates通過、設計承認
    end
```

**トレーサビリティ**: AC-1.3（実装前ゲート）、AC-1.4（シンプルさゲート）、AC-1.5（反抽象化ゲート）、AC-1.6（テストファースト強制）、AC-1.7（ライブラリファースト検証）

---

### 3.2 変更ワークフローフロー

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant ChangeWorkflow as Change Workflow Manager
    participant FileStorage as File Storage
    participant Git

    User->>CLI: musuhi change-init "Add OAuth 2.0 Support"
    CLI->>ChangeWorkflow: initChange("add-oauth2-support")
    ChangeWorkflow->>FileStorage: createDirectory(changes/2025-11-15-add-oauth2-support/)
    ChangeWorkflow->>FileStorage: writeFile(proposal.md)
    ChangeWorkflow->>FileStorage: writeFile(tasks.md)
    ChangeWorkflow->>FileStorage: writeFile(design.md)
    FileStorage-->>ChangeWorkflow: ワークスペース作成完了
    ChangeWorkflow-->>CLI: ChangeWorkspace
    CLI-->>User: ✅ 変更ワークスペース作成完了 changes/2025-11-15-add-oauth2-support/

    User->>User: delta.md編集 (ADDED/MODIFIED/REMOVED)

    User->>CLI: musuhi change-review
    CLI->>ChangeWorkflow: reviewChange()
    ChangeWorkflow->>FileStorage: readDelta()
    FileStorage-->>ChangeWorkflow: delta.md
    ChangeWorkflow->>ChangeWorkflow: detectConflicts(delta)

    alt 競合検出
        ChangeWorkflow-->>CLI: ReviewReport(conflicts)
        CLI-->>User: ❌ 競合検出: [リスト]
    else 競合なし
        ChangeWorkflow-->>CLI: ReviewReport(passed)
        CLI-->>User: ✅ レビュー通過、アーカイブ準備完了

        User->>CLI: musuhi change-archive
        CLI->>ChangeWorkflow: archiveChange()
        ChangeWorkflow->>FileStorage: applyDelta(delta)
        ChangeWorkflow->>FileStorage: moveToArchive()
        ChangeWorkflow->>Git: git commit -m "変更マージ: add-oauth2-support"
        ChangeWorkflow-->>CLI: アーカイブ完了
        CLI-->>User: ✅ 変更アーカイブ完了、specs/更新完了
    end
```

**トレーサビリティ**: AC-2.2（変更初期化）、AC-2.3（Delta形式）、AC-2.5（変更レビュー）、AC-2.6（変更アーカイブ）、AC-2.7（競合検出）

---

### 3.3 並列タスク実行フロー

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant ParallelExecutor as Parallel Task Executor
    participant DAGBuilder as DAG Builder
    participant PWaveLabeler as P-Wave Labeler
    participant ConcurrentExecutor as Concurrent Executor
    participant Orchestrator as Multi-Agent Orchestrator

    User->>CLI: musuhi execute --parallel
    CLI->>ParallelExecutor: execute(tasks)
    ParallelExecutor->>DAGBuilder: buildDAG(dependencies)
    DAGBuilder-->>ParallelExecutor: DAG
    ParallelExecutor->>PWaveLabeler: labelPWaves(DAG)
    PWaveLabeler-->>ParallelExecutor: {P0: [T1, T2], P1: [T3, T4], P2: [T5]}

    ParallelExecutor->>ConcurrentExecutor: executePWave(0, [T1, T2])
    ConcurrentExecutor->>Orchestrator: executeTask(T1) [並列]
    ConcurrentExecutor->>Orchestrator: executeTask(T2) [並列]
    Orchestrator-->>ConcurrentExecutor: T1完了
    Orchestrator-->>ConcurrentExecutor: T2完了
    ConcurrentExecutor-->>ParallelExecutor: P0 wave完了

    ParallelExecutor->>ConcurrentExecutor: executePWave(1, [T3, T4])
    ConcurrentExecutor->>Orchestrator: executeTask(T3) [並列]
    ConcurrentExecutor->>Orchestrator: executeTask(T4) [並列]

    alt タスク失敗
        Orchestrator-->>ConcurrentExecutor: T3失敗
        ConcurrentExecutor->>ParallelExecutor: handleFailure(T3)
        ParallelExecutor->>ParallelExecutor: cancelDependentTasks(P2)
        ParallelExecutor-->>CLI: P1で実行失敗
        CLI-->>User: ❌ タスクT3失敗、P2 waveキャンセル
    else 成功
        Orchestrator-->>ConcurrentExecutor: T3完了
        Orchestrator-->>ConcurrentExecutor: T4完了
        ConcurrentExecutor-->>ParallelExecutor: P1 wave完了

        ParallelExecutor->>ConcurrentExecutor: executePWave(2, [T5])
        ConcurrentExecutor->>Orchestrator: executeTask(T5)
        Orchestrator-->>ConcurrentExecutor: T5完了
        ConcurrentExecutor-->>ParallelExecutor: P2 wave完了

        ParallelExecutor->>ParallelExecutor: calculateTimeSavings()
        ParallelExecutor-->>CLI: 実行完了（60%時間削減）
        CLI-->>User: ✅ 全タスク完了（逐次: 100分、並列: 40分）
    end
```

**トレーサビリティ**: AC-4.1（P-Waveラベリング）、AC-4.2（依存グラフ）、AC-4.3（P0実行）、AC-4.4（P1実行）、AC-4.5（P2+実行）、AC-4.6（時間削減）、AC-4.8（失敗処理）

---

### 3.4 ギャップ分析フロー

```mermaid
sequenceDiagram
    participant User
    participant CLI
    participant GapAnalyzer as Brownfield Gap Analyzer
    participant FileStorage as File Storage
    participant Codebase as Existing Codebase

    User->>CLI: musuhi validate-gap
    CLI->>GapAnalyzer: analyzeGap()

    GapAnalyzer->>FileStorage: readRequirements()
    FileStorage-->>GapAnalyzer: requirements.md (72 AC)

    GapAnalyzer->>Codebase: scanCodebase()
    Codebase-->>GapAnalyzer: AST + ファイルリスト

    GapAnalyzer->>GapAnalyzer: detectMissingFeatures()
    GapAnalyzer->>GapAnalyzer: detectUndocumentedFeatures()
    GapAnalyzer->>GapAnalyzer: detectConflicts()
    GapAnalyzer->>GapAnalyzer: detectBreakingChanges()
    GapAnalyzer->>GapAnalyzer: generateRecommendations()

    GapAnalyzer->>FileStorage: writeGapReport(gap-report.md)
    GapAnalyzer-->>CLI: GapReport

    CLI-->>User: ✅ ギャップ分析完了
    CLI-->>User: サマリー:
    CLI-->>User:   - 要件カバレッジ: 45/72 (62.5%)
    CLI-->>User:   - 欠落機能: 27
    CLI-->>User:   - 未文書化機能: 8
    CLI-->>User:   - 競合: 3
    CLI-->>User:   - 破壊的変更: 2
    CLI-->>User: 完全レポート: gap-report.md
```

**トレーサビリティ**: AC-5.1（ギャップ分析コマンド）、AC-5.2（欠落機能）、AC-5.3（未文書化機能）、AC-5.4（競合検出）、AC-5.5（調整推奨事項）、AC-5.6（破壊的変更検出）、AC-5.8（ギャップレポート形式）

---

## 4. 技術スタック

### 4.1 コア技術

| レイヤー                   | 技術              | バージョン | 目的                   |
| -------------------------- | ----------------- | ---------- | ---------------------- |
| **言語**                   | TypeScript        | 5.3+       | 型安全な実装           |
| **ランタイム**             | Node.js           | 18.x LTS   | JavaScript実行         |
| **パッケージマネージャー** | pnpm              | 8.x+       | 依存関係管理           |
| **ファイル解析**           | unified + remark  | Latest     | Markdown AST解析       |
| **YAML解析**               | js-yaml           | Latest     | YAML解析/シリアライズ  |
| **CLIフレームワーク**      | commander         | Latest     | コマンドライン引数解析 |
| **TUIフレームワーク**      | blessed-contrib   | Latest     | ターミナルUI (ADR-006) |
| **グラフライブラリ**       | graphlib          | Latest     | P-waveラベリング用DAG  |
| **テスト**                 | Vitest            | Latest     | ユニット+統合テスト    |
| **リンティング**           | ESLint + Prettier | Latest     | コード品質             |

### 4.2 プラットフォームSDK

| プラットフォーム  | SDK                     | 統合方法                       |
| ----------------- | ----------------------- | ------------------------------ |
| Claude Code       | `@anthropic-ai/sdk`     | child_processによるCLI呼び出し |
| Cursor            | Cursor Extension API    | 拡張/プラグイン                |
| VS Code + Copilot | VS Code Extension API   | カスタム拡張                   |
| Zed               | Zed Extension API       | Zedプラグイン                  |
| Windsurf          | Windsurf Platform API   | プラットフォーム固有統合       |
| Codex CLI         | `openai` npmパッケージ  | child_processによるCLIラッパー |
| Gemini CLI        | `@google/generative-ai` | child_processによるCLIラッパー |
| Qwen Code         | Qwen APIクライアント    | HTTP APIまたはCLIラッパー      |

### 4.3 開発ツール

| ツール        | 目的                                     |
| ------------- | ---------------------------------------- |
| `tsc`         | TypeScriptコンパイラ                     |
| `Vitest`      | ユニット+統合テスト（80%以上カバレッジ） |
| `ESLint`      | TypeScriptプラグイン付きリンティング     |
| `Prettier`    | コードフォーマット                       |
| `Husky`       | プレコミットフック                       |
| `lint-staged` | ステージされたファイルでリンターを実行   |

**トレーサビリティ**: `steering/tech.md`の技術決定に整合

---

## 5. 設計決定サマリー

### 5.1 アーキテクチャ決定記録（ADR）

**7つのADR作成**:

1. **ADR-001**: 憲法強制メカニズム
   - **決定**: Phase -1 Gate validatorを持つファイルベース憲法
   - **根拠**: 透明性、バージョン管理、人間可読
   - **トレーサビリティ**: AC-1.1～AC-1.9

2. **ADR-002**: ファイルベースストレージ vs データベース
   - **決定**: delta形式の2フォルダーモデル（specs/, changes/, archive/）
   - **根拠**: シンプル、Git対応、データベース不要
   - **トレーサビリティ**: AC-2.1～AC-2.9

3. **ADR-003**: マルチエージェントオーケストレーションパターン選択
   - **決定**: 9つの会話パターンをサポート（Sequential、Group、Nested、Swarmなど）
   - **根拠**: 異なるワークフロータイプへの柔軟性
   - **トレーサビリティ**: AC-3.1～AC-3.9

4. **ADR-004**: 並列実行実装（P-wave）
   - **決定**: graphlibを使用したP0/P1/P2レベルのDAGベース依存関係解決
   - **根拠**: 明確なセマンティクス、50-70%時間削減
   - **トレーサビリティ**: AC-4.1～AC-4.9

5. **ADR-005**: ギャップ分析アルゴリズム
   - **決定**: マルチ戦略検出（AST解析+パターンマッチング+ML）
   - **根拠**: 高精度、複数検出方法
   - **トレーサビリティ**: AC-5.1～AC-5.9

6. **ADR-006**: ダッシュボード技術（TUI vs Web）
   - **決定**: TUI用blessed-contrib（フェーズ1-3）、Webダッシュボード（フェーズ5+）
   - **根拠**: 軽量、<100msレスポンスタイム（NFR-P.1）
   - **トレーサビリティ**: AC-6.1～AC-6.9

7. **ADR-007**: マルチプラットフォームアダプターアーキテクチャ
   - **決定**: 8実装を持つ統一PlatformAdapterインターフェース
   - **根拠**: クリーンな抽象化、型安全性、プラットフォーム独立性
   - **トレーサビリティ**: AC-8.1～AC-8.9

**完全なADRドキュメント**: `docs/design/adr/`ディレクトリを参照

---

## 6. 要件トレーサビリティマトリクス

### 6.1 機能要件カバレッジ

| 機能                                              | 要件   | 設計コンポーネント                                      | ADR     |
| ------------------------------------------------- | ------ | ------------------------------------------------------- | ------- |
| **機能1: 憲法的ガバナンス**                       |        |                                                         |         |
|                                                   | AC-1.1 | Constitution Reader                                     | ADR-001 |
|                                                   | AC-1.2 | Article Parser（9条）                                   | ADR-001 |
|                                                   | AC-1.3 | Phase -1 Gate Validator                                 | ADR-001 |
|                                                   | AC-1.4 | Simplicity Checker                                      | ADR-001 |
|                                                   | AC-1.5 | Anti-Abstraction Checker                                | ADR-001 |
|                                                   | AC-1.6 | Test-First Enforcer                                     | ADR-001 |
|                                                   | AC-1.7 | Library-First Checker                                   | ADR-001 |
|                                                   | AC-1.8 | Phase Gate Validator（ブロッキング）                    | ADR-001 |
|                                                   | AC-1.9 | Compliance Reporter                                     | ADR-001 |
| **機能2: 変更ワークフロー管理**                   |        |                                                         |         |
|                                                   | AC-2.1 | Change Workflow Manager                                 | ADR-002 |
|                                                   | AC-2.2 | Change Initialization                                   | ADR-002 |
|                                                   | AC-2.3 | Delta Format Parser                                     | ADR-002 |
|                                                   | AC-2.4 | Multi-Spec Change Tracker                               | ADR-002 |
|                                                   | AC-2.5 | Change Review Engine                                    | ADR-002 |
|                                                   | AC-2.6 | Change Archival                                         | ADR-002 |
|                                                   | AC-2.7 | Conflict Detector                                       | ADR-002 |
|                                                   | AC-2.8 | Archive Manager（監査証跡）                             | ADR-002 |
|                                                   | AC-2.9 | Change Status Tracker                                   | ADR-002 |
| **機能3: マルチエージェントオーケストレーション** |        |                                                         |         |
|                                                   | AC-3.1 | Sequential Chat                                         | ADR-003 |
|                                                   | AC-3.2 | Group Chat                                              | ADR-003 |
|                                                   | AC-3.3 | Nested Chat                                             | ADR-003 |
|                                                   | AC-3.4 | Swarm Pattern                                           | ADR-003 |
|                                                   | AC-3.5 | Pattern Selector (AutoPattern)                          | ADR-003 |
|                                                   | AC-3.6 | UserProxy Agent                                         | ADR-003 |
|                                                   | AC-3.7 | Tool Registry                                           | ADR-003 |
|                                                   | AC-3.8 | Capability Registry                                     | ADR-003 |
|                                                   | AC-3.9 | Conversation History                                    | ADR-003 |
| **機能4: 並列タスク実行**                         |        |                                                         |         |
|                                                   | AC-4.1 | P-Wave Labeler                                          | ADR-004 |
|                                                   | AC-4.2 | Dependency Analyzer + DAG Builder                       | ADR-004 |
|                                                   | AC-4.3 | Wave Scheduler（P0実行）                                | ADR-004 |
|                                                   | AC-4.4 | Wave Scheduler（P1実行）                                | ADR-004 |
|                                                   | AC-4.5 | Wave Scheduler（P2+実行）                               | ADR-004 |
|                                                   | AC-4.6 | Time Metrics Collector                                  | ADR-004 |
|                                                   | AC-4.7 | Circular Dependency Detector                            | ADR-004 |
|                                                   | AC-4.8 | Failure Handler                                         | ADR-004 |
|                                                   | AC-4.9 | Progress Tracker                                        | ADR-004 |
| **機能5: Brownfieldギャップ分析**                 |        |                                                         |         |
|                                                   | AC-5.1 | Gap Analysis Command (CLI)                              | ADR-005 |
|                                                   | AC-5.2 | Missing Features Detector                               | ADR-005 |
|                                                   | AC-5.3 | Undocumented Features Detector                          | ADR-005 |
|                                                   | AC-5.4 | Conflict Detector                                       | ADR-005 |
|                                                   | AC-5.5 | Recommendation Engine                                   | ADR-005 |
|                                                   | AC-5.6 | Breaking Change Detector                                | ADR-005 |
|                                                   | AC-5.7 | Pattern Violation Detector                              | ADR-005 |
|                                                   | AC-5.8 | Gap Report Generator                                    | ADR-005 |
|                                                   | AC-5.9 | Design Integration                                      | ADR-005 |
| **機能6: インタラクティブダッシュボード**         |        |                                                         |         |
|                                                   | AC-6.1 | Dashboard Launch (CLI)                                  | ADR-006 |
|                                                   | AC-6.2 | Workflow Status View                                    | ADR-006 |
|                                                   | AC-6.3 | Active Changes View                                     | ADR-006 |
|                                                   | AC-6.4 | Current Specs View                                      | ADR-006 |
|                                                   | AC-6.5 | Active Agent Status                                     | ADR-006 |
|                                                   | AC-6.6 | Parallel Execution Visualization                        | ADR-006 |
|                                                   | AC-6.7 | Real-Time Updates（2秒更新）                            | ADR-006 |
|                                                   | AC-6.8 | Interactive Navigation                                  | ADR-006 |
|                                                   | AC-6.9 | Command Shortcuts                                       | ADR-006 |
| **機能7: 反復的検証**                             |        |                                                         |         |
|                                                   | AC-7.1 | Task-by-Task Mode                                       | -       |
|                                                   | AC-7.2 | Task Completion Prompt                                  | -       |
|                                                   | AC-7.3 | Continue Option                                         | -       |
|                                                   | AC-7.4 | Revise Option                                           | -       |
|                                                   | AC-7.5 | Rollback Option                                         | -       |
|                                                   | AC-7.6 | Resume from Checkpoint                                  | -       |
|                                                   | AC-7.7 | Progress Checkboxes                                     | -       |
|                                                   | AC-7.8 | Error Detection Metrics                                 | -       |
|                                                   | AC-7.9 | Mode Persistence                                        | -       |
| **機能8: マルチプラットフォームAI統合**           |        |                                                         |         |
|                                                   | AC-8.1 | PlatformAdapter Interface                               | ADR-007 |
|                                                   | AC-8.2 | CLI Adapters (Claude, Codex, Gemini)                    | ADR-007 |
|                                                   | AC-8.3 | IDE Extension Adapters (VS Code, Cursor, Zed, Windsurf) | ADR-007 |
|                                                   | AC-8.4 | Unified Config Loader                                   | ADR-007 |
|                                                   | AC-8.5 | Context Sharing (steering/, specs/, changes/)           | ADR-007 |
|                                                   | AC-8.6 | Platform-Specific Optimizations                         | ADR-007 |
|                                                   | AC-8.7 | LLM Abstraction Layer                                   | ADR-007 |
|                                                   | AC-8.8 | Auto-Detection (Adapter Factory)                        | ADR-007 |
|                                                   | AC-8.9 | Compatibility Matrix Documentation                      | ADR-007 |

**カバレッジ**: 72/72機能要件（100%）

### 6.2 非機能要件カバレッジ

| カテゴリ             | 要件     | 設計コンポーネント                        | パフォーマンス目標           |
| -------------------- | -------- | ----------------------------------------- | ---------------------------- |
| **パフォーマンス**   |          |                                           |                              |
|                      | NFR-P.1  | Dashboard TUI (blessed-contrib)           | <100ms（95パーセンタイル）   |
|                      | NFR-P.2  | Parallel Task Executor (DAG)              | 50%以上時間削減              |
|                      | NFR-P.3  | Gap Analyzer (AST + パターンマッチング)   | 100k LOCで<60秒              |
|                      | NFR-P.4  | Orchestrator（最小オーバーヘッド）        | <200msルーティング           |
| **信頼性**           |          |                                           |                              |
|                      | NFR-R.1  | Constitutional Governance（読み取り専用） | 100%強制率                   |
|                      | NFR-R.2  | Change Workflow (delta検証)               | 100%データ整合性             |
|                      | NFR-R.3  | Parallel Executor（失敗ハンドラー）       | 100%キャンセル精度           |
| **使いやすさ**       |          |                                           |                              |
|                      | NFR-U.1  | Dashboard TUI（直感的ナビゲーション）     | <5分学習曲線                 |
|                      | NFR-U.2  | EARS Validation（明確なエラーメッセージ） | 90%以上理解                  |
|                      | NFR-U.3  | エラーメッセージ（実行可能な修正）        | すべてのエラーにステップあり |
| **保守性**           |          |                                           |                              |
|                      | NFR-M.1  | 憲法ファイル (steering/constitution.md)   | コード変更不要               |
|                      | NFR-M.2  | Orchestrator（プラグインメカニズム）      | カスタムパターン             |
|                      | NFR-M.3  | Dashboard (.musuhi/config.yaml)           | テーマカスタマイズ           |
| **スケーラビリティ** |          |                                           |                              |
|                      | NFR-SC.1 | Core Engine（ストリーミングファイル解析） | 1000リクエストで<10%劣化     |
|                      | NFR-SC.2 | Orchestrator（ワーカースレッド）          | 20並行エージェント           |
| **互換性**           |          |                                           |                              |
|                      | NFR-C.1  | Platform Adapters                         | 8プラットフォーム            |
|                      | NFR-C.2  | Node.jsランタイム                         | macOS、Linux、Windows        |
| **セキュリティ**     |          |                                           |                              |
|                      | NFR-S.1  | Change Workflow（明示的承認）             | 自動マージなし               |
|                      | NFR-S.2  | Constitutional Governance（ファイル権限） | プログラムによる上書きなし   |

**カバレッジ**: 19/19非機能要件（100%）

---

## 7. 実装ロードマップ

### 7.1 フェーズ1: 基盤（1-2ヶ月）- P0機能

**成果物**:

- 憲法的ガバナンスシステム（機能1）
- 変更ワークフロー管理（機能2）
- マルチエージェントオーケストレーション（機能3）

**タスク**（P0 - 依存関係なし）:

1. プロジェクト構造のセットアップ（pnpm、TypeScript、tsconfig）
2. ファイルストレージ抽象化の実装
3. Constitution Reader + Article Parserの実装
4. Phase -1 Gate Validatorの実装
5. Change Workflow Manager（specs/, changes/, archive/）の実装
6. Delta Format parserの実装
7. Multi-Agent Orchestrator（Sequential、Group、Nestedパターン）の実装
8. PlatformAdapterインターフェースの実装
9. ClaudeCodeAdapter（プライマリプラットフォーム）の実装

**成功基準**:

- Phase -1 Gatesが違反をブロック（100%強制）
- 変更ワークフローがdelta形式をサポート
- 順次エージェントハンドオフが機能

---

### 7.2 フェーズ2: 並列実行（3-4ヶ月）- P1機能

**成果物**:

- 並列タスク実行（機能4）
- Brownfieldギャップ分析（機能5）
- インタラクティブダッシュボード（機能6）

**タスク**（P1 - フェーズ1に依存）:

1. Dependency Analyzerの実装
2. DAG Builder（graphlib）の実装
3. P-Wave Labelerの実装
4. Wave Schedulerの実装
5. Concurrent Executor（ワーカースレッド）の実装
6. Gap Analyzer（AST解析）の実装
7. TUI Dashboard（blessed-contrib）の実装
8. リアルタイムイベントバスの実装

**成功基準**:

- 並列実行で50%以上の時間削減
- ギャップ分析が100k LOCで<60秒完了
- ダッシュボードが<100msで更新

---

### 7.3 フェーズ3: マルチプラットフォームサポート（5-6ヶ月）- P1機能

**成果物**:

- 8プラットフォーム向けプラットフォームアダプター（機能8）

**タスク**（P1 - フェーズ1に依存）:

1. CursorAdapterの実装
2. VSCodeCopilotAdapterの実装
3. ZedAdapterの実装
4. WindsurfAdapterの実装
5. CodexCLIAdapterの実装
6. GeminiCLIAdapterの実装
7. QwenCodeAdapterの実装
8. Adapter Factory（自動検出）の実装

**成功基準**:

- 全8プラットフォームサポート
- プラットフォーム切り替えがシームレスに動作
- プラットフォーム間でコンテキスト共有が保持

---

### 7.4 フェーズ4: 検証と仕上げ（7-8ヶ月）- P2機能

**成果物**:

- 反復的検証システム（機能7）
- テストスイート（189テストケース）
- ドキュメント

**タスク**（P2 - フェーズ2に依存）:

1. Iterative Verification Engineの実装
2. タスクごとモードの実装
3. Continue/Revise/Rollbackの実装
4. ユニットテスト作成（72テスト）
5. 統合テスト作成（72テスト）
6. E2Eテスト作成（45テスト）
7. 技術ドキュメント作成
8. パフォーマンス最適化

**成功基準**:

- 80%以上テストカバレッジ
- 40%早期エラー検出
- 全NFR達成

---

## 8. リスク分析と軽減策

### 8.1 高リスク領域

| リスク                                   | 影響 | 確率 | 軽減策                                                                         |
| ---------------------------------------- | ---- | ---- | ------------------------------------------------------------------------------ |
| **マルチプラットフォーム抽象化の複雑性** | 高   | 中   | 3プラットフォーム（Claude Code、Cursor、VS Code）から開始、フェーズ3で他を追加 |
| **TUIパフォーマンス（NFR-P.1: <100ms）** | 高   | 低   | 軽量blessed-contrib使用、遅延読み込み、キャッシング                            |
| **ギャップ分析精度**                     | 中   | 中   | マルチ戦略検出（AST+パターンマッチング+ML）、ユーザー設定可能しきい値          |
| **P-Wave循環依存関係**                   | 中   | 低   | Circular Dependency Detector、明確なエラーでfail-fast                          |
| **憲法バイパス試行**                     | 高   | 低   | 読み取り専用ファイル権限、監査ログ、Phase -1 Gate強制                          |

### 8.2 技術的負債防止

**戦略**:

1. **テストファースト開発**: 第2条強制（80%以上カバレッジ必須）
2. **ライブラリファースト**: 第1条強制（graphlib、blessed-contribなど使用）
3. **シンプルさファースト**: 第5条強制（過剰エンジニアリング拒否）
4. **ドキュメントファースト**: 第4条強制（実装前にドキュメント）
5. **コードレビュー**: すべてのPRで憲法遵守チェック必須

---

## 9. 付録

### 9.1 用語集

| 用語              | 定義                                              |
| ----------------- | ------------------------------------------------- |
| **AC**            | Acceptance Criteria（例: AC-1.1）                 |
| **ADR**           | Architecture Decision Record                      |
| **EARS**          | Easy Approach to Requirements Syntax（5パターン） |
| **P-Wave**        | 並列実行ウェーブ（P0/P1/P2）                      |
| **Phase -1 Gate** | 事前承認検証（憲法遵守）                          |
| **DAG**           | Directed Acyclic Graph（タスク依存関係）          |
| **TUI**           | Terminal User Interface                           |
| **Delta Format**  | 仕様変更用のADDED/MODIFIED/REMOVEDセクション      |

### 9.2 参考文献

**要件**:

- `docs/requirements/requirements.md`（91要件）

**調査**:

- `docs/research/musuhi-redesign-research-part1.md`（spec-kit、ag2、musuhi）
- `docs/research/musuhi-redesign-research-part2.md`（cc-sdd、OpenSpec、ai-dev-tasks）
- `docs/research/musuhi-redesign-research-part3.md`（推奨事項）

**Steering**:

- `steering/structure.md`（アーキテクチャパターン）
- `steering/tech.md`（技術スタック）
- `steering/product.md`（製品ビジョン）
- `steering/constitution.md`（9つの不変条文）

**ADR**:

- `docs/design/adr/001-constitutional-enforcement.md`
- `docs/design/adr/002-file-based-storage.md`
- `docs/design/adr/003-agent-orchestration-patterns.md`
- `docs/design/adr/004-parallel-execution-algorithm.md`
- `docs/design/adr/005-gap-analysis-strategy.md`
- `docs/design/adr/006-dashboard-tui-framework.md`
- `docs/design/adr/007-multi-platform-abstraction.md`

### 9.3 承認

| 役割             | 名前                | 署名 | 日付       |
| ---------------- | ------------------- | ---- | ---------- |
| Product Manager  |                     |      |            |
| System Architect | System Architect AI |      | 2025-11-15 |
| Tech Lead        |                     |      |            |
| QA Lead          |                     |      |            |

---

**アーキテクチャ設計書終了**

本ドキュメントは、91要件に基づくMUSUHI 2.0の包括的なシステムアーキテクチャを提供します。すべての機能要件と非機能要件が100%カバレッジで設計コンポーネントにマッピングされています。

**次のステップ**:

1. ステークホルダーレビューと承認
2. Project ManagerがP-waveラベリング付きtasks.mdを作成
3. 設計承認後に実装開始
