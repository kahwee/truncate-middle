# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Build: `npm run build`
- Lint: `npm run lint`
- Lint & fix: `npm run lint:fix`
- Test: `npm run test`
- Run single test: `npx vitest run -t "test description"`
- Type check: `npm run typecheck`
- Coverage: `npm run coverage`

## Code Style Guidelines

- **Module System**: ES Modules (`type: "module"` in package.json)
- **Formatting**: Follow ESLint config (flat config format)
- **Types**: TypeScript with strict mode enabled
- **Naming**: camelCase for variables/functions, interfaces for type definitions
- **Error Handling**: Null/undefined checks with early returns
- **Functions**: Default parameters where appropriate
- **Documentation**: JSDoc comments for exports
- **Framework**: Vitest for testing with `expect(...).toBe()` pattern
- **Imports**: Named imports preferred, absolute paths from root

Maintain consistent code style with existing files when making changes.
