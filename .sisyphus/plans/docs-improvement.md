# 文档改进计划

## TL;DR

> **核心目标**: 更新和补充项目文档，反映最新代码状态，提升开发者体验
>
> **交付物**:
>
> - 更新 TODO.md 反映代码改进成果
> - 创建 API 参考文档
> - 创建迁移指南
> - 创建 FAQ 常见问题
> - 创建最佳实践指南
> - 补充架构设计文档
> - 添加更新日志
>
> **预估工作量**: **Medium** (约 1-2 周)
> **并行执行**: **YES** - 2 个 Wave，最多 4 任务并行

---

## Context

### Original Request

用户请求："做完了所有优化之后，接下来应该做一些文档工作，看看有没有需要补充和改进的文档"

### Interview Summary

**文档审查发现**:

- 核心 README 完整 (中英文都有)
- CONTRIBUTING.md 基础但可用
- TODO.md 严重过时 (所有 P0/P1 任务已完成)
- 缺失 API 参考、迁移指南、FAQ、最佳实践
- 缺少架构设计文档说明代码改进

### Research Findings

**代码改进成果** (需要记录):

- Wave 1: 类型安全修复、Biome 错误修复、类型守卫创建
- Wave 2: load() 函数重构为 4 个函数、类型断言减少
- Wave 3: 测试从 10 个增加到 52 个、覆盖率从 39%→83%
- Final: 所有验证通过、向后兼容保持

---

## Work Objectives

### Core Objective

通过系统性文档更新和补充，提升项目的开发者体验，确保文档与代码同步。

### Concrete Deliverables

- 📝 更新 TODO.md 标记已完成任务
- 📝 创建 `docs/api-reference.md` API 参考
- 📝 创建 `docs/migration-guide.md` 迁移指南
- 📝 创建 `docs/faq.md` 常见问题
- 📝 创建 `docs/best-practices.md` 最佳实践
- 📝 创建 `docs/architecture.md` 架构设计文档
- 📝 创建 `CHANGELOG.md` 更新日志

### Definition of Done

- [ ] 所有新文档文件创建
- [ ] TODO.md 更新完成
- [ ] 文档中所有代码示例可运行
- [ ] 文档链接正确
- [ ] 中英文文档同步更新 (可选)

### Must Have

- **准确性**: 所有代码示例必须与当前版本一致
- **完整性**: API 参考覆盖所有配置项
- **实用性**: FAQ 回答真实常见问题
- **可读性**: 使用清晰的标题和结构

### Must NOT Have (Guardrails)

- **不重复**: 不在多处重复相同信息
- **不过时**: 不添加很快会过时的内容
- **不冗余**: 保持简洁，避免冗长
- **不破坏链接**: 保持现有 README 链接有效

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — 所有验证由代理执行。

### Test Decision

- **基础设施存在**: **NO** (文档不需要自动化测试)
- **验证方式**: 代理手动检查文档链接、代码示例

### QA Policy

每个任务必须包含代理执行的 QA 场景：

- **文档链接**: Bash (curl) 检查外部链接有效性
- **代码示例**: Bash 运行示例代码验证可执行
- **格式检查**: Bash 检查 markdown 语法

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (立即开始 - 更新现有文档):
├── Task 1: 更新 TODO.md 反映代码改进成果 [quick]
├── Task 2: 创建 CHANGELOG.md [writing]
└── Task 3: 更新 CONTRIBUTING.md 添加文档规范 [writing]

Wave 2 (Wave 1 后 - 创建新文档):
├── Task 4: 创建 docs/api-reference.md [writing]
├── Task 5: 创建 docs/migration-guide.md [writing]
├── Task 6: 创建 docs/faq.md [writing]
├── Task 7: 创建 docs/best-practices.md [writing]
└── Task 8: 创建 docs/architecture.md [writing]

Wave FINAL (文档验证):
├── Task F1: 验证所有文档链接 [quick]
├── Task F2: 验证所有代码示例可运行 [unspecified-high]
└── Task F3: 验证 README 引用正确 [quick]

Critical Path: Task 1 → Task 4-8 → F1-F3
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 4 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
| ---- | ---------- | ------ |
| 1    | —          | 4-8    |
| 2    | 1          | —      |
| 3    | —          | —      |
| 4    | 1          | F1-F3  |
| 5    | 1          | F1-F3  |
| 6    | 1          | F1-F3  |
| 7    | 1          | F1-F3  |
| 8    | 1          | F1-F3  |
| F1   | 4-8        | —      |
| F2   | 4-8        | —      |
| F3   | 4-8        | —      |

---

## TODOs

> 每个任务包含：推荐代理配置 + 并行化信息 + QA 场景。

- [x] 1. 更新 TODO.md 反映代码改进成果

  **What to do**:

  - 标记 BUG-001, BUG-002 为 ✅ 已完成
  - 标记 REFACTOR-001, REFACTOR-002 为 ✅ 已完成
  - 标记 TYPE-001 为 ✅ 已完成 (29→25 as, 30→5 !)
  - 标记 DOCS-001 为 ✅ 已完成 (JSDoc 已添加)
  - 标记 TEST-001 为 ✅ 已完成 (52 个测试)
  - 更新完成记录表格
  - 添加"代码改进计划"完成说明

  **Must NOT do**:

  - 不删除任何 TODO 项
  - 不改变文档结构
  - 不添加新的 TODO 项

  **Recommended Agent Profile**:

  - **Category**: `writing`
    - Reason: 文档更新任务
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1
  - **Blocks**: Tasks 4-8
  - **Blocked By**: None

  **References**:

  - `TODO.md` - 当前 TODO 列表
  - `.sisyphus/plans/code-improvement.md` - 代码改进计划完成情况

  **Acceptance Criteria**:

  - [ ] 所有已完成任务标记为 ✅
  - [ ] 完成记录表格更新
  - [ ] 添加代码改进计划总结

  **QA Scenarios**:

  ```
  Scenario: 验证 TODO.md 格式正确
    Tool: Bash
    Preconditions: TODO.md 已更新
    Steps:
      1. 运行 `grep -c "✅ 已完成" TODO.md`
      2. 验证计数 ≥8 (所有 P0/P1 任务)
    Expected Result: 输出数字 ≥8
    Evidence: .sisyphus/evidence/task-1-todo-format.txt
  ```

  **Commit**: YES

  - Message: `docs: update TODO.md to reflect code improvement completion`
  - Files: `TODO.md`
  - Pre-commit: 无

---

- [x] 2. 创建 CHANGELOG.md

  **What to do**:

  - 创建 `CHANGELOG.md` 文件
  - 使用 Keep a Changelog 格式
  - 记录 v0.2.x 到 v0.3.0 的变更
  - 包含：Added, Changed, Fixed, 改进

  **Must NOT do**:

  - 不记录太详细的历史
  - 不破坏现有版本历史

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Task 1)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: Task 1 (需要知道完成情况)

  **References**:

  - `.sisyphus/plans/code-improvement.md` - 代码改进详情
  - `https://keepachangelog.com/` - Keep a Changelog 格式

  **Acceptance Criteria**:

  - [ ] CHANGELOG.md 创建
  - [ ] 包含 v0.3.0 版本记录
  - [ ] 使用标准格式

  **QA Scenarios**:

  ```
  Scenario: 验证 CHANGELOG 格式
    Tool: Bash
    Preconditions: CHANGELOG.md 已创建
    Steps:
      1. 检查包含 "## [0.3.0]" 标题
      2. 检查包含 "### Added", "### Changed", "### Fixed"
    Expected Result: 所有部分存在
    Evidence: .sisyphus/evidence/task-2-changelog-format.txt
  ```

  **Commit**: YES

  - Message: `docs: add CHANGELOG.md with v0.3.0 release notes`
  - Files: `CHANGELOG.md`
  - Pre-commit: 无

---

- [x] 3. 更新 CONTRIBUTING.md 添加文档规范

  **What to do**:

  - 添加"文档贡献"章节
  - 说明文档结构
  - 添加文档编写规范
  - 添加代码示例规范

  **Must NOT do**:

  - 不改变现有章节
  - 不添加过于复杂的规范

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 1, 2)
  - **Parallel Group**: Wave 1
  - **Blocks**: None
  - **Blocked By**: None

  **References**:

  - `CONTRIBUTING.md` - 现有贡献指南

  **Acceptance Criteria**:

  - [ ] 添加"文档贡献"章节
  - [ ] 说明文档位置
  - [ ] 添加编写规范

  **QA Scenarios**:

  ```
  Scenario: 验证 CONTRIBUTING.md 更新
    Tool: Bash
    Preconditions: CONTRIBUTING.md 已更新
    Steps:
      1. 检查包含"文档"或"Documentation"关键词
      2. 检查包含文档结构说明
    Expected Result: 所有部分存在
    Evidence: .sisyphus/evidence/task-3-contributing-update.txt
  ```

  **Commit**: YES

  - Message: `docs: update CONTRIBUTING.md with documentation guidelines`
  - Files: `CONTRIBUTING.md`
  - Pre-commit: 无

---

- [x] 4. 创建 docs/api-reference.md API 参考

  **What to do**:

  - 创建 `docs/api-reference.md`
  - 记录所有配置选项 (include, exclude, lazy)
  - 记录虚拟模块 API (`virtual:routes`)
  - 记录导出的类型定义
  - 添加使用示例

  **Must NOT do**:

  - 不复制 README 内容
  - 不添加未实现的 API

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 5, 6, 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F3
  - **Blocked By**: Task 1

  **References**:

  - `src/index.ts` - ConventionalRouterProps 接口定义
  - `README.md` - 现有配置说明

  **Acceptance Criteria**:

  - [ ] 所有配置项 documented
  - [ ] 类型定义 documented
  - [ ] 代码示例正确

  **QA Scenarios**:

  ```
  Scenario: 验证 API 参考完整性
    Tool: Bash
    Preconditions: docs/api-reference.md 已创建
    Steps:
      1. 检查包含 "include", "exclude", "lazy" 配置
      2. 检查包含类型定义
    Expected Result: 所有部分存在
    Evidence: .sisyphus/evidence/task-4-api-reference-check.txt
  ```

  **Commit**: YES

  - Message: `docs: add API reference documentation`
  - Files: `docs/api-reference.md`
  - Pre-commit: 无

---

- [x] 5. 创建 docs/migration-guide.md 迁移指南

  **What to do**:

  - 创建 `docs/migration-guide.md`
  - 从 react-router 手动配置迁移
  - 从其他文件系统路由迁移
  - 常见问题和解决方案
  - 迁移检查清单

  **Must NOT do**:

  - 不假设用户有特定背景
  - 不跳过步骤

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 4, 6, 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F3
  - **Blocked By**: Task 1

  **References**:

  - `README.md` - 现有配置说明
  - `example/react/` - 示例项目

  **Acceptance Criteria**:

  - [ ] 包含从 react-router 迁移步骤
  - [ ] 包含常见问题
  - [ ] 包含检查清单

  **QA Scenarios**:

  ```
  Scenario: 验证迁移指南完整性
    Tool: Bash
    Preconditions: docs/migration-guide.md 已创建
    Steps:
      1. 检查包含"迁移步骤"章节
      2. 检查包含"常见问题"章节
      3. 检查包含"检查清单"
    Expected Result: 所有部分存在
    Evidence: .sisyphus/evidence/task-5-migration-guide-check.txt
  ```

  **Commit**: YES

  - Message: `docs: add migration guide`
  - Files: `docs/migration-guide.md`
  - Pre-commit: 无

---

- [x] 6. 创建 docs/faq.md 常见问题

  **What to do**:

  - 创建 `docs/faq.md`
  - 收集常见问题 (基于 TODO.md 和代码审查)
  - 提供清晰答案和解决方案
  - 包含代码示例

  **Must NOT do**:

  - 不编造问题
  - 不提供错误答案

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 4, 5, 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F3
  - **Blocked By**: Task 1

  **References**:

  - `TODO.md` - 已知问题和解决方案
  - `.sisyphus/plans/code-improvement.md` - 代码改进中的问题

  **Acceptance Criteria**:

  - [ ] 包含 10+ 常见问题
  - [ ] 每个问题有答案
  - [ ] 包含代码示例

  **QA Scenarios**:

  ```
  Scenario: 验证 FAQ 完整性
    Tool: Bash
    Preconditions: docs/faq.md 已创建
    Steps:
      1. 计算问题数量 `grep -c "^### " docs/faq.md`
      2. 验证 ≥10 个问题
    Expected Result: 输出数字 ≥10
    Evidence: .sisyphus/evidence/task-6-faq-check.txt
  ```

  **Commit**: YES

  - Message: `docs: add FAQ documentation`
  - Files: `docs/faq.md`
  - Pre-commit: 无

---

- [x] 7. 创建 docs/best-practices.md 最佳实践

  **What to do**:

  - 创建 `docs/best-practices.md`
  - 文件组织最佳实践
  - 性能优化建议
  - 调试技巧
  - 测试建议

  **Must NOT do**:

  - 不提供主观意见
  - 不强制特定风格

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 4, 5, 6)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F3
  - **Blocked By**: Task 1

  **References**:

  - `.sisyphus/notepads/code-improvement/learnings.md` - 代码改进中的经验
  - `README.md` - 现有最佳实践

  **Acceptance Criteria**:

  - [ ] 包含文件组织建议
  - [ ] 包含性能建议
  - [ ] 包含调试技巧

  **QA Scenarios**:

  ```
  Scenario: 验证最佳实践完整性
    Tool: Bash
    Preconditions: docs/best-practices.md 已创建
    Steps:
      1. 检查包含"文件组织"章节
      2. 检查包含"性能"章节
      3. 检查包含"调试"章节
    Expected Result: 所有部分存在
    Evidence: .sisyphus/evidence/task-7-best-practices-check.txt
  ```

  **Commit**: YES

  - Message: `docs: add best practices guide`
  - Files: `docs/best-practices.md`
  - Pre-commit: 无

---

- [x] 8. 创建 docs/architecture.md 架构设计文档

  **What to do**:

  - 创建 `docs/architecture.md`
  - 说明插件架构
  - 说明路由构建流程
  - 说明关键算法
  - 包含代码改进记录

  **Must NOT do**:

  - 不暴露敏感信息
  - 不过于技术化

  **Recommended Agent Profile**:

  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with Tasks 4, 5, 6, 7)
  - **Parallel Group**: Wave 2
  - **Blocks**: F1-F3
  - **Blocked By**: Task 1

  **References**:

  - `.sisyphus/plans/code-improvement.md` - 代码改进计划
  - `src/index.ts`, `src/utils.ts` - 源代码

  **Acceptance Criteria**:

  - [ ] 包含架构图或说明
  - [ ] 包含路由构建流程
  - [ ] 包含代码改进记录

  **QA Scenarios**:

  ```
  Scenario: 验证架构文档完整性
    Tool: Bash
    Preconditions: docs/architecture.md 已创建
    Steps:
      1. 检查包含"架构"或"Architecture"章节
      2. 检查包含"路由构建"章节
      3. 检查包含"改进记录"
    Expected Result: 所有部分存在
    Evidence: .sisyphus/evidence/task-8-architecture-check.txt
  ```

  **Commit**: YES

  - Message: `docs: add architecture documentation`
  - Files: `docs/architecture.md`
  - Pre-commit: 无

---

- [ ] F1. 验证所有文档链接

  **What to do**:

  - 检查所有 markdown 文件中的内部链接
  - 检查所有外部链接
  - 修复断开的链接
  - 输出验证报告

  **Must NOT do**:

  - 不跳过任何链接

  **Recommended Agent Profile**:

  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with F2, F3)
  - **Parallel Group**: Final Wave
  - **Blocks**: None
  - **Blocked By**: Tasks 4-8

  **Acceptance Criteria**:

  - [ ] 所有内部链接有效
  - [ ] 所有外部链接有效
  - [ ] 验证报告生成

  **QA Scenarios**:

  ```
  Scenario: 验证文档链接
    Tool: Bash
    Preconditions: 所有文档已创建
    Steps:
      1. 提取所有链接 `grep -roh 'http[s]://[^"]*' docs/ README.md | sort -u`
      2. 对每个链接运行 curl -I
      3. 验证 HTTP 200 响应
    Expected Result: 所有链接返回 200
    Evidence: .sisyphus/evidence/final-docs/f1-links-check.txt
  ```

  **Commit**: NO (验证任务)

---

- [ ] F2. 验证所有代码示例可运行

  **What to do**:

  - 提取所有文档中的代码示例
  - 在示例项目中运行验证
  - 记录失败的示例
  - 输出验证报告

  **Must NOT do**:

  - 不跳过任何示例

  **Recommended Agent Profile**:

  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with F1, F3)
  - **Parallel Group**: Final Wave
  - **Blocks**: None
  - **Blocked By**: Tasks 4-8

  **Acceptance Criteria**:

  - [ ] 所有代码示例可运行
  - [ ] 失败示例已修复
  - [ ] 验证报告生成

  **QA Scenarios**:

  ```
  Scenario: 验证代码示例
    Tool: Bash
    Preconditions: 所有文档已创建
    Steps:
      1. 进入 example/react 目录
      2. 运行 pnpm build
      3. 验证构建成功
    Expected Result: 构建成功
    Evidence: .sisyphus/evidence/final-docs/f2-examples-check.txt
  ```

  **Commit**: NO (验证任务)

---

- [ ] F3. 验证 README 引用正确

  **What to do**:

  - 检查 README.md 中对新文档的引用
  - 添加缺失的引用
  - 更新导航结构
  - 输出验证报告

  **Must NOT do**:

  - 不破坏现有引用

  **Recommended Agent Profile**:

  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:

  - **Can Run In Parallel**: YES (with F1, F2)
  - **Parallel Group**: Final Wave
  - **Blocks**: None
  - **Blocked By**: Tasks 4-8

  **Acceptance Criteria**:

  - [ ] README 包含新文档引用
  - [ ] 导航结构清晰
  - [ ] 验证报告生成

  **QA Scenarios**:

  ```
  Scenario: 验证 README 引用
    Tool: Bash
    Preconditions: 所有文档已创建
    Steps:
      1. 检查 README.md 包含 docs/ 目录引用
      2. 验证链接格式正确
    Expected Result: 所有引用存在
    Evidence: .sisyphus/evidence/final-docs/f3-readme-references.txt
  ```

  **Commit**: NO (验证任务)

---

## Final Verification Wave

> 3 个验证任务并行运行。全部必须 APPROVE。

- [ ] F1. **文档链接验证** — `quick`
      检查所有内部和外部链接有效性。
      Output: `Internal Links [N/N valid] | External Links [N/N valid] | VERDICT`

- [ ] F2. **代码示例验证** — `unspecified-high`
      在示例项目中运行所有代码示例。
      Output: `Examples [N/N pass] | VERDICT`

- [ ] F3. **README 引用验证** — `quick`
      验证 README 包含所有新文档引用。
      Output: `References [N/N present] | VERDICT`

---

## Commit Strategy

**Wave 1 Commits**:

- `docs: update TODO.md to reflect code improvement completion` — TODO.md
- `docs: add CHANGELOG.md with v0.3.0 release notes` — CHANGELOG.md
- `docs: update CONTRIBUTING.md with documentation guidelines` — CONTRIBUTING.md

**Wave 2 Commits**:

- `docs: add API reference documentation` — docs/api-reference.md
- `docs: add migration guide` — docs/migration-guide.md
- `docs: add FAQ documentation` — docs/faq.md
- `docs: add best practices guide` — docs/best-practices.md
- `docs: add architecture documentation` — docs/architecture.md

---

## Success Criteria

### Verification Commands

```bash
# Check all docs exist
ls -la docs/*.md

# Check TODO.md updated
grep -c "✅ 已完成" TODO.md

# Check CHANGELOG exists
test -f CHANGELOG.md && echo "EXISTS" || echo "MISSING"
```

### Final Checklist

- [ ] TODO.md 更新完成
- [ ] CHANGELOG.md 创建
- [ ] CONTRIBUTING.md 更新
- [ ] docs/api-reference.md 创建
- [ ] docs/migration-guide.md 创建
- [ ] docs/faq.md 创建
- [ ] docs/best-practices.md 创建
- [ ] docs/architecture.md 创建
- [ ] 所有链接有效
- [ ] 所有代码示例可运行
- [ ] README 引用正确
