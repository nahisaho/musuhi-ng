# ADR-005: ギャップ分析アルゴリズム

**ステータス**: 承認済み
**日付**: 2025-11-15
**決定者**: System Architect AI、Product Manager
**タグ**: brownfield、gap-analysis、ast-parsing、pattern-matching

---

## コンテキスト

MUSUHI 2.0は、要件と既存コード間のギャップを検出することでbrownfieldプロジェクトをサポートする必要があります。ギャップタイプ: 欠落機能、未文書化機能、競合、破壊的変更。

### 要件カバレッジ

- AC-5.1: ギャップ分析コマンド（`/musuhi:validate-gap`）
- AC-5.2: 欠落機能検出
- AC-5.3: 未文書化機能検出
- AC-5.4: 競合検出
- AC-5.5: 調整推奨事項
- AC-5.6: 破壊的変更検出
- AC-5.7: パターン違反検出
- AC-5.8: ギャップレポート形式
- AC-5.9: 設計統合

### パフォーマンス目標

- **NFR-P.3**: 100k LOCコードベースで<60秒

---

## 決定

**マルチ戦略ギャップ検出**

### 3つの検出戦略

1. **AST解析**（高精度）

   ```typescript
   // コードベースをASTに解析
   const ast = parseCodebase(codebase);

   // AC-1.1実装を検索
   function findImplementation(requirement: Requirement): boolean {
     return ast.search(requirement.pattern) !== null;
   }
   ```

   - **利点**: 高精度、コード構造を理解
   - **欠点**: 大規模コードベースで遅い
   - **使用例**: 欠落機能、未文書化機能

2. **パターンマッチング**（高速）

   ```typescript
   // キーワードを検索
   const hasOAuth = codebase.includes('OAuth') || codebase.includes('oauth2');
   ```

   - **利点**: 高速、シンプル
   - **欠点**: 誤検出（コメント、文字列）
   - **使用例**: クイックスキャン、破壊的変更

3. **セマンティック分析**（将来: ML）
   ```typescript
   // LLMを使用してセマンティック競合を理解
   const conflict = await llm.analyze(requirement, existingCode);
   ```

   - **利点**: セマンティック競合を検出
   - **欠点**: 遅い、LLM API必要
   - **使用例**: 競合検出（フェーズ5以降）

### ギャップタイプ

1. **欠落機能**: 実装のない要件

   ```markdown
   ## 欠落機能

   - AC-1.1: 憲法ファイルサポート（コードベースに見つからない）
   - AC-3.5: AutoPattern選択（コードベースに見つからない）
   ```

2. **未文書化機能**: 要件のないコード

   ```markdown
   ## 未文書化機能

   - src/oauth/OAuthProvider.ts（要件なし）
   - src/cache/RedisCache.ts（要件なし）
   ```

3. **競合**: 要件が既存コードと矛盾

   ```markdown
   ## 競合

   - AC-2.1はspecs/フォルダーを要求、しかしコードベースはrequirements/を使用（競合）
   ```

4. **破壊的変更**: 要件が既存APIを変更
   ```markdown
   ## 破壊的変更

   - AC-8.7がPlatformAdapterインターフェースを変更（破壊的変更）
   ```

### ギャップレポート形式

```markdown
# ギャップ分析レポート

**生成日時**: 2025-11-15 10:00:00
**コードベース**: /home/user/project（100k LOC）
**要件**: 72 AC（docs/requirements/requirements.md）

## サマリー

- **カバレッジ**: 45/72要件（62.5%）
- **欠落機能**: 27
- **未文書化機能**: 8
- **競合**: 3
- **破壊的変更**: 2

## 欠落機能（27）

| 要件   | 機能           | 推奨事項                       |
| ------ | -------------- | ------------------------------ |
| AC-1.1 | 憲法ファイル   | steering/constitution.mdを追加 |
| AC-1.3 | Phase -1 Gates | PhaseGateValidatorを実装       |

...

## 未文書化機能（8）

| ファイル                   | 説明                  | 推奨事項         |
| -------------------------- | --------------------- | ---------------- |
| src/oauth/OAuthProvider.ts | OAuth 2.0プロバイダー | AC-9.X要件を追加 |

...

## 競合（3）

| 要件   | 競合                              | 解決                   |
| ------ | --------------------------------- | ---------------------- |
| AC-2.1 | specs/ではなくrequirements/を使用 | ディレクトリをリネーム |

...

## 破壊的変更（2）

| 要件   | 影響                                | マイグレーション    |
| ------ | ----------------------------------- | ------------------- |
| AC-8.7 | PlatformAdapterインターフェース変更 | 全8アダプターを更新 |

...

## 推奨事項

1. **27の欠落機能を追加**（P0機能を優先）
2. **8の未文書化機能を文書化**（AC-9.X要件を追加）
3. **3つの競合を解決**（ディレクトリをリネーム、コードを更新）
4. **2つの破壊的変更を計画**（バージョンを2.0.0にバンプ）
```

---

## 検討した代替案

### 代替案1: シンプルなGrep（パターンマッチングのみ）

**却下**: 誤検出が多すぎる（コメント、文字列内のキーワード）、AC-5.4（競合検出）失敗

### 代替案2: LLMのみ分析

**却下**: 遅すぎる（100k LOCで>60秒）、高価（APIコスト）、NFR-P.3失敗

### 代替案3: 手動コードレビュー

**却下**: 自動化されていない、時間がかかる、AC-5.1（コマンド）失敗

---

## 結果

### 肯定的

- **100% brownfieldサポート**（自動ギャップ検出）
- **マルチ戦略**（高精度 + 高速パフォーマンス）
- **実行可能な推奨事項**（AC-5.5）

### 否定的

- **AST解析オーバーヘッド**（100k LOCで<60秒目標が厳しい可能性）
- **軽減策**: 並列ファイルスキャン、キャッシング、増分分析

### パフォーマンス目標

- **NFR-P.3**: 100k LOCで<60秒（AST + パターンマッチング使用、フェーズ1ではLLMスキップ）

---

## 実装

**コンポーネント**:

- `GapAnalyzer.ts`: 中央調整
- `ASTParser.ts`: コードベースをASTに解析（TypeScript: ts-morph、Python: ast）
- `PatternMatcher.ts`: キーワード検索（高速スキャン）
- `MissingFeatureDetector.ts`: 要件 → コードマッピング
- `UndocumentedFeatureDetector.ts`: コード → 要件マッピング
- `ConflictDetector.ts`: 要件 vs 既存パターンを比較
- `BreakingChangeDetector.ts`: API変更を検出
- `PatternViolationDetector.ts`: steering/structure.mdパターンをチェック
- `RecommendationEngine.ts`: 実行可能な推奨事項を生成
- `GapReportGenerator.ts`: gap-report.mdをフォーマット

**トレーサビリティ**: AC-5.1～AC-5.9

---

**ステータス**: 承認済み（優先度: P1、フェーズ2）
