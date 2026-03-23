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

## 文档贡献 (Documentation Contributions)

### 文档结构

项目文档位于以下位置：

- `README.md` - 项目概述和快速开始
- `README_EN.md` - English documentation
- `CONTRIBUTING.md` - 贡献指南
- `TODO.md` - TODO 列表和计划
- `CHANGELOG.md` - 版本更新日志
- `docs/` - 详细文档目录
  - `api-reference.md` - API 参考
  - `migration-guide.md` - 迁移指南
  - `faq.md` - 常见问题
  - `best-practices.md` - 最佳实践
  - `architecture.md` - 架构设计

### 文档编写规范

1. **使用清晰的标题层级**

   - 使用 `##` 作为主章节
   - 使用 `###` 作为子章节
   - 避免超过 4 级标题

2. **代码示例规范**

   - 所有代码示例必须可运行
   - 使用 TypeScript 语法高亮
   - 包含必要的上下文

3. **链接规范**

   - 内部链接使用相对路径
   - 外部链接使用完整 URL
   - 避免链接到不稳定的资源

4. **语言风格**
   - 使用简洁的中文
   - 技术术语保持英文
   - 避免口语化表达

### 测试文档

在提交文档更改前，请确保：

- [ ] 所有代码示例可运行
- [ ] 所有链接有效
- [ ] 格式正确 (markdown lint)
- [ ] 无拼写错误

## Questions?

Feel free to open an issue for questions or join discussions.

Thank you for contributing! 🎉
