# @moccona/vite-plugin-react-conventional-router

## ⚠️注意⚠️

这个库只基于 _react-router_ 实现，与 _react-router_ 的功能高度集成。其他的路由库暂时不支持，比如 _@tanstack/react-router_

## 安装与配置

- 先安装 _react-router_ 和 _react-router-dom_

```sh
npm i react-router react-router-dom
```

- 安装插件

```sh
npm i @moccona/vite-plugin-react-conventional-router -D
```

- 配置插件

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "@moccona/vite-react-conventional-router "

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      // 需要解析为路由的文件
      include: ["src/pages/**"],
      // 需要被排除解析的文件
      exclude: ["src/**/components/**","src/**/hooks/**"]
    }),
  ],
})

//
```

- 添加虚拟路由模块类型定义文件到 _tsconfig.json_ ， 避免导入路有配置的时候报 _MODULE NOT FOUND_ 的错误。

```ts
{
  //...
  "include": [
    "src",
    "./node_modules/@moccona/vite-react-conventional-router/client.d.ts"
  ]
}
```

- 从虚拟路由模块中导入生成的路由数据，然后创建路由

```tsx
import routes from "virtual:routes"
import { createBrowserRouter, RouterProvider } from "react-router-dom";

export default function App() {
  return <div id="main">
    <RouterProvider
      router={createBrowserRouter(routes)}
      fallbackElement={
        <div>
          Loading
        </div>
      }
    />
  </div>
}
```

## 文件名与路由的映射关系

```txt
`src/pages/index.tsx`           -> `/`
`src/pages/home.tsx`            -> `/home`
`src/pages/home.list.tsx`       -> `/home/list`
`src/pages/home.@id.tsx`        -> `/home/:id`
`src/pages/home.list.$id.tsx`   -> `/home/list/:id?`
```

### Layout

两种布局组件格式。

- \*\*/layout.tsx

  作为同级目录下的布局组件。

- \*\*/page.layout.tsx

  作为page路由的布局组件。

### ErrorBoundary

两种错误边界组件格式。

- \*\*/errorBoundary.tsx

  作为同级目录下的错误边界组件。

- \*\*/page.errorBoundary.tsx

  作为page路由的错误边界组件。

## 如何组织路由文件内容

文件内容组织参考 _react-router_ 的 [**lazy**](https://reactrouter.com/en/main/route/lazy#lazy) 部分。唯一不同的是，默认到处会作为 _Component_ 被使用。
