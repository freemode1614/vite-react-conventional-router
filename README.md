# @moccona/vite-plugin-react-conventional-router

## 安装与配置

- 安装

```sh
npm i @moccona/vite-plugin-react-conventional-router -D
```

- 配置

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "@moccona/vite-react-conventional-router"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      pages: ["src/pages/**"]
    }),
  ],
})

//
```

- 添加虚拟模块类型定义文件到 tsconfig.json

```ts
{
    //...
    "include": ["src", "./node_modules/@moccona/vite-react-conventional-router/client.d.ts"]
}
```

- 从虚拟路由模块中导入生成的路由数据，然后创建路由

```tsx
import routes from "virtual:routes"
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export default function App() {
    return <div id="main">
        <RouterProvider router={createBrowserRouter(routes)} fallbackElement={
          <div>
              Loading
          </div>
        } />
    </div>
}
```

## 支持的文件名与路由的映射

```
`src/pages/index.tsx`           -> `/`
`src/pages/home.tsx`            -> `/home`
`src/pages/home.list.tsx`       -> `/home/list`
`src/pages/home.@id.tsx`        -> `/home/:id`
`src/pages/home.list.$id.tsx`   -> `/home/list/:id?`
```

## 如何组织页面文件内容

文件内容组织参考 react-router 的 [**lazy**](https://reactrouter.com/en/main/route/lazy#lazy) 部分。
