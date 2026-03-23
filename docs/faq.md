# Frequently Asked Questions

常见问题解答，帮助你快速上手和使用插件。

---

## 入门问题 (Getting Started)

### Q: 如何开始使用？

**A:** 按照以下步骤开始：

1. 安装依赖：

   ```bash
   npm install react-router react-router-dom
   npm install @moccona/vite-plugin-react-conventional-router -D
   ```

2. 配置 `vite.config.ts`：

   ```typescript
   import conventionalRouter from "@moccona/vite-plugin-react-conventional-router";

   export default defineConfig({
     plugins: [
       react(),
       conventionalRouter({
         include: ["src/pages/**"],
       }),
     ],
   });
   ```

3. 在 `src/pages/` 目录下创建页面文件，如 `index.tsx`

4. 在应用中导入路由：

   ```tsx
   import routes from "virtual:routes";
   import { createBrowserRouter, RouterProvider } from "react-router-dom";

   export default function App() {
     return <RouterProvider router={createBrowserRouter(routes)} />;
   }
   ```

---

### Q: 需要安装哪些依赖？

**A:** 必需依赖：

```bash
# React Router (必需)
npm install react-router react-router-dom

# 插件本身
npm install @moccona/vite-plugin-react-conventional-router -D
```

注意：此插件仅支持 `react-router`，不支持其他路由库如 `@tanstack/react-router`。

---

### Q: 支持哪些 React Router 版本？

**A:** 插件支持 React Router v6 和 v7 版本。两个版本的路由 API 基本兼容，可以无缝切换。

---

## 文件组织 (File Organization)

### Q: 如何组织文件？

**A:** 推荐的项目结构：

```
src/
├── pages/                 # 路由页面目录
│   ├── layout.tsx         # 根布局
│   ├── errorBoundary.tsx  # 根错误边界
│   ├── index.tsx          # 首页 /
│   ├── about.tsx          # 关于页 /about
│   ├── blog/
│   │   ├── layout.tsx     # Blog 子布局
│   │   ├── index.tsx      # /blog
│   │   └── @slug.tsx      # /blog/:slug
│   └── user.@id.tsx       # /user/:id
├── components/            # 可复用组件（不会被解析为路由）
└── hooks/                 # 自定义 Hooks（不会被解析为路由）
```

在配置中排除不需要解析的目录：

```typescript
conventionalRouter({
  include: ["src/pages/**"],
  exclude: ["src/**/components/**", "src/**/hooks/**"],
});
```

---

### Q: 如何排除某些文件？

**A:** 使用 `exclude` 配置项：

```typescript
conventionalRouter({
  include: ["src/pages/**"],
  exclude: [
    "src/**/components/**", // 排除所有 components 目录
    "src/**/hooks/**", // 排除所有 hooks 目录
    "**/*.test.tsx", // 排除测试文件
    "**/*.stories.tsx", // 排除 Storybook 故事
  ],
});
```

支持 glob 模式匹配，被排除的文件不会被解析为路由。

---

## 路由配置 (Route Configuration)

### Q: 如何使用动态路由？

**A:** 使用 `@` 前缀表示动态参数：

```
pages/
├── user.@id.tsx       # /user/:id
├── post.@slug.tsx     # /post/:slug
└── @category.tsx      # /:category
```

在组件中获取参数：

```tsx
import { useParams } from "react-router-dom";

export default function UserPage() {
  const { id } = useParams();
  return <div>User ID: {id}</div>;
}
```

在 loader 中获取参数：

```typescript
// pages/user.@id.loader.ts
export default function userLoader({ params }) {
  return fetch(`/api/user/${params.id}`);
}
```

---

### Q: 如何使用可选参数？

**A:** 使用 `$` 前缀表示可选参数：

```
pages/
├── product.$id.tsx    # /product/:id?  (id 可选)
└── blog.$page.tsx     # /blog/:page?   (page 可选)
```

可选参数意味着路由既可以匹配 `/product/123`，也可以匹配 `/product`。

---

### Q: 如何处理嵌套路由？

**A:** 有两种方式创建嵌套路由：

**方式 1：使用目录结构**

```
pages/
└── dashboard/
    ├── index.tsx      # /dashboard
    └── settings.tsx   # /dashboard/settings
```

**方式 2：使用点号连接文件名**

```
pages/
├── dashboard.index.tsx      # /dashboard
└── dashboard.settings.tsx   # /dashboard/settings
```

嵌套路由会自动构建路由树，子路由会在父路由的 `<Outlet />` 中渲染。

---

### Q: 如何添加根布局？

**A:** 在 `pages/` 根目录创建 `layout.tsx`：

```tsx
// pages/layout.tsx
import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="app">
      <header>My App</header>
      <main>
        <Outlet /> {/* 子路由在此渲染 */}
      </main>
      <footer>© 2024</footer>
    </div>
  );
}
```

根布局会包裹所有路由。子目录也可以有自己的 `layout.tsx`，形成嵌套布局。

---

### Q: 通配路由如何使用？

**A:** 使用 `_` 作为文件名匹配所有子路径：

```
pages/
└── docs/
    └── _.tsx        # /docs/*
```

通配路由常用于：

- 文档站点
- 帮助中心
- 捕获未定义的路径

```tsx
// pages/docs/_.tsx
import { useMatch } from "react-router-dom";

export default function DocsWildcard() {
  const match = useMatch("/docs/*");
  return <div>Docs: {match?.params["*"]}</div>;
}
```

---

## Loader/Action (数据加载)

### Q: loader 和 action 有什么区别？

**A:**

| 特性      | loader             | action                   |
| --------- | ------------------ | ------------------------ |
| 用途      | 加载数据供组件渲染 | 处理表单提交等 mutations |
| HTTP 方法 | GET                | POST, PUT, DELETE 等     |
| 触发时机  | 路由匹配时自动执行 | 表单提交或程序调用时执行 |
| 数据访问  | `useLoaderData()`  | `useActionData()`        |

示例：

```typescript
// loader - 加载数据
export async function loader({ params }) {
  return fetch(`/api/user/${params.id}`);
}

// action - 处理表单
export async function action({ request }) {
  const data = await request.formData();
  return await updateUser(data);
}
```

---

### Q: 如何在 loader 中获取参数？

**A:** loader 函数接收一个上下文对象，包含 `params`、`request` 等：

```typescript
// pages/user.@id.loader.ts
export default function userLoader({ params, request }) {
  const { id } = params;
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  return {
    userId: id,
    filter: searchParams.get("filter"),
  };
}
```

在组件中使用：

```tsx
import { useLoaderData } from "react-router-dom";

export default function UserPage() {
  const { userId, filter } = useLoaderData();
  return (
    <div>
      User {userId} (filter: {filter})
    </div>
  );
}
```

---

### Q: 如何使用 Handle 数据？

**A:** 创建 `.handle.ts` 文件导出路由元数据：

```typescript
// pages/dashboard.handle.ts
export default {
  crumb: () => "Dashboard",
  requiresAuth: true,
  role: "admin",
};
```

在路由守卫或面包屑中使用：

```tsx
import { useMatches } from "react-router-dom";

function Breadcrumbs() {
  const matches = useMatches();
  return matches.map((match) => (
    <span key={match.id}>{match.handle?.crumb?.()}</span>
  ));
}
```

---

## 错误处理 (Error Handling)

### Q: 如何处理错误？

**A:** 创建 `errorBoundary.tsx` 文件：

```tsx
// pages/errorBoundary.tsx
import { useRouteError } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="error-page">
      <h1>出错了</h1>
      <p>{error.message}</p>
      <button onClick={() => window.location.reload()}>重新加载</button>
    </div>
  );
}
```

错误边界可以是：

- 目录级：`pages/admin/errorBoundary.tsx` 作用于 `admin/` 下所有路由
- 路由级：`pages/user.@id.errorBoundary.tsx` 仅作用于该路由

---

### Q: 如何添加 404 页面？

**A:** 创建 `404.tsx` 文件：

```tsx
// pages/404.tsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>页面未找到</p>
      <Link to="/">返回首页</Link>
    </div>
  );
}
```

插件会自动将 `404.tsx` 注册为兜底路由 (`*`)，捕获所有未匹配的路径。

---

### Q: loader 错误如何处理？

**A:** 在 loader 中抛出错误会被错误边界捕获：

```typescript
// pages/user.@id.loader.ts
export default async function userLoader({ params }) {
  const response = await fetch(`/api/user/${params.id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Response("User not found", { status: 404 });
    }
    throw new Error("Failed to load user");
  }

  return response.json();
}
```

错误边界中可以根据错误类型显示不同内容：

```tsx
import { isRouteErrorResponse } from "react-router-dom";

export default function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <div>用户不存在</div>;
    }
  }

  return <div>未知错误</div>;
}
```

---

## 性能优化 (Performance)

### Q: 如何优化性能？

**A:** 启用懒加载：

```typescript
// vite.config.ts
conventionalRouter({
  include: ["src/pages/**"],
  lazy: true, // 启用懒加载
});
```

懒加载会将页面组件拆分为独立的 chunk，按需加载，提升首屏性能。

其他优化建议：

- 在 loader 中只加载必要的数据
- 使用 React.memo 避免不必要的重渲染
- 合理使用嵌套布局，避免重复渲染公共部分

---

### Q: 如何调试路由问题？

**A:** 有几种调试方法：

**1. 查看生成的路由配置**

```typescript
import routes from "virtual:routes";
console.log("Routes:", routes);
```

**2. 使用 React Router DevTools**

安装 `react-router-devtools` 包，可视化查看路由树。

**3. 检查路由匹配**

```tsx
import { useMatch } from "react-router-dom";

function DebugInfo() {
  const match = useMatch("/user/:id");
  console.log("Match:", match);
  return null;
}
```

**4. 查看插件日志**

开发模式下，插件会输出路由解析日志，显示每个文件对应的路由路径。

---

### Q: 路由冲突如何解决？

**A:** 当两个文件解析为相同路由时会报错：

```
Error: Route conflict detected:
  - src/pages/user.@id.tsx -> /user/:id
  - src/pages/user.@userId.tsx -> /user/:userId
```

解决方案：

1. 重命名其中一个文件
2. 确保动态参数名一致
3. 使用不同的路由路径

插件会提供详细的冲突信息和修复建议。

---

## 其他问题

### Q: 支持 TypeScript 吗？

**A:** 完全支持。插件会自动生成 TypeScript 类型定义。

在 `tsconfig.json` 中添加：

```json
{
  "include": [
    "src",
    "./node_modules/@moccona/vite-plugin-react-conventional-router/client.d.ts"
  ]
}
```

导入的路由会有完整的类型提示：

```tsx
import routes from "virtual:routes";
// routes 类型为 RouteObject[]
```

---

### Q: 如何贡献代码或报告问题？

**A:**

- **报告问题**: 在 GitHub 仓库创建 Issue，描述问题并附上复现步骤
- **贡献代码**: Fork 仓库，创建分支，提交 Pull Request
- **查看文档**: 阅读 `CONTRIBUTING.md` 了解贡献指南

项目地址：https://github.com/freemode1614/vite-react-conventional-router
