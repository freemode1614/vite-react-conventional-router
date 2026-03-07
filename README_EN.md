# @moccona/vite-plugin-react-conventional-router

> A file-system based routing plugin for React Router with deep integration.
>
> Other routing libraries like *@tanstack/react-router* are not supported.

[中文文档](./README.md) | [Architecture Doc](./AGENTS.md)

---

## ✨ Features

- 📁 **File-system Routing** - Auto-generate routes from directory structure
- 🚀 **React Router v6/v7 Support** - Deep integration with react-router
- ⚡ **Lazy Loading** - On-demand page loading for better performance
- 🎯 **Dynamic Routes** - Support for parameters and optional parameters
- 🌲 **Nested Routes** - Automatic nested route tree building
- 🎨 **Layout Support** - Flexible layout component configuration
- 🔥 **Hot Reload** - Auto server restart during development
- ✅ **Route Validation** - Conflict detection and smart error hints

---

## 📦 Installation

### 1. Install react-router

```bash
npm install react-router react-router-dom
```

### 2. Install the plugin

```bash
npm install @moccona/vite-plugin-react-conventional-router -D
```

---

## 🔧 Configuration

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import conventionalRouter from "@moccona/vite-plugin-react-conventional-router"

export default defineConfig({
  plugins: [
    react(),
    conventionalRouter({
      // Files to be resolved as routes
      include: ["src/pages/**"],
      // Files to be excluded
      exclude: ["src/**/components/**", "src/**/hooks/**"],
      // Enable lazy loading (optional)
      lazy: false
    }),
  ],
})
```

### tsconfig.json

Add virtual module type definitions:

```json
{
  "include": [
    "src",
    "./node_modules/@moccona/vite-plugin-react-conventional-router/client.d.ts"
  ]
}
```

### Create Routes

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

## 📁 File Naming Conventions

### Basic Routes

| File Path | Route Path |
|-----------|------------|
| `src/pages/index.tsx` | `/` |
| `src/pages/home.tsx` | `/home` |
| `src/pages/about.tsx` | `/about` |

### Nested Routes

Use `.` to connect file names for nested routes:

| File Path | Route Path |
|-----------|------------|
| `src/pages/home.list.tsx` | `/home/list` |
| `src/pages/home.detail.tsx` | `/home/detail` |

### Dynamic Routes

Use `@` prefix for dynamic parameters:

| File Path | Route Path |
|-----------|------------|
| `src/pages/user.@id.tsx` | `/user/:id` |
| `src/pages/post.@slug.tsx` | `/post/:slug` |

### Optional Parameters

Use `$` prefix for optional parameters:

| File Path | Route Path |
|-----------|------------|
| `src/pages/product.$id.tsx` | `/product/:id?` |
| `src/pages/blog.$page.tsx` | `/blog/:page?` |

### Catch-all Routes

Use `_` as file name to match all sub-paths:

| File Path | Route Path |
|-----------|------------|
| `src/pages/docs/_.tsx` | `/docs/*` |

### 404 Page

Use `404.tsx` as the fallback route:

| File Path | Route Path |
|-----------|------------|
| `src/pages/404.tsx` | `*` |

---

## 🎨 Layouts

Two layout file formats are supported:

### Directory-level Layout

`layout.tsx` applies to all routes in the same directory:

```
pages/
├── layout.tsx          # Root layout, wraps all routes
├── index.tsx           # Home page
├── about.tsx           # About page (uses root layout)
└── dashboard/
    ├── layout.tsx      # Dashboard layout
    ├── index.tsx       # Dashboard home
    └── settings.tsx    # Settings page (uses Dashboard layout)
```

### Route-level Layout

`[route].layout.tsx` applies to specific routes:

```
pages/
├── home.tsx            # /home
├── home.layout.tsx     # Layout for home route
├── user.@id.tsx        # /user/:id
└── user.@id.layout.tsx # Layout for user/:id route
```

---

## 🛡️ Error Boundaries

Two error boundary file formats are supported:

### Directory-level Error Boundary

`errorBoundary.tsx` applies to all routes in the same directory:

```
pages/
├── errorBoundary.tsx   # Root error boundary
├── index.tsx
└── admin/
    ├── errorBoundary.tsx  # Admin error boundary
    └── dashboard.tsx
```

### Route-level Error Boundary

`[route].errorBoundary.tsx` applies to specific routes:

```
pages/
├── user.@id.tsx
└── user.@id.errorBoundary.tsx
```

---

## 🔄 Data Loading (Loader)

Supports react-router's loader functionality:

### Standalone Loader File

```typescript
// pages/home.loader.ts
export default function homeLoader() {
  return fetch('/api/home').then(res => res.json())
}

// Or using params
export default function userLoader({ params }) {
  return fetch(`/api/user/${params.id}`).then(res => res.json())
}
```

### Export in Page Component

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

## 📝 Handle Data

Supports react-router's handle property:

```typescript
// pages/dashboard.handle.ts
export default {
  crumb: () => "Dashboard"
}
```

---

## ⚡ Lazy Loading

Enable lazy loading mode:

```typescript
// vite.config.ts
conventionalRouter({
  include: ["src/pages/**"],
  lazy: true  // Enable lazy loading
})
```

In lazy loading mode, page components are loaded on demand, improving initial load performance.

---

## 🗂️ Complete Example

```
pages/
├── layout.tsx                 # Root layout
├── errorBoundary.tsx          # Root error boundary
├── index.tsx                  # / (Home)
├── 404.tsx                    # * (404 page)
├── about.tsx                  # /about
├── contact.tsx                # /contact
├── blog/
│   ├── layout.tsx             # Blog layout
│   ├── index.tsx              # /blog
│   ├── @slug.tsx              # /blog/:slug
│   └── @slug.layout.tsx       # Blog post layout
├── products/
│   ├── index.tsx              # /products
│   ├── @id.tsx                # /products/:id
│   └── @id.errorBoundary.tsx  # Product detail error boundary
└── docs/
    ├── layout.tsx             # Docs layout
    ├── index.tsx              # /docs
    └── _.tsx                  # /docs/* (catch-all)
```

---

## ⚙️ Configuration Options

```typescript
interface ConventionalRouterProps {
  /** 
   * File patterns to include as routes
   * @default []
   */
  include: string | string[]
  
  /** 
   * File patterns to exclude
   * @default []
   */
  exclude: string | string[]
  
  /** 
   * Enable lazy loading
   * @default false
   */
  lazy: boolean
}
```

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

Please check [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License © 2024 [freemode1614](https://github.com/freemode1614)
