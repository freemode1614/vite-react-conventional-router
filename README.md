# @moccona/vite-plugin-react-conventional-router

> 基于 *react-router* 实现的文件系统路由插件，与 react-router 功能深度集成。
> 
> 不支持其他路由库，如 *@tanstack/react-router*

[English Documentation](./README_EN.md) | [架构文档](./AGENTS.md)

---

## ✨ 特性

- 📁 **文件系统路由** - 基于目录结构自动生成路由配置
- 🚀 **支持 React Router v6/v7** - 与 react-router 深度集成
- ⚡ **懒加载支持** - 按需加载页面组件，优化首屏性能
- 🎯 **动态路由** - 支持参数路由和可选参数
- 🌲 **嵌套路由** - 自动构建嵌套路由树
- 🎨 **布局支持** - 灵活的布局组件配置
- 🔥 **热更新** - 开发时自动重启服务器
- ✅ **路由验证** - 冲突检测和智能错误提示

---

## 📦 安装

### 1. 安装 react-router

```bash
npm install react-router react-router-dom
```

### 2. 安装插件

```bash
npm install @moccona/vite-plugin-react-conventional-router -D
```

---

## 🔧 配置

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router"

export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      // 需要解析为路由的文件
      include: ["src/pages/**"],
      // 需要被排除解析的文件
      exclude: ["src/**/components/**", "src/**/hooks/**"],
      // 启用懒加载（可选）
      lazy: false
    }),
  ],
})
```

### tsconfig.json

添加虚拟模块类型定义，避免导入时报错：

```json
{
  "include": [
    "src",
    "./node_modules/@moccona/vite-plugin-react-conventional-router/client.d.ts"
  ]
}
```

### 创建路由

```tsx
import routes from "virtual:routes"
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export default function App() {
  return (
    <RouterProvider
      router={createBrowserRouter(routes)}
      fallbackElement={<div>Loading...</div>}
    />
  )
}
```

---

## 📁 文件命名约定

### 基础路由

| 文件路径 | 路由路径 |
|---------|---------|
| `src/pages/index.tsx` | `/` |
| `src/pages/home.tsx` | `/home` |
| `src/pages/about.tsx` | `/about` |

### 嵌套路由

使用 `.` 连接文件名创建嵌套路由：

| 文件路径 | 路由路径 |
|---------|---------|
| `src/pages/home.list.tsx` | `/home/list` |
| `src/pages/home.detail.tsx` | `/home/detail` |

### 动态路由

使用 `@` 前缀表示动态参数：

| 文件路径 | 路由路径 |
|---------|---------|
| `src/pages/user.@id.tsx` | `/user/:id` |
| `src/pages/post.@slug.tsx` | `/post/:slug` |

### 可选参数路由

使用 `$` 前缀表示可选参数：

| 文件路径 | 路由路径 |
|---------|---------|
| `src/pages/product.$id.tsx` | `/product/:id?` |
| `src/pages/blog.$page.tsx` | `/blog/:page?` |

### 通配路由

使用 `_` 作为文件名匹配所有子路径：

| 文件路径 | 路由路径 |
|---------|---------|
| `src/pages/docs/_.tsx` | `/docs/*` |

### 404 页面

使用 `404.tsx` 作为兜底路由：

| 文件路径 | 路由路径 |
|---------|---------|
| `src/pages/404.tsx` | `*` |

---

## 🎨 布局 (Layout)

支持两种布局文件格式：

### 目录级布局

`layout.tsx` 作用于同级目录下的所有路由：

```
pages/
├── layout.tsx          # 根布局，包裹所有路由
├── index.tsx           # 首页
├── about.tsx           # 关于页面（使用根布局）
└── dashboard/
    ├── layout.tsx      # Dashboard 布局
    ├── index.tsx       # Dashboard 首页
    └── settings.tsx    # 设置页面（使用 Dashboard 布局）
```

### 路由级布局

`[route].layout.tsx` 作用于指定路由：

```
pages/
├── home.tsx            # /home
├── home.layout.tsx     # home 路由的布局
├── user.@id.tsx        # /user/:id
└── user.@id.layout.tsx # user/:id 路由的布局
```

---

## 🛡️ 错误边界 (ErrorBoundary)

支持两种错误边界文件格式：

### 目录级错误边界

`errorBoundary.tsx` 作用于同级目录下的所有路由：

```
pages/
├── errorBoundary.tsx   # 根错误边界
├── index.tsx
└── admin/
    ├── errorBoundary.tsx  # Admin 错误边界
    └── dashboard.tsx
```

### 路由级错误边界

`[route].errorBoundary.tsx` 作用于指定路由：

```
pages/
├── user.@id.tsx
└── user.@id.errorBoundary.tsx
```

---

## 🔄 数据加载 (Loader)

支持 react-router 的 loader 功能：

### 独立 loader 文件

```typescript
// pages/home.loader.ts
export default function homeLoader() {
  return fetch('/api/home').then(res => res.json())
}

// 或者使用 params
export default function userLoader({ params }) {
  return fetch(`/api/user/${params.id}`).then(res => res.json())
}
```

### 页面内导出

```tsx
// pages/home.tsx
export async function loader() {
  const data = await fetch('/api/home')
  return data.json()
}

export default function HomePage() {
  const data = useLoaderData()
  return <div>{data.title}</div>
}
```

---

## 📝 Handle 数据

支持 react-router 的 handle 属性：

```typescript
// pages/dashboard.handle.ts
export default {
  crumb: () => "Dashboard"
}
```

---

## ⚡ 懒加载

启用懒加载模式：

```typescript
// vite.config.ts
conventionalRouter({
  include: ["src/pages/**"],
  lazy: true  // 启用懒加载
})
```

在懒加载模式下，页面组件会按需加载，提升首屏性能。

---

## 🗂️ 完整示例

```
pages/
├── layout.tsx                 # 根布局
├── errorBoundary.tsx          # 根错误边界
├── index.tsx                  # / (首页)
├── 404.tsx                    # * (404页面)
├── about.tsx                  # /about
├── contact.tsx                # /contact
├── blog/
│   ├── layout.tsx             # Blog 布局
│   ├── index.tsx              # /blog
│   ├── @slug.tsx              # /blog/:slug
│   └── @slug.layout.tsx       # Blog 文章布局
├── products/
│   ├── index.tsx              # /products
│   ├── @id.tsx                # /products/:id
│   └── @id.errorBoundary.tsx  # 产品详情错误边界
└── docs/
    ├── layout.tsx             # Docs 布局
├── index.tsx              # /docs
    └── _.tsx                  # /docs/* (通配)
```

---

## ⚙️ 配置选项

```typescript
interface ConventionalRouterProps {
  /** 
   * 需要解析为路由的文件匹配模式 
   * @default []
   */
  include: string | string[]
  
  /** 
   * 需要排除的文件匹配模式 
   * @default []
   */
  exclude: string | string[]
  
  /** 
   * 是否启用懒加载 
   * @default false
   */
  lazy: boolean
}
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

请查看 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解贡献指南。

---

## 📄 许可证

MIT License © 2024 [freemode1614](https://github.com/freemode1614)
