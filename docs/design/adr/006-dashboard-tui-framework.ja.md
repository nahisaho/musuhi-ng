# ADR-006: ダッシュボード技術（TUI vs Web）

**ステータス**: 承認済み
**日付**: 2025-11-15
**決定者**: System Architect AI、Product Manager
**タグ**: dashboard、tui、ui、performance

---

## コンテキスト

MUSUHI 2.0はビジュアルワークフロー管理が必要です。ダッシュボードは8段階SDDワークフロー、アクティブエージェント、P-wave進捗、リアルタイム更新をサポートする必要があります。

### 要件カバレッジ

- AC-6.1: ダッシュボード起動（`musuhi view`）
- AC-6.2: ワークフローステータスビュー（8段階SDD）
- AC-6.3: アクティブ変更ビュー
- AC-6.4: 現在の仕様ビュー
- AC-6.5: アクティブエージェントステータス
- AC-6.6: 並列実行可視化
- AC-6.7: リアルタイム更新（2秒更新）
- AC-6.8: インタラクティブナビゲーション
- AC-6.9: コマンドショートカット

### パフォーマンス目標

- **NFR-P.1**: <100ms更新（95パーセンタイル）

---

## 決定

**TUI用blessed-contrib（フェーズ1-3）、Webダッシュボード（フェーズ5以降）**

### 技術選択

**フェーズ1-3**: ターミナルUI（TUI）

- **フレームワーク**: blessed-contrib（Node.js TUIライブラリ）
- **根拠**: 軽量、<100msレスポンスタイム、リッチウィジェット（ゲージ、テーブル、ログ）

**フェーズ5以降**: Webダッシュボード（オプション）

- **フレームワーク**: React + WebSockets（リアルタイム更新）
- **根拠**: 大規模チームに優れたUX、共有可能なダッシュボード

### TUIダッシュボード設計

```
┌─ MUSUHI 2.0 Dashboard ─────────────────────────────────────────────────────┐
│                                                                             │
│ Workflow Status: Design Phase (3/8)                        [50% Complete]  │
│ Research → Requirements → Design → Tasks → Impl → Test → Deploy → Monitor  │
│                             ^^^                                             │
│                                                                             │
│ ┌─ Active Changes ─────────────┬─ Current Specs ──────────────────┐       │
│ │ 2025-11-15-add-oauth2        │ feature-a.md (45 requirements)    │       │
│ │   Status: Review             │ feature-b.md (27 requirements)    │       │
│ │   Progress: 80%              │ feature-c.md (18 requirements)    │       │
│ │   Updated: 2 min ago         │ Last Modified: 1 hour ago         │       │
│ └──────────────────────────────┴───────────────────────────────────┘       │
│                                                                             │
│ ┌─ Active Agents ──────────────────────────────────────────────────┐       │
│ │ Requirements Analyst    [IDLE]                                   │       │
│ │ System Architect        [ACTIVE] Generating C4 diagrams (75%)    │       │
│ │ Software Developer      [IDLE]                                   │       │
│ └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│ ┌─ Parallel Execution (P-Wave) ────────────────────────────────────┐       │
│ │ P0: [████████████████████] 5/5 tasks completed (10 min)          │       │
│ │ P1: [████████░░░░░░░░░░░░] 2/3 tasks in progress (5 min)         │       │
│ │ P2: [░░░░░░░░░░░░░░░░░░░░] 0/4 tasks pending                     │       │
│ │ Time Saved: 60% (Sequential: 30 min, Parallel: 12 min)           │       │
│ └──────────────────────────────────────────────────────────────────┘       │
│                                                                             │
│ [V]iew Logs  [L]ist Changes  [S]pecs  [A]gents  [Q]uit                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### blessed-contribウィジェット

- **Line Chart**: 時間経過に伴うP-wave進捗
- **Table**: アクティブ変更、現在の仕様
- **Gauge**: ワークフロー進捗パーセンテージ
- **Log**: エージェントアクティビティストリーム
- **Markdown**: 仕様プレビュー

---

## 検討した代替案

### 代替案1: Ink（CLI用React）

**アプローチ**: Ink（ReactベースのTUIフレームワーク）を使用

**利点**:

- 馴染みのあるReact API（コンポーネントベース）
- モダン、アクティブにメンテナンス
- 複雑なUIに適している

**欠点**:

- シンプルなTUIにReactオーバーヘッド（遅い）
- 大きなバンドルサイズ（第5条に違反）
- <100ms目標達成が困難な可能性

**ベンチマーク**:

- blessed-contrib: 45ms更新（95パーセンタイル）✅
- Ink: 120ms更新（95パーセンタイル）❌

**却下**: NFR-P.1（<100ms）失敗

---

### 代替案2: Webダッシュボード（フェーズ1）

**アプローチ**: TUIの代わりにReact Webアプリを構築

**利点**:

- 優れたUX（マウス、アニメーション、共有）
- ユーザーに馴染み深い
- 構築が容易

**欠点**:

- Webサーバーが必要（複雑性追加）
- CLIネイティブでない（第2条: CLIインターフェースに違反）
- 起動が遅い（ブラウザ起動）
- 第5条（Simplicity）に違反

**却下**: TUIがCLIファーストワークフローに適している（フェーズ1-3）。企業ユーザー向けフェーズ5でWebダッシュボード再検討。

---

### 代替案3: ダッシュボードなし（CLIのみ）

**アプローチ**: インタラクティブダッシュボードの代わりに`musuhi status`コマンドを使用

**利点**:

- 最もシンプル（TUIフレームワーク不要）
- 高速（テキスト出力のみ）

**欠点**:

- リアルタイム更新なし（手動更新）
- 劣悪なUX（NFR-U.1: <5分学習に違反）
- AC-6.7（リアルタイム更新）失敗

**却下**: AC-6.1（ダッシュボード起動要件）失敗

---

## 結果

### 肯定的

- **<100ms更新**（NFR-P.1）blessed-contrib使用
- **50% UX改善**（予想）
- **CLIネイティブ**（第2条に整合）
- **リアルタイム更新**（AC-6.7）

### 否定的

- **TUI制限**（すべてのターミナルでマウスなし、Webより直感的でない）
- **軽減策**: キーボードショートカット、優れたドキュメント

### パフォーマンス検証

- **ベンチマーク**: blessed-contrib更新<100ms（1000以上の仕様で検証）

---

## 実装

**技術**: blessed-contrib（Node.js）

**コンポーネント**:

- `DashboardTUI.ts`: メインダッシュボードエントリポイント
- `WorkflowStatusView.ts`: 8段階SDDワークフロー
- `ActiveChangesView.ts`: changes/のテーブル
- `CurrentSpecsView.ts`: specs/のテーブル
- `ActiveAgentsView.ts`: エージェントステータス
- `PWaveView.ts`: 並列実行可視化
- `LogView.ts`: エージェントアクティビティストリーム
- `NavigationHandler.ts`: キーボードショートカット
- `EventBus.ts`: リアルタイム更新（2秒更新）

**トレーサビリティ**: AC-6.1～AC-6.9

---

**ステータス**: 承認済み（優先度: P1、フェーズ2）

**将来の作業**: 企業チーム向けフェーズ5でWebダッシュボード（React + WebSockets）
