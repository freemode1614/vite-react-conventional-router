# @moccona/vite-plugin-react-conventional-router - Architecture

This document describes the internal architecture and design decisions of the vite-plugin-react-conventional-router project, intended for AI agents and contributors.

## Project Overview

This Vite plugin automatically generates React Router route configurations from the filesystem structure, enabling file-system based routing similar to Next.js or Nuxt.js.

## Architecture

### High-Level Flow

```
User's Page Files → File Scanning → Route Parsing → Tree Building → Code Generation → Virtual Module
```

### Core Components

```
src/
├── index.ts      # Main plugin - Vite Plugin API implementation
├── utils.ts      # Route processing logic
├── constants.ts  # Naming conventions and flags
├── validation.ts # Route validation and error detection
└── client.d.ts   # TypeScript declarations for virtual module
```

## Module Details

### 1. Plugin Entry (`index.ts`)

Implements Vite's Plugin API:

- **`resolveId`** - Intercepts imports of `virtual:routes`
- **`load`** - Generates route code when virtual module is imported
- **`configureServer`** - Captures Vite dev server for hot reload
- **`watchChange`** - Triggers server restart when route files change

Key processing flow in `load()`:
1. Collect all page files using glob patterns
2. Separate special routes (404, layout, field keys)
3. Build route tree by nesting children under parents
4. Wrap routes with layouts if specified
5. Generate import statements and route configuration code
6. Validate routes and throw on critical errors

### 2. Utilities (`utils.ts`)

#### `collectRoutePages()`
Scans filesystem for page files matching include patterns, excluding ignore patterns.

**Key behaviors:**
- Uses `fast-glob` for efficient file scanning
- Converts relative paths to absolute paths
- Transforms file paths to route paths using `filePathToRoutePath()`

#### `filePathToRoutePath()`
Converts file paths to route paths using naming conventions.

**Transformation rules:**
| Pattern | Input | Output |
|---------|-------|--------|
| Basic | `home.tsx` | `home` |
| Nested | `home.list.tsx` | `home/list` |
| Index | `index.tsx` | `""` (empty) |
| Dynamic | `user.@id.tsx` | `user/:id` |
| Optional | `user.$id.tsx` | `user/:id?` |
| Splat | `docs._.tsx` | `docs/*` |

#### `arrangeRoutes()`
Builds the nested route tree structure recursively.

**Algorithm:**
1. Find all direct children of current parent route
2. Collect associated field keys (layout, loader, errorBoundary, handle)
3. Recursively process children
4. If layout exists, wrap route with layout

**Layout wrapping:**
```
Before: Route { path: "/home", children: [...] }
After:  Layout { path: "/home", children: [Route { children: [...] }] }
```

#### `stringifyRoutes()`
Generates JavaScript code for route configuration.

**Modes:**
- **Eager** - All components imported at build time
- **Lazy** - Components loaded dynamically with `import()`

Handles field keys by generating separate imports for loader, handle, errorBoundary.

### 3. Validation (`validation.ts`)

Provides comprehensive route validation:

#### Conflict Detection
Detects when multiple files map to the same route path.

Example:
```
ERROR: Route conflict: "home" is defined by multiple files
  → src/pages/home.tsx
  → src/pages/home/index.tsx
```

#### Path Validation
- Empty segments (double slashes)
- Splat after dynamic params (warning)

#### Field Key Association
Warns when layout/loader files have no matching parent route.

#### Typo Detection
Uses Levenshtein distance to detect potential typos:
- `layuot` → suggests `layout`
- `loder` → suggests `loader`

## Route File Naming Conventions

### Page Files

```
pages/
├── index.tsx              → /
├── about.tsx              → /about
├── users/
│   ├── index.tsx          → /users
│   ├── @id.tsx            → /users/:id
│   └── $page.tsx          → /users/:page?
└── docs/
    └── _.tsx              → /docs/*
```

### Field Key Files

```
pages/
├── layout.tsx             → Root layout wrapper
├── errorBoundary.tsx      → Root error boundary
├── users/
│   ├── index.tsx          → /users
│   ├── layout.tsx         → Layout for /users/*
│   ├── loader.ts          → Loader for /users
│   ├── errorBoundary.tsx  → Error boundary for /users
│   └── @id.tsx            → /users/:id
│       ├── layout.tsx     → Layout for /users/:id
│       └── loader.ts      → Loader for /users/:id
```

### Naming Patterns

Field key files can be named in two ways:
1. **Directory level**: `users/layout.tsx` - applies to all routes in `users/`
2. **Route level**: `users.@id.layout.tsx` - applies only to `users/:id`

## Route Tree Building Algorithm

### Phase 1: File Discovery

```typescript
const allRoutes = collectRoutePages(
  ["src/pages/**"],           // Include patterns
  ["**/components/**"]        // Exclude patterns
);
```

### Phase 2: Route Classification

```typescript
// Separate special routes
const { routes, "404": notFound, layout: rootLayout } = 
  collectRootRouteRelatedRoute(allRoutes);

// Identify field keys
const fieldKeys = collectRouteFieldKeyRoute(routes);

// Get actual page routes (excluding field keys)
const pageRoutes = routes.filter(r => !fieldKeys.includes(r));
```

### Phase 3: Tree Construction

Two-pass approach for handling deep nesting:

**Pass 1:** Process top-level routes (depth = 1)
- Build initial parent-child relationships
- Attach direct children to parents

**Pass 2:** Process deep routes (depth > 2)
- Attach grandchildren and deeper levels
- Ensure proper nesting at all levels

**Why two passes?**
- Ensures parent routes exist before children are attached
- Handles deeply nested structures correctly
- Prevents race conditions in tree building

### Phase 4: Layout Wrapping

Layouts are applied after tree construction:

```typescript
if (layout) {
  const wrappedRoute = {
    ...layout,
    path: route.path,
    children: [route]
  };
}
```

### Phase 5: Code Generation

Generates code structure:

```typescript
// Imports
import element0 from "/src/pages/home.tsx";
import loader0 from "/src/pages/home.loader.ts";

// Route configuration
const routes = [{
  path: "/home",
  Component: element0.default,
  loader: loader0,
  children: [...]
}];

export default routes;
```

## Virtual Module

The plugin exposes routes through a virtual module:

```typescript
// In user's code
import routes from "virtual:routes";

// Resolved to generated code at build time
```

TypeScript support via `client.d.ts`:
```typescript
declare module "virtual:routes" {
  import type { RouteObject } from "react-router";
  const routes: RouteObject[];
  export default routes;
}
```

## Development vs Production

### Development
- File watcher triggers server restart on route changes
- Routes logged to console for debugging
- Validation errors throw with detailed messages

### Production
- Routes generated at build time
- No file watching
- Optimized output (no debug logging)

## Testing Strategy

### Unit Tests (`__tests__/index.spec.ts`)
- Test individual utility functions
- Mock file system where possible
- Test edge cases in path conversion

### Validation Tests (`__tests__/validation.spec.ts`)
- Test conflict detection
- Test typo detection
- Test field key validation

### E2E Tests (`e2e/react.spec.ts`)
- Full integration with Vite + React Router
- Real browser testing with Playwright
- Tests actual routing behavior

## Common Issues & Solutions

### 1. Route Not Found
**Cause:** File path doesn't match expected pattern
**Solution:** Check file naming conventions

### 2. Layout Not Applied
**Cause:** Layout file not in same directory as routes
**Solution:** Place layout.tsx in the directory containing the routes

### 3. Conflicting Routes
**Cause:** Multiple files resolve to same path
**Solution:** Use validation output to identify and rename files

### 4. Field Key Not Working
**Cause:** Parent route doesn't exist
**Solution:** Ensure the route file exists before adding field keys

## Configuration Options

```typescript
interface ConventionalRouterProps {
  /** Glob patterns for page files to include */
  include: Pattern | Pattern[];
  /** Glob patterns for files to exclude */
  exclude: Pattern | Pattern[];
  /** Enable lazy loading for components */
  lazy: boolean;
}
```

## Future Enhancements

Potential improvements not yet implemented:

1. **Route Groups** - Group routes without affecting URL
2. **Parallel Routes** - Multiple page components per route
3. **Intercepting Routes** - Modal-like route interception
4. **Middleware** - Route-level middleware support
5. **API Routes** - Server-side API endpoint generation

## Dependencies

- `fast-glob` - Fast file system globbing
- `@rollup/pluginutils` - Vite/Rollup plugin utilities
- `@moccona/logger` - Structured logging

## Development Tools

- **Biome** - Linting and formatting (replaces ESLint + Prettier)
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **TypeScript** - Type checking

### Biome Configuration

Biome is configured in `biome.json`:
- 2-space indentation
- Double quotes
- Semicolons required
- Trailing commas (all)
- Line width: 100

VS Code users should install the Biome extension for the best experience.

## Peer Dependencies

- `react` ^17 || ^18 || ^19
- `react-router` ^6 || ^7
- `vite` ^5 || ^6
