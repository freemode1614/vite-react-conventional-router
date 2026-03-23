# Architecture

本文档说明 vite-react-conventional-router 的架构设计、核心算法和代码改进记录。

## 插件架构

### Vite 插件生命周期

本插件实现以下 Vite 插件钩子：

1. **`configResolved()`** - 解析 Vite 配置，获取项目根目录
2. **`configureServer()`** - 配置开发服务器，设置文件监听
3. **`resolveId()`** - 解析虚拟模块 ID (`virtual:routes`)
4. **`load()`** - 加载虚拟模块，生成路由代码
5. **`watchChange()`** - 监听文件变更，触发热更新

### 虚拟模块系统

插件导出一个虚拟模块 `virtual:routes`，该模块在运行时被替换为生成的路由配置：

```typescript
// 用户代码
import routes from 'virtual:routes';

// 构建时转换为
import routes from [
  {
    path: '/',
    element: HomePage,
    loader: homeLoader,
  },
  // ... 更多路由
];
```

### 文件监听

插件监听以下文件变更：

- `*.tsx` - 页面组件
- `*.loader.ts` - Loader 函数
- `*.action.ts` - Action 函数
- `*.handle.ts` - Handle 元数据
- `*.errorBoundary.tsx` - 错误边界组件
- `*.layout.tsx` - 布局组件

## 路由构建流程

### 1. 文件扫描

使用 `fast-glob` 扫描项目目录，匹配以下模式：

```typescript
const patterns = [
  "**/*.tsx", // 页面组件
  "**/*.loader.ts", // Loader
  "**/*.action.ts", // Action
  "**/*.handle.ts", // Handle
  "**/*.errorBoundary.tsx", // ErrorBoundary
  "**/*.layout.tsx", // Layout
];
```

### 2. 路由收集

对每个匹配的文件：

1. 解析文件路径
2. 转换为路由路径 (文件路径 → URL 路径)
3. 收集关联的 loader/action/handle
4. 创建 `RouteRecord` 对象

**路径转换规则**:

- `src/pages/index.tsx` → `/`
- `src/pages/about.tsx` → `/about`
- `src/pages/blog/[slug].tsx` → `/blog/:slug`
- `src/pages/user/[id]/[name].tsx` → `/user/:id/:name`

### 3. 树形构建

扁平路由数组通过 `buildRouteTree()` 函数转换为树形结构：

```typescript
// 输入：扁平数组
[{ path: "/users" }, { path: "/users/:id" }, { path: "/users/:id/posts" }][
  // 输出：树形结构
  {
    path: "/users",
    children: [
      {
        path: "/users/:id",
        children: [{ path: "/users/:id/posts" }],
      },
    ],
  }
];
```

### 4. 布局应用

`applyLayouts()` 函数递归应用布局：

1. 查找每个路由的 `*.layout.tsx` 文件
2. 将布局组件注入路由配置
3. 子路由继承父布局

### 5. 代码生成

`generateRouteCode()` 函数生成最终的路由配置代码：

```typescript
// 生成的代码
import HomePage from "/src/pages/index.tsx";
import homeLoader from "/src/pages/index.loader.ts";

export default [
  {
    path: "/",
    element: HomePage,
    loader: homeLoader,
  },
];
```

## 关键算法

### 路径解析算法

```typescript
function parseRoutePath(filePath: string): string {
  // 1. 移除基础路径
  // 2. 移除文件扩展名
  // 3. 转换 [param] → :param
  // 4. 处理 index 路由
  // 5. 添加前导斜杠
}
```

### 布局继承算法

```typescript
function applyLayouts(
  routes: RouteRecord[],
  rootLayout: RouteRecord,
): RouteRecord[] {
  // 1. 如果有根布局，应用到所有路由
  // 2. 递归处理嵌套布局
  // 3. 合并布局配置
}
```

### 类型守卫

代码改进计划中创建的类型守卫函数：

```typescript
// src/type-guards.ts
export function isStringExport(value: unknown): value is string {
  return typeof value === "string";
}

export function isLoaderFunction(value: unknown): value is LoaderFunction {
  return typeof value === "function";
}

export function isComponentType(value: unknown): value is ComponentType {
  return typeof value === "function" || typeof value === "object";
}
```

## 代码改进记录

### v0.3.0 重构 (2026-03-23)

#### 问题

原始 `load()` 函数存在以下问题：

- **过长**: 120+ 行，违反单一职责原则
- **复杂**: 混合了路由收集、验证、树构建、代码生成
- **难测试**: 无法单独测试各个步骤
- **类型不安全**: 多处 `as` 和 `!` 断言

#### 重构方案

将 `load()` 拆分为 4 个独立函数：

| 函数                  | 行数 | 职责             |
| --------------------- | ---- | ---------------- |
| `buildRouteTree()`    | 50   | 构建路由树形结构 |
| `applyLayouts()`      | 10   | 应用布局到路由   |
| `generateRouteCode()` | 13   | 生成路由配置代码 |
| `addNotFoundRoute()`  | 集成 | 添加 404 路由    |

#### 类型安全改进

| 指标            | 改进前 | 改进后 | 改善 |
| --------------- | ------ | ------ | ---- |
| `as` 断言       | 29     | 25     | -14% |
| `!` 断言        | 30     | 5      | -83% |
| TypeScript 错误 | 3      | 0      | 100% |

#### 测试覆盖改进

| 文件          | 改进前 | 改进后 | 改善    |
| ------------- | ------ | ------ | ------- |
| index.ts      | 0%     | 80%    | +80%    |
| utils.ts      | 30.5%  | 89.9%  | +59.4%  |
| validation.ts | 78.87% | 80.76% | +1.89%  |
| **整体**      | 39.78% | 83.72% | +43.94% |

测试数量：10 → 52 (420% 增长)

#### 结果

- ✅ 代码可维护性提升
- ✅ 类型安全性提升
- ✅ 测试覆盖率达标
- ✅ 所有验证通过 (F1-F4)

---

## 总结

vite-react-conventional-router 采用 Vite 插件架构，通过虚拟模块系统实现文件系统路由。核心流程包括文件扫描、路由收集、树形构建、布局应用和代码生成。

v0.3.0 版本的代码改进计划成功重构了核心逻辑，提升了代码质量和可维护性。
