# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Egon.io VS Code Extension - A Domain Story Modeler plugin that integrates the open source Egon.io tool into Visual Studio Code. Users create and edit `.egn` files to write domain stories visually using diagram-js.

## Build Commands

```bash
# Install dependencies (Yarn 4 workspaces)
yarn install

# Development (watch mode for all packages)
yarn dev

# Production build
yarn build

# Run all tests
yarn test

# Run a single test file
yarn test --testPathPattern="<pattern>"

# Lint
yarn lint

# Serve webview for development (hot reload)
yarn serve
```

## Architecture

### Monorepo Structure (Yarn Workspaces)

- **apps/vscode/egon-modeler-plugin** - VS Code extension entry point (webpack bundled)
- **apps/vscode/egon-modeler-webview** - Webview UI that renders the diagram-js canvas (Vite bundled)
- **libs/diagram-js-egon-plugin** - Core diagram-js modules for Domain Story modeling
- **libs/vscode/domain-story** - Application layer with DDD architecture (domain, application, infrastructure)
- **libs/vscode/data-transfer-objects** - Command DTOs for plugin ↔ webview communication

### DDD Architecture (libs/vscode/domain-story)

Three-layer architecture with dependency injection via tsyringe:

1. **Domain Layer** - Pure business logic, no external dependencies
   - `EditorSession` - Aggregate root managing editor state and sync guards

2. **Application Layer** - Use case orchestration with port interfaces
   - `DomainStoryEditorService` - Session management and sync coordination
   - `DocumentPort`, `ViewPort` - Interfaces for infrastructure

3. **Infrastructure Layer** - VS Code API implementations
   - `VsCodeDocumentPort`, `VsCodeViewPort` - Adapt VS Code APIs to ports

### diagram-js Plugin System (libs/diagram-js-egon-plugin)

Custom diagram-js modules in `src/features/`:
- `palette/` - Toolbar with actor/work-object icons
- `context-pad/` - Context actions for selected elements
- `renderer/` - SVG rendering for domain story elements
- `labeling/` - Text editing and label positioning
- `modeling/` - Element creation and manipulation
- `copy-paste/` - Clipboard operations
- `replace/` - Element type replacement
- `popup/` - Numbering and popup menus

### Plugin ↔ Webview Communication

Commands flow bidirectionally via `postMessage`:
- `InitializeWebviewCommand` - Webview requests initial content
- `DisplayDomainStoryCommand` - Extension sends content to webview
- `SyncDocumentCommand` - Webview sends changes to extension

Echo prevention uses per-session guards to prevent infinite sync loops.

## Key Patterns

- **Dependency Injection**: tsyringe container configured in `main.config.ts`
- **Custom Icons**: Users add SVGs to `.egon/icons/actors/` or `.egon/icons/work-objects/` in workspace
- **Semantic Commits**: Follow conventional commits (feat, fix, docs, etc.)

## Testing

Tests use Jest. The `libs/vscode/domain-story` library has comprehensive unit tests demonstrating the testing patterns for each layer.
