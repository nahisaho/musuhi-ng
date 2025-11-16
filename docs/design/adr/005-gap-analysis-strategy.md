# ADR-005: Gap Analysis Algorithm

**Status**: Accepted
**Date**: 2025-11-15
**Deciders**: System Architect AI, Product Manager
**Tags**: brownfield, gap-analysis, ast-parsing, pattern-matching

---

## Context

MUSUHI 2.0 must support brownfield projects by detecting gaps between requirements and existing code. Gap types: missing features, undocumented features, conflicts, breaking changes.

### Requirements Coverage

- AC-5.1: Gap Analysis Command (`/musuhi:validate-gap`)
- AC-5.2: Missing Features Detection
- AC-5.3: Undocumented Features Detection
- AC-5.4: Conflict Detection
- AC-5.5: Reconciliation Recommendations
- AC-5.6: Breaking Change Detection
- AC-5.7: Pattern Violation Detection
- AC-5.8: Gap Report Format
- AC-5.9: Design Integration

### Performance Target

- **NFR-P.3**: <60s for 100k LOC codebase

---

## Decision

**Multi-Strategy Gap Detection**

### 3 Detection Strategies

1. **AST Parsing** (High Accuracy)

   ```typescript
   // Parse codebase to AST
   const ast = parseCodebase(codebase);

   // Search for AC-1.1 implementation
   function findImplementation(requirement: Requirement): boolean {
     return ast.search(requirement.pattern) !== null;
   }
   ```

   - **Pros**: High accuracy, understands code structure
   - **Cons**: Slow for large codebases
   - **Use Case**: Missing features, undocumented features

2. **Pattern Matching** (Fast)

   ```typescript
   // Search for keywords
   const hasOAuth = codebase.includes('OAuth') || codebase.includes('oauth2');
   ```

   - **Pros**: Fast, simple
   - **Cons**: False positives (comments, strings)
   - **Use Case**: Quick scan, breaking changes

3. **Semantic Analysis** (Future: ML)
   ```typescript
   // Use LLM to understand semantic conflicts
   const conflict = await llm.analyze(requirement, existingCode);
   ```

   - **Pros**: Detects semantic conflicts
   - **Cons**: Slow, requires LLM API
   - **Use Case**: Conflict detection (Phase 5+)

### Gap Types

1. **Missing Features**: Requirements without implementation

   ```markdown
   ## Missing Features

   - AC-1.1: Constitution File Support (NOT FOUND in codebase)
   - AC-3.5: AutoPattern Selection (NOT FOUND in codebase)
   ```

2. **Undocumented Features**: Code without requirements

   ```markdown
   ## Undocumented Features

   - src/oauth/OAuthProvider.ts (NO REQUIREMENT)
   - src/cache/RedisCache.ts (NO REQUIREMENT)
   ```

3. **Conflicts**: Requirements contradict existing code

   ```markdown
   ## Conflicts

   - AC-2.1 requires specs/ folder, but codebase uses requirements/ (CONFLICT)
   ```

4. **Breaking Changes**: Requirements change existing APIs
   ```markdown
   ## Breaking Changes

   - AC-8.7 changes PlatformAdapter interface (BREAKING CHANGE)
   ```

### Gap Report Format

```markdown
# Gap Analysis Report

**Generated**: 2025-11-15 10:00:00
**Codebase**: /home/user/project (100k LOC)
**Requirements**: 72 AC (docs/requirements/requirements.md)

## Summary

- **Coverage**: 45/72 requirements (62.5%)
- **Missing Features**: 27
- **Undocumented Features**: 8
- **Conflicts**: 3
- **Breaking Changes**: 2

## Missing Features (27)

| Requirement | Feature           | Recommendation               |
| ----------- | ----------------- | ---------------------------- |
| AC-1.1      | Constitution File | Add steering/constitution.md |
| AC-1.3      | Phase -1 Gates    | Implement PhaseGateValidator |

...

## Undocumented Features (8)

| File                       | Description        | Recommendation         |
| -------------------------- | ------------------ | ---------------------- |
| src/oauth/OAuthProvider.ts | OAuth 2.0 provider | Add AC-9.X requirement |

...

## Conflicts (3)

| Requirement | Conflict                      | Resolution       |
| ----------- | ----------------------------- | ---------------- |
| AC-2.1      | Uses requirements/ not specs/ | Rename directory |

...

## Breaking Changes (2)

| Requirement | Impact                           | Migration             |
| ----------- | -------------------------------- | --------------------- |
| AC-8.7      | PlatformAdapter interface change | Update all 8 adapters |

...

## Recommendations

1. **Add 27 missing features** (prioritize P0 features)
2. **Document 8 undocumented features** (add AC-9.X requirements)
3. **Resolve 3 conflicts** (rename directories, update code)
4. **Plan 2 breaking changes** (version bump to 2.0.0)
```

---

## Alternatives Considered

### Alternative 1: Simple Grep (Pattern Matching Only)

**Rejected**: Too many false positives (keywords in comments, strings), fails AC-5.4 (conflict detection)

### Alternative 2: LLM-Only Analysis

**Rejected**: Too slow (>60s for 100k LOC), expensive (API costs), fails NFR-P.3

### Alternative 3: Manual Code Review

**Rejected**: Not automated, time-consuming, fails AC-5.1 (command)

---

## Consequences

### Positive

- **100% brownfield support** (automated gap detection)
- **Multi-strategy** (high accuracy + fast performance)
- **Actionable recommendations** (AC-5.5)

### Negative

- **AST parsing overhead** (<60s target may be tight for 100k LOC)
- **Mitigation**: Parallel file scanning, caching, incremental analysis

### Performance Targets

- **NFR-P.3**: <60s for 100k LOC (use AST + pattern matching, skip LLM in Phase 1)

---

## Implementation

**Components**:

- `GapAnalyzer.ts`: Central coordination
- `ASTParser.ts`: Parse codebase to AST (TypeScript: ts-morph, Python: ast)
- `PatternMatcher.ts`: Keyword search (fast scan)
- `MissingFeatureDetector.ts`: Requirement → code mapping
- `UndocumentedFeatureDetector.ts`: Code → requirement mapping
- `ConflictDetector.ts`: Compare requirement vs. existing patterns
- `BreakingChangeDetector.ts`: Detect API changes
- `PatternViolationDetector.ts`: Check steering/structure.md patterns
- `RecommendationEngine.ts`: Generate actionable recommendations
- `GapReportGenerator.ts`: Format gap-report.md

**Traceability**: AC-5.1 through AC-5.9

---

**Status**: Accepted (Priority: P1, Phase 2)
