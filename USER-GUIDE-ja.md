# MUSUHI-NG ユーザーガイド

**バージョン**: 1.0.0
**最終更新**: 2025-11-16

## 目次

1. [はじめに](#はじめに)
2. [インストール](#インストール)
3. [クイックスタート](#クイックスタート)
4. [コアコンセプト](#コアコンセプト)
5. [8段階SDDワークフロー](#8段階sddワークフロー)
6. [憲法的ガバナンス](#憲法的ガバナンス)
7. [マルチエージェント・オーケストレーション](#マルチエージェントオーケストレーション)
8. [プラットフォーム統合](#プラットフォーム統合)
9. [高度な機能](#高度な機能)
10. [トラブルシューティング](#トラブルシューティング)
11. [ベストプラクティス](#ベストプラクティス)
12. [FAQ](#faq)

---

## はじめに

### MUSUHI-NGとは？

MUSUHI-NG(Multi-User Specification Unified Hierarchical Intelligence - Next Generation)は、仕様駆動開発(SDD)のための包括的なフレームワークです。AIを活用したソフトウェア開発を構造化された方法論で実現し、8つの主要なAIコーディングアシスタントとシームレスに統合します。

### 主な特徴

- **憲法的ガバナンス** - 9つの不変条項がLibrary-First、Test-First、Security-Firstの原則を強制
- **変更ワークフロー管理** - 8段階の自動化されたSDDワークフロー(Research → Requirements → Design → Tasks → Implementation → Testing → Deployment → Monitoring)
- **マルチエージェント・オーケストレーション** - 20の専門AIエージェントが9つの会話パターンで協調
- **並列実行** - P-wave依存関係解析により72%のタイムライン短縮
- **ブラウンフィールド・ギャップ分析** - 既存コードベースの多戦略分析(AST + パターンマッチング + ML)
- **インタラクティブダッシュボード** - トレーサビリティ可視化によるリアルタイムTUIモニタリング
- **反復的検証** - 継続的な要件カバレッジ検証
- **マルチプラットフォームAI統合** - VS Code + Copilot、Cursor、Zed、Windsurf、Claude Code、Codex CLI、Gemini CLI、Qwen Codeの統一アダプタインターフェース

### このガイドの対象者

- AIアシスタントを使用するソフトウェア開発者
- プロジェクトマネージャー/アーキテクト
- QA/テストエンジニア
- DevOps/SREエンジニア
- 仕様駆動開発を学ぶ学生

---

## インストール

### システム要件

- **Node.js**: >=18.0.0
- **pnpm**: >=8.0.0(推奨)またはnpm >= 9.0.0
- **TypeScript**: ^5.3.3(ライブラリとして使用する場合)
- **Git**: >= 2.30.0

### インストール方法

#### 方法1: npxで使用(インストール不要)

```bash
# 一時的に使用
npx @musuhi-ng/cli --help
npx @musuhi-ng/cli init my-project
```

#### 方法2: グローバルインストール(推奨)

```bash
# npmでインストール
npm install -g @musuhi-ng/cli

# またはpnpmでインストール
pnpm add -g @musuhi-ng/cli

# musuhi コマンドの使用
musuhi --help
musuhi init my-project
```

#### 方法3: ライブラリとして使用

```bash
# プロジェクトにインストール
npm install @musuhi-ng/core

# または特定のパッケージをインストール
npm install @musuhi-ng/constitutional-governance
npm install @musuhi-ng/multi-agent-orchestrator
npm install @musuhi-ng/gap-analyzer
```

#### 方法4: 開発版のインストール

```bash
# リポジトリをクローン
git clone https://github.com/nahisaho/musuhi-ng.git
cd musuhi-ng

# 依存関係をインストール
pnpm install

# すべてのパッケージをビルド
pnpm build

# テストを実行
pnpm test
```

### インストールの確認

```bash
# バージョン確認
musuhi --version

# ヘルプ表示
musuhi --help
```

---

## クイックスタート

### 1. 新規プロジェクトの初期化

```bash
# プロジェクトディレクトリを作成
npx @musuhi-ng/cli init my-project
cd my-project
```

これにより以下が作成されます:

```
my-project/
├── steering/               # プロジェクトメモリ(ステアリングコンテキスト)
│   ├── structure.md       # アーキテクチャパターン
│   ├── tech.md            # 技術スタック
│   └── product.md         # ビジネスコンテキスト
├── docs/
│   ├── requirements/      # EARS形式の要件
│   ├── design/            # C4図とADR
│   └── tasks/             # 実装計画
├── .musuhi/
│   └── config.yml         # 設定ファイル
└── package.json
```

### 2. プラットフォームアダプタの設定

```bash
# 例: VS Code + GitHub Copilot
musuhi config set platform vscode-copilot

# 利用可能なプラットフォーム:
# - vscode-copilot    (VS Code + GitHub Copilot)
# - cursor            (Cursor)
# - zed               (Zed)
# - windsurf          (Windsurf)
# - claude-code       (Claude Code)
# - codex-cli         (OpenAI Codex CLI)
# - gemini-cli        (Google Gemini CLI)
# - qwen-code         (Alibaba Qwen Code)
```

### 3. SDDワークフローの開始

```bash
# ステージ1: 調査(Research)
musuhi workflow research "ユーザー認証の実装"

# ステージ2: 要件定義(Requirements) - EARS形式
musuhi workflow requirements

# ステージ3: 設計(Design) - C4 + ADR
musuhi workflow design

# ステージ4: タスク計画(Tasks) - P-wave
musuhi workflow tasks

# ステージ5-8: 実装〜モニタリング
musuhi workflow execute
```

### 4. ダッシュボードの起動

```bash
# リアルタイムTUIダッシュボード
musuhi dashboard
```

ダッシュボードには以下が表示されます:

- ワークフロー進捗状況
- 要件トレーサビリティマトリックス
- 憲法的ゲート検証状態
- エージェント実行ログ
- テストカバレッジメトリクス

---

## コアコンセプト

### 仕様駆動開発(SDD)

MUSUHI-NGは**仕様駆動開発**方法論に基づいています:

1. **仕様が第一**: コードよりも要件と設計を優先
2. **トレーサビリティ**: 要件 ↔ 設計 ↔ タスク ↔ コード ↔ テストの完全な追跡
3. **検証可能性**: すべての要件がテスト可能
4. **ガバナンス**: 憲法的条項による品質ゲート

### EARS要件フォーマット

すべての要件は**EARS**(Easy Approach to Requirements Syntax)に従う必要があります:

#### 1. イベント駆動型(Event-Driven)

```
WHEN [イベント], the [システム] SHALL [応答]
```

**例**:

```
WHEN ユーザーがログインボタンをクリックした時, the システム SHALL 認証情報を検証する
```

#### 2. 状態駆動型(State-Driven)

```
WHILE [状態], the [システム] SHALL [応答]
```

**例**:

```
WHILE ユーザーがログインしている間, the システム SHALL セッショントークンを保持する
```

#### 3. 望ましくない動作(Unwanted Behavior)

```
IF [エラー], THEN the [システム] SHALL [応答]
```

**例**:

```
IF 認証に失敗した場合, THEN the システム SHALL エラーメッセージを表示する
```

#### 4. オプション機能(Optional Features)

```
WHERE [機能が有効], the [システム] SHALL [応答]
```

**例**:

```
WHERE 多要素認証が有効な場合, the システム SHALL 確認コードを送信する
```

#### 5. 遍在的要件(Ubiquitous)

```
The [システム] SHALL [要件]
```

**例**:

```
The システム SHALL すべてのパスワードをbcryptでハッシュ化する
```

### プロジェクトメモリ(ステアリングコンテキスト)

MUSUHI-NGは`steering/`ディレクトリにプロジェクトメモリを維持します:

- **structure.md** - アーキテクチャパターン、ディレクトリ構成、命名規則
- **tech.md** - 技術スタック、フレームワーク、開発ツール
- **product.md** - ビジネスコンテキスト、製品目的、ユーザー

これらのファイルは:

- AIエージェントへのコンテキスト提供
- 一貫性のある意思決定のガイド
- プロジェクト進化の文書化

---

## 8段階SDDワークフロー

### 概要

```
Research → Requirements → Design → Tasks → Implementation → Testing → Deployment → Monitoring
```

各ステージには:

- **入力**: 前段階の成果物
- **プロセス**: 実行するアクティビティ
- **出力**: 次段階への成果物
- **品質ゲート**: 次に進むための基準

### ステージ1: 調査(Research)

**目的**: 技術オプションと実現可能性の調査

```bash
musuhi workflow research "ユーザー認証の実装"
```

**成果物**: `docs/research/auth-research.md`

```markdown
# ユーザー認証の調査

## オプション

1. OAuth 2.0 + JWT
2. セッションベース認証
3. SAML

## 推奨

OAuth 2.0 + JWT

## 理由

- ステートレス
- マイクロサービスとの親和性
- 業界標準
```

### ステージ2: 要件定義(Requirements)

**目的**: EARS形式の機能要件定義

```bash
musuhi workflow requirements
```

**成果物**: `docs/requirements/auth-requirements.md`

```markdown
# REQ-AUTH: ユーザー認証要件

## REQ-AUTH-001: ログイン

WHEN ユーザーが有効な認証情報を提供した時, the システム SHALL JWTトークンを発行する

## REQ-AUTH-002: トークン検証

WHILE リクエストにJWTトークンが含まれる間, the システム SHALL トークンの署名を検証する

## REQ-AUTH-003: エラー処理

IF トークンが無効または期限切れの場合, THEN the システム SHALL 401エラーを返す
```

### ステージ3: 設計(Design)

**目的**: C4図とアーキテクチャ決定記録(ADR)の作成

```bash
musuhi workflow design
```

**成果物**: `docs/design/auth-design.md`

```markdown
# 認証システム設計

## C4 コンテキスト図

[システムとユーザーの関係図]

## C4 コンテナ図

[APIサーバー、データベース、認証サービス]

## ADR-001: JWTライブラリの選択

**ステータス**: 承認済み
**決定**: jsonwebtokenライブラリを使用
**理由**: 成熟した実装、活発なメンテナンス、セキュリティ実績

## 要件マッピング

- REQ-AUTH-001 → JWTService.generateToken()
- REQ-AUTH-002 → AuthMiddleware.verifyToken()
- REQ-AUTH-003 → ErrorHandler.handleAuthError()
```

### ステージ4: タスク計画(Tasks)

**目的**: P-wave並列実行計画の作成

```bash
musuhi workflow tasks
```

**成果物**: `docs/tasks/auth-tasks.md`

```markdown
# 認証実装タスク

## Wave 1(並列実行可能)

- TASK-001: JWTServiceの実装(REQ-AUTH-001)
- TASK-002: データベーススキーマの作成(REQ-AUTH-001)

## Wave 2(Wave 1に依存)

- TASK-003: AuthMiddlewareの実装(REQ-AUTH-002)
- TASK-004: エラーハンドラの実装(REQ-AUTH-003)

## Wave 3(Wave 2に依存)

- TASK-005: 統合テスト(すべての要件)
```

### ステージ5: 実装(Implementation)

**目的**: 設計に従ったコードの実装

```bash
musuhi workflow implement
```

**実装プロセス**:

1. **P-wave並列実行**: Wave 1タスクを同時実行
2. **コードレビュー**: 各タスク完了後に自動レビュー
3. **憲法的ゲート**: Library-First、Test-First、Security-Firstの検証
4. **トレーサビリティ**: 要件へのリンク埋め込み

### ステージ6: テスト(Testing)

**目的**: EARS要件の検証

```bash
musuhi workflow test
```

**テストタイプ**:

- **単体テスト**: 各関数/クラス
- **統合テスト**: コンポーネント間の相互作用
- **E2Eテスト**: ユーザーシナリオ
- **要件テスト**: 各EARS要件の検証

### ステージ7: デプロイ(Deployment)

**目的**: ステージング/本番環境へのデプロイ

```bash
musuhi workflow deploy
```

**デプロイメントチェック**:

- すべてのテストが合格
- セキュリティスキャン完了
- パフォーマンスベンチマーク達成
- ドキュメント更新済み

### ステージ8: モニタリング(Monitoring)

**目的**: 本番環境でのメトリクス収集

```bash
musuhi workflow monitor
```

**モニタリング内容**:

- パフォーマンスメトリクス
- エラー率
- ユーザー行動分析
- セキュリティアラート

---

## 憲法的ガバナンス

### 9つの不変条項

MUSUHI-NGは**Phase -1ゲート**を通じて9つの不変条項を強制します:

#### 条項1: Library-First(ライブラリ優先)

**原則**: カスタムコードよりも既存ソリューションを優先

**検証**:

```bash
musuhi gate check library-first
```

**例**:

```typescript
// ❌ 悪い例: カスタムで日付フォーマッタを実装
function formatDate(date: Date): string {
  // 200行のカスタムコード...
}

// ✅ 良い例: 実績のあるライブラリを使用
import { format } from 'date-fns';
const formatted = format(new Date(), 'yyyy-MM-dd');
```

#### 条項2: Test-First(テスト優先)

**原則**: 実装前にテストを記述

**検証**:

```bash
musuhi gate check test-first
```

**例**:

```typescript
// 1. 最初にテストを書く
describe('AuthService', () => {
  it('should generate valid JWT token', () => {
    const token = authService.generateToken({ userId: 1 });
    expect(jwt.verify(token, SECRET)).toBeTruthy();
  });
});

// 2. 次に実装する
class AuthService {
  generateToken(payload: object): string {
    return jwt.sign(payload, SECRET, { expiresIn: '1h' });
  }
}
```

#### 条項3: Security-First(セキュリティ優先)

**原則**: OWASP Top 10コンプライアンス必須

**検証**:

```bash
musuhi gate check security-first
```

**チェック項目**:

- ✅ SQLインジェクション防止(パラメータ化クエリ)
- ✅ XSS防止(入力サニタイゼーション)
- ✅ CSRF保護(トークン検証)
- ✅ 認証/認可の適切な実装
- ✅ 機密データの暗号化

**例**:

```typescript
// ❌ 悪い例: SQLインジェクションのリスク
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// ✅ 良い例: パラメータ化クエリ
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

#### 条項4: Documentation-First(ドキュメント優先)

**原則**: コーディング前にドキュメント作成

**検証**:

```bash
musuhi gate check documentation-first
```

**必須ドキュメント**:

- API仕様(OpenAPI/Swagger)
- README.md
- インラインコードコメント(JSDoc/TSDoc)
- アーキテクチャ決定記録(ADR)

#### 条項5: Simplicity-First(シンプルさ優先)

**原則**: 複雑さを最小化(循環的複雑度 < 10)

**検証**:

```bash
musuhi gate check simplicity-first
```

**メトリクス**:

- 循環的複雑度: < 10
- 関数の行数: < 50
- クラスのメソッド数: < 20

#### 条項6: Performance-First(パフォーマンス優先)

**原則**: パフォーマンスバジェットの強制

**検証**:

```bash
musuhi gate check performance-first
```

**バジェット例**:

- APIレスポンス: < 200ms
- ページロード: < 3秒
- バンドルサイズ: < 500KB

#### 条項7: Accessibility-First(アクセシビリティ優先)

**原則**: WCAG 2.1 AAコンプライアンス

**検証**:

```bash
musuhi gate check accessibility-first
```

**チェック項目**:

- セマンティックHTML
- ARIAラベル
- キーボードナビゲーション
- スクリーンリーダー対応

#### 条項8: Privacy-First(プライバシー優先)

**原則**: データ最小化とGDPRコンプライアンス

**検証**:

```bash
musuhi gate check privacy-first
```

**要件**:

- 明示的な同意取得
- データ削除権の実装
- データポータビリティ
- 暗号化された保存

#### 条項9: Integration-First(統合優先)

**原則**: 実装前にAPIコントラクト定義

**検証**:

```bash
musuhi gate check integration-first
```

**成果物**:

- OpenAPI仕様
- GraphQLスキーマ
- gRPCプロトコル定義
- コントラクトテスト

---

## マルチエージェント・オーケストレーション

### 20の専門AIエージェント

MUSUHI-NGは20の専門エージェントを提供します:

#### オーケストレーション

**@orchestrator** - 複雑なマルチエージェントワークフローのマスターコーディネーター

```bash
@orchestrator "ユーザー認証システムの完全な実装"
```

自動的に以下を実行:

1. @requirements-analyst - 要件定義
2. @system-architect - アーキテクチャ設計
3. @api-designer - API設計
4. @software-developer - 実装
5. @test-engineer - テスト作成
6. @code-reviewer - コードレビュー

**@steering** - プロジェクトメモリマネージャー

```bash
@steering
```

以下を生成/保守:

- `steering/structure.md` - アーキテクチャパターン
- `steering/tech.md` - 技術スタック
- `steering/product.md` - ビジネスコンテキスト

#### 要件&計画

**@requirements-analyst** - 要件分析、ユーザーストーリー、EARS形式、SRS文書

```bash
@requirements-analyst "ユーザー認証の要件を作成"
```

**@project-manager** - プロジェクト計画、スケジューリング、リスク管理

```bash
@project-manager "プロジェクトタイムラインとマイルストーンを作成"
```

#### アーキテクチャ&設計

**@system-architect** - システムアーキテクチャ、C4図、ADR、EARS要件マッピング

```bash
@system-architect "requirements.mdに基づいてアーキテクチャを設計"
```

**@api-designer** - REST/GraphQL/gRPC API設計、OpenAPI仕様

```bash
@api-designer "認証APIのOpenAPI仕様を作成"
```

**@database-schema-designer** - データベース設計、ER図、DDL

```bash
@database-schema-designer "ユーザー管理システムのスキーマを設計"
```

**@ui-ux-designer** - UI/UX設計、ワイヤーフレーム、プロトタイプ

```bash
@ui-ux-designer "ログインページのワイヤーフレームを作成"
```

#### 開発&実装

**@software-developer** - マルチ言語コード実装、SOLID原則

```bash
@software-developer "design.mdに従って認証サービスを実装"
```

**@test-engineer** - ユニット、統合、E2Eテスト、EARS要件マッピング

```bash
@test-engineer "requirements.mdからテストを生成"
```

#### 品質&レビュー

**@code-reviewer** - コードレビュー、SOLID原則、ベストプラクティス

```bash
@code-reviewer "src/auth/ディレクトリをレビュー"
```

**@bug-hunter** - バグ調査、根本原因分析

```bash
@bug-hunter "認証エラーを調査"
```

**@quality-assurance** - QA戦略、テスト計画

```bash
@quality-assurance "リリース前のQA計画を作成"
```

#### セキュリティ&パフォーマンス

**@security-auditor** - OWASP Top 10、脆弱性検出

```bash
@security-auditor "認証フローのセキュリティ監査"
```

**@performance-optimizer** - パフォーマンス分析、最適化

```bash
@performance-optimizer "APIレスポンスタイムを分析"
```

#### インフラ&運用

**@devops-engineer** - CI/CDパイプライン、Docker/Kubernetes

```bash
@devops-engineer "GitHub Actions CI/CDパイプラインを作成"
```

**@cloud-architect** - AWS/Azure/GCP、IaC(Terraform/Bicep)

```bash
@cloud-architect "AWS上にインフラをプロビジョニングするTerraformコードを生成"
```

**@database-administrator** - データベース運用、チューニング

```bash
@database-administrator "PostgreSQLパフォーマンスを最適化"
```

#### ドキュメント&専門

**@technical-writer** - 技術ドキュメント、APIドキュメント

```bash
@technical-writer "APIドキュメントを作成"
```

**@ai-ml-engineer** - MLモデル開発、MLOps

```bash
@ai-ml-engineer "推薦システムモデルを開発"
```

### 9つの会話パターン

エージェントは以下のパターンで相互作用します:

1. **シーケンシャル**: A → B → C
2. **並列**: A + B + C(同時実行)
3. **フィードバックループ**: A ⇄ B(反復改善)
4. **階層的**: Orchestrator → Specialist Agents
5. **コンセンサス**: 複数エージェントが決定に投票
6. **専門家パネル**: 異なる視点からの分析
7. **デバッグ連鎖**: Developer → Bug Hunter → Tester
8. **レビューサイクル**: Developer → Code Reviewer → Developer
9. **統合フロー**: Designer → Developer → DevOps → Tester

---

## プラットフォーム統合

### サポートされているプラットフォーム

MUSUHI-NGは8つのAIコーディングアシスタントと統合します:

| プラットフォーム         | アダプタ                    | ステータス  |
| ------------------------ | --------------------------- | ----------- |
| VS Code + GitHub Copilot | `@musuhi-ng/vscode-copilot` | ✅ 利用可能 |
| Cursor                   | `@musuhi-ng/cursor`         | ✅ 利用可能 |
| Zed                      | `@musuhi-ng/zed`            | ✅ 利用可能 |
| Windsurf                 | `@musuhi-ng/windsurf`       | ✅ 利用可能 |
| Claude Code              | `@musuhi-ng/claude-code`    | ✅ 利用可能 |
| Codex CLI                | `@musuhi-ng/codex-cli`      | ✅ 利用可能 |
| Gemini CLI               | `@musuhi-ng/gemini-cli`     | ✅ 利用可能 |
| Qwen Code                | `@musuhi-ng/qwen-code`      | ✅ 利用可能 |

### プラットフォーム設定

```bash
# 現在のプラットフォーム確認
musuhi config get platform

# プラットフォーム変更
musuhi config set platform cursor

# プラットフォーム固有の設定
musuhi config set cursor.api_key "your-key"
```

### VS Code + Copilot統合

```bash
# アダプタをインストール
npm install @musuhi-ng/vscode-copilot

# 拡張機能を有効化
code --install-extension musuhi-ng.vscode-adapter
```

**.vscode/settings.json**:

```json
{
  "musuhi.enabled": true,
  "musuhi.platform": "vscode-copilot",
  "musuhi.earsValidation": true,
  "musuhi.constitutionalGates": true
}
```

### Cursor統合

```bash
# アダプタをインストール
npm install @musuhi-ng/cursor
```

**cursor.config.json**:

```json
{
  "musuhi": {
    "enabled": true,
    "workflowStage": "auto",
    "agents": ["@requirements-analyst", "@system-architect"]
  }
}
```

### Claude Code統合

```bash
# アダプタをインストール
npm install @musuhi-ng/claude-code
```

**.claude/musuhi.yml**:

```yaml
enabled: true
workflow:
  auto_advance: true
  stage: requirements
agents:
  preferred:
    - requirements-analyst
    - system-architect
    - software-developer
```

---

## 高度な機能

### P-Wave並列実行

**P-Wave**は依存関係を分析してタスクを並列化し、最大72%の時間短縮を実現します。

#### 依存関係グラフ

```typescript
const tasks = [
  { id: 'A', deps: [] },           // Wave 1
  { id: 'B', deps: [] },           // Wave 1
  { id: 'C', deps: ['A'] },        // Wave 2
  { id: 'D', deps: ['A', 'B'] },   // Wave 2
  { id: 'E', deps: ['C', 'D'] },   // Wave 3
];

// P-Wave実行
musuhi pwave execute tasks.json
```

**実行順序**:

```
Wave 1 (並列): A + B
Wave 2 (並列): C + D (AとBの完了を待つ)
Wave 3 (順次): E (CとDの完了を待つ)
```

**時間短縮計算**:

```
順次実行: A(10m) + B(10m) + C(15m) + D(20m) + E(10m) = 65分
P-Wave実行: Wave1(10m) + Wave2(20m) + Wave3(10m) = 40分
短縮率: (65-40)/65 = 38%
```

### ブラウンフィールド・ギャップ分析

既存コードベースを分析して仕様との差分を検出します。

```bash
# ギャップ分析を実行
musuhi gap-analyze --source ./src --requirements ./docs/requirements/
```

**分析戦略**:

1. **AST解析**: 構文木からコード構造を抽出
2. **パターンマッチング**: 既知のパターンを検出
3. **ML分類**: 機械学習モデルでコード意図を推測

**出力**: `gap-analysis-report.md`

```markdown
# ギャップ分析レポート

## 未実装要件

- REQ-AUTH-004: パスワードリセット機能(欠落)
- REQ-AUTH-007: 多要素認証(部分実装)

## 実装済みだが文書化されていない機能

- SocialLoginService(Facebook/Google OAuth)
- RateLimitMiddleware

## 推奨アクション

1. REQ-AUTH-004の実装を優先
2. SocialLoginServiceを要件に追加
3. RateLimitMiddlewareのドキュメント作成
```

### 反復的検証

継続的な要件カバレッジ検証を実行します。

```bash
# 検証を実行
musuhi verify
```

**検証項目**:

- ✅ すべてのEARS要件がテストにマップされている
- ✅ すべてのテストが合格している
- ✅ コードカバレッジが閾値(80%)を満たしている
- ✅ すべての憲法的ゲートが合格している

**トレーサビリティマトリックス**:

| 要件ID       | 設計 | タスク | コード | テスト | ステータス |
| ------------ | ---- | ------ | ------ | ------ | ---------- |
| REQ-AUTH-001 | ✅   | ✅     | ✅     | ✅     | 合格       |
| REQ-AUTH-002 | ✅   | ✅     | ✅     | ✅     | 合格       |
| REQ-AUTH-003 | ✅   | ✅     | ❌     | ❌     | 失敗       |

---

## トラブルシューティング

### 一般的な問題

#### 問題1: `musuhi: command not found`

**原因**: CLIがグローバルにインストールされていない

**解決策**:

```bash
npm install -g @musuhi-ng/cli
# または
pnpm add -g @musuhi-ng/cli
```

#### 問題2: EARS検証失敗

**エラー**:

```
Error: Requirement REQ-001 does not follow EARS format
```

**解決策**:

```markdown
# ❌ 悪い例

REQ-001: ユーザーはログインできる

# ✅ 良い例

REQ-001: WHEN ユーザーが有効な認証情報を提供した時, the システム SHALL JWTトークンを発行する
```

#### 問題3: 憲法的ゲート失敗

**エラー**:

```
Constitutional Gate Violation: Library-First
Found custom implementation for date formatting
```

**解決策**:

```typescript
// カスタムコードを削除
// import { myCustomDateFormatter } from './utils';

// ライブラリを使用
import { format } from 'date-fns';
```

#### 問題4: P-Wave循環依存

**エラー**:

```
Error: Circular dependency detected: A → B → C → A
```

**解決策**:

```json
// 依存関係を再構成
{
  "tasks": [
    { "id": "A", "deps": [] },
    { "id": "B", "deps": ["A"] },
    { "id": "C", "deps": ["B"] }
    // "C" → "A"の依存を削除
  ]
}
```

#### 問題5: プラットフォーム統合エラー

**エラー**:

```
Error: Platform adapter 'cursor' not found
```

**解決策**:

```bash
# アダプタをインストール
npm install @musuhi-ng/cursor

# 設定を確認
musuhi config get platform
musuhi config set platform cursor
```

### デバッグモード

```bash
# 詳細ログを有効化
musuhi --debug workflow execute

# ログファイルを確認
cat .musuhi/logs/workflow-2025-11-16.log
```

### サポート

問題が解決しない場合:

- **GitHub Issues**: https://github.com/nahisaho/musuhi-ng/issues
- **ドキュメント**: https://musuhi.dev/docs
- **コミュニティフォーラム**: https://musuhi.dev/community

---

## ベストプラクティス

### 1. 常にステアリングコンテキストから開始

新しいプロジェクトでは:

```bash
# ステアリングコンテキストを生成
@steering

# ステアリングファイルを確認
cat steering/structure.md
cat steering/tech.md
cat steering/product.md
```

### 2. EARS要件の厳格な遵守

すべての要件を以下のパターンで記述:

- WHEN/WHILE/IF/WHERE/The
- [システム] SHALL [応答]
- 明確で検証可能

### 3. 小さく頻繁な検証サイクル

```bash
# 各変更後に検証
musuhi verify

# トレーサビリティを確認
musuhi traceability
```

### 4. P-Wave並列化の活用

```bash
# 依存関係を分析
musuhi pwave analyze

# 並列実行
musuhi pwave execute
```

### 5. エージェントの適切な選択

| 状況                       | 推奨エージェント       |
| -------------------------- | ---------------------- |
| 複雑なマルチステップタスク | @orchestrator          |
| 要件不明確                 | @requirements-analyst  |
| アーキテクチャ決定必要     | @system-architect      |
| コード品質問題             | @code-reviewer         |
| バグ調査                   | @bug-hunter            |
| パフォーマンス問題         | @performance-optimizer |
| セキュリティ懸念           | @security-auditor      |

### 6. 憲法的ゲートの早期チェック

```bash
# 実装前にゲート検証
musuhi gate check all

# 特定の条項をチェック
musuhi gate check library-first
musuhi gate check security-first
```

### 7. ドキュメント言語ポリシー

- **英語ファイル優先**: すべてのドキュメントは英語版(`.md`)を作成
- **日本語翻訳**: 必要に応じて日本語版(`.ja.md`)を追加
- **参照は英語版**: コードやツールは常に`.md`を参照

### 8. 継続的なトレーサビリティ維持

```typescript
// コードに要件IDを埋め込む
/**
 * ユーザー認証サービス
 * @requirement REQ-AUTH-001 JWTトークン生成
 */
class AuthService {
  // ...
}
```

---

## FAQ

### Q1: MUSUHI-NGと従来のAIコーディングアシスタントの違いは？

**A**: MUSUHI-NGは**仕様駆動開発方法論**を強制します:

- 従来: AIが自由にコードを生成
- MUSUHI-NG: EARS要件 → 設計 → 憲法的ゲート → コード生成 → 検証

### Q2: EARS形式は必須ですか？

**A**: はい。EARS形式により:

- 曖昧さのない要件定義
- 自動テスト生成
- トレーサビリティ追跡
- 検証可能性

が実現します。

### Q3: 既存プロジェクトにMUSUHI-NGを導入できますか？

**A**: はい。**ブラウンフィールド・ギャップ分析**を使用:

```bash
musuhi gap-analyze --source ./src
```

これにより:

1. 既存コードを分析
2. 逆要件を生成
3. ギャップを特定
4. 段階的な移行計画を提案

### Q4: どのプラットフォームを選ぶべきですか？

**A**: 使用しているIDEに基づいて:

- **VS Code**: `vscode-copilot`
- **JetBrains**: `cursor`(互換性あり)
- **Vim/Neovim**: `codex-cli`
- **Claude Desktop**: `claude-code`

### Q5: P-Wave並列化はどのくらい時間を短縮しますか？

**A**: プロジェクトによりますが:

- 小規模: 30-40%短縮
- 中規模: 50-60%短縮
- 大規模: 60-72%短縮

依存関係が少ないほど並列化効果が高まります。

### Q6: 憲法的ゲートに違反したらどうなりますか？

**A**: ゲートは**ブロッキング**です:

- 警告が表示される
- コミット/デプロイが防止される
- 修正が必須

`--force`フラグで一時的に回避可能ですが、推奨しません。

### Q7: 20のエージェントすべてを使う必要がありますか？

**A**: いいえ。プロジェクトに応じて選択:

- **最小構成**: @requirements-analyst + @software-developer + @test-engineer
- **推奨構成**: + @system-architect + @code-reviewer
- **フル構成**: @orchestrator(自動的にすべて調整)

### Q8: 商用プロジェクトで使用できますか？

**A**: はい。MITライセンスです:

- 商用利用可能
- 改変可能
- 再配布可能

### Q9: カスタムエージェントを作成できますか？

**A**: はい。エージェントSDKを使用:

```typescript
import { Agent, AgentConfig } from '@musuhi-ng/agents';

const myAgent = new Agent({
  name: 'my-custom-agent',
  role: 'specialized task',
  prompts: [...],
  tools: [...]
});
```

### Q10: MUSUHI-NGの学習曲線は？

**A**: 段階的な学習パス:

- **1日目**: 基本ワークフロー(init, workflow, dashboard)
- **1週目**: EARS形式と憲法的条項
- **1ヶ月目**: マルチエージェント・オーケストレーション
- **3ヶ月目**: 高度な機能(P-wave, ギャップ分析)

---

## さらなるリソース

### ドキュメント

- **ステアリングコンテキスト**: `steering/` - アーキテクチャ、技術スタック、製品ビジョン
- **要件**: `docs/requirements/` - EARS形式の要件
- **設計**: `docs/design/` - C4図とADR
- **タスク**: `docs/tasks/` - P-wave実装計画
- **API**: `docs/api/` - APIドキュメント

### コミュニティ

- **GitHub**: https://github.com/nahisaho/musuhi-ng
- **npm**: https://www.npmjs.com/org/musuhi-ng
- **Website**: https://musuhi.dev
- **Twitter**: @musuhi_dev

### チュートリアル

- **クイックスタート動画**: https://musuhi.dev/tutorials/quickstart
- **EARS要件ガイド**: https://musuhi.dev/tutorials/ears
- **マルチエージェント入門**: https://musuhi.dev/tutorials/agents

---

## 貢献

MUSUHI-NGへの貢献を歓迎します！

```bash
# リポジトリをフォーク
git clone https://github.com/your-username/musuhi-ng.git
cd musuhi-ng

# ブランチを作成
git checkout -b feature/my-feature

# 変更をコミット
git commit -m "feat: add my feature"

# プルリクエストを送信
```

詳細は[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

---

## ライセンス

MIT

---

**Powered by MUSUHI-NG** - Specification Driven Development for the AI Era
