# 代码审查 TODO 列表

> 基于 2026-03-10 代码审查报告生成

---

## 🔴 高优先级（P0）- 影响功能正确性

### [BUG-001] 修复根路由 Loader 被错误分配的问题

**问题描述**: 根路由 `/` 的 loader 被错误地指向了 `page4.loader.ts`，而不是正确的 `loader.ts`。

**影响**: 根页面无法正确加载数据，显示错误的数据（"job" 而不是 "Say My Name!!!"）。

**根因**: `stringifyRoutes` 函数中使用 `imports.length` 作为 loader 索引，但多个路由可能共享 loader 引用，导致索引错位。

**修复建议**:
```typescript
// 使用 Map 跟踪已导入的 loader
const loaderMap = new Map<string, string>();

if (loader) {
  const loaderKey = loader as string;
  if (!loaderMap.has(loaderKey)) {
    const index = loaderMap.size;
    loaderMap.set(loaderKey, `loader${index}`);
    imports.push(`import loader${index} from "${fileProtocol(loaderKey)}";`);
  }
  // 使用 Map 中的引用
}
```

**相关文件**: `src/utils.ts` (第 259-262 行)

---

### [BUG-002] 修复循环依赖问题

**问题描述**: `utils.ts` 导入 `index.ts` 的 `pluginlog`，而 `index.ts` 又导入 `utils.ts` 的函数。

**影响**: 可能导致模块加载顺序问题，难以维护。

**修复建议**: 将 `pluginlog` 提取到独立的 `logger.ts` 模块。

**相关文件**:
- `src/utils.ts` (第 20 行): `import { pluginlog } from "@/index";`
- `src/validation.ts` (第 5 行): `import { pluginlog } from "@/index";`
- `src/index.ts` (第 28 行): `export const pluginlog = createScopedLogger(PLUGIN_NAME);`

---

## 🟡 中优先级（P1）- 影响代码质量和可维护性

### [REFACTOR-001] 重构 `load` 函数

**问题描述**: `load` 函数超过 120 行，包含完整的路由构建流程，职责过多。

**影响**: 难以测试、难以理解、难以修改。

**修复建议**: 拆分为多个小函数：
- `buildRouteTree()` - 构建路由树
- `applyLayouts()` - 应用布局
- `generateRouteCode()` - 生成代码
- `addNotFoundRoute()` - 添加 404 路由

**相关文件**: `src/index.ts` (第 108-227 行)

---

### [REFACTOR-002] 简化路由构建算法

**问题描述**: `load` 函数中的双重过滤逻辑难以理解：
```typescript
// 第一次过滤
isolateRoutes.filter((r) => r.path!.split("/").length === 1)
// 第二次过滤  
intermediaRoutes.filter((r) => r.path!.split("/").length > 2)
```

**影响**: 代码意图不明确，维护困难。

**修复建议**: 
1. 添加详细注释说明算法逻辑
2. 或重构为更易理解的流程
3. 提取魔法数字为命名常量

**相关文件**: `src/index.ts` (第 161-192 行)

---

### [TYPE-001] 减少类型断言使用

**问题描述**: 代码中存在大量 `as` 类型断言和 Non-null 断言：
```typescript
route.element! as string
loader as unknown as string
route.path!
```

**影响**: 绕过 TypeScript 类型检查，可能导致运行时错误。

**修复建议**:
1. 添加运行时类型检查
2. 改进类型定义，使用更精确的类型
3. 使用类型守卫函数

**相关文件**: 
- `src/utils.ts` (多处)
- `src/index.ts` (多处)

---

### [DOCS-001] 为复杂算法添加注释

**问题描述**: `collectRoutePages` 中的路径前缀去除逻辑难以理解：
```typescript
while (true) {
  const group = files.map((file) => file[0]);
  if (new Set(group).size > 1) {
    break;
  } else {
    files = files.map((file) => file.slice(1));
  }
}
```

**影响**: 新开发者难以理解代码意图。

**修复建议**: 添加详细注释说明算法目的和逻辑。

**相关文件**: `src/utils.ts` (第 58-65 行)

---

## 🟢 低优先级（P2）- 优化和增强

### [TEST-001] 补充单元测试

**缺失的测试场景**:
- [ ] ErrorBoundary 触发和渲染
- [ ] Handle 数据处理
- [ ] Action 表单处理
- [ ] 路由冲突检测
- [ ] 热更新 (HMR) `watchChange`
- [ ] 可选参数路由 `$id`
- [ ] 通配路由 `_`
- [ ] 拼写错误检测 (Levenshtein 距离)

**相关文件**: `__tests__/` 目录

---

### [TEST-002] 补充 E2E 测试

**缺失的测试场景**:
- [ ] ErrorBoundary 错误捕获
- [ ] 404 页面兜底路由
- [ ] 客户端导航历史记录
- [ ] 动态路由参数传递
- [ ] 嵌套路由 Outlet 渲染

**相关文件**: `e2e/react.spec.ts`

---

### [VALIDATION-001] 增强路由验证

**缺失的验证**:
- [ ] 动态路由参数名冲突检测
- [ ] loader 文件是否有默认导出
- [ ] layout 文件是否为有效的 React 组件
- [ ] 循环路由引用检测

**相关文件**: `src/validation.ts`

---

### [PERF-001] 性能优化

**优化点**:
- [ ] `globSync` 是同步操作，大型项目可能受影响，考虑异步化
- [ ] `deepCopy` 使用 `JSON.parse/stringify`，考虑使用 `structuredClone`
- [ ] 缓存 glob 结果，避免重复读取文件系统

**相关文件**: `src/utils.ts`

---

### [CONFIG-001] 支持更多配置选项

**建议添加的配置**:
- [ ] `caseSensitive`: 路由大小写敏感选项
- [ ] `trailingSlash`: 尾随斜杠处理
- [ ] `basePath`: 基础路径配置
- [ ] `logLevel`: 日志级别配置

**相关文件**: `src/index.ts`

---

### [ERROR-001] 改进错误信息

**改进点**:
- [ ] 路由冲突时显示更清晰的错误信息
- [ ] 提供修复建议的代码示例
- [ ] 添加错误码便于搜索解决方案

**相关文件**: `src/errors.ts`, `src/validation.ts`

---

## 📋 完成记录

| 编号 | 描述 | 状态 | 完成日期 | 备注 |
|------|------|------|----------|------|
| BUG-001 | 修复根路由 Loader 被错误分配的问题 | ✅ 已完成 | 2026-03-10 | 使用 Map 跟踪已导入的 loader，避免索引错位 |
| BUG-002 | 修复循环依赖问题 | ✅ 已完成 | 2026-03-10 | 提取 pluginlog 到独立的 logger.ts 模块 |

---

## 优先级说明

- **🔴 P0 (高)**: 影响功能正确性，需要立即修复
- **🟡 P1 (中)**: 影响代码质量和可维护性，建议近期修复
- **🟢 P2 (低)**: 优化和增强，可以后续处理

---

## 贡献指南

1. 修复问题时请在提交信息中引用 TODO 编号（如 `Fix BUG-001: 修复根路由 loader 错误`）
2. 完成问题后更新「完成记录」表格
3. 如果问题不再适用，请标记为「已取消」并说明原因
