# 迁移指南

本指南帮助您从其他路由方案迁移到 `@moccona/vite-plugin-react-conventional-router`。

## 目录

- [从 react-router-dom 手动配置迁移](#从 react-router-dom-手动配置迁移)
- [从其他文件系统路由迁移](#从其他文件系统路由迁移)
- [从零开始新项目](#从零开始新项目)
- [文件组织指南](#文件组织指南)
- [常见问题](#常见问题)
- [迁移检查清单](#迁移检查清单)

---

## 从 react-router-dom 手动配置迁移

如果您之前使用 react-router-dom 手动配置路由，请按以下步骤迁移。

### 迁移前示例

典型的 react-router-dom 手动配置：

```tsx
// 迁移前的 App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import UserPage from "./pages/UserPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/user/:id" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 步骤 1: 移除旧依赖（可选）

如果您想完全迁移到文件系统路由，可以移除手动的路由配置，但**保留 react-router-dom**：

```bash
# 不需要卸载 react-router-dom，插件依赖它
# 只需删除手动的 Routes/Route 配置
```

### 步骤 2: 安装插件

```bash
npm install @moccona/vite-plugin-react-conventional-router -D
```

### 步骤 3: 配置 Vite

在 `vite.config.ts` 中添加插件配置：

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router";

export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      include: ["src/pages/**"],
      exclude: ["src/**/components/**", "src/**/hooks/**"],
      lazy: false,
    }),
  ],
});
```

### 步骤 4: 重组文件结构

将页面文件移动到统一的目录（推荐 `src/pages/`）：

```bash
# 示例目录结构
src/
├── pages/
│   ├── index.tsx          # 对应原 HomePage
│   ├── about.tsx          # 对应原 AboutPage
│   └── user.@id.tsx       # 对应原 UserPage
├── components/            # 组件目录（不会被解析为路由）
└── hooks/                 # Hooks 目录（不会被解析为路由）
```

**文件重命名对照表**：

| 原文件                    | 新文件                   | 说明       |
| ------------------------- | ------------------------ | ---------- |
| `src/pages/HomePage.tsx`  | `src/pages/index.tsx`    | 首页       |
| `src/pages/AboutPage.tsx` | `src/pages/about.tsx`    | 关于页     |
| `src/pages/UserPage.tsx`  | `src/pages/user.@id.tsx` | 动态参数页 |

### 步骤 5: 更新应用入口

修改 `main.tsx` 或 `App.tsx`，使用自动生成的路由：

```tsx
// 新的 App.tsx
import routes from "virtual:routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export default function App() {
  return (
    <RouterProvider
      router={createBrowserRouter(routes)}
      fallbackElement={<div>Loading...</div>}
    />
  );
}
```

### 步骤 6: 更新导航链接

检查所有导航代码，确保路径与新的文件结构匹配：

```tsx
// 迁移前
<Link to="/user/123">用户详情</Link>
<navigate to="/about">关于</navigate>

// 迁移后（路径不变，无需修改）
<Link to="/user/123">用户详情</Link>
<navigate to="/about">关于</navigate>
```

### 步骤 7: 迁移 Loader 和 Action

如果使用 react-router 的 loader/action，将它们移动到独立文件：

```typescript
// src/pages/user.@id.loader.ts
export default function userLoader({ params }) {
  return fetch(`/api/user/${params.id}`).then((res) => res.json());
}
```

或在页面组件内直接导出：

```tsx
// src/pages/user.@id.tsx
import { useLoaderData } from "react-router-dom";

export async function loader({ params }) {
  return fetch(`/api/user/${params.id}`).then((res) => res.json());
}

export default function UserPage() {
  const user = useLoaderData();
  return <div>{user.name}</div>;
}
```

---

## 从其他文件系统路由迁移

### 从 Next.js App Router 迁移

Next.js 使用 `app/` 目录和 `page.tsx` 命名：

```bash
# Next.js 结构
app/
├── page.tsx           # 首页
├── about/
│   └── page.tsx       # /about
└── user/
    └── [id]/
        └── page.tsx   # /user/:id
```

转换为：

```bash
# 本插件结构
src/pages/
├── index.tsx          # 首页
├── about.tsx          # /about
└── user.@id.tsx       # /user/:id
```

**主要差异**：

| Next.js       | 本插件              | 说明                         |
| ------------- | ------------------- | ---------------------------- |
| `page.tsx`    | `index.tsx`         | 目录索引文件                 |
| `[id]`        | `@id`               | 动态参数                     |
| `layout.tsx`  | `layout.tsx`        | 布局文件相同                 |
| `loading.tsx` | 不支持              | 使用 RouterProvider fallback |
| `error.tsx`   | `errorBoundary.tsx` | 错误边界                     |

### 从 TanStack Router 迁移

TanStack Router 使用代码定义路由，迁移步骤类似 react-router-dom：

1. 删除 `__router.tsx` 或路由配置文件
2. 按文件命名约定重组文件
3. 使用 `virtual:routes` 替代 `createRouteConfig()`

### 从 Nuxt 迁移

Nuxt 使用 `pages/` 目录，命名约定不同：

```bash
# Nuxt 结构
pages/
├── index.vue          # 首页
├── about.vue          # /about
└── user/
    └── _id.vue        # /user/:id
```

转换为：

```bash
# 本插件结构
src/pages/
├── index.tsx          # 首页
├── about.tsx          # /about
└── user.@id.tsx       # /user/:id
```

**主要差异**：

| Nuxt      | 本插件    | 说明         |
| --------- | --------- | ------------ |
| `.vue`    | `.tsx`    | 文件扩展名   |
| `_id.vue` | `@id.tsx` | 动态参数前缀 |
| `_.vue`   | `_.tsx`   | 通配符相同   |

---

## 从零开始新项目

如果是新项目，建议直接使用文件系统路由：

### 1. 初始化项目

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
```

### 2. 安装依赖

```bash
npm install react-router react-router-dom
npm install @moccona/vite-plugin-react-conventional-router -D
```

### 3. 配置 Vite

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router";

export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      include: ["src/pages/**"],
      lazy: true, // 新项目建议启用懒加载
    }),
  ],
});
```

### 4. 配置 TypeScript

```json
// tsconfig.json
{
  "include": [
    "src",
    "./node_modules/@moccona/vite-plugin-react-conventional-router/client.d.ts"
  ]
}
```

### 5. 创建初始页面

```bash
mkdir -p src/pages
```

```tsx
// src/pages/index.tsx
export default function HomePage() {
  return <h1>欢迎</h1>;
}
```

### 6. 设置应用入口

```tsx
// src/App.tsx
import routes from "virtual:routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export default function App() {
  return (
    <RouterProvider
      router={createBrowserRouter(routes)}
      fallbackElement={<div>Loading...</div>}
    />
  );
}
```

---

## 文件组织指南

### 推荐目录结构

```
src/
├── pages/                 # 路由页面目录
│   ├── layout.tsx         # 根布局（可选）
│   ├── errorBoundary.tsx  # 根错误边界（可选）
│   ├── index.tsx          # 首页 /
│   ├── about.tsx          # /about
│   ├── 404.tsx            # 404 页面
│   ├── blog/
│   │   ├── layout.tsx     # Blog 布局
│   │   ├── index.tsx      # /blog
│   │   ├── @slug.tsx      # /blog/:slug
│   │   └── @slug.loader.ts
│   └── user/
│       ├── @id.tsx        # /user/:id
│       └── @id.layout.tsx # 用户页布局
├── components/            # 可复用组件（不解析为路由）
├── hooks/                 # 自定义 Hooks（不解析为路由）
├── lib/                   # 工具函数
├── api/                   # API 调用
└── types/                 # 类型定义
```

### 排除配置

确保非页面文件被排除：

```typescript
// vite.config.ts
conventionalRouter({
  include: ["src/pages/**"],
  exclude: [
    "src/**/components/**",
    "src/**/hooks/**",
    "src/**/__tests__/**",
    "src/**/*.test.tsx",
  ],
});
```

### 布局嵌套策略

```
src/pages/
├── layout.tsx             # 应用主布局（Header + Footer）
├── index.tsx              # 首页（使用主布局）
└── dashboard/
    ├── layout.tsx         # Dashboard 布局（侧边栏）
    ├── index.tsx          # /dashboard（使用 Dashboard 布局）
    └── settings.tsx       # /dashboard/settings
```

---

## 常见问题

### Q1: 迁移后路由路径变了怎么办？

确保文件命名与期望的路径匹配：

- `about.tsx` → `/about`
- `user.@id.tsx` → `/user/:id`
- `blog.index.tsx` → `/blog`（嵌套）

### Q2: 如何处理路由守卫/权限验证？

使用路由的 `handle` 属性和 loader：

```typescript
// src/pages/admin.dashboard.handle.ts
export default {
  requiresAuth: true,
  role: "admin",
};
```

```typescript
// src/pages/admin.dashboard.loader.ts
import { redirect } from "react-router-dom";

export default async function dashboardLoader({ request }) {
  const user = await getUser(request);
  if (!user || user.role !== "admin") {
    throw redirect("/login");
  }
  return { user };
}
```

### Q3: 迁移后热更新不工作？

检查：

1. Vite 配置正确
2. 文件在 `include` 模式内
3. 开发服务器已重启

### Q4: 如何保留原有的路由中间件？

将中间件逻辑迁移到：

- **loader** 中的数据预取
- **errorBoundary** 中的错误处理
- **handle** 中的元数据

### Q5: 懒加载导致闪烁？

设置 `RouterProvider` 的 `fallbackElement`：

```tsx
<RouterProvider
  router={createBrowserRouter(routes)}
  fallbackElement={<div className="loading-skeleton">加载中...</div>}
/>
```

### Q6: 动态参数如何获取？

使用 react-router 的标准 hooks：

```tsx
import { useParams, useLoaderData } from "react-router-dom";

export default function UserPage() {
  const { id } = useParams();
  const user = useLoaderData();

  return (
    <div>
      用户 {id}: {user.name}
    </div>
  );
}
```

---

## 迁移检查清单

### 准备阶段

- [ ] 备份当前代码（Git 提交）
- [ ] 记录现有路由列表
- [ ] 确认 react-router-dom 已安装
- [ ] 安装插件 `@moccona/vite-plugin-react-conventional-router`

### 配置阶段

- [ ] 配置 `vite.config.ts`
- [ ] 配置 `tsconfig.json` 类型定义
- [ ] 设置 `include` 和 `exclude` 模式

### 文件重组

- [ ] 创建 `src/pages/` 目录
- [ ] 移动页面文件到新目录
- [ ] 按命名约定重命名文件
- [ ] 排除组件和 hooks 目录

### 代码更新

- [ ] 更新应用入口使用 `virtual:routes`
- [ ] 移除手动 `<Routes>` 配置
- [ ] 迁移 loader/action 到独立文件
- [ ] 更新导航链接路径（如有变化）

### 布局和功能

- [ ] 添加根布局（如需要）
- [ ] 添加错误边界
- [ ] 配置路由 handle 数据
- [ ] 测试权限验证逻辑

### 测试验证

- [ ] 测试所有路由路径
- [ ] 测试动态参数
- [ ] 测试嵌套路由
- [ ] 测试 404 页面
- [ ] 测试热更新
- [ ] 测试生产构建

### 清理

- [ ] 删除旧的路由配置文件
- [ ] 清理未使用的导入
- [ ] 更新文档
- [ ] 提交迁移结果

---

## 需要帮助？

遇到问题请：

1. 查看 [README.md](../README.md) 了解完整 API
2. 查看 [api-reference.md](./api-reference.md) 了解配置选项
3. 提交 [GitHub Issue](https://github.com/freemode1614/vite-react-conventional-router/issues)
