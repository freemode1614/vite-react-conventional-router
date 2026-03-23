# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-23

### Added

- **Type Safety**

  - Type guard utility functions (`src/type-guards.ts`)
  - `isStringExport()`, `isLoaderFunction()`, `isActionFunction()`, `isComponentType()` guards
  - Coverage threshold configuration (80% global, 60% per file)

- **Test Infrastructure**

  - Test framework for `index.ts` (`__tests__/index.spec.ts`)
  - Type guard tests (`__tests__/type-guards.spec.ts`)
  - ErrorBoundary tests (4 test cases)
  - Handle/Action tests (7 test cases)
  - HMR watchChange tests (9 test cases)
  - Loader validation tests (10 test cases)

- **Documentation**
  - JSDoc comments for complex algorithms
  - Code improvement plan documentation

### Changed

- **Code Quality**

  - Refactored `load()` function (120+ lines) into smaller, focused functions:
    - `buildRouteTree()` - Route tree building logic (50 lines)
    - `applyLayouts()` - Layout application logic (10 lines)
    - `generateRouteCode()` - Code generation logic (13 lines)
    - `addNotFoundRoute()` - 404 route handling (integrated)
  - Reduced type assertions:
    - `as` assertions: 29 → 25 (14% reduction)
    - `!` assertions: 30 → 5 (83% reduction)
  - Improved code maintainability and testability

- **Testing**
  - Test count increased from 10 → 52 (420% increase)
  - Coverage increased from 39.78% → 83.72% (110% improvement)
  - index.ts coverage: 0% → 80%
  - utils.ts coverage: 30.5% → 89.9%

### Fixed

- **TypeScript Errors**

  - Fixed unsafe type assertions in `utils.ts:316,334,343`
  - Replaced `loader as string`, `action as string`, `ErrorBoundary as string` with type guards

- **Lint Errors**

  - Fixed 6 Biome errors:
    - 2× `useIterableCallbackReturn` (forEach returning values)
    - 1× `useFlatMap` (`.map().flat()` → `.flatMap()`)
    - 2× `useImportType` (type imports)
    - 1× formatting issue

- **Code Smells**
  - Fixed `load()` function violating single responsibility principle
  - Fixed forEach callback return anti-pattern

### Technical Details

**Files Modified**:

- `src/index.ts` (+113, -100) - Main plugin refactored
- `src/utils.ts` (+44, -105) - Type assertions fixed
- `src/validation.ts` (+39, -7) - Validation enhanced
- `src/type-guards.ts` (new) - Type guard utilities
- `vitest.config.ts` (+14, -0) - Coverage thresholds added

**Build Output**:

- Bundle size: ~18 KB
- Build time: ~3.4s
- Zero TypeScript errors
- Zero Biome errors

## [0.2.x] - Previous Versions

See git history for details.

### [0.2.9] - 2026-03-10

- Fixed root route loader assignment bug (BUG-001)
- Fixed circular dependency issue (BUG-002)
