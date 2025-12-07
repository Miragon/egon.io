# EgonClient Technical Documentation

## Overview

`EgonClient` is the primary API for consuming the `@libs/diagram-js-egon-plugin` library. It provides a clean, domain-focused facade that abstracts away diagram-js framework complexity and provides user-friendly event handling.

The client follows **Domain-Driven Design (DDD)** principles with three architectural layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Consumer Code                          │
│              (e.g., egon-modeler-webview)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ uses EgonClient
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Application Layer                         │
│                       EgonClient                            │
│  - Orchestrates use cases                                   │
│  - Maps domain events to user-friendly events               │
└────────────────────────┬────────────────────────────────────┘
                         │ implements Ports
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  - DiagramJsModelerAdapter (ModelerPort)                    │
│  - DiagramJsIconAdapter (IconPort)                          │
│  - Isolates diagram-js dependencies                         │
└────────────────────────┬────────────────────────────────────┘
                         │ delegates to
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          Existing Services (Single Source of Truth)         │
│  - IconDictionaryService (icons storage)                    │
│  - IconSetImportExportService                               │
│  - DomainStoryImportService                                 │
│  - DomainStoryExportService                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

### Basic Usage

```typescript
import {EgonClient} from "@libs/diagram-js-egon-plugin";

const container = document.getElementById("egon-io-container");
const client = new EgonClient({
    container,
    width: "100%",
    height: "100%",
});

// Import a domain story
client.import(domainStoryDocument);

// Subscribe to changes
client.on("story.changed", () => {
    const document = client.export();
    // Sync with editor
});

// Viewport management
client.on("viewport.changed", (viewport) => {
    console.log("Viewport:", viewport);
});

// Icon management
client.loadIcons({
    actors: {Robot: "<svg>...</svg>"},
});

// Clean up
client.destroy();
```

### With Additional Modules

```typescript
import {EgonClient} from "@libs/diagram-js-egon-plugin";
import CustomModule from "./custom-module";

const client = new EgonClient(
    {container, width: "100%", height: "100%"},
    [CustomModule], // Additional modules merged with defaults
);
```

### With Initial Viewport

```typescript
const client = new EgonClient({
    container,
    width: "100%",
    height: "100%",
    viewport: {
        x: 0,
        y: 0,
        width: 1000,
        height: 800,
    },
});
```

---

## Architecture

### Domain Layer

The domain layer contains **pure business logic** with no external dependencies:

#### Viewport Value Object

Immutable value object representing the visible canvas area:

```typescript
class Viewport {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;

    equals(other: Viewport): boolean;

    toPlainObject(): ViewportData;

    static fromPlainObject(data: ViewportData): Viewport;
}

interface ViewportData {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

**Properties:**

- **Immutable**: All instances are frozen, preventing accidental mutations
- **Value semantics**: Equality is based on content, not identity
- **Conversion methods**: Convert to/from plain objects for serialization

#### Icon Types

Type definitions for icon management (no state storage):

```typescript
interface IconMap {
    readonly [name: string]: string; // name -> SVG content
}

interface IconSet {
    readonly actors: IconMap;
    readonly workObjects: IconMap;
}

type IconSetData = {
    readonly actors?: IconMap;
    readonly workObjects?: IconMap;
};

type IconCategory = "actor" | "workObject";
```

**Important**: Icons are **not stored** in the client module. The existing `IconDictionaryService` is the single source of truth for icon storage.

#### Domain Story Document

```typescript
interface DomainStoryDocument {
    readonly domain: DomainConfiguration;
    readonly dst: readonly DomainStoryElement[];
}

interface DomainConfiguration {
    readonly name: string;
    readonly actors: Readonly<Record<string, string>>;
    readonly workObjects: Readonly<Record<string, string>>;
}

type DomainStoryElement = unknown; // Validated during import
```

**Note**: This type is defined independently from `@libs/vscode/domain-story` to avoid coupling between libraries.

#### Domain Events

Internal events that get mapped to user-friendly event names:

```typescript
interface StoryChangedEvent {
    readonly type: "StoryChanged";
}

interface ViewportChangedEvent {
    readonly type: "ViewportChanged";
    readonly viewport: Viewport;
}

interface IconsChangedEvent {
    readonly type: "IconsChanged";
    readonly icons: IconSet;
}
```

### Application Layer

The application layer coordinates use cases and provides the public API:

#### EgonClient - Application Service / Facade

Main entry point for consumers. Orchestrates workflows via port interfaces.

```typescript
export type EgonEventMap = {
    "story.changed": () => void;
    "viewport.changed": (viewport: ViewportData) => void;
    "icons.changed": (icons: IconSet) => void;
};

export class EgonClient {
    constructor(config: EgonClientConfig, additionalModules?: ModuleDeclaration[]);

    // Document operations
    import(document: DomainStoryDocument): void;

    export(): DomainStoryDocument;

    // Event subscription
    on<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void;

    off<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void;

    // Viewport
    getViewport(): ViewportData;

    setViewport(viewport: ViewportData): void;

    // Icon management
    loadIcons(icons: Partial<IconSetData>): void;

    addIcon(category: IconCategory, name: string, svg: string): void;

    removeIcon(category: IconCategory, name: string): void;

    getIcons(): IconSet;

    hasIcon(category: IconCategory, name: string): boolean;

    // Lifecycle
    destroy(): void;
}
```

#### Port Interfaces

Abstract contracts that infrastructure adapters implement:

**ModelerPort** - Diagram operations:

```typescript
interface ModelerPort {
    import(document: DomainStoryDocument): void;

    export(): DomainStoryDocument;

    getViewport(): ViewportData;

    setViewport(viewport: ViewportData): void;

    onStoryChanged(callback: () => void): void;

    onViewportChanged(callback: (viewport: ViewportData) => void): void;

    offStoryChanged(callback: () => void): void;

    offViewportChanged(callback: (viewport: ViewportData) => void): void;

    destroy(): void;
}
```

**IconPort** - Icon management:

```typescript
interface IconPort {
    loadIcons(icons: Partial<IconSetData>): void;

    addIcon(category: IconCategory, name: string, svg: string): void;

    removeIcon(category: IconCategory, name: string): void;

    getIcons(): IconSet;

    hasIcon(category: IconCategory, name: string): boolean;

    onIconsChanged(callback: (icons: IconSet) => void): void;

    offIconsChanged(callback: (icons: IconSet) => void): void;
}
```

#### Configuration

```typescript
interface EgonClientConfig {
    readonly container: HTMLElement;
    readonly width?: string;     // default: "100%"
    readonly height?: string;    // default: "100%"
    readonly viewport?: ViewportData;
}
```

### Infrastructure Layer

Framework-specific implementations that adapt diagram-js to the port interfaces:

#### DiagramJsModelerAdapter

Implements `ModelerPort` using diagram-js:

- Manages diagram-js `Diagram` instance
- Wraps import/export services
- Handles canvas and viewport
- Manages event subscriptions with debouncing
- Tracks callback registry for proper cleanup

**Key responsibilities:**

- Initialize diagram-js with EgonPlugin
- Map modeler events to port callbacks
- Handle CSS initialization for icons
- Debounce frequently-fired events (100ms default)

#### DiagramJsIconAdapter

Implements `IconPort` using existing services:

- Delegates to `IconDictionaryService` (single source of truth)
- Delegates to `IconSetImportExportService`
- Manages icon registration/unregistration
- Fires internal events for icon changes

**Key responsibilities:**

- Load icon configurations using existing services
- Add/remove individual icons
- Query current icon state
- Subscribe/unsubscribe from icon changes

---

## API Reference

### Constructor

```typescript
new EgonClient(
    config
:
EgonClientConfig,
    additionalModules ? : ModuleDeclaration[],
    ports ? : EgonClientPorts
)
```

**Parameters:**

- `config` - Configuration object with container and optional dimensions/viewport
- `additionalModules` - Optional diagram-js modules to load alongside defaults
- `ports` - Optional port injection for testing (bypasses adapter creation)

**Throws**: Error if document is invalid during import

**Note**: The `ports` parameter is primarily for testing. When provided, `EgonClient` uses the injected ports instead of creating real infrastructure adapters. See [Testing](#testing) for details.

### Document Operations

#### import(document: DomainStoryDocument)

Imports a domain story document into the diagram. Clears any existing content before importing.

```typescript
const document: DomainStoryDocument = {
    domain: {
        name: "My Domain",
        actors: {Person: "<svg>...</svg>"},
        workObjects: {Document: "<svg>...</svg>"},
    },
    dst: [],
};

client.import(document);
```

**Effects:**

- Clears existing diagram content
- Registers icons from domain configuration
- Renders story elements on canvas
- Fires `story.changed` event

#### export(): DomainStoryDocument

Exports the current diagram state as a domain story document.

```typescript
const document = client.export();
console.log(document.dst.length); // Number of elements
```

**Returns**: Complete domain story document with current state

### Event Subscription

#### on(event: EgonEventName, callback: Function)

Subscribe to an event.

```typescript
// Story changes
client.on("story.changed", () => {
    const doc = client.export();
    // Persist changes
});

// Viewport changes
client.on("viewport.changed", (viewport: ViewportData) => {
    console.log(`Zoomed to ${viewport.width}x${viewport.height}`);
});

// Icon changes
client.on("icons.changed", (icons: IconSet) => {
    console.log("Icons updated:", icons);
});
```

**Event types:**

- `"story.changed"` - Fired when diagram elements change (debounced 100ms)
- `"viewport.changed"` - Fired when viewport changes (debounced 100ms)
- `"icons.changed"` - Fired when icon set changes (debounced 100ms)

#### off(event: EgonEventName, callback: Function)

Unsubscribe from an event.

```typescript
const handler = () => { /* ... */
};
client.on("story.changed", handler);
// ... later
client.off("story.changed", handler);
```

**Important**: Must pass the exact same callback function reference to unsubscribe.

### Viewport Management

#### getViewport(): ViewportData

Get the current viewport.

```typescript
const viewport = client.getViewport();
console.log(`Position: ${viewport.x}, ${viewport.y}`);
console.log(`Size: ${viewport.width}x${viewport.height}`);
```

**Returns**: Current viewport with x, y, width, height

#### setViewport(viewport: ViewportData)

Set the viewport (pan and zoom to a specific area).

```typescript
client.setViewport({
    x: 100,
    y: 50,
    width: 500,
    height: 400,
});
```

**Parameters:**

- `x`, `y` - Canvas offset
- `width`, `height` - Visible area dimensions

### Icon Management

#### loadIcons(icons: Partial<IconSetData>)

Load a set of icons (actors and/or work objects). Merges with existing icons.

```typescript
// Load both types
client.loadIcons({
    actors: {
        Person: "<svg>...</svg>",
        Robot: "<svg>...</svg>",
    },
    workObjects: {
        Document: "<svg>...</svg>",
        Email: "<svg>...</svg>",
    },
});

// Load only actors
client.loadIcons({
    actors: {CustomActor: "<svg>...</svg>"},
});
```

**Effects:**

- Registers icons in `IconDictionaryService`
- Updates CSS for icon rendering
- Fires `icons.changed` event

#### addIcon(category: IconCategory, name: string, svg: string)

Add a single icon at runtime.

```typescript
client.addIcon("actor", "Robot", "<svg>...</svg>");
client.addIcon("workObject", "Database", "<svg>...</svg>");
```

**Parameters:**

- `category` - `"actor"` or `"workObject"`
- `name` - Icon identifier (e.g., "Person", "Document")
- `svg` - SVG content as string

**Effects:**

- Registers icon in type-specific dictionary
- Generates CSS for rendering
- Fires `icons.changed` event

#### removeIcon(category: IconCategory, name: string)

Remove an icon.

```typescript
client.removeIcon("actor", "Robot");
```

**Parameters:**

- `category` - `"actor"` or `"workObject"`
- `name` - Icon identifier

**Note**: Removing an icon does not affect elements already on the canvas using this icon. They will continue to display until elements are removed or diagram is re-rendered.

#### getIcons(): IconSet

Get all currently registered icons.

```typescript
const icons = client.getIcons();
console.log(Object.keys(icons.actors));     // ["Person", "Robot", ...]
console.log(Object.keys(icons.workObjects)); // ["Document", "Email", ...]
```

**Returns**: Object with `actors` and `workObjects` icon maps

#### hasIcon(category: IconCategory, name: string): boolean

Check if a specific icon is registered.

```typescript
if (client.hasIcon("actor", "Robot")) {
    console.log("Robot icon exists");
}
```

**Parameters:**

- `category` - `"actor"` or `"workObject"`
- `name` - Icon identifier

**Returns**: `true` if icon exists, `false` otherwise

### Lifecycle

#### destroy()

Clean up resources and destroy the client.

```typescript
client.destroy();
// After this, the client instance should not be used
```

**Effects:**

- Clears all event listeners
- Destroys diagram-js instance
- Releases DOM references
- Cleans up callback registry

---

## Icon Management Patterns

### Pattern 1: Icons in Document (Default)

Most common pattern - icons are included in the story document:

```typescript
const document: DomainStoryDocument = {
    domain: {
        name: "My Domain",
        actors: {Person: "<svg>...</svg>"},
        workObjects: {Document: "<svg>...</svg>"},
    },
    dst: [ /* story elements */],
};

client.import(document);
// Icons are automatically registered
```

**When to use**: When icons are part of the story file

### Pattern 2: Pre-load Icons Before Import

Load custom icons before importing a story:

```typescript
// Load workspace-specific icons
client.loadIcons({
    actors: {CustomActor: "<svg>...</svg>"},
});

// Now import story that uses these icons
client.import(story);
```

**When to use:**

- Loading icons from `.egon/icons/` folder
- Using shared icon sets across multiple stories
- Dynamically loading icons based on configuration

### Pattern 3: Dynamic Icon Addition

Add icons one at a time as they're needed:

```typescript
client.addIcon("actor", "System", "<svg>...</svg>");
client.addIcon("workObject", "Database", "<svg>...</svg>");

// Now create elements using these icons
```

**When to use:**

- Runtime icon generation
- User-uploaded custom icons
- Lazy-loading icon libraries

### Pattern 4: Icon Updates

Update existing icons by loading with same name:

```typescript
// Get current icons
const icons = client.getIcons();

// Modify and reload
icons.actors["Person"] = "<svg>...new content...</svg>";
client.loadIcons(icons);
```

**When to use**: Updating icon definitions dynamically

### Pattern 5: Icon Validation

Check before using icons:

```typescript
// Check if icon exists
if (!client.hasIcon("actor", "Person")) {
    client.addIcon("actor", "Person", defaultPersonSvg);
}

// Get all available icons for UI
const icons = client.getIcons();
const actorNames = Object.keys(icons.actors);
```

**When to use**: Conditional icon registration, building UI

---

## Event Handling

### Event Flow

```
User Action (drag, edit, etc.)
         ↓
Diagram-js fires internal event
(e.g., "commandStack.changed")
         ↓
Adapter receives event
         ↓
Debounce (100ms default)
         ↓
Adapter fires user-friendly event
(e.g., "story.changed")
         ↓
Consumer callback executes
```

### Debouncing

All events are debounced to prevent excessive firing:

- **Default delay**: 100ms
- **When**: Multiple rapid changes (e.g., dragging)
- **Effect**: Single callback invocation per batch of changes

```typescript
// Even if user rapidly makes 10 changes,
// "story.changed" fires only once (100ms after last change)
client.on("story.changed", () => {
    // This runs once, not 10 times
    persistence.save(client.export());
});
```

### Event Best Practices

1. **Store callback references** for unsubscribing:

```typescript
// Good
const handleChange = () => { /* ... */
};
client.on("story.changed", handleChange);
client.off("story.changed", handleChange);

// Bad - can't unsubscribe
client.on("story.changed", () => { /* ... */
});
```

2. **Unsubscribe when done**:

```typescript
const unsubscribe = () => {
    client.off("story.changed", handleChange);
    client.off("viewport.changed", handleViewport);
};

// In cleanup/destruction
unsubscribe();
```

3. **Keep handlers lightweight**:

```typescript
// Good - delegate to another handler
client.on("story.changed", () => persistChanges());

// Bad - expensive operation in event handler
client.on("story.changed", () => {
    // Don't validate entire document here
    document = client.export();
    for (let el of document.dst) {
        // expensive validation...
    }
});
```

---

## Type Definitions

### Complete Type Reference

```typescript
// Main API
export class EgonClient {
    constructor(
        config: EgonClientConfig,
        additionalModules?: ModuleDeclaration[],
        ports?: EgonClientPorts
    );

    import(document: DomainStoryDocument): void;

    export(): DomainStoryDocument;

    on<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void;

    off<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void;

    getViewport(): ViewportData;

    setViewport(viewport: ViewportData): void;

    loadIcons(icons: Partial<IconSetData>): void;

    addIcon(category: IconCategory, name: string, svg: string): void;

    removeIcon(category: IconCategory, name: string): void;

    getIcons(): IconSet;

    hasIcon(category: IconCategory, name: string): boolean;

    destroy(): void;
}

// Configuration
export interface EgonClientConfig {
    readonly container: HTMLElement;
    readonly width?: string;
    readonly height?: string;
    readonly viewport?: ViewportData;
}

// Port injection for testing
export interface EgonClientPorts {
    modelerPort: ModelerPort;
    iconPort: IconPort;
}

// Events
export type EgonEventMap = {
    "story.changed": () => void;
    "viewport.changed": (viewport: ViewportData) => void;
    "icons.changed": (icons: IconSet) => void;
};
export type EgonEventName = keyof EgonEventMap;

// Domain types
export interface DomainStoryDocument {
    readonly domain: DomainConfiguration;
    readonly dst: readonly DomainStoryElement[];
}

export interface DomainConfiguration {
    readonly name: string;
    readonly actors: Readonly<Record<string, string>>;
    readonly workObjects: Readonly<Record<string, string>>;
}

export type ViewportData = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export interface IconSet {
    readonly actors: IconMap;
    readonly workObjects: IconMap;
}

export type IconSetData = {
    readonly actors?: IconMap;
    readonly workObjects?: IconMap;
};

export type IconCategory = "actor" | "workObject";

export interface IconMap {
    readonly [name: string]: string;
}
```

---

## Implementation Details

### Callback Registry

The adapters maintain a callback registry to track wrapped callbacks:

```typescript
private readonly
callbackRegistry: Map<Function, Function> = new Map();
```

**Why?** Diagram-js events are wrapped with debouncing. When unsubscribing, we need to find the wrapped version to properly remove it.

```typescript
on(event, callback)
{
    const wrapped = debounce(callback);
    this.callbackRegistry.set(callback, wrapped);
    this.eventBus.on(event, wrapped);
}

off(event, callback)
{
    const wrapped = this.callbackRegistry.get(callback);
    if (wrapped) {
        this.eventBus.off(event, wrapped);
        this.callbackRegistry.delete(callback);
    }
}
```

### CSS Injection

Icon rendering requires a `<style>` element in the container:

```typescript
private
initializeContainer(container
:
HTMLElement
):
void {
    if(!
container.querySelector("#iconsCss")
)
{
    const style = document.createElement("style");
    style.id = "iconsCss";
    container.appendChild(style);
}
}
```

When icons are added, CSS rules are injected:

```css
.icon-domain-story-person::before {
    mask-image: url('data:image/svg+xml;base64,...');
}
```

### Single Diagram Instance

Each `EgonClient` manages a single diagram-js instance. Multiple clients require separate containers:

```typescript
// Create two separate modelers
const client1 = new EgonClient({container: div1});
const client2 = new EgonClient({container: div2});

// They are independent
client1.import(doc1);
client2.import(doc2);
```

---

## Design Principles

### 1. Separation of Concerns

- **Domain layer**: Business logic only
- **Application layer**: Use case coordination
- **Infrastructure layer**: Framework details

### 2. Ports and Adapters

Depend on abstractions (ports), not implementations:

```typescript
// EgonClient depends on port interfaces, not concrete adapters
export class EgonClient {
    private readonly modelerPort: ModelerPort;
    private readonly iconPort: IconPort;

    constructor(config: EgonClientConfig, additionalModules?: ModuleDeclaration[], ports?: EgonClientPorts) {
        if (ports) {
            // Use injected ports (for testing)
            this.modelerPort = ports.modelerPort;
            this.iconPort = ports.iconPort;
        } else {
            // Create infrastructure adapters (production)
            // Uses dynamic imports to avoid module resolution in tests
        }
    }
}
```

### 3. Single Responsibility

Each class has one reason to change:

- `Viewport` - Represents canvas area
- `EgonClient` - Coordinates use cases
- `DiagramJsModelerAdapter` - Integrates diagram-js
- `DiagramJsIconAdapter` - Manages icons

### 4. Immutability

Value objects are immutable:

```typescript
const viewport = new Viewport(0, 0, 100, 100);
Object.isFrozen(viewport); // true
```

### 5. Event Abstraction

Hide diagram-js event names from consumers:

```typescript
// Internal: "commandStack.changed"
// External: "story.changed"
```

---

## Common Patterns

### Setup and Teardown

```typescript
export function setupModeler(container: HTMLElement) {
    const client = new EgonClient({container});

    // Load initial story
    client.import(getInitialStory());

    // Subscribe to changes
    client.on("story.changed", () => {
        persistence.save(client.export());
    });

    // Expose for cleanup
    return {
        client,
        destroy: () => {
            client.destroy();
        },
    };
}
```

### State Synchronization

```typescript
class EditorState {
    private client: EgonClient;
    private document: DomainStoryDocument;

    constructor(client: EgonClient) {
        this.client = client;
        this.document = client.export();

        this.client.on("story.changed", () => {
            this.document = this.client.export();
            this.notifySubscribers();
        });
    }

    getDocument(): DomainStoryDocument {
        return this.document;
    }
}
```

### Icon Registry Builder

```typescript
async function loadWorkspaceIcons(workspacePath: string) {
    const iconDir = `${workspacePath}/.egon/icons`;
    const icons = {
        actors: {} as Record<string, string>,
        workObjects: {} as Record<string, string>,
    };

    const files = await fs.readdir(iconDir);
    for (const file of files) {
        const svg = await fs.readFile(`${iconDir}/${file}`, "utf-8");
        const [category, name] = file.replace(".svg", "").split("_");
        if (category === "actor" || category === "workObject") {
            icons[category][name] = svg;
        }
    }

    return icons;
}
```

---

## Troubleshooting

### Icons Not Rendering

**Problem**: Added icons but they don't appear.

**Check**:

1. Icon is registered: `client.hasIcon("actor", "IconName")`
2. Icon exists in current set: `Object.keys(client.getIcons().actors)`
3. Elements using icon exist on canvas

**Solution**:

```typescript
// Ensure icons are registered
client.loadIcons({
    actors: {Person: mySvg},
});

// Create element that uses the icon
```

### Events Not Firing

**Problem**: Callback never invoked.

**Check**:

1. Correct event name: `"story.changed"` not `"storyChanged"`
2. Correct callback signature
3. Not unsubscribed accidentally

**Solution**:

```typescript
// Use correct names and signatures
client.on("story.changed", () => { /* no params */
});
client.on("viewport.changed", (viewport: ViewportData) => {
});
```

### Memory Leaks

**Problem**: Application memory grows over time.

**Check**:

1. Calling `client.destroy()` on cleanup
2. Unsubscribing from events: `client.off(...)`
3. Not creating multiple instances unnecessarily

**Solution**:

```typescript
const client = new EgonClient({container});

// Cleanup when done
return () => {
    client.destroy();
};
```

---

## Testing

### Unit Testing with Port Injection

`EgonClient` supports constructor injection for testing. Instead of creating real diagram-js adapters, you can provide mock ports:

```typescript
import {describe, it, expect, vi} from "vitest";
import {EgonClient} from "@libs/diagram-js-egon-plugin";
import type {ModelerPort, IconPort} from "@libs/diagram-js-egon-plugin";

function createMockPorts() {
    const mockModelerPort: ModelerPort = {
        import: vi.fn(),
        export: vi.fn(),
        getViewport: vi.fn().mockReturnValue({x: 0, y: 0, width: 100, height: 100}),
        setViewport: vi.fn(),
        onStoryChanged: vi.fn(),
        onViewportChanged: vi.fn(),
        offStoryChanged: vi.fn(),
        offViewportChanged: vi.fn(),
        destroy: vi.fn(),
    };

    const mockIconPort: IconPort = {
        loadIcons: vi.fn(),
        addIcon: vi.fn(),
        removeIcon: vi.fn(),
        getIcons: vi.fn().mockReturnValue({actors: {}, workObjects: {}}),
        hasIcon: vi.fn(),
        onIconsChanged: vi.fn(),
        offIconsChanged: vi.fn(),
    };

    return {mockModelerPort, mockIconPort};
}

describe("EgonClient", () => {
    it("should delegate import to modeler port", () => {
        const container = document.createElement("div");
        const {mockModelerPort, mockIconPort} = createMockPorts();

        // Use constructor injection to provide mock ports
        const client = new EgonClient(
            {container},
            [], // No additional modules
            {modelerPort: mockModelerPort, iconPort: mockIconPort}
        );

        const doc = {domain: {name: "", actors: {}, workObjects: {}}, dst: []};
        client.import(doc);

        expect(mockModelerPort.import).toHaveBeenCalledWith(doc);
    });
});
```

### Benefits of Port Injection

1. **No DOM dependencies** - Tests run without jsdom complexities
2. **No diagram-js initialization** - Avoids ESM/CJS module issues
3. **Fast execution** - No real canvas rendering
4. **Focused testing** - Test EgonClient logic in isolation

### Test Framework

The library uses **Vitest** for testing, which provides native ESM support and avoids the module resolution issues common with Jest + diagram-js.

```bash
# Run tests
yarn workspace @egon/diagram-js-egon-plugin test

# Run with coverage
yarn workspace @egon/diagram-js-egon-plugin test:coverage

# Watch mode
yarn workspace @egon/diagram-js-egon-plugin test:watch
```

---

## See Also

- [Usage Examples](./Usage.md) - API usage reference
- [Development](../Development.md) - Contributing guidelines
- [Custom Icons](../CustomIcons.md) - Icon system details
