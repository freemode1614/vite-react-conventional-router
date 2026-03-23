# Best Practices

最佳实践指南，帮助你在项目中建立一致的开发模式和高质量标准。

---

## 文件组织

### 目录结构

推荐的项目结构能够清晰分离关注点，便于维护和扩展：

```
src/
├── pages/                 # 路由页面目录（唯一被解析为路由的目录）
│   ├── layout.tsx         # 根布局组件
│   ├── errorBoundary.tsx  # 根错误边界
│   ├── index.tsx          # 首页 /
│   ├── 404.tsx            # 404 页面
│   ├── about.tsx          # 静态页面
│   ├── blog/              # 嵌套路由目录
│   │   ├── layout.tsx     # Blog 子布局
│   │   ├── index.tsx      # /blog
│   │   ├── @slug.tsx      # /blog/:slug
│   │   └── @slug.layout.tsx
│   └── user.@id.tsx       # 动态路由 /user/:id
├── components/            # 可复用 UI 组件（排除在路由外）
│   ├── ui/                # 基础 UI 组件
│   └── layout/            # 布局相关组件
├── hooks/                 # 自定义 Hooks
├── lib/                   # 工具函数和第三方封装
├── types/                 # TypeScript 类型定义
└── styles/                # 全局样式
```

### 命名约定

遵循一致的命名规则提升代码可读性：

**文件命名**

- 使用小写字母和连字符：`user-profile.tsx`
- 动态参数使用 `@` 前缀：`user.@id.tsx`
- 可选参数使用 `$` 前缀：`product.$id.tsx`
- 布局文件：`[route].layout.tsx` 或目录级 `layout.tsx`
- 错误边界：`[route].errorBoundary.tsx` 或目录级 `errorBoundary.tsx`
- Loader 文件：`[route].loader.ts`
- Handle 文件：`[route].handle.ts`

**组件命名**

- 组件文件名与导出组件名一致
- 使用 PascalCase：`UserProfile.tsx`
- 页面组件使用描述性名称：`HomePage`, `DashboardPage`

### 模块分离

**按功能组织**

将相关功能组织在一起，而不是按文件类型：

```
# 不推荐 - 按类型分离
src/
├── components/
├── hooks/
├── services/

# 推荐 - 按功能分离
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   └── dashboard/
└── pages/
```

**排除配置**

在插件配置中明确排除不需要解析为路由的目录：

```typescript
conventionalRouter({
  include: ["src/pages/**"],
  exclude: [
    "src/**/components/**",
    "src/**/hooks/**",
    "src/**/*.test.tsx",
    "src/**/*.stories.tsx",
  ],
});
```

---

## 性能优化

### 代码分割

启用懒加载自动实现代码分割：

```typescript
// vite.config.ts
conventionalRouter({
  include: ["src/pages/**"],
  lazy: true, // 启用懒加载
});
```

懒加载模式下，每个页面组件会被打包成独立的 chunk，仅在访问时加载。

**手动代码分割**

对于大型组件，可以使用动态导入：

```tsx
// 不推荐 - 静态导入所有组件
import { HeavyComponent } from "./HeavyComponent";

// 推荐 - 动态导入
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

### 懒加载策略

**按路由懒加载**

插件自动处理路由级别的懒加载，无需手动配置。

**组件级懒加载**

对于不重要的 UI 部分，延迟加载：

```tsx
import { lazy, Suspense } from "react";

const Comments = lazy(() => import("./Comments"));

function PostPage() {
  return (
    <article>
      <PostContent />
      <Suspense fallback={<div>加载中...</div>}>
        <Comments />
      </Suspense>
    </article>
  );
}
```

### Bundle 大小管理

**分析 Bundle**

使用 Vite 内置分析工具：

```bash
pnpm build --mode analyze
```

或使用 `rollup-plugin-visualizer` 可视化分析。

**优化建议**

- 避免在页面组件中导入大型库
- 使用轻量级替代方案（如 `date-fns` 替代 `moment`）
- 按需导入 lodash 函数：`import debounce from 'lodash/debounce'`
- 压缩图片和静态资源

**Tree Shaking**

确保使用 ES Module 格式的依赖，支持 Tree Shaking：

```tsx
// 推荐 - 支持 Tree Shaking
import { debounce } from "lodash-es";

// 不推荐 - 导入整个库
import _ from "lodash";
```

---

## 调试技巧

### 常见问题排查

**路由未生成**

检查点：

1. 文件是否在 `include` 匹配范围内
2. 文件是否被 `exclude` 排除
3. 文件命名是否符合约定
4. 开发服务器是否重启

**动态参数未传递**

```tsx
// 检查 useParams 使用
const { id } = useParams();
console.log("Params:", id); // 验证参数存在
```

**Loader 未执行**

确保 loader 函数正确导出：

```typescript
// 正确 - 默认导出
export default function userLoader({ params }) {
  return fetch(`/api/user/${params.id}`);
}

// 或在组件中命名导出
export async function loader() {
  // ...
}
```

### 调试工具

**查看生成的路由**

开发模式下插件会自动输出路由配置：

```tsx
import routes from "virtual:routes";

if (import.meta.env.DEV) {
  console.log("Generated routes:", routes);
}
```

**React Router DevTools**

安装浏览器扩展可视化路由树：

```bash
npm install -D react-router-devtools
```

```tsx
import { ReactRouterDevTools } from "react-router-devtools";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ReactRouterDevTools />
    </>
  );
}
```

**路由匹配调试**

```tsx
import { useMatch } from "react-router-dom";

function DebugMatch() {
  const match = useMatch("/user/:id");
  console.log("Match info:", match);
  return null;
}
```

### 日志策略

**结构化日志**

```typescript
const logger = {
  info: (msg: string, data?: any) =>
    console.log(`[INFO] ${msg}`, data ? JSON.stringify(data) : ""),
  error: (msg: string, error?: Error) =>
    console.error(`[ERROR] ${msg}`, error?.message),
};

// 使用
logger.info("User loaded", { userId: params.id });
```

**条件日志**

仅在开发环境输出调试信息：

```typescript
if (import.meta.env.DEV) {
  console.log("Debug info:", someData);
}
```

---

## 测试建议

### 测试结构

**文件组织**

测试文件与被测文件放在一起：

```
src/
├── pages/
│   ├── user.@id.tsx
│   └── user.@id.test.tsx
├── components/
│   ├── UserProfile.tsx
│   └── UserProfile.test.tsx
```

**测试分类**

```
tests/
├── unit/           # 单元测试
├── integration/    # 集成测试
└── e2e/            # 端到端测试
```

### Mock 策略

**Mock Loader 数据**

```tsx
import { createMemoryRouter } from "react-router-dom";

function renderWithRouter(initialEntries = ["/"]) {
  const router = createMemoryRouter(
    [
      {
        path: "/user/:id",
        loader: vi.fn().mockResolvedValue({ name: "Mock User" }),
        element: <UserPage />,
      },
    ],
    { initialEntries },
  );

  return render(<RouterProvider router={router} />);
}
```

**Mock 虚拟模块**

在测试配置中 mock `virtual:routes`：

```typescript
// vitest.config.ts
export default {
  test: {
    mock: {
      "virtual:routes": () => [],
    },
  },
};
```

### 覆盖率目标

**推荐目标**

- 语句覆盖率：≥80%
- 分支覆盖率：≥75%
- 函数覆盖率：≥85%
- 行覆盖率：≥80%

**关键测试场景**

1. 路由匹配正确性
2. 动态参数解析
3. Loader 数据加载
4. 错误边界捕获
5. 布局嵌套渲染

**测试示例**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

describe("UserPage", () => {
  it("renders user data from loader", async () => {
    const router = createMemoryRouter(
      [
        {
          path: "/user/:id",
          loader: () => Promise.resolve({ name: "John" }),
          element: <UserPage />,
        },
      ],
      { initialEntries: ["/user/1"] },
    );

    render(<RouterProvider router={router} />);

    expect(await screen.findByText("John")).toBeInTheDocument();
  });
});
```

---

## 代码质量

### 类型安全

**严格模式**

在 `tsconfig.json` 中启用严格检查：

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**路由类型**

使用 react-router 提供的类型：

```tsx
import type { RouteObject } from "react-router";
import type { LoaderFunctionArgs } from "react-router-dom";

export async function loader({ params }: LoaderFunctionArgs) {
  // params 有完整类型推断
}
```

**避免类型断言**

优先使用类型守卫而非断言：

```tsx
// 不推荐
const data = useLoaderData() as UserData;

// 推荐 - 使用类型守卫
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    "email" in data
  );
}

const data = useLoaderData();
if (!isUserData(data)) {
  throw new Error("Invalid data");
}
```

### 错误处理

**统一错误边界**

```tsx
// pages/errorBoundary.tsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }
    if (error.status === 403) {
      return <Forbidden />;
    }
  }

  return <GenericError error={error} />;
}
```

**Loader 错误处理**

```typescript
export async function userLoader({ params }) {
  try {
    const response = await fetch(`/api/user/${params.id}`);

    if (!response.ok) {
      throw new Response("User not found", {
        status: 404,
        statusText: "Not Found",
      });
    }

    return await response.json();
  } catch (error) {
    // 记录错误日志
    console.error("Loader error:", error);
    throw error; // 重新抛出让错误边界处理
  }
}
```

### 文档规范

**JSDoc 注释**

为公共函数和组件添加文档：

```typescript
/**
 * 加载用户数据
 * @param params - 路由参数
 * @param params.id - 用户 ID
 * @returns 用户数据对象
 * @throws 404 错误当用户不存在时
 */
export async function userLoader({ params }) {
  // ...
}
```

**组件 Props 文档**

````tsx
interface UserProfileProps {
  /** 用户 ID */
  userId: string;
  /** 是否显示详细信息 */
  showDetails?: boolean;
  /** 点击回调 */
  onUserClick?: (id: string) => void;
}

/**
 * 用户资料卡片组件
 *
 * @example
 * ```tsx
 * <UserProfile userId="123" showDetails />
 * ```
 */
export function UserProfile({ userId, showDetails = false }: UserProfileProps) {
  // ...
}
````

**README 更新**

当添加新功能时同步更新文档：

- 更新配置选项说明
- 添加使用示例
- 记录已知限制

---

## 开发工作流

### Git 提交规范

遵循 Conventional Commits：

```
feat: 添加用户资料页面
fix: 修复动态路由参数解析
docs: 更新最佳实践文档
refactor: 重构 loader 函数结构
test: 添加用户页面测试
```

### 代码审查清单

提交前检查：

- [ ] 代码通过 lint 检查
- [ ] 测试通过且覆盖率达标
- [ ] 类型定义完整
- [ ] 文档已更新
- [ ] 无控制台警告

### 持续集成

推荐 CI 流程：

1. 安装依赖
2. 类型检查
3. Lint 检查
4. 运行测试
5. 构建验证

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

---

## 总结

遵循这些最佳实践可以：

- 提升代码可维护性和可读性
- 减少运行时错误和调试时间
- 优化应用性能和用户体验
- 建立一致的开发标准

根据项目需求灵活调整，关键是保持一致性和文档化。
