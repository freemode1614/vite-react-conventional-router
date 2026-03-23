# API Reference

完整的 API 参考文档，包含所有配置选项、虚拟模块和类型定义。

## 配置选项

### ConventionalRouterProps

插件主函数的配置参数接口。

```typescript
interface ConventionalRouterProps {
  include: Pattern | Pattern[];
  exclude: Pattern | Pattern[];
  lazy: boolean;
}
```

### include

**类型**: `string | string[]`

**默认值**: `[]`

需要解析为路由的文件匹配模式。使用 [fast-glob](https://github.com/mrmlnc/fast-glob) 模式匹配文件路径。

```typescript
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router";

export default defineConfig({
  plugins: [
    conventionalRouter({
      include: ["src/pages/**"],
    }),
  ],
});
```

支持多个模式：

```typescript
include: ["src/pages/**", "src/routes/**"];
```

### exclude

**类型**: `string | string[]`

**默认值**: `[]`

需要排除的文件匹配模式。用于过滤不需要生成路由的文件，例如组件文件、hooks 等。

```typescript
export default defineConfig({
  plugins: [
    conventionalRouter({
      include: ["src/pages/**"],
      exclude: ["src/**/components/**", "src/**/hooks/**", "src/**/*.test.tsx"],
    }),
  ],
});
```

### lazy

**类型**: `boolean`

**默认值**: `false`

是否启用懒加载模式。启用后，页面组件会按需加载，优化首屏性能。

```typescript
export default defineConfig({
  plugins: [
    conventionalRouter({
      include: ["src/pages/**"],
      lazy: true,
    }),
  ],
});
```

**懒加载模式的路由输出**:

```javascript
{
  path: "/home",
  lazy: async () => {
    const element = await import("/path/to/home.tsx");
    return {
      Component: element.default,
      loader: homeLoader,
      ErrorBoundary: homeErrorBoundary
    };
  }
}
```

**非懒加载模式的路由输出**:

```javascript
import element0 from "/path/to/home.tsx";

{
  path: "/home",
  Component: element0.default,
  loader: homeLoader,
  ErrorBoundary: homeErrorBoundary
}
```

---

## 虚拟模块

### virtual:routes

**模块名称**: `virtual:routes`

插件生成的虚拟模块，导出自动生成的路由配置数组。

### 导入方式

```typescript
import routes from "virtual:routes";
```

### 导出内容

```typescript
import type { RouteObject } from "react-router";

const routes: RouteObject[];
export default routes;
```

### 完整使用示例

```tsx
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router";
import routes from "virtual:routes";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      include: ["src/pages/**"],
      exclude: ["src/**/components/**"],
      lazy: false,
    }),
  ],
});

function App() {
  return (
    <RouterProvider
      router={createBrowserRouter(routes)}
      fallbackElement={<div>Loading...</div>}
    />
  );
}
```

---

## 类型定义

### RouteRecord

路由记录对象，由插件内部生成。

```typescript
interface RouteRecord {
  path: string;
  element: string;
}
```

- **path**: 路由路径
- **element**: 页面组件的绝对路径

### LoaderFunction

数据加载函数类型，与 react-router 的 loader 兼容。

```typescript
type LoaderFunction = (args: {
  params: Params;
  request: Request;
}) => Promise<any> | any;
```

**使用示例**:

```typescript
// pages/user.@id.loader.ts
export default function userLoader({ params }) {
  return fetch(`/api/user/${params.id}`).then((res) => res.json());
}
```

或在页面组件中导出：

```tsx
// pages/home.tsx
export async function loader() {
  const data = await fetch("/api/home");
  return data.json();
}

export default function HomePage() {
  const data = useLoaderData();
  return <div>{data.title}</div>;
}
```

### ActionFunction

表单动作函数类型，与 react-router 的 action 兼容。

```typescript
type ActionFunction = (args: {
  params: Params;
  request: Request;
}) => Promise<any> | any;
```

**使用示例**:

```typescript
// pages/login.action.ts
export default async function loginAction({ request }) {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  return await loginUser(username, password);
}
```

### ComponentType

页面组件类型。

```typescript
type ComponentType = React.ComponentType<any>;
```

### HandleObject

路由 handle 数据对象，用于添加路由元数据。

```typescript
interface HandleObject {
  [key: string]: any;
}
```

**使用示例**:

```typescript
// pages/dashboard.handle.ts
export default {
  crumb: () => "Dashboard",
  permission: "admin",
};
```

---

## 路由字段文件

插件支持以下特殊文件名为路由添加额外属性：

| 文件名       | 对应属性        | 说明         |
| ------------ | --------------- | ------------ |
| `layout.tsx` | `ErrorBoundary` | 错误边界组件 |
| `loader.ts`  | `loader`        | 数据加载函数 |
| `action.ts`  | `action`        | 表单动作函数 |
| `handle.ts`  | `handle`        | 路由元数据   |

### 文件命名规则

- **目录级**: `layout.tsx`, `errorBoundary.tsx` 作用于同级所有路由
- **路由级**: `[route].layout.tsx`, `[route].errorBoundary.tsx` 作用于指定路由

**示例**:

```
pages/
├── layout.tsx                 # 根布局
├── errorBoundary.tsx          # 根错误边界
├── home.tsx                   # /home
├── home.layout.tsx            # home 路由的布局
├── user.@id.tsx               # /user/:id
└── user.@id.errorBoundary.tsx # user/:id 的错误边界
```

---

## 常量

### 插件常量

```typescript
const PLUGIN_NAME = "vite-plugin-conventional-router";
const PLUGIN_VIRTUAL_MODULE_NAME = "virtual:routes";
const PLUGIN_MAIN_PAGE_FILE = "index.tsx";
```

### 路由标志

```typescript
const OPTIONAL_ROUTE_FLAG = "$"; // 可选参数
const DYNAMIC_ROUTE_FLAG = "@"; // 动态参数
const SPLAT_ROUTE_FLAG = "_"; // 通配符
const SPECIAL_PATH_SPLIT = "."; // 路径分隔符
const ROUTE_PATH_SEP = "/"; // 路由路径分隔符
```

### 特殊文件名

```typescript
const LAYOUT_FILE_NAME = "layout";
const NOT_FOUND_FILE_NAME = "404";
const ERROR_BOUNDARY_FILE_NAME = "errorBoundary";
const LOADER_FILE_NAME = "loader";
const HANDLE_FILE_NAME = "handle";
```

---

## 工具函数

### filePathToRoutePath

将文件路径转换为路由路径。

```typescript
function filePathToRoutePath(filepath: string): string;
```

**转换规则**:

| 文件路径                | 路由路径        |
| ----------------------- | --------------- |
| `pages/index.tsx`       | `/`             |
| `pages/home.tsx`        | `/home`         |
| `pages/user.@id.tsx`    | `/user/:id`     |
| `pages/product.$id.tsx` | `/product/:id?` |
| `pages/docs/_.tsx`      | `/docs/*`       |

### collectRoutePages

从文件系统收集路由页面。

```typescript
function collectRoutePages(
  pages: Pattern[],
  ignore: Pattern[] = [],
): NonIndexRouteObject[];
```

### stringifyRoutes

将路由树序列化为 JavaScript 代码字符串。

```typescript
function stringifyRoutes(
  routes: NonIndexRouteObject[],
  imports: string[] = [],
  lazy = false,
): string;
```

---

## 完整配置示例

### 基础配置

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
      exclude: ["src/**/components/**"],
      lazy: false,
    }),
  ],
});
```

### 高级配置

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router";

export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      // 多目录支持
      include: ["src/pages/**", "src/routes/**"],
      // 排除测试文件和组件
      exclude: [
        "src/**/components/**",
        "src/**/hooks/**",
        "src/**/*.test.tsx",
        "src/**/*.spec.tsx",
      ],
      // 启用懒加载
      lazy: true,
    }),
  ],
});
```

### TypeScript 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx"
  },
  "include": [
    "src",
    "./node_modules/@moccona/vite-plugin-react-conventional-router/client.d.ts"
  ]
}
```

---

## 错误处理

### 验证错误

插件会在构建时验证路由配置，发现以下问题时会抛出错误：

- 路由冲突
- 重复的路由路径
- 无效的文件命名

### 开发模式日志

在开发模式下 (`import.meta.env.DEV`)，插件会自动在控制台输出生成的路由配置，方便调试。

```typescript
if (import.meta.env.DEV) {
  console.log(routes);
}
```

---

## 变更监听

插件会监听文件变化，当路由文件创建或删除时自动重启开发服务器。

```typescript
watchChange(id, change) {
  if (filter(id) && (change.event === "create" || change.event === "delete")) {
    devServer.restart()
  }
}
```
