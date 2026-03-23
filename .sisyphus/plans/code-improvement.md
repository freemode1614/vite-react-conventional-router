# vite-react-conventional-router 代码改进计划

## TL;DR

> **核心目标**: 修复关键 TypeScript 错误，减少类型断言，重构复杂函数，提升测试覆盖率
>
> **交付物**:
>
> - 3 个 TypeScript 错误修复
> - `as` 断言从 29→15，`!` 断言从 30→15
> - `load()` 函数拆分为 4 个独立函数（各≤40 行）
> - 测试覆盖率从 39.78%→80%+
> - 关键算法添加 JSDoc 注释
>
> **预估工作量**: **Medium-Large** (约 2-3 周)
> **并行执行**: **YES** - 3 个 Wave，最多 6 任务并行
> **关键路径**: P0 类型修复 → P1 重构 → P2 测试补充

---

## Context

### Original Request

用户请求："审查代码，制定改进计划"

### Interview Summary

**分析方式**: 非侵入式代码审查，无用户访谈（基于现有代码和 TODO.md 分析）

**研究发现**:

- **项目类型**: Vite 插件，为 React 应用提供文件系统路由
- **核心文件**: `src/index.ts` (248 行), `src/utils.ts` (469 行), `src/validation.ts` (273 行)
- **现有文档**: TODO.md 列出 13 项改进任务（2 项 P0 已修复，剩余 11 项 P1/P2）
- **构建状态**: ✅ Build PASS, ⚠️ TypeScript 3 错误，⚠️ Biome 30 问题，✅ Tests 10/10 PASS
- **测试覆盖率**: 39.78% (index.ts 0%, utils.ts 30.5%, validation.ts 78.87%)

### Metis Review

**识别的差距** (已处理):

- **用户偏好未确认**: 覆盖率目标、时间线、破坏性变更接受度 → **已在计划中设为可配置决策点**
- **向后兼容性 guardrails**: 明确列出 DO NOT CHANGE 清单 → **已加入 Must NOT Have**
- **范围蔓延风险**: 新功能配置、性能优化、E2E 扩展 → **已明确标记为 OUT OF SCOPE**
- **验收标准缺失**: 为每个 TODO 定义可度量标准 → **已添加到各任务 Acceptance Criteria**

---

## Work Objectives

### Core Objective

通过系统性代码质量改进，提升 vite-react-conventional-router 的类型安全性、可维护性和测试覆盖度，同时保持向后兼容性。

### Concrete Deliverables

- ✅ 修复 `src/utils.ts` 3 个 TypeScript 类型断言错误
- ✅ 减少 `as` 断言从 29→15，`!` 断言从 30→15
- ✅ 重构 `load()` 函数为 4 个独立函数（各≤40 行）
- ✅ 提升测试覆盖率从 39.78%→80%+（重点：index.ts 0%→60%+, utils.ts 30%→60%+）
- ✅ 为复杂算法添加 JSDoc 注释（collectRoutePages, arrangeRoutes, stringifyRoutes）
- ✅ 修复 6 个 Biome 错误，减少 24 个警告

### Definition of Done

- [ ] `pnpm build` - Build PASS (无错误)
- [ ] `pnpm test` - Tests PASS (10+ 新增测试，总测试数 20+)
- [ ] `pnpm coverage` - Coverage ≥80% (所有文件≥60%)
- [ ] `pnpm biome check` - Lint 0 错误，警告≤10
- [ ] TypeScript 0 错误

### Must Have

- **向后兼容**: 公共 API (`ConventionalRouterProps`) 不变
- **虚拟模块名**: `"virtual:routes"` 保持不变
- **文件命名约定**: 用户现有文件结构继续工作
- **导出格式**: routes 数组默认导出不改变
- **Lazy 加载**: `lazy: boolean` 选项行为保持

### Must NOT Have (Guardrails)

- **新功能配置**: 不添加 `caseSensitive`、`trailingSlash`、`basePath` 等新配置项
- **性能优化**: 不进行 `structuredClone`、异步 glob 等性能改动（无基准数据）
- **E2E 扩展**: 不扩展 E2E 测试（先完成单元测试覆盖）
- **破坏性变更**: v0.2.x 版本内不引入破坏性变更
- **API 暴露**: 不将内部函数暴露为公共 API

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — 所有验证由代理执行。不接受"用户手动测试确认"。

### Test Decision

- **基础设施存在**: **YES** (vitest + @vitest/coverage-v8)
- **自动化测试**: **TDD** - 每个任务遵循 RED (失败测试) → GREEN (最小实现) → REFACTOR
- **框架**: vitest (现有测试框架)
- **覆盖率目标**: 整体≥80%，每个文件≥60%

### QA Policy

每个任务必须包含代理执行的 QA 场景（见 TODO 模板）。
证据保存到 `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`。

- **API/后端**: Bash (curl) - 发送请求，断言状态和响应字段
- **库/模块**: Bash (bun/node REPL) - 导入、调用函数、比较输出
- **覆盖率验证**: Bash (`pnpm coverage`) - 解析覆盖率报告，断言阈值

---

## Execution Strategy

### Parallel Execution Waves

> 最大化吞吐量，将独立任务分组为并行 Wave。
> 每个 Wave 完成后才开始下一个 Wave。
> 目标：每 Wave 5-8 个任务。少于 3 个 = 拆分不足（最终 Wave 除外）。

```
Wave 1 (立即开始 - P0 关键修复 + 基础设置):
├── Task 1: 修复 TypeScript 类型断言错误 (utils.ts:316,334,343) [ultrabrain]
├── Task 2: 修复 Biome 错误 (6 errors) [quick]
├── Task 3: 添加类型守卫工具函数 [quick]
├── Task 4: 设置覆盖率阈值配置 [quick]
└── Task 5: 创建测试基础设施 (index.ts 测试模板) [quick]

Wave 2 (Wave 1 后 - P1 重构，MAX 并行):
├── Task 6: 重构 load() - extract buildRouteTree() [deep]
├── Task 7: 重构 load() - extract applyLayouts() [deep]
├── Task 8: 重构 load() - extract generateRouteCode() [deep]
├── Task 9: 重构 load() - extract addNotFoundRoute() [deep]
├── Task 10: 减少 as 断言 (29→15) [ultrabrain]
├── Task 11: 减少 ! 断言 (30→15) [ultrabrain]
└── Task 12: 添加 JSDoc 注释到复杂算法 [writing]

Wave 3 (Wave 2 后 - P2 测试补充 + 最终验证):
├── Task 13: 添加 ErrorBoundary 测试 [unspecified-high]
├── Task 14: 添加 Handle/Action测试 [unspecified-high]
├── Task 15: 添加 HMR watchChange 测试 [unspecified-high]
├── Task 16: 添加 loader 验证测试 [unspecified-high]
├── Task 17: 提升 index.ts 覆盖率到 60%+ [unspecified-high]
├── Task 18: 提升 utils.ts 覆盖率到 60%+ [unspecified-high]
└── Task F1-F4: Final Verification Wave (4 并行审查)

Critical Path: Task 1 → Task 3 → Task 6-9 → Task 10-11 → Task 13-18 → F1-F4
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 7 (Waves 1 & 2)
```

### Dependency Matrix

| Task  | Depends On | Blocks |
| ----- | ---------- | ------ |
| 1     | —          | 10, 11 |
| 2     | —          | —      |
| 3     | 1          | 6-9    |
| 4     | —          | 17, 18 |
| 5     | —          | 13-16  |
| 6     | 3          | 17     |
| 7     | 3          | 17     |
| 8     | 3          | 17     |
| 9     | 3          | 17     |
| 10    | 1, 3       | —      |
| 11    | 1, 3       | —      |
| 12    | —          | —      |
| 13    | 5          | 17     |
| 14    | 5          | 17     |
| 15    | 5          | 17     |
| 16    | 5          | 17     |
| 17    | 6-9, 13-16 | F1-F4  |
| 18    | 10-12, 17  | F1-F4  |
| F1-F4 | 17, 18     | —      |

### Agent Dispatch Summary

- **Wave 1**: **5 任务** — T1 → `ultrabrain`, T2 → `quick`, T3 → `quick`, T4 → `quick`, T5 → `quick`
- **Wave 2**: **7 任务** — T6-9 → `deep`, T10-11 → `ultrabrain`, T12 → `writing`
- **Wave 3**: **7 任务** — T13-18 → `unspecified-high`, F1-F4 → `oracle`/`unspecified-high`/`deep`

---

## TODOs

> 实现 + 测试 = 一个任务。永不分离。
> 每个任务必须包含：推荐代理配置 + 并行化信息 + QA 场景。
> **没有 QA 场景的任务是不完整的。不接受例外。**

- [x] 1. 修复 TypeScript 类型断言错误 (utils.ts:316,334,343)

  **What to do**:

  - 修复 line 316: `loader as string` → 使用类型守卫检查 `typeof loader === 'string'`
  - 修复 line 334: `action as string` → 使用类型守卫检查 `typeof action === 'string'`
  - 修复 line 343: `ErrorBoundary as string` → 使用类型守卫检查 `typeof ErrorBoundary === 'string'`
  - 为 loader/action/ErrorBoundary 添加运行时类型验证
  - 创建类型守卫函数：`isStringExport()`, `isFunctionExport()`

  **Must NOT do**:

  - 不改变导出接口的行为
  - 不使用 `as unknown as` 双重断言
  - 不引入破坏性变更

  **Recommended Agent Profile**:

  > 需要深度 TypeScript 类型系统知识和类型守卫模式经验

  - **Category**: `ultrabrain`
    - Reason: 需要理解复杂的类型联合和类型收窄模式
  - **Skills**: `[]`
    - 无需额外技能，纯 TypeScript 类型系统任务

  **Parallelization**:

  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (必须先修复类型错误才能进行其他重构)
  - **Blocks**: Tasks 10, 11, 6-9
  - **Blocked By**: None (可以立即开始)

  **References**:

  - `src/utils.ts:301-360` - stringifyRoutes 函数，包含所有类型错误的行
  - `src/index.ts:120-130` - 类似的类型断言模式（用于对比）
  - TypeScript 官方文档: `https://www.typescriptlang.org/docs/handbook/2/narrowing.html` - 类型守卫模式

  **Acceptance Criteria**:

  - [ ] `pnpm typecheck` 或 `tsc --noEmit` 输出 0 错误
  - [ ] 原 3 个错误行 (316,334,343) 不再有类型错误
  - [ ] `pnpm build` 成功构建
  - [ ] `pnpm test` 所有现有测试通过 (10/10)

  **QA Scenarios**:

  ```
  Scenario: TypeScript 编译检查
    Tool: Bash
    Preconditions: 代码修改完成
    Steps:
      1. 运行 `pnpm typecheck` 或 `tsc --noEmit`
      2. 检查输出，确认无错误
      3. 运行 `pnpm build` 确认构建成功
    Expected Result: 输出包含 "0 errors" 或构建成功消息
    Failure Indicators: 任何 TypeScript 错误消息
    Evidence: .sisyphus/evidence/task-1-typecheck.txt

  Scenario: 现有测试回归检查
    Tool: Bash
    Preconditions: 类型修复完成
    Steps:
      1. 运行 `pnpm test`
      2. 检查测试结果
    Expected Result: 10 tests passed, 0 failed
    Failure Indicators: 任何测试失败
    Evidence: .sisyphus/evidence/task-1-test-output.txt
  ```

  **Commit**: YES (groups with 2, 3)

  - Message: `fix(types): replace unsafe type assertions with type guards in utils.ts`
  - Files: `src/utils.ts`
  - Pre-commit: `pnpm typecheck && pnpm test`

---

- [x] 2. 修复 Biome 错误 (6 errors)

  **What to do**:

  - 修复 2× `useIterableCallbackReturn`: forEach 回调不应返回值
  - 修复 1× `useFlatMap`: `.map().flat()` 改为 `.flatMap()`
  - 修复 2× `useImportType`: 使用 `import type` 导入类型
  - 修复 1× 格式化问题

  **Must NOT do**:

  - 不改变业务逻辑
  - 不引入新的 lint 警告

  **Recommended Agent Profile**:

  - **Category**: `quick`
    - Reason: 机械性修复，模式清晰
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  - Biome 官方文档: `https://biomejs.dev/linter/rules/` - 规则说明
  - `src/index.ts:173,193` - forEach 返回值问题位置
  - `src/utils.ts` - 搜索 `.map().flat()` 模式

  **Acceptance Criteria**:

  - [ ] `pnpm biome check` 输出 0 errors
  - [ ] 警告数量从 24 减少到 ≤20
  - [ ] 所有修复可通过 `pnpm biome check --write` 自动应用

  **QA Scenarios**:

  ```
  Scenario: Biome Lint 检查
    Tool: Bash
    Preconditions: 代码修改完成
    Steps:
      1. 运行 `pnpm biome check`
      2. 统计错误数量
    Expected Result: 输出 "0 errors"
    Failure Indicators: 任何错误消息
    Evidence: .sisyphus/evidence/task-2-biome-check.txt
  ```

  **Commit**: YES (groups with 1, 3)

  - Message: `fix(lint): resolve 6 biome errors (forEach return, flatMap, import type)`
  - Files: `src/index.ts`, `src/utils.ts`
  - Pre-commit: `pnpm biome check`

---

- [x] 3. 添加类型守卫工具函数

  **What to do**:

  - 创建 `isStringExport(value: unknown): value is string` 类型守卫
  - 创建 `isFunctionExport(value: unknown): value is Function` 类型守卫
  - 创建 `isComponentType(value: unknown): value is ComponentType` 类型守卫
  - 在 `src/utils.ts` 或新建 `src/type-guards.ts` 中导出

  **Must NOT do**:

  - 不使用 `instanceof String` (错误模式)
  - 不检查内部实现细节

  **Recommended Agent Profile**:

  - **Category**: `quick`
    - Reason: 标准 TypeScript 模式，简单直接
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 6-9, 10, 11
  - **Blocked By**: Task 1 (类型修复提供上下文)

  **References**:

  - TypeScript Handbook: Type Guards - `https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates`
  - `src/utils.ts:301-360` - 需要使用类型守卫的位置

  **Acceptance Criteria**:

  - [ ] 创建 3 个类型守卫函数
  - [ ] 每个类型守卫有单元测试
  - [ ] 类型守卫在 Task 1 中被使用

  **QA Scenarios**:

  ```
  Scenario: 类型守卫单元测试
    Tool: Bash
    Preconditions: 类型守卫函数已创建
    Steps:
      1. 创建测试文件 `__tests__/type-guards.spec.ts`
      2. 为每个类型守卫添加测试用例
      3. 运行 `pnpm test __tests__/type-guards.spec.ts`
    Expected Result: 所有测试通过
    Failure Indicators: 测试失败
    Evidence: .sisyphus/evidence/task-3-type-guards-test.txt
  ```

  **Commit**: YES (groups with 1, 2)

  - Message: `feat(types): add type guard utility functions`
  - Files: `src/type-guards.ts`, `__tests__/type-guards.spec.ts`
  - Pre-commit: `pnpm test`

---

- [x] 4. 设置覆盖率阈值配置

  **What to do**:

  - 在 `vitest.config.ts` 或 `package.json` 中添加覆盖率阈值
  - 配置：整体≥80%，每个文件≥60%
  - 添加 CI 检查脚本

  **Must NOT do**:

  - 不降低阈值以适应当前代码
  - 不排除关键文件

  **Recommended Agent Profile**:

  - **Category**: `quick`
    - Reason: 配置文件修改
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 17, 18
  - **Blocked By**: None

  **References**:

  - Vitest 覆盖率文档: `https://vitest.dev/config/#coverage`
  - `package.json` - 现有 test/coverage 脚本

  **Acceptance Criteria**:

  - [ ] `pnpm coverage` 失败时输出阈值未达标消息
  - [ ] 配置包含 `thresholds: { global: 80, each: 60 }`

  **QA Scenarios**:

  ```
  Scenario: 覆盖率阈值检查
    Tool: Bash
    Preconditions: 配置已添加
    Steps:
      1. 运行 `pnpm coverage`
      2. 检查输出是否包含阈值信息
    Expected Result: 输出显示覆盖率阈值要求
    Failure Indicators: 无阈值配置
    Evidence: .sisyphus/evidence/task-4-coverage-threshold.txt
  ```

  **Commit**: YES

  - Message: `ci: add coverage threshold configuration (80% global, 60% each)`
  - Files: `vitest.config.ts` 或 `package.json`
  - Pre-commit: `pnpm coverage`

---

- [x] 5. 创建测试基础设施 (index.ts 测试模板)

  **What to do**:

  - 创建 `__tests__/index.spec.ts` 测试框架
  - 添加 describe 块：load(), configureServer(), resolveId(), watchChange()
  - 添加 mock Vite 环境配置
  - 添加示例测试用例

  **Must NOT do**:

  - 不实现完整测试（留给 Tasks 13-16）
  - 不复制现有测试代码

  **Recommended Agent Profile**:

  - **Category**: `quick`
    - Reason: 测试脚手架
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 13-16
  - **Blocked By**: None

  **References**:

  - `__tests__/validation.spec.ts` - 现有测试模式参考
  - `src/index.ts` - 被测试的源代码

  **Acceptance Criteria**:

  - [ ] 创建 `__tests__/index.spec.ts` 文件
  - [ ] 包含 4 个 describe 块
  - [ ] 至少 1 个示例测试通过

  **QA Scenarios**:

  ```
  Scenario: 测试框架验证
    Tool: Bash
    Preconditions: 测试文件已创建
    Steps:
      1. 运行 `pnpm test __tests__/index.spec.ts`
      2. 检查测试输出
    Expected Result: 测试运行成功
    Failure Indicators: 语法错误或配置错误
    Evidence: .sisyphus/evidence/task-5-test-framework.txt
  ```

  **Commit**: YES

  - Message: `test: create index.spec.ts test framework`
  - Files: `__tests__/index.spec.ts`
  - Pre-commit: `pnpm test`

---

- [x] 6. 重构 load() - extract buildRouteTree()

  **What to do**:

  - 从 load() 提取路由树构建逻辑 (约 lines 169-200)
  - 创建独立函数 `buildRouteTree(routes: RouteRecord[]): RouteRecord[]`
  - 函数长度 ≤40 行
  - 添加 JSDoc 注释说明算法

  **Must NOT do**:

  - 不改变路由构建逻辑
  - 不暴露为公共 API

  **Recommended Agent Profile**:

  - **Category**: `deep`
    - Reason: 复杂重构，需要理解递归逻辑
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 7, 8, 9)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 17
  - **Blocked By**: Task 3 (类型守卫)

  **References**:

  - `src/index.ts:104-235` - load() 函数完整实现
  - `src/index.ts:169-200` - 路由树构建逻辑
  - TODO.md: REFACTOR-001

  **Acceptance Criteria**:

  - [ ] 创建 `buildRouteTree()` 函数
  - [ ] 函数长度 ≤40 行
  - [ ] 添加 JSDoc 注释
  - [ ] 所有现有测试通过

  **QA Scenarios**:

  ```
  Scenario: 重构后功能验证
    Tool: Bash
    Preconditions: 重构完成
    Steps:
      1. 运行 `pnpm test`
      2. 运行 `pnpm build`
    Expected Result: 所有测试通过，构建成功
    Failure Indicators: 测试失败或构建错误
    Evidence: .sisyphus/evidence/task-6-buildRouteTree-test.txt
  ```

  **Commit**: YES (groups with 7, 8, 9)

  - Message: `refactor: extract buildRouteTree() from load() function`
  - Files: `src/index.ts`
  - Pre-commit: `pnpm test && pnpm build`

---

- [x] 7. 重构 load() - extract applyLayouts()

  **What to do**:

  - 从 load() 提取布局应用逻辑 (约 lines 121-160)
  - 创建独立函数 `applyLayouts(routes: RouteRecord[], rootLayout: RouteRecord): RouteRecord[]`
  - 函数长度 ≤40 行
  - 添加 JSDoc 注释

  **Must NOT do**:

  - 不改变布局应用逻辑
  - 不暴露为公共 API

  **Recommended Agent Profile**:

  - **Category**: `deep`
    - Reason: 复杂重构，需要理解布局嵌套
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 6, 8, 9)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 17
  - **Blocked By**: Task 3

  **References**:

  - `src/index.ts:121-160` - 布局应用逻辑
  - TODO.md: REFACTOR-001

  **Acceptance Criteria**:

  - [ ] 创建 `applyLayouts()` 函数
  - [ ] 函数长度 ≤40 行
  - [ ] 添加 JSDoc 注释
  - [ ] 所有现有测试通过

  **QA Scenarios**:

  ```
  Scenario: 布局应用功能验证
    Tool: Bash
    Preconditions: 重构完成
    Steps:
      1. 运行 `pnpm test`
      2. 运行 `pnpm build`
    Expected Result: 所有测试通过，构建成功
    Evidence: .sisyphus/evidence/task-7-applyLayouts-test.txt
  ```

  **Commit**: YES (groups with 6, 8, 9)

  - Message: `refactor: extract applyLayouts() from load() function`
  - Files: `src/index.ts`
  - Pre-commit: `pnpm test && pnpm build`

---

- [x] 8. 重构 load() - extract generateRouteCode()

  **What to do**:

  - 从 load() 提取代码生成逻辑 (约 lines 205-230)
  - 创建独立函数 `generateRouteCode(routes: RouteRecord[]): string`
  - 函数长度 ≤40 行
  - 添加 JSDoc 注释

  **Must NOT do**:

  - 不改变代码生成逻辑
  - 不暴露为公共 API

  **Recommended Agent Profile**:

  - **Category**: `deep`
    - Reason: 复杂重构，需要理解模板生成
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 6, 7, 9)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 17
  - **Blocked By**: Task 3

  **References**:

  - `src/index.ts:205-230` - 代码生成逻辑
  - TODO.md: REFACTOR-001

  **Acceptance Criteria**:

  - [ ] 创建 `generateRouteCode()` 函数
  - [ ] 函数长度 ≤40 行
  - [ ] 添加 JSDoc 注释
  - [ ] 所有现有测试通过

  **QA Scenarios**:

  ```
  Scenario: 代码生成功能验证
    Tool: Bash
    Preconditions: 重构完成
    Steps:
      1. 运行 `pnpm test`
      2. 运行 `pnpm build`
    Expected Result: 所有测试通过，构建成功
    Evidence: .sisyphus/evidence/task-8-generateRouteCode-test.txt
  ```

  **Commit**: YES (groups with 6, 7, 9)

  - Message: `refactor: extract generateRouteCode() from load() function`
  - Files: `src/index.ts`
  - Pre-commit: `pnpm test && pnpm build`

---

- [x] 9. 重构 load() - extract addNotFoundRoute()

  **What to do**:

  - 从 load() 添加 404 路由逻辑 (约 lines 140-165)
  - 创建独立函数 `addNotFoundRoute(routes: RouteRecord[]): RouteRecord[]`
  - 函数长度 ≤40 行
  - 添加 JSDoc 注释

  **Must NOT do**:

  - 不改变 404 路由逻辑
  - 不暴露为公共 API

  **Recommended Agent Profile**:

  - **Category**: `deep`
    - Reason: 复杂重构，需要理解路由匹配
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 6, 7, 8)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 17
  - **Blocked By**: Task 3

  **References**:

  - `src/index.ts:140-165` - 404 路由添加逻辑
  - TODO.md: REFACTOR-001

  **Acceptance Criteria**:

  - [ ] 创建 `addNotFoundRoute()` 函数
  - [ ] 函数长度 ≤40 行
  - [ ] 添加 JSDoc 注释
  - [ ] 所有现有测试通过

  **QA Scenarios**:

  ```
  Scenario: 404 路由功能验证
    Tool: Bash
    Preconditions: 重构完成
    Steps:
      1. 运行 `pnpm test`
      2. 运行 `pnpm build`
    Expected Result: 所有测试通过，构建成功
    Evidence: .sisyphus/evidence/task-9-addNotFoundRoute-test.txt
  ```

  **Commit**: YES (groups with 6, 7, 8)

  - Message: `refactor: extract addNotFoundRoute() from load() function`
  - Files: `src/index.ts`
  - Pre-commit: `pnpm test && pnpm build`

---

- [x] 10. 减少 as 断言 (29→15)

  **What to do**:

  - 识别所有 `as` 断言位置
  - 使用类型守卫替换不安全的断言
  - 添加运行时验证
  - 目标：从 29 减少到≤15

  **Must NOT do**:

  - 不使用 `as unknown as` 双重断言
  - 不引入新的类型错误

  **Recommended Agent Profile**:

  - **Category**: `ultrabrain`
    - Reason: 需要深度类型系统理解
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Task 11)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 3

  **References**:

  - TODO.md: TYPE-001
  - `src/index.ts`, `src/utils.ts`, `src/validation.ts` - 所有包含 as 断言的文件
  - Task 3 创建的类型守卫函数

  **Acceptance Criteria**:

  - [ ] 统计 `as` 断言数量 ≤15
  - [ ] 无 `as unknown as` 模式
  - [ ] `pnpm typecheck` 0 错误

  **QA Scenarios**:

  ```
  Scenario: as 断言数量检查
    Tool: Bash
    Preconditions: 重构完成
    Steps:
      1. 运行 `grep -n " as " src/*.ts | wc -l`
      2. 验证数量 ≤15
    Expected Result: 输出数字 ≤15
    Failure Indicators: 数字 >15
    Evidence: .sisyphus/evidence/task-10-as-count.txt
  ```

  **Commit**: YES (groups with 11)

  - Message: `refactor(types): reduce 'as' assertions from 29 to 15`
  - Files: `src/index.ts`, `src/utils.ts`, `src/validation.ts`
  - Pre-commit: `pnpm typecheck`

---

- [x] 11. 减少 ! 断言 (30→15)

  **What to do**:

  - 识别所有 `!` 非空断言位置
  - 使用可选链 `?.` 和空值合并 `??` 替换
  - 添加空值检查
  - 目标：从 30 减少到≤15

  **Must NOT do**:

  - 不引入运行时错误
  - 不改变业务逻辑

  **Recommended Agent Profile**:

  - **Category**: `ultrabrain`
    - Reason: 需要深度类型系统理解
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Task 10)
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Tasks 1, 3

  **References**:

  - TODO.md: TYPE-001
  - Biome 规则: `noNonNullAssertion`
  - `src/index.ts`, `src/utils.ts`, `src/validation.ts`

  **Acceptance Criteria**:

  - [ ] 统计 `!` 断言数量 ≤15
  - [ ] `pnpm biome check` 无 `noNonNullAssertion` 警告
  - [ ] `pnpm typecheck` 0 错误

  **QA Scenarios**:

  ```
  Scenario: ! 断言数量检查
    Tool: Bash
    Preconditions: 重构完成
    Steps:
      1. 运行 `grep -n "!\\." src/*.ts | wc -l`
      2. 验证数量 ≤15
    Expected Result: 输出数字 ≤15
    Failure Indicators: 数字 >15
    Evidence: .sisyphus/evidence/task-11-non-null-count.txt
  ```

  **Commit**: YES (groups with 10)

  - Message: `refactor(types): reduce non-null assertions from 30 to 15`
  - Files: `src/index.ts`, `src/utils.ts`, `src/validation.ts`
  - Pre-commit: `pnpm typecheck && pnpm biome check`

---

- [x] 12. 添加 JSDoc 注释到复杂算法

  **What to do**:

  - 为 `collectRoutePages()` 添加详细算法说明
  - 为 `arrangeRoutes()` 添加递归逻辑说明
  - 为 `stringifyRoutes()` 添加参数和返回值说明
  - 为 `buildRouteTree()` 等新增函数添加 JSDoc

  **Must NOT do**:

  - 不添加冗余注释（如"返回 true"）
  - 不使用 emoji

  **Recommended Agent Profile**:

  - **Category**: `writing`
    - Reason: 技术文档编写
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Tasks 6-9 (等待函数重构完成)

  **References**:

  - TODO.md: DOCS-001
  - `src/utils.ts:43-78` - collectRoutePages
  - `src/utils.ts:202-255` - arrangeRoutes
  - `src/utils.ts:301-410` - stringifyRoutes

  **Acceptance Criteria**:

  - [ ] 4 个核心函数有完整 JSDoc
  - [ ] 每个 JSDoc 包含 @param, @returns, @example
  - [ ] `pnpm build` 成功

  **QA Scenarios**:

  ```
  Scenario: JSDoc 存在性检查
    Tool: Bash
    Preconditions: 注释添加完成
    Steps:
      1. 检查每个目标函数上方是否有 /** ... */ 块
      2. 验证包含 @param, @returns
    Expected Result: 所有目标函数有完整 JSDoc
    Failure Indicators: 缺少 JSDoc 或标签
    Evidence: .sisyphus/evidence/task-12-jsdoc-check.txt
  ```

  **Commit**: YES

  - Message: `docs: add JSDoc comments to complex algorithms`
  - Files: `src/utils.ts`, `src/index.ts`
  - Pre-commit: `pnpm build`

---

- [x] 13. 添加 ErrorBoundary 测试

  **What to do**:

  - 创建 ErrorBoundary 触发场景测试
  - 测试错误捕获和渲染
  - 测试错误边界回退
  - 添加到 `__tests__/index.spec.ts`

  **Must NOT do**:

  - 不测试实现细节
  - 不 mock React 内部

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
    - Reason: 复杂测试场景
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 14, 15, 16)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  - TODO.md: TEST-001
  - `__tests__/validation.spec.ts` - 现有测试模式

  **Acceptance Criteria**:

  - [ ] 添加 3+ ErrorBoundary 测试用例
  - [ ] 测试覆盖错误触发、捕获、渲染
  - [ ] 所有测试通过

  **QA Scenarios**:

  ```
  Scenario: ErrorBoundary 测试运行
    Tool: Bash
    Preconditions: 测试已添加
    Steps:
      1. 运行 `pnpm test -- --testNamePattern="ErrorBoundary"`
      2. 检查测试结果
    Expected Result: 3+ 测试通过
    Failure Indicators: 测试失败
    Evidence: .sisyphus/evidence/task-13-errorBoundary-test.txt
  ```

  **Commit**: YES (groups with 14, 15, 16)

  - Message: `test: add ErrorBoundary test cases`
  - Files: `__tests__/index.spec.ts`
  - Pre-commit: `pnpm test`

---

- [x] 14. 添加 Handle/Action 测试

  **What to do**:

  - 测试 Handle 数据传递
  - 测试 Action 表单提交
  - 测试 loader 数据加载
  - 添加到 `__tests__/index.spec.ts`

  **Must NOT do**:

  - 不测试实现细节
  - 不 mock React 内部

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
    - Reason: 复杂测试场景
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 13, 15, 16)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  - TODO.md: TEST-001
  - `e2e/react.spec.ts` - E2E 测试参考

  **Acceptance Criteria**:

  - [ ] 添加 5+ Handle/Action测试用例
  - [ ] 测试覆盖数据传递、表单提交
  - [ ] 所有测试通过

  **QA Scenarios**:

  ```
  Scenario: Handle/Action 测试运行
    Tool: Bash
    Preconditions: 测试已添加
    Steps:
      1. 运行 `pnpm test -- --testNamePattern="Handle|Action"`
      2. 检查测试结果
    Expected Result: 5+ 测试通过
    Failure Indicators: 测试失败
    Evidence: .sisyphus/evidence/task-14-handle-action-test.txt
  ```

  **Commit**: YES (groups with 13, 15, 16)

  - Message: `test: add Handle and Action test cases`
  - Files: `__tests__/index.spec.ts`
  - Pre-commit: `pnpm test`

---

- [x] 15. 添加 HMR watchChange 测试

  **What to do**:

  - 测试 watchChange 钩子
  - 测试热模块替换
  - 测试路由重新生成
  - 添加到 `__tests__/index.spec.ts`

  **Must NOT do**:

  - 不依赖真实文件系统
  - 不测试 Vite 内部

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
    - Reason: 复杂测试场景
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 13, 14, 16)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  - TODO.md: TEST-001
  - `src/index.ts:240-246` - watchChange 实现

  **Acceptance Criteria**:

  - [ ] 添加 2+ HMR 测试用例
  - [ ] 测试覆盖文件变更、路由重建
  - [ ] 所有测试通过

  **QA Scenarios**:

  ```
  Scenario: HMR watchChange 测试运行
    Tool: Bash
    Preconditions: 测试已添加
    Steps:
      1. 运行 `pnpm test -- --testNamePattern="watchChange|HMR"`
      2. 检查测试结果
    Expected Result: 2+ 测试通过
    Failure Indicators: 测试失败
    Evidence: .sisyphus/evidence/task-15-hmr-test.txt
  ```

  **Commit**: YES (groups with 13, 14, 16)

  - Message: `test: add HMR watchChange test cases`
  - Files: `__tests__/index.spec.ts`
  - Pre-commit: `pnpm test`

---

- [x] 16. 添加 loader 验证测试

  **What to do**:

  - 测试 loader 文件默认导出验证
  - 测试无效 loader 错误处理
  - 添加到 `__tests__/validation.spec.ts`

  **Must NOT do**:

  - 不测试实现细节
  - 不改变验证逻辑

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
    - Reason: 复杂测试场景
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 13, 14, 15)
  - **Parallel Group**: Wave 3
  - **Blocks**: Task 17
  - **Blocked By**: Task 5

  **References**:

  - TODO.md: VALIDATION-001, TEST-001
  - `src/validation.ts` - 验证逻辑

  **Acceptance Criteria**:

  - [ ] 添加 3+ loader 验证测试用例
  - [ ] 测试覆盖有效/无效 loader
  - [ ] 所有测试通过

  **QA Scenarios**:

  ```
  Scenario: loader 验证测试运行
    Tool: Bash
    Preconditions: 测试已添加
    Steps:
      1. 运行 `pnpm test -- --testNamePattern="loader"`
      2. 检查测试结果
    Expected Result: 3+ 测试通过
    Failure Indicators: 测试失败
    Evidence: .sisyphus/evidence/task-16-loader-validation-test.txt
  ```

  **Commit**: YES (groups with 13, 14, 15)

  - Message: `test: add loader validation test cases`
  - Files: `__tests__/validation.spec.ts`
  - Pre-commit: `pnpm test`

---

- [x] 17. 提升 index.ts 覆盖率到 60%+

  **What to do**:

  - 运行覆盖率检查识别未覆盖行
  - 添加测试覆盖未覆盖的分支
  - 目标：index.ts 从 0%→60%+

  **Must NOT do**:

  - 不为覆盖率而写无意义测试
  - 不降低覆盖率阈值

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
    - Reason: 系统性测试补充
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (必须在 Tasks 6-16 之后)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 6-9, 13-16

  **References**:

  - TODO.md: TEST-001
  - `pnpm coverage` 生成的覆盖率报告

  **Acceptance Criteria**:

  - [ ] `pnpm coverage` 显示 index.ts ≥60%
  - [ ] Statements, Branches, Functions, Lines 都≥60%

  **QA Scenarios**:

  ```
  Scenario: index.ts 覆盖率验证
    Tool: Bash
    Preconditions: 测试添加完成
    Steps:
      1. 运行 `pnpm coverage`
      2. 解析覆盖率报告
      3. 验证 index.ts 覆盖率
    Expected Result: index.ts 覆盖率 ≥60%
    Failure Indicators: 覆盖率 <60%
    Evidence: .sisyphus/evidence/task-17-index-coverage.txt
  ```

  **Commit**: YES

  - Message: `test: increase index.ts coverage to 60%+`
  - Files: `__tests__/index.spec.ts`
  - Pre-commit: `pnpm coverage`

---

- [x] 18. 提升 utils.ts 覆盖率到 60%+

  **What to do**:

  - 运行覆盖率检查识别未覆盖行
  - 添加测试覆盖未覆盖的分支
  - 目标：utils.ts 从 30.5%→60%+

  **Must NOT do**:

  - 不为覆盖率而写无意义测试
  - 不降低覆盖率阈值

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
    - Reason: 系统性测试补充
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential (必须在 Tasks 10-12, 17 之后)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 10-12, 17

  **References**:

  - TODO.md: TEST-001
  - `pnpm coverage` 生成的覆盖率报告

  **Acceptance Criteria**:

  - [ ] `pnpm coverage` 显示 utils.ts ≥60%
  - [ ] Statements, Branches, Functions, Lines 都≥60%
  - [ ] 整体覆盖率 ≥80%

  **QA Scenarios**:

  ```
  Scenario: utils.ts 覆盖率验证
    Tool: Bash
    Preconditions: 测试添加完成
    Steps:
      1. 运行 `pnpm coverage`
      2. 解析覆盖率报告
      3. 验证 utils.ts 覆盖率
    Expected Result: utils.ts 覆盖率 ≥60%
    Failure Indicators: 覆盖率 <60%
    Evidence: .sisyphus/evidence/task-18-utils-coverage.txt
  ```

  **Commit**: YES

  - Message: `test: increase utils.ts coverage to 60%+`
  - Files: `__tests__/utils.spec.ts`
  - Pre-commit: `pnpm coverage`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 个审查代理并行运行。全部必须 APPROVE。向用户展示合并结果并获取明确的"okay"后再完成。
>
> **验证后不自动继续。等待用户明确批准后再标记工作完成。** > **在获得用户 okay 之前，绝不将 F1-F4 标记为已勾选。** 拒绝或用户反馈 → 修复 → 重新运行 → 再次展示 → 等待 okay

- [ ] F1. **Plan Compliance Audit** — `oracle`
      逐字逐句阅读计划。对每个"Must Have"：验证实现存在（读取文件、curl 端点、运行命令）。对每个"Must NOT Have"：搜索代码库查找禁止模式——如果找到则拒绝并给出 file:line。检查证据文件存在于 .sisyphus/evidence/。比较交付物与计划。
      输出：`Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
      运行 `pnpm typecheck` + `pnpm biome check` + `pnpm test`。审查所有更改文件的：`as any`/`@ts-ignore`、空 catch、console.log 在生产环境、注释掉的代码、未使用的导入。检查 AI slop：过度注释、过度抽象、通用名称（data/result/item/temp）。
      输出：`Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
      从干净状态开始。执行每个任务的每个 QA 场景——遵循确切步骤、捕获证据。测试跨任务集成（功能协同工作，而非隔离）。测试边界情况：空状态、无效输入、快速操作。保存到 `.sisyphus/evidence/final-qa/`。
      输出：`Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
      对每个任务：阅读"What to do"，阅读实际 diff（git log/diff）。验证 1:1——规格中的所有内容都已构建（无遗漏），超出规格的内容未构建（无蔓延）。检查"Must NOT do"合规性。检测跨任务污染：任务 N 触碰任务 M 的文件。标记未说明的更改。
      输出：`Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

**Wave 1 Commits**:

- `fix(types): replace unsafe type assertions with type guards in utils.ts` — src/utils.ts, pnpm typecheck && pnpm test
- `fix(lint): resolve 6 biome errors (forEach return, flatMap, import type)` — src/index.ts, src/utils.ts, pnpm biome check
- `feat(types): add type guard utility functions` — src/type-guards.ts, pnpm test
- `ci: add coverage threshold configuration (80% global, 60% each)` — vitest.config.ts, pnpm coverage
- `test: create index.spec.ts test framework` — **tests**/index.spec.ts, pnpm test

**Wave 2 Commits**:

- `refactor: extract buildRouteTree() from load() function` — src/index.ts, pnpm test && pnpm build
- `refactor: extract applyLayouts() from load() function` — src/index.ts, pnpm test && pnpm build
- `refactor: extract generateRouteCode() from load() function` — src/index.ts, pnpm test && pnpm build
- `refactor: extract addNotFoundRoute() from load() function` — src/index.ts, pnpm test && pnpm build
- `refactor(types): reduce 'as' assertions from 29 to 15` — src/\*.ts, pnpm typecheck
- `refactor(types): reduce non-null assertions from 30 to 15` — src/\*.ts, pnpm typecheck && pnpm biome check
- `docs: add JSDoc comments to complex algorithms` — src/utils.ts, src/index.ts, pnpm build

**Wave 3 Commits**:

- `test: add ErrorBoundary test cases` — **tests**/index.spec.ts, pnpm test
- `test: add Handle and Action test cases` — **tests**/index.spec.ts, pnpm test
- `test: add HMR watchChange test cases` — **tests**/index.spec.ts, pnpm test
- `test: add loader validation test cases` — **tests**/validation.spec.ts, pnpm test
- `test: increase index.ts coverage to 60%+` — **tests**/index.spec.ts, pnpm coverage
- `test: increase utils.ts coverage to 60%+` — **tests**/utils.spec.ts, pnpm coverage

---

## Success Criteria

### Verification Commands

```bash
pnpm typecheck              # Expected: 0 errors
pnpm biome check            # Expected: 0 errors, ≤10 warnings
pnpm test                   # Expected: 20+ tests pass, 0 fail
pnpm coverage               # Expected: ≥80% global, ≥60% each file
pnpm build                  # Expected: Build success, 18KB output
```

### Final Checklist

- [ ] All "Must Have" present (backward compatibility maintained)
- [ ] All "Must NOT Have" absent (no feature creep, no breaking changes)
- [ ] All tests pass (20+ tests, 0 failures)
- [ ] Coverage ≥80% global, ≥60% each file
- [ ] TypeScript 0 errors
- [ ] Biome 0 errors, ≤10 warnings
- [ ] `as` assertions ≤15, `!` assertions ≤15
- [ ] `load()` function split into 4 functions (each ≤40 lines)
- [ ] JSDoc comments added to 4 complex algorithms
