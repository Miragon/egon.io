# Domain Story Library

A Domain-Driven Design (DDD) library for managing Domain Story editor sessions in VS Code extensions.

## Overview

This library provides a clean, maintainable architecture for handling bidirectional synchronization between VS Code text documents and webview panels. It eliminates global state and provides per-session sync guards to prevent echo loops.

## Features

- ✅ **Clean DDD Architecture**: Separation of domain, application, and infrastructure layers
- ✅ **No Global State**: Per-session state management with sync guards
- ✅ **Testable**: Domain and application logic is framework-agnostic
- ✅ **Type-Safe**: Full TypeScript support with strict typing
- ✅ **Extensible**: Port-based architecture allows easy adapter swapping

## Installation

This library is already part of the monorepo. Import it using the path alias:

```typescript
import {
    DomainStoryEditorService,
    VsCodeDocumentPort,
    VsCodeViewPort
} from '@egon/domain-story';
```

## Quick Start

### 1. Register Dependencies (DI Container)

```typescript
import { container } from "tsyringe";
import {
    DomainStoryEditorService,
    DocumentPort,
    VsCodeDocumentPort
} from "@egon/domain-story";

export function config() {
    container.register<DocumentPort>("DocumentPort", {
        useClass: VsCodeDocumentPort,
    });

    container.register<DomainStoryEditorService>(DomainStoryEditorService, {
        useFactory: (c) => {
            const docs = c.resolve<DocumentPort>("DocumentPort");
            return new DomainStoryEditorService(docs);
        },
    });
}
```

### 2. Use in Your WebviewController

```typescript
import { inject, singleton } from "tsyringe";
import {
    CustomTextEditorProvider,
    TextDocument,
    WebviewPanel,
    workspace
} from "vscode";
import {
    DomainStoryEditorService,
    VsCodeViewPort
} from "@egon/domain-story";

@singleton()
export class WebviewController implements CustomTextEditorProvider {
    constructor(
        @inject(DomainStoryEditorService)
        private app: DomainStoryEditorService,
    ) {
    }

    async resolveCustomTextEditor(
        document: TextDocument,
        webviewPanel: WebviewPanel,
    ): Promise<void> {
        const documentId = document.uri.path;

        // Create view port for this webview
        const view = new VsCodeViewPort(webviewPanel);

        // Register session
        const sessionId = this.app.registerSession(documentId, document.getText(), view);

        // Handle initialization message from webview
        webviewPanel.webview.onDidReceiveMessage(async (command) => {
            if (command.TYPE === 'InitializeWebview') {
                await this.app.initialize(sessionId);
            } else if (command.TYPE === 'SyncDocument') {
                await this.app.syncFromWebview(sessionId, command.text);
            }
        });

        // Handle document changes (user edits text)
        workspace.onDidChangeTextDocument(async (event) => {
            if (event.document.uri.path === sessionId) {
                await this.app.onDocumentChanged(sessionId, event.document.getText());
            }
        });

        // Cleanup on dispose
        webviewPanel.onDidDispose(() => {
            this.app.dispose(sessionId);
        });
    }
}
```

## Architecture

The library follows a three-layer DDD architecture:

```
├── domain/           # Pure domain logic (no dependencies)
├── application/      # Use cases and ports (orchestration)
└── infrastructure/   # VS Code adapters (framework-specific)
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Core Concepts

### EditorSession (Domain)

The core aggregate that manages the state of a single editor session:

```typescript
const session = new EditorSession(sessionId, initialText);

// Local change (user edits text document)
const event = session.applyLocalChange(newText);

// Remote change (webview updates document)
const event = session.applyRemoteSync(newText);

// Get current content
const content = session.snapshot();
```

### DomainStoryEditorService (Application)

Orchestrates editor sessions and prevents echo loops:

```typescript
// Register a new session
service.registerSession(sessionId, initialText, viewPort);

// Initialize webview with current content
await service.initialize(sessionId);

// Sync from webview to document
await service.syncFromWebview(sessionId, text);

// Handle document change (with echo prevention)
await service.onDocumentChanged(sessionId, text);

// Cleanup
service.dispose(sessionId);
```

### Ports (Application Layer)

Interfaces that define contracts for infrastructure adapters:

**DocumentPort** - Reading/writing VS Code documents:

```typescript
interface DocumentPort {
    read(documentId: string): Promise<string>;

    write(documentId: string, text: string): Promise<void>;
}
```

**ViewPort** - Displaying content in webview:

```typescript
interface ViewPort {
    display(sessionId: string, text: string): Promise<void>;
}
```

## Sync Guard Mechanism

The library prevents infinite loops between document and webview updates using per-session guards:

1. When webview updates document (`syncFromWebview`):
    - Guard counter increments
    - Document is updated
    - Guard counter decrements

2. When document changes (`onDocumentChanged`):
    - If guard > 0: Skip (it's our own change)
    - If guard = 0: Update webview (user's change)

This replaces the previous global `isChangeDocumentEventBlocked` flag.

## Testing

The library has comprehensive test coverage across all layers (60 tests).

**Run tests**:

```bash
npx nx run domain-story:test
npx nx run domain-story:test --coverage
```

**Test files**:

- `src/domain/EditorSession.spec.ts` - Pure domain logic tests
- `src/application/DomainStoryEditorService.spec.ts` - Orchestration & echo prevention
- `src/infrastructure/VsCodeDocumentPort.spec.ts` - Document I/O tests
- `src/infrastructure/VsCodeViewPort.spec.ts` - Webview communication tests

For detailed testing documentation, see [TESTING.md](./TESTING.md).

## Extending

### Custom Ports

Create your own port implementations for different frameworks:

```typescript
import { ViewPort } from '@egon/domain-story';

export class CustomViewPort implements ViewPort {
    async display(sessionId: string, text: string): Promise<void> {
        // Your custom implementation
    }
}
```

### Additional Events

Extend `EditorSession` to emit more domain events:

```typescript
export class EditorSession {
    // Add new methods for other domain events
    validateContent(text: string): ValidationEvent {
        // Validation logic
    }
}
```

## API Reference

### DomainStoryEditorService

| Method                                          | Description                                   |
|-------------------------------------------------|-----------------------------------------------|
| `registerSession(sessionId, initialText, view)` | Register a new editor session                 |
| `initialize(sessionId)`                         | Send current content to webview               |
| `syncFromWebview(sessionId, text)`              | Update document from webview (with guard)     |
| `onDocumentChanged(sessionId, text)`            | Handle document change (with echo prevention) |
| `dispose(sessionId)`                            | Cleanup session                               |

### EditorSession

| Method                   | Description                        |
|--------------------------|------------------------------------|
| `snapshot()`             | Get current content                |
| `applyLocalChange(text)` | Apply local change (from document) |
| `applyRemoteSync(text)`  | Apply remote change (from webview) |

## License

See LICENSE in the repository root.
