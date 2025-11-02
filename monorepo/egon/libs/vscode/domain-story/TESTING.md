# Testing Guide

## Overview

The domain-story library has comprehensive test coverage across all three architectural layers:
- **Domain Layer**: Pure business logic tests
- **Application Layer**: Use case orchestration tests with mocks
- **Infrastructure Layer**: VS Code adapter tests with mocks

## Running Tests

### Run All Tests

```bash
npx nx run domain-story:test
```

### Run Tests with Coverage

```bash
npx nx run domain-story:test --coverage
```

### Run Tests in Watch Mode

```bash
npx nx run domain-story:test --watch
```

### Run Specific Test File

```bash
npx nx run domain-story:test --testFile=EditorSession.spec.ts
```

## Test Structure

### Domain Layer Tests

**File**: `src/domain/EditorSession.spec.ts`

**Coverage**:
- ✅ Session creation
- ✅ Content snapshots
- ✅ Local changes (user edits document)
- ✅ Remote syncs (webview updates document)
- ✅ Mixed changes
- ✅ Edge cases (empty, multiline, special characters)
- ✅ Immutability guarantees

**Example**:
```typescript
it('should apply local changes', () => {
    const session = new EditorSession('test-id', 'initial');
    const event = session.applyLocalChange('updated');
    
    expect(event.origin).toBe('local');
    expect(session.snapshot()).toBe('updated');
});
```

### Application Layer Tests

**File**: `src/application/DomainStoryEditorService.spec.ts`

**Coverage**:
- ✅ Session registration
- ✅ Initialization
- ✅ Webview → Document sync
- ✅ Document → Webview sync
- ✅ Echo prevention (guard mechanism)
- ✅ Multiple independent sessions
- ✅ Session disposal
- ✅ Edge cases (empty, long content, special chars)

**Key Test - Echo Prevention**:
```typescript
it('should not create echo loop between webview and document', async () => {
    service.registerSession('editor-1', 'initial', mockView);
    mockView.resetCalls('editor-1');

    await service.syncFromWebview('editor-1', 'from webview');
    
    // During sync, guard is active, so onDocumentChanged should not update view
    const displayCallsDuringSync = mockView.getDisplayCalls('editor-1').length;
    expect(displayCallsDuringSync).toBe(0);
});
```

**Mock Implementations**:
```typescript
class MockDocumentPort implements DocumentPort {
    private documents = new Map<string, string>();

    async read(editorId: string): Promise<string> {
        return this.documents.get(editorId) || '';
    }

    async write(editorId: string, text: string): Promise<void> {
        this.documents.set(editorId, text);
    }
}

class MockViewPort implements ViewPort {
    private displayedContent = new Map<string, string[]>();

    async display(editorId: string, text: string): Promise<void> {
        if (!this.displayedContent.has(editorId)) {
            this.displayedContent.set(editorId, []);
        }
        this.displayedContent.get(editorId)!.push(text);
    }

    getDisplayCalls(editorId: string): string[] {
        return this.displayedContent.get(editorId) || [];
    }
}
```

### Infrastructure Layer Tests

**Files**:
- `src/infrastructure/VsCodeDocumentPort.spec.ts`
- `src/infrastructure/VsCodeViewPort.spec.ts`

**Coverage**:
- ✅ VS Code API integration (mocked)
- ✅ Reading documents via `workspace.openTextDocument`
- ✅ Writing documents via `WorkspaceEdit`
- ✅ Posting messages to webview
- ✅ Error handling
- ✅ Special characters and edge cases

**Mocking VS Code**:
```typescript
jest.mock('vscode', () => ({
    Range: jest.fn().mockImplementation((startLine, startChar, endLine, endChar) => ({
        startLine, startChar, endLine, endChar,
    })),
    Uri: {
        file: jest.fn((path) => ({ fsPath: path, path })),
    },
    workspace: {
        openTextDocument: jest.fn(),
        applyEdit: jest.fn(),
    },
    WorkspaceEdit: jest.fn().mockImplementation(() => ({
        replace: jest.fn(),
    })),
}));
```

## Test Statistics

**Total Test Suites**: 4
**Total Tests**: 60
**Coverage**: Domain & Application layers have ~100% coverage

### Test Breakdown

| Layer | Test File | Tests | Focus |
|-------|-----------|-------|-------|
| Domain | `EditorSession.spec.ts` | 13 | Pure domain logic |
| Application | `DomainStoryEditorService.spec.ts` | 27 | Orchestration & guards |
| Infrastructure | `VsCodeDocumentPort.spec.ts` | 10 | Document I/O |
| Infrastructure | `VsCodeViewPort.spec.ts` | 10 | Webview communication |

## Writing New Tests

### Domain Layer

Domain tests should be pure and have no mocks:

```typescript
describe('YourDomainClass', () => {
    it('should do something', () => {
        const instance = new YourDomainClass('id', 'data');
        const result = instance.doSomething();
        expect(result).toBe(expected);
    });
});
```

### Application Layer

Application tests use port mocks:

```typescript
describe('YourService', () => {
    let service: YourService;
    let mockPort: MockPort;

    beforeEach(() => {
        mockPort = new MockPort();
        service = new YourService(mockPort);
    });

    it('should coordinate workflow', async () => {
        await service.doSomething('id', 'data');
        expect(mockPort.wasCalled()).toBe(true);
    });
});
```

### Infrastructure Layer

Infrastructure tests mock framework APIs:

```typescript
jest.mock('vscode', () => ({
    // Mock VS Code APIs
}));

describe('YourAdapter', () => {
    it('should adapt framework call', async () => {
        const adapter = new YourAdapter();
        await adapter.doSomething('id', 'data');
        expect(mockVsCodeApi).toHaveBeenCalled();
    });
});
```

## Continuous Integration

Tests run automatically in CI via:

```bash
npx nx run-many --target test --all --parallel --coverage
```

## Test Configuration

### Jest Config

Located at `jest.config.ts`:

```typescript
export default {
    displayName: 'domain-story',
    preset: '../../../jest.preset.js',
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
    transform: {
        '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../../coverage/libs/vscode/domain-story',
};
```

### TypeScript Config

Located at `tsconfig.spec.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.test.ts"
  ]
}
```

### Test Setup

Located at `src/test-setup.ts`:

```typescript
import 'reflect-metadata';
```

This imports the polyfill required by `tsyringe` for dependency injection.

## Best Practices

### 1. Test Naming

Use descriptive test names:

```typescript
// ✅ Good
it('should prevent echo loop when syncing from webview', async () => { ... });

// ❌ Bad
it('should work', () => { ... });
```

### 2. Arrange-Act-Assert

Structure tests clearly:

```typescript
it('should update content', () => {
    // Arrange
    const session = new EditorSession('id', 'initial');
    
    // Act
    session.applyLocalChange('updated');
    
    // Assert
    expect(session.snapshot()).toBe('updated');
});
```

### 3. Test One Thing

Each test should verify one behavior:

```typescript
// ✅ Good
it('should update content', () => { ... });
it('should emit event', () => { ... });

// ❌ Bad
it('should update content and emit event and log', () => { ... });
```

### 4. Use Mocks for Ports Only

- Domain layer: No mocks
- Application layer: Mock ports only
- Infrastructure layer: Mock framework APIs

### 5. Test Edge Cases

Always test:
- Empty strings
- Null/undefined (if applicable)
- Very long content
- Special characters
- Concurrent operations

## Debugging Tests

### Run Single Test

```bash
npx nx run domain-story:test --testNamePattern="should prevent echo loop"
```

### Enable Verbose Output

```bash
npx nx run domain-story:test --verbose
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "--runInBand",
    "--testPathPattern=domain-story"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Coverage Reports

Coverage reports are generated in:
```
coverage/libs/vscode/domain-story/
```

View coverage:
- `lcov-report/index.html` - HTML report
- `clover.xml` - Clover format (for CI)

## Troubleshooting

### "reflect-metadata" Error

If you see:
```
tsyringe requires a reflect polyfill
```

Ensure `src/test-setup.ts` exists and is referenced in `jest.config.ts`:
```typescript
setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts']
```

### VS Code Mock Issues

If VS Code mocks fail, verify the mock structure matches the actual API:

```typescript
jest.mock('vscode', () => ({
    // Ensure structure matches vscode typings
}));
```

### Import Errors

If imports fail, check:
1. Path aliases in `tsconfig.base.json`
2. Module resolution in `tsconfig.spec.json`
3. Jest `moduleNameMapper` if needed

## Further Reading

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [NX Testing](https://nx.dev/recipes/jest)
