# Architecture

## Module Structure

```
src/
├── index.ts              - Plugin entry point
├── types/index.ts        - Type definitions
├── utils/                - Route processing
│   ├── shared.ts         - Common utilities
│   ├── imports.ts        - ImportTracker, stringifyRoutes
│   ├── scan.ts           - Route file scanning
│   ├── tree.ts           - Route tree building
│   └── layout.ts         - Layout application
├── generators/           - Code generation
│   └── routeCode.ts      - Route code generation
└── validation/           - Route validation
    ├── utils.ts          - Shared validation utilities
    └── conflicts.ts      - Conflict detection
```

## Module Responsibilities

- **index.ts**: Plugin entry, orchestrates route tree building and code generation
- **types/**: Centralized type definitions for the plugin
- **utils/shared.ts**: Common utilities (reserved keys, field key checks, subpath detection)
- **utils/imports.ts**: Import tracking and route code stringification
- **utils/scan.ts**: File system scanning and path conversion
- **utils/tree.ts**: Route tree construction and arrangement
- **utils/layout.ts**: Layout inheritance and application
- **generators/routeCode.ts**: React Router code generation
- **validation/utils.ts**: Validation utilities (conflict detection, typo detection)
- **validation/conflicts.ts**: Path conflict and field key typo validation
