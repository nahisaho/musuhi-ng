# ADR-003: マルチエージェントオーケストレーションパターン選択

**ステータス**: 承認済み
**日付**: 2025-11-15
**決定者**: System Architect AI、Product Manager
**タグ**: orchestration、multi-agent、conversation-patterns

---

## コンテキスト

MUSUHI 2.0は、複雑なワークフロー全体で20の専門AIエージェントの調整を必要とします。異なるタスクは異なる通信パターンを必要とします。

### 要件カバレッジ

- AC-3.1: Sequential Chat（A → B → C）
- AC-3.2: Group Chat（ラウンドロビン/動的スピーカー選択）
- AC-3.3: Nested Chat（階層的委譲）
- AC-3.4: Swarm Pattern（自律的調整）
- AC-3.5: AutoPattern（自動選択）
- AC-3.6: UserProxy Agent（human-in-the-loop）
- AC-3.7: Tool Registration
- AC-3.8: Capability Discovery
- AC-3.9: Conversation History

---

## 決定

**9つのオーケストレーションパターン（ag2インスパイア）**

1. **Sequential Chat**: 線形ハンドオフ（Requirements Analyst → System Architect → Project Manager）
2. **Group Chat**: マネージャーがタスクに基づいて次のスピーカーを選択
3. **Nested Chat**: 親エージェントがサブタスクのために子エージェントを生成
4. **Swarm Pattern**: 並列自律エージェント調整
5. **Finite State Machine**: 状態駆動遷移（Draft → Review → Approved）
6. **Hierarchical**: 親子エージェントツリー
7. **UserProxy Agent**: 人間承認ゲート
8. **Tool Registration**: エージェントが呼び出し可能関数を登録
9. **AutoPattern**: タスク複雑性に基づく自動パターン選択

### Pattern Selectorアルゴリズム

```typescript
selectPattern(task: Task): OrchestrationPattern {
  if (task.requiresHumanApproval) return 'UserProxy'
  if (task.subtasks.length > 0) return 'Nested'
  if (task.dependencies.length === 0 && task.subtasks.length > 3) return 'Swarm'
  if (task.agents.length > 5) return 'Group'
  return 'Sequential'
}
```

---

## 検討した代替案

### 代替案1: 単一シーケンシャルパターン

**却下**: 複雑なワークフローには制限的すぎる（AC-3.5は柔軟性を要求）

### 代替案2: パターン用カスタムDSL

**却下**: 過剰エンジニアリング（第5条に違反）、9パターンで十分

### 代替案3: OpenAI Swarmライブラリ

**却下**: Pythonのみ、TypeScript互換でない

---

## 結果

### 肯定的

- 40%高速なマルチエージェントワークフロー（予想）
- 異なるタスクタイプへの柔軟性
- Human-in-the-loopコントロール

### 否定的

- パターン選択ロジックの複雑性
- **軽減策**: 各パターンのユニットテスト、AutoPatternヒューリスティック

---

## 実装

**コンポーネント**:

- `PatternSelector.ts`: AutoPatternロジック
- `SequentialChat.ts`: 線形ハンドオフ
- `GroupChat.ts`: マネージャー駆動スピーカー選択
- `NestedChat.ts`: 階層的委譲
- `SwarmPattern.ts`: 自律的調整
- `UserProxyAgent.ts`: 人間承認ゲート
- `ToolRegistry.ts`: 関数登録
- `CapabilityRegistry.ts`: エージェントスキル発見
- `ConversationHistory.ts`: メッセージ永続化

**トレーサビリティ**: AC-3.1～AC-3.9

---

**ステータス**: 承認済み（優先度: P0、フェーズ1）
