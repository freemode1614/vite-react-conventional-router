# Contributing to @moccona/vite-plugin-react-conventional-router

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/freemode1614/vite-react-conventional-router.git
cd vite-react-conventional-router
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Start development**

```bash
# Build the plugin
pnpm build

# Run tests
pnpm test

# Run e2e tests
pnpm test:e2e
```

## Project Structure

```
.
├── src/              # Source code
│   ├── index.ts      # Main plugin entry
│   ├── utils.ts      # Route processing utilities
│   ├── validation.ts # Route validation
│   └── constants.ts  # Naming conventions
├── __tests__/        # Unit tests
├── e2e/              # E2E tests
├── example/          # Example projects
└── npm/              # Built output
```

## Code Style

This project uses [Biome](https://biomejs.dev/) for linting and formatting.

```bash
# Check code
pnpm biome check .

# Fix issues
pnpm biome check --write .

# Format code
pnpm biome format --write .
```

## Submitting Changes

1. **Create a branch**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**

- Write clear, concise commit messages
- Add tests for new features
- Update documentation if needed

3. **Run tests**

```bash
pnpm test
pnpm test:e2e
```

4. **Submit a Pull Request**

- Provide a clear description of the changes
- Link to any related issues
- Ensure all tests pass

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build/config changes

Example:
```
feat: add support for route groups

- Add group file naming pattern
- Update route tree building logic
- Add tests for group routes
```

## Reporting Issues

When reporting issues, please include:

- Plugin version
- Node.js version
- React Router version
- Vite version
- Minimal reproduction steps
- Expected vs actual behavior

## Code of Conduct

Be respectful and constructive in all interactions.

## Questions?

Feel free to open an issue for questions or join discussions.

Thank you for contributing! 🎉
