# ADR-004: 並列実行実装（P-wave）

**ステータス**: 承認済み
**日付**: 2025-11-15
**決定者**: System Architect AI、Product Manager
**タグ**: parallel-execution、performance、dag、p-wave

---

## コンテキスト

MUSUHI 2.0は、並列タスク実行により開発時間を50-70%削減する必要があります。100以上の要件に対して逐次実行は遅すぎます。

### 要件カバレッジ

- AC-4.1: P-Waveラベリング（P0/P1/P2）
- AC-4.2: 依存グラフ（DAG）
- AC-4.3: P0実行（並行）
- AC-4.4: P1実行（P0後）
- AC-4.5: P2+実行（逐次ウェーブ）
- AC-4.6: 時間削減測定（50%以上）
- AC-4.7: 競合状態防止
- AC-4.8: 失敗処理（依存タスクをキャンセル）
- AC-4.9: 進捗監視

---

## 決定

**graphlibを使用したDAGベースP-Waveラベリング**

### アルゴリズム

1. **依存関係分析**: `tasks.md`からタスク依存関係を解析

   ```markdown
   - [ ] Task A (depends: none) → P0
   - [ ] Task B (depends: none) → P0
   - [ ] Task C (depends: Task A) → P1
   - [ ] Task D (depends: Task A, B) → P1
   - [ ] Task E (depends: Task C) → P2
   ```

2. **DAG構築**: `graphlib`を使用して有向非巡回グラフを構築

   ```typescript
   const graph = new graphlib.Graph();
   graph.setNode('Task A', { task: taskA });
   graph.setNode('Task B', { task: taskB });
   graph.setEdge('Task C', 'Task A'); // CはAに依存
   ```

3. **P-Waveラベリング**: 最長依存パスに基づいてwaveを割り当て

   ```typescript
   function labelPWave(dag: Graph): Map<string, number> {
     const waves = new Map<string, number>();
     const sorted = graphlib.alg.topsort(dag);
     for (const node of sorted) {
       const predecessors = dag.predecessors(node) || [];
       const maxPredWave = Math.max(
         ...predecessors.map((p) => waves.get(p) || 0)
       );
       waves.set(node, maxPredWave + 1);
     }
     return waves; // {Task A: 0, Task B: 0, Task C: 1, Task D: 1, Task E: 2}
   }
   ```

4. **並行実行**: ワーカースレッドを使用してwaveでタスクを実行

   ```typescript
   async function executePWave(wave: number, tasks: Task[]): Promise<Result[]> {
     return Promise.all(tasks.map((task) => executeTask(task))); // 並列
   }
   ```

5. **失敗処理**: 失敗時に依存タスクをキャンセル
   ```typescript
   if (task.failed) {
     const dependents = dag.successors(task.id);
     dependents.forEach((d) => cancelTask(d));
   }
   ```

### 期待される時間削減

**例**:

- 逐次: 10タスク × 10分 = 100分
- 並列: P0（2タスク、10分）+ P1（3タスク、10分）+ P2（5タスク、10分）= 30分
- **削減**: 70%

---

## 検討した代替案

### 代替案1: 手動P-Waveラベル

**アプローチ**: 開発者が手動でタスクをP0/P1/P2としてラベル

**却下**: エラーが発生しやすい、最適な並列化を逃す、自動化目標に違反

### 代替案2: シンプルな依存カウント

**アプローチ**: P-wave = 依存数（2依存を持つタスク = P2）

**却下**: 不正確（最長パスがより正確）、AC-4.1失敗

### 代替案3: DAGなし（リストベース）

**アプローチ**: グラフ構造なしで依存リストを維持

**却下**: 循環依存検出不可能、最長パス計算困難

---

## 結果

### 肯定的

- **50-70%時間削減**（NFR-P.2）
- 自動P-waveラベリング（手動作業なし）
- 循環依存検出（graphlib）

### 否定的

- **複雑性**: DAG構築オーバーヘッド
- **軽減策**: キャッシングで最適化、遅延評価

### パフォーマンス目標

- **NFR-P.2**: 50%以上時間削減（ベンチマークで検証）
- **NFR-P.4**: <200msエージェントルーティングオーバーヘッド

---

## 実装

**技術**: graphlib（成熟した、十分にテストされたDAGライブラリ）

**コンポーネント**:

- `DependencyAnalyzer.ts`: tasks.mdを解析
- `DAGBuilder.ts`: graphlibを使用してグラフを構築
- `PWaveLabeler.ts`: P0/P1/P2ラベルを割り当て
- `CircularDependencyDetector.ts`: 循環を検出（graphlib.alg.findCycles）
- `WaveScheduler.ts`: P-wave実行をスケジュール
- `ConcurrentExecutor.ts`: 並列でタスクを実行（ワーカースレッド）
- `FailureHandler.ts`: 依存タスクをキャンセル
- `ProgressTracker.ts`: リアルタイム進捗
- `TimeMetricsCollector.ts`: 時間削減を測定

**トレーサビリティ**: AC-4.1～AC-4.9

---

**ステータス**: 承認済み（優先度: P1、フェーズ2）
