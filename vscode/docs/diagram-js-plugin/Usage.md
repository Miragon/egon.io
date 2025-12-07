# EgonClient API Design

This document describes the desired API for `@libs/diagram-js-egon-plugin` and provides implementation guidance.

## Design Goals

1. **Multi-instance support** - Allow multiple `EgonClient` instances for future use cases
2. **No cross-library dependencies** - `@libs/diagram-js-egon-plugin` and `@libs/vscode/domain-story` remain independent; each defines its own types
3. **User-friendly event names** - Abstract away diagram-js internals (no "commandStack" terminology)
4. **Extensible module system** - Default modules always loaded; additional modules optional
5. **Flexible icon management** - Icons can be loaded with the story or added independently at any time
6. **Domain-Driven Design (DDD)** - Apply DDD principles to the new client module as a foundation for future refactoring of the entire library

---

## API Usage

### Basic Usage

```typescript
import { EgonClient } from "@libs/diagram-js-egon-plugin";

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
    // Sync document to VS Code extension
});

// Subscribe to viewport changes
client.on("viewport.changed", (viewport) => {
    console.log("Viewport:", viewport);
});

// Clean up when done
client.destroy();
```

### With Additional Modules

```typescript
import { EgonClient } from "@libs/diagram-js-egon-plugin";
import CustomModule from "./custom-module";

const client = new EgonClient(
    {
        container: document.getElementById("egon-io-container"),
        width: "100%",
        height: "100%",
    },
    [CustomModule], // Additional modules are merged with default modules
);
```

### With Initial Viewport

```typescript
const client = new EgonClient({
    container: document.getElementById("egon-io-container"),
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

### Icon Management

Icons can be managed in two ways: loaded automatically with the story document, or added independently at runtime.

#### Option 1: Icons Included in Document (Default)

When importing a `DomainStoryDocument`, icons are automatically loaded from the `domain` section:

```typescript
const document: DomainStoryDocument = {
    domain: {
        name: "My Domain",
        actors: {
            Person: "<svg>...</svg>",
            System: "<svg>...</svg>",
        },
        workObjects: {
            Document: "<svg>...</svg>",
            Email: "<svg>...</svg>",
        },
    },
    dst: [
        // ... story elements
    ],
};

// Icons are automatically registered when importing
client.import(document);
```

#### Option 2: Load Icons Independently

Load icons at any time, before or after importing a story. This is useful for:
- Pre-loading a custom icon set before the story is available
- Adding workspace-specific icons (e.g., from `.egon/icons/` folder)
- Dynamically adding icons based on user actions

```typescript
// Load icons before importing a story
client.loadIcons({
    actors: {
        CustomActor: "<svg>...</svg>",
    },
    workObjects: {
        CustomWorkObject: "<svg>...</svg>",
    },
});

// Now import a story that uses these icons
client.import(storyWithoutIconDefinitions);
```

#### Option 3: Add Individual Icons

Add a single icon at runtime:

```typescript
// Add an actor icon
client.addIcon("actor", "Robot", "<svg>...</svg>");

// Add a work object icon
client.addIcon("workObject", "Database", "<svg>...</svg>");
```

#### Option 4: Remove Icons

Remove icons that are no longer needed:

```typescript
// Remove a specific icon
client.removeIcon("actor", "Robot");

// Note: Removing an icon does not affect elements already on the canvas
// that use this icon. They will continue to display until the diagram is
// re-rendered or the elements are removed.
```

#### Get Current Icons

Retrieve the currently registered icons:

```typescript
// Get all icons
const icons = client.getIcons();
console.log(icons.actors);     // { Person: "<svg>...", ... }
console.log(icons.workObjects); // { Document: "<svg>...", ... }

// Check if a specific icon exists
const hasRobot = client.hasIcon("actor", "Robot");
```

---

## Type Definitions

### EgonClientConfig

```typescript
interface EgonClientConfig {
    /** The HTML element to render the diagram into */
    container: HTMLElement;
    /** Width of the diagram canvas (default: "100%") */
    width?: string;
    /** Height of the diagram canvas (default: "100%") */
    height?: string;
    /** Initial viewport configuration */
    viewport?: Viewport;
}

interface Viewport {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

### DomainStoryDocument

This type is defined within `@libs/diagram-js-egon-plugin` independently from `@libs/vscode/domain-story`.

```typescript
interface IconMap {
    [name: string]: string;
}

interface DomainConfiguration {
    name: string;
    actors: IconMap;
    workObjects: IconMap;
}

interface DomainStoryDocument {
    domain: DomainConfiguration;
    dst: DomainStoryElement[];
}

// Element types for the dst array
type DomainStoryElement = ActorElement | WorkObjectElement | ActivityElement | GroupElement;

interface BaseElement {
    id: string;
    type: string;
    name: string;
    pickedColor?: string;
}

interface ActorElement extends BaseElement {
    type: `domainStory:actor${string}`;
    x: number;
    y: number;
}

interface WorkObjectElement extends BaseElement {
    type: `domainStory:workObject${string}`;
    x: number;
    y: number;
}

interface ActivityElement extends BaseElement {
    type: "domainStory:activity";
    number: number;
    source: string;
    target: string;
    waypoints: Waypoint[];
}

interface GroupElement extends BaseElement {
    type: "domainStory:group";
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Waypoint {
    x: number;
    y: number;
    original?: { x: number; y: number };
}
```

### Event Types

```typescript
type EgonEventMap = {
    /** Fired when the story content changes (elements added, removed, or modified) */
    "story.changed": () => void;
    /** Fired when the viewport (zoom/pan) changes */
    "viewport.changed": (viewport: Viewport) => void;
    /** Fired when icons are added, removed, or updated */
    "icons.changed": (icons: IconSet) => void;
};

type EgonEventName = keyof EgonEventMap;
```

### Icon Types

```typescript
/** Map of icon names to SVG content */
interface IconMap {
    [name: string]: string;
}

/** A set of icons for actors and work objects */
interface IconSet {
    actors: IconMap;
    workObjects: IconMap;
}

/** Icon category for adding/removing individual icons */
type IconCategory = "actor" | "workObject";
```

---

## EgonClient Class

### Constructor

```typescript
class EgonClient {
    /**
     * Creates a new EgonClient instance.
     *
     * @param config - Configuration options for the client
     * @param additionalModules - Optional array of additional diagram-js modules
     */
    constructor(config: EgonClientConfig, additionalModules?: Module[]);
}
```

### Methods

```typescript
class EgonClient {
    /**
     * Import a domain story document into the diagram.
     * Clears any existing content before importing.
     *
     * @param document - The domain story document to import
     * @throws Error if the document is invalid
     */
    import(document: DomainStoryDocument): void;

    /**
     * Export the current diagram state as a domain story document.
     *
     * @returns The current domain story document
     */
    export(): DomainStoryDocument;

    /**
     * Subscribe to an event.
     *
     * @param event - The event name
     * @param callback - The callback function
     */
    on<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void;

    /**
     * Unsubscribe from an event.
     *
     * @param event - The event name
     * @param callback - The callback function to remove
     */
    off<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void;

    /**
     * Get the current viewport.
     *
     * @returns The current viewport
     */
    getViewport(): Viewport;

    /**
     * Set the viewport.
     *
     * @param viewport - The viewport to set
     */
    setViewport(viewport: Viewport): void;

    /**
     * Destroy the client and clean up resources.
     * After calling this method, the client instance should not be used.
     */
    destroy(): void;

    // --- Icon Management Methods ---

    /**
     * Load a set of icons (actors and/or work objects).
     * Merges with existing icons; existing icons with the same name are overwritten.
     *
     * @param icons - The icon set to load
     */
    loadIcons(icons: Partial<IconSet>): void;

    /**
     * Add a single icon.
     *
     * @param category - The icon category ("actor" or "workObject")
     * @param name - The icon name (e.g., "Person", "Document")
     * @param svg - The SVG content as a string
     */
    addIcon(category: IconCategory, name: string, svg: string): void;

    /**
     * Remove a single icon.
     * Note: Does not affect elements already on the canvas using this icon.
     *
     * @param category - The icon category ("actor" or "workObject")
     * @param name - The icon name to remove
     */
    removeIcon(category: IconCategory, name: string): void;

    /**
     * Get all currently registered icons.
     *
     * @returns The current icon set
     */
    getIcons(): IconSet;

    /**
     * Check if a specific icon is registered.
     *
     * @param category - The icon category ("actor" or "workObject")
     * @param name - The icon name to check
     * @returns True if the icon exists
     */
    hasIcon(category: IconCategory, name: string): boolean;
}
```

---

## Implementation Guide

### DDD Architecture Overview

The new client module follows Domain-Driven Design principles with three layers:

```
┌─────────────────────────────────────────────────────────────┐
│                      Consumer Code                          │
│              (e.g., egon-modeler-webview)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ uses EgonClient
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Application Layer                         │
│                       (client/)                             │
│  ┌──────────────────────────────────────────────┐          │
│  │              EgonClient                       │          │
│  │  (Application Service / Facade)               │          │
│  │  - Orchestrates use cases                     │          │
│  │  - Maps domain events to user-friendly events │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   ModelerPort    │         │   IconPort       │         │
│  │   (Interface)    │         │   (Interface)    │         │
│  └──────────────────┘         └──────────────────┘         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ implements Ports
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Infrastructure Layer                       │
│                       (client/)                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │DiagramJsModeler  │         │DiagramJsIconAdapter│        │
│  │    Adapter       │         │  (Delegates to    │         │
│  │(Adapts diagram-js)│        │   existing svc)   │         │
│  └──────────────────┘         └────────┬─────────┘         │
└────────────────────────┬───────────────┼────────────────────┘
                         │               │
                         │ uses          │ delegates to
                         │               │
┌────────────────────────▼───────────────▼────────────────────┐
│              Domain Layer (client/) - Types Only            │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Viewport       │  │  IconSet        │                  │
│  │  (Value Object) │  │  (Type/DTO)     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │DomainStory      │  │  IconCategory   │                  │
│  │  Document       │  │  (Type)         │                  │
│  │(Value Object)   │  └─────────────────┘                  │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│          Existing Services (SINGLE SOURCE OF TRUTH)         │
│                   (icon-set-config/)                        │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │         IconDictionaryService                 │          │
│  │  - Stores icons in memory (customIcons)       │          │
│  │  - Manages actor/workObject dictionaries      │          │
│  │  - Generates CSS for icons                    │          │
│  └──────────────────────────────────────────────┘          │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │      IconSetImportExportService               │          │
│  │  - Creates icon configurations                │          │
│  │  - Loads configurations into dictionary       │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Domain Layer** - Pure business logic, no external dependencies:
- Value Objects: `Viewport`, `DomainStoryDocument`
- Type Definitions: `IconSet`, `IconCategory` (interfaces only, no state)
- Note: Icons are **not stored** in the domain layer. The existing `IconDictionaryService` is the single source of truth for icon storage.

**Application Layer** - Use case orchestration:
- `EgonClient`: Application service / facade that coordinates workflows
- Port interfaces: `ModelerPort`, `IconPort` (contracts for infrastructure)
- Event mapping: Translates internal events to user-friendly event names

**Infrastructure Layer** - Framework-specific implementations:
- `DiagramJsModelerAdapter`: Adapts the diagram-js `Diagram` class
- `DiagramJsIconAdapter`: Adapts `IconDictionaryService` and `IconSetImportExportService` (single source of truth for icons)

### File Structure

```
libs/diagram-js-egon-plugin/src/
├── index.ts                           # Public exports
├── plugin.ts                          # Existing module aggregation (unchanged)
│
├── client/                            # New DDD-structured module
│   ├── index.ts                       # Public exports for client module
│   │
│   ├── domain/                        # Domain Layer (types & value objects only)
│   │   ├── index.ts
│   │   ├── model/
│   │   │   ├── DomainStoryDocument.ts # Value Object interface
│   │   │   ├── Viewport.ts            # Value Object
│   │   │   └── IconTypes.ts           # Icon type definitions (NO state storage)
│   │   └── events/
│   │       └── DomainEvents.ts        # Domain event definitions
│   │
│   ├── application/                   # Application Layer
│   │   ├── index.ts
│   │   ├── EgonClient.ts              # Application Service (Facade)
│   │   ├── EgonClientConfig.ts        # Configuration types
│   │   └── ports/
│   │       ├── ModelerPort.ts         # Interface for diagram operations
│   │       └── IconPort.ts            # Interface for icon operations
│   │
│   └── infrastructure/                # Infrastructure Layer
│       ├── index.ts
│       ├── DiagramJsModelerAdapter.ts # Implements ModelerPort
│       └── DiagramJsIconAdapter.ts    # Implements IconPort (delegates to IconDictionaryService)
│
├── icon-set-config/                   # Existing icon services (SINGLE SOURCE OF TRUTH)
│   └── service/
│       ├── IconDictionaryService.ts   # Stores icons in memory
│       └── IconSetImportExportService.ts
├── domain/                            # Existing domain entities (unchanged)
├── export/
├── import/
├── features/
└── ...
```

**Important**: The `client/` module does **not** store icons. All icon operations delegate to the existing `IconDictionaryService` through the `DiagramJsIconAdapter`. This ensures:
- Single source of truth for icon storage
- No memory duplication
- No synchronization issues between client and diagram-js services

### Step 1: Define Domain Layer (Types & Value Objects Only)

The domain layer contains **only types and value objects** - no stateful classes for icons.
Icons are stored in the existing `IconDictionaryService` (single source of truth).

Create `src/client/domain/model/Viewport.ts`:

```typescript
/**
 * Value Object representing the visible area of the canvas.
 * Immutable - create a new instance for changes.
 */
export class Viewport {
    constructor(
        readonly x: number,
        readonly y: number,
        readonly width: number,
        readonly height: number,
    ) {
        Object.freeze(this);
    }

    equals(other: Viewport): boolean {
        return (
            this.x === other.x &&
            this.y === other.y &&
            this.width === other.width &&
            this.height === other.height
        );
    }

    toPlainObject(): ViewportData {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }

    static fromPlainObject(data: ViewportData): Viewport {
        return new Viewport(data.x, data.y, data.width, data.height);
    }
}

export interface ViewportData {
    x: number;
    y: number;
    width: number;
    height: number;
}
```

Create `src/client/domain/model/IconTypes.ts`:

```typescript
/**
 * Type definitions for icons.
 *
 * IMPORTANT: These are ONLY type definitions (interfaces).
 * Icons are NOT stored in the client module.
 * The existing IconDictionaryService is the single source of truth.
 */

/** Map of icon names to SVG content */
export interface IconMap {
    readonly [name: string]: string;
}

/**
 * A set of icons for actors and work objects.
 * This is a Data Transfer Object (DTO) - it does not store state.
 */
export interface IconSet {
    readonly actors: IconMap;
    readonly workObjects: IconMap;
}

/** Partial icon set for loading operations */
export type IconSetData = {
    readonly actors?: IconMap;
    readonly workObjects?: IconMap;
};

/** Icon category for identifying icon type */
export type IconCategory = "actor" | "workObject";
```

Create `src/client/domain/model/DomainStoryDocument.ts`:

```typescript
/**
 * Value Object representing a complete domain story document.
 * This type is defined independently from @libs/vscode/domain-story
 * to avoid coupling between libraries.
 */
export interface DomainStoryDocument {
    readonly domain: DomainConfiguration;
    readonly dst: readonly DomainStoryElement[];
}

export interface DomainConfiguration {
    readonly name: string;
    readonly actors: Readonly<Record<string, string>>;
    readonly workObjects: Readonly<Record<string, string>>;
}

export type DomainStoryElement = unknown; // Validated during import
```

### Step 2: Define Domain Events

Create `src/client/domain/events/DomainEvents.ts`:

```typescript
import { Viewport } from "../model/Viewport";
import { IconSet } from "../model/IconTypes";

/**
 * Domain events emitted by the modeler.
 * These are internal events that get mapped to user-friendly event names.
 */
export interface StoryChangedEvent {
    readonly type: "StoryChanged";
}

export interface ViewportChangedEvent {
    readonly type: "ViewportChanged";
    readonly viewport: Viewport;
}

export interface IconsChangedEvent {
    readonly type: "IconsChanged";
    readonly icons: IconSet;
}

export type DomainEvent = StoryChangedEvent | ViewportChangedEvent | IconsChangedEvent;
```

### Step 3: Define Application Layer Ports

Create `src/client/application/ports/ModelerPort.ts`:

```typescript
import { DomainStoryDocument } from "../../domain/model/DomainStoryDocument";
import { Viewport, ViewportData } from "../../domain/model/Viewport";

/**
 * Port interface for diagram modeler operations.
 * Infrastructure layer provides the concrete implementation.
 */
export interface ModelerPort {
    /**
     * Import a domain story document into the diagram.
     */
    import(document: DomainStoryDocument): void;

    /**
     * Export the current diagram state.
     */
    export(): DomainStoryDocument;

    /**
     * Get the current viewport.
     */
    getViewport(): ViewportData;

    /**
     * Set the viewport.
     */
    setViewport(viewport: ViewportData): void;

    /**
     * Subscribe to internal diagram events.
     */
    onStoryChanged(callback: () => void): void;
    onViewportChanged(callback: (viewport: ViewportData) => void): void;

    /**
     * Unsubscribe from events.
     */
    offStoryChanged(callback: () => void): void;
    offViewportChanged(callback: (viewport: ViewportData) => void): void;

    /**
     * Clean up resources.
     */
    destroy(): void;
}
```

Create `src/client/application/ports/IconPort.ts`:

```typescript
import { IconSet, IconSetData, IconCategory } from "../../domain/model/IconTypes";

/**
 * Port interface for icon management operations.
 * Infrastructure layer provides the concrete implementation.
 */
export interface IconPort {
    /**
     * Load a set of icons into the modeler.
     */
    loadIcons(icons: Partial<IconSetData>): void;

    /**
     * Add a single icon.
     */
    addIcon(category: IconCategory, name: string, svg: string): void;

    /**
     * Remove an icon.
     */
    removeIcon(category: IconCategory, name: string): void;

    /**
     * Get all currently registered icons.
     */
    getIcons(): IconSet;

    /**
     * Check if an icon exists.
     */
    hasIcon(category: IconCategory, name: string): boolean;

    /**
     * Subscribe to icon changes.
     */
    onIconsChanged(callback: (icons: IconSet) => void): void;

    /**
     * Unsubscribe from icon changes.
     */
    offIconsChanged(callback: (icons: IconSet) => void): void;
}
```

### Step 4: Define Configuration Types

Create `src/client/application/EgonClientConfig.ts`:

```typescript
import { ViewportData } from "../domain/model/Viewport";

/**
 * Configuration options for creating an EgonClient instance.
 */
export interface EgonClientConfig {
    /** The HTML element to render the diagram into */
    readonly container: HTMLElement;
    /** Width of the diagram canvas (default: "100%") */
    readonly width?: string;
    /** Height of the diagram canvas (default: "100%") */
    readonly height?: string;
    /** Initial viewport configuration */
    readonly viewport?: ViewportData;
}
```

### Step 5: Implement Infrastructure Layer Adapters

Create `src/client/infrastructure/DiagramJsModelerAdapter.ts`:

```typescript
import Diagram from "diagram-js";
import type { ModuleDeclaration } from "didi";
import type Canvas from "diagram-js/lib/core/Canvas";
import type EventBus from "diagram-js/lib/core/EventBus";
import type ElementFactory from "diagram-js/lib/core/ElementFactory";

import EgonPlugin from "../../plugin";
import { DomainStoryImportService } from "../../import/service/DomainStoryImportService";
import { DomainStoryExportService } from "../../export/service/DomainStoryExportService";

import { ModelerPort } from "../application/ports/ModelerPort";
import { DomainStoryDocument } from "../domain/model/DomainStoryDocument";
import { ViewportData } from "../domain/model/Viewport";

const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Infrastructure adapter that implements ModelerPort using diagram-js.
 * This adapter isolates all diagram-js framework dependencies.
 */
export class DiagramJsModelerAdapter implements ModelerPort {
    private readonly diagram: Diagram;
    private readonly eventBus: EventBus;
    private readonly canvas: Canvas;
    private readonly callbackRegistry: Map<Function, Function> = new Map();

    constructor(
        container: HTMLElement,
        width: string,
        height: string,
        additionalModules: ModuleDeclaration[] = [],
    ) {
        this.initializeContainer(container);

        this.diagram = new Diagram({
            container,
            width,
            height,
            modules: [EgonPlugin, ...additionalModules],
        });

        this.eventBus = this.diagram.get<EventBus>("eventBus");
        this.canvas = this.diagram.get<Canvas>("canvas");

        this.initializeRootElement();
    }

    import(document: DomainStoryDocument): void {
        const importService = this.diagram.get<DomainStoryImportService>(
            "domainStoryImportService",
        );
        importService.import(JSON.stringify(document));
    }

    export(): DomainStoryDocument {
        const exportService = this.diagram.get<DomainStoryExportService>(
            "domainStoryExportService",
        );
        return JSON.parse(exportService.export());
    }

    getViewport(): ViewportData {
        return this.canvas.viewbox();
    }

    setViewport(viewport: ViewportData): void {
        this.canvas.viewbox(viewport);
    }

    onStoryChanged(callback: () => void): void {
        const wrapped = this.createDebouncedCallback(() => callback());
        this.callbackRegistry.set(callback, wrapped);
        this.eventBus.on("commandStack.changed", wrapped);
    }

    onViewportChanged(callback: (viewport: ViewportData) => void): void {
        const wrapped = this.createDebouncedCallback((event: any) => callback(event.viewbox));
        this.callbackRegistry.set(callback, wrapped);
        this.eventBus.on("canvas.viewbox.changed", wrapped);
    }

    offStoryChanged(callback: () => void): void {
        const wrapped = this.callbackRegistry.get(callback);
        if (wrapped) {
            this.eventBus.off("commandStack.changed", wrapped);
            this.callbackRegistry.delete(callback);
        }
    }

    offViewportChanged(callback: (viewport: ViewportData) => void): void {
        const wrapped = this.callbackRegistry.get(callback);
        if (wrapped) {
            this.eventBus.off("canvas.viewbox.changed", wrapped);
            this.callbackRegistry.delete(callback);
        }
    }

    destroy(): void {
        this.callbackRegistry.clear();
        this.diagram.destroy();
    }

    /** Expose diagram instance for IconAdapter to access services */
    getDiagram(): Diagram {
        return this.diagram;
    }

    private initializeContainer(container: HTMLElement): void {
        if (!container.querySelector("#iconsCss")) {
            const style = document.createElement("style");
            style.id = "iconsCss";
            container.appendChild(style);
        }
    }

    private initializeRootElement(): void {
        const elementFactory = this.diagram.get<ElementFactory>("elementFactory");
        const root = elementFactory.createRoot();
        this.canvas.setRootElement(root);
    }

    private createDebouncedCallback(callback: (event?: any) => void): Function {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        return (event: any) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback(event), DEFAULT_DEBOUNCE_MS);
        };
    }
}
```

Create `src/client/infrastructure/DiagramJsIconAdapter.ts`:

```typescript
import type Diagram from "diagram-js";
import type EventBus from "diagram-js/lib/core/EventBus";

import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";
import { IconSetImportExportService } from "../../icon-set-config/service/IconSetImportExportService";
import { ElementTypes } from "../../domain/entities/elementTypes";

import { IconPort } from "../application/ports/IconPort";
import { IconSet, IconSetData, IconCategory } from "../domain/model/IconTypes";

const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Infrastructure adapter that implements IconPort using diagram-js icon services.
 * This adapter isolates all diagram-js icon-related dependencies.
 */
export class DiagramJsIconAdapter implements IconPort {
    private readonly iconDictionaryService: IconDictionaryService;
    private readonly iconSetImportExportService: IconSetImportExportService;
    private readonly eventBus: EventBus;
    private readonly callbackRegistry: Map<Function, Function> = new Map();

    constructor(diagram: Diagram) {
        this.iconDictionaryService = diagram.get<IconDictionaryService>(
            "domainStoryIconDictionaryService",
        );
        this.iconSetImportExportService = diagram.get<IconSetImportExportService>(
            "domainStoryIconSetImportExportService",
        );
        this.eventBus = diagram.get<EventBus>("eventBus");
    }

    loadIcons(icons: Partial<IconSetData>): void {
        const iconSetConfig = this.iconSetImportExportService.createIconSetConfiguration({
            actors: icons.actors ?? {},
            workObjects: icons.workObjects ?? {},
        });

        this.iconSetImportExportService.loadConfiguration(iconSetConfig);
        this.fireIconsChangedEvent();
    }

    addIcon(category: IconCategory, name: string, svg: string): void {
        const elementType = this.toElementType(category);

        this.iconDictionaryService.addIMGToIconDictionary(svg, name);
        this.iconDictionaryService.registerIconForType(elementType, name, svg);
        this.addIconToCss(name, svg);
        this.fireIconsChangedEvent();
    }

    removeIcon(category: IconCategory, name: string): void {
        const elementType = this.toElementType(category);
        this.iconDictionaryService.unregisterIconForType(elementType, name);
        this.fireIconsChangedEvent();
    }

    getIcons(): IconSet {
        const config = this.iconSetImportExportService.getCurrentConfigurationForExport();
        return {
            actors: config?.actors ?? {},
            workObjects: config?.workObjects ?? {},
        };
    }

    hasIcon(category: IconCategory, name: string): boolean {
        const icons = this.getIcons();
        const iconMap = category === "actor" ? icons.actors : icons.workObjects;
        return name in iconMap;
    }

    onIconsChanged(callback: (icons: IconSet) => void): void {
        const wrapped = this.createDebouncedCallback((event: any) => callback(event.iconSet));
        this.callbackRegistry.set(callback, wrapped);
        this.eventBus.on("dst.config.changed", wrapped);
    }

    offIconsChanged(callback: (icons: IconSet) => void): void {
        const wrapped = this.callbackRegistry.get(callback);
        if (wrapped) {
            this.eventBus.off("dst.config.changed", wrapped);
            this.callbackRegistry.delete(callback);
        }
    }

    private toElementType(category: IconCategory): ElementTypes {
        return category === "actor" ? ElementTypes.ACTOR : ElementTypes.WORKOBJECT;
    }

    private addIconToCss(name: string, svg: string): void {
        const dict = {
            keysArray: () => [name],
            get: () => svg,
        };
        this.iconDictionaryService.addIconsToCss(dict as any);
    }

    private fireIconsChangedEvent(): void {
        this.eventBus.fire("dst.config.changed", { iconSet: this.getIcons() });
    }

    private createDebouncedCallback(callback: (event?: any) => void): Function {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        return (event: any) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback(event), DEFAULT_DEBOUNCE_MS);
        };
    }
}
```

### Step 6: Implement EgonClient (Application Service)

Create `src/client/application/EgonClient.ts`:

```typescript
import type { ModuleDeclaration } from "didi";

import { EgonClientConfig } from "./EgonClientConfig";
import { ModelerPort } from "./ports/ModelerPort";
import { IconPort } from "./ports/IconPort";
import { DiagramJsModelerAdapter } from "../infrastructure/DiagramJsModelerAdapter";
import { DiagramJsIconAdapter } from "../infrastructure/DiagramJsIconAdapter";

import { DomainStoryDocument } from "../domain/model/DomainStoryDocument";
import { Viewport, ViewportData } from "../domain/model/Viewport";
import { IconSet, IconSetData, IconCategory } from "../domain/model/IconTypes";

/**
 * User-friendly event types exposed by EgonClient.
 */
export type EgonEventMap = {
    "story.changed": () => void;
    "viewport.changed": (viewport: ViewportData) => void;
    "icons.changed": (icons: IconSet) => void;
};

export type EgonEventName = keyof EgonEventMap;

/**
 * EgonClient - Application Service / Facade
 *
 * This is the main entry point for consumers of the diagram-js-egon-plugin.
 * It orchestrates use cases by coordinating between ports (abstractions)
 * and provides a clean, domain-focused API.
 *
 * Following DDD principles:
 * - Acts as an Application Service that coordinates workflows
 * - Depends on port interfaces, not concrete implementations
 * - Maps internal events to user-friendly event names
 * - Hides infrastructure complexity from consumers
 */
export class EgonClient {
    private readonly modelerPort: ModelerPort;
    private readonly iconPort: IconPort;

    constructor(config: EgonClientConfig, additionalModules: ModuleDeclaration[] = []) {
        // Create infrastructure adapters
        // Note: In a full DI setup, these would be injected
        const modelerAdapter = new DiagramJsModelerAdapter(
            config.container,
            config.width ?? "100%",
            config.height ?? "100%",
            additionalModules,
        );

        this.modelerPort = modelerAdapter;
        this.iconPort = new DiagramJsIconAdapter(modelerAdapter.getDiagram());

        // Apply initial viewport if provided
        if (config.viewport) {
            this.setViewport(config.viewport);
        }
    }

    // --- Document Operations ---

    /**
     * Import a domain story document into the diagram.
     * Icons from the document's domain section are automatically loaded.
     */
    import(document: DomainStoryDocument): void {
        this.modelerPort.import(document);
    }

    /**
     * Export the current diagram state as a domain story document.
     */
    export(): DomainStoryDocument {
        return this.modelerPort.export();
    }

    // --- Event Subscription ---

    /**
     * Subscribe to an event.
     */
    on<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void {
        switch (event) {
            case "story.changed":
                this.modelerPort.onStoryChanged(callback as EgonEventMap["story.changed"]);
                break;
            case "viewport.changed":
                this.modelerPort.onViewportChanged(callback as EgonEventMap["viewport.changed"]);
                break;
            case "icons.changed":
                this.iconPort.onIconsChanged(callback as EgonEventMap["icons.changed"]);
                break;
        }
    }

    /**
     * Unsubscribe from an event.
     */
    off<E extends EgonEventName>(event: E, callback: EgonEventMap[E]): void {
        switch (event) {
            case "story.changed":
                this.modelerPort.offStoryChanged(callback as EgonEventMap["story.changed"]);
                break;
            case "viewport.changed":
                this.modelerPort.offViewportChanged(callback as EgonEventMap["viewport.changed"]);
                break;
            case "icons.changed":
                this.iconPort.offIconsChanged(callback as EgonEventMap["icons.changed"]);
                break;
        }
    }

    // --- Viewport Operations ---

    /**
     * Get the current viewport.
     */
    getViewport(): ViewportData {
        return this.modelerPort.getViewport();
    }

    /**
     * Set the viewport.
     */
    setViewport(viewport: ViewportData): void {
        this.modelerPort.setViewport(viewport);
    }

    // --- Icon Management ---

    /**
     * Load a set of icons (actors and/or work objects).
     * Merges with existing icons; existing icons with the same name are overwritten.
     */
    loadIcons(icons: Partial<IconSetData>): void {
        this.iconPort.loadIcons(icons);
    }

    /**
     * Add a single icon.
     */
    addIcon(category: IconCategory, name: string, svg: string): void {
        this.iconPort.addIcon(category, name, svg);
    }

    /**
     * Remove a single icon.
     */
    removeIcon(category: IconCategory, name: string): void {
        this.iconPort.removeIcon(category, name);
    }

    /**
     * Get all currently registered icons.
     */
    getIcons(): IconSet {
        return this.iconPort.getIcons();
    }

    /**
     * Check if a specific icon is registered.
     */
    hasIcon(category: IconCategory, name: string): boolean {
        return this.iconPort.hasIcon(category, name);
    }

    // --- Lifecycle ---

    /**
     * Destroy the client and clean up resources.
     */
    destroy(): void {
        this.modelerPort.destroy();
    }
}
```

### Step 7: Update Public Exports

Update `src/index.ts`:

```typescript
// =============================================================================
// Client API (primary exports)
// =============================================================================

// Application Layer - Main entry point
export { EgonClient, type EgonEventMap, type EgonEventName } from "./client/application/EgonClient";
export type { EgonClientConfig } from "./client/application/EgonClientConfig";

// Domain Layer - Value Objects & Types (for consumers who need type information)
export type {
    DomainStoryDocument,
    DomainConfiguration,
} from "./client/domain/model/DomainStoryDocument";
export type { ViewportData } from "./client/domain/model/Viewport";
export type { IconSet, IconSetData, IconCategory, IconMap } from "./client/domain/model/IconTypes";

// =============================================================================
// Plugin module (for advanced usage / custom integrations)
// =============================================================================
export { default as EgonPlugin } from "./plugin";

// =============================================================================
// Internal services (deprecated - use EgonClient instead)
// These exports are kept for backward compatibility but should be removed
// in future versions.
// =============================================================================

/** @deprecated Use EgonClient.import() instead */
export { DomainStoryImportService } from "./import/service/DomainStoryImportService";
/** @deprecated Use EgonClient.export() instead */
export { DomainStoryExportService } from "./export/service/DomainStoryExportService";
// ... other deprecated exports
```

---

## Implementation Challenges

### Challenge 1: Type Synchronization Between Libraries

**Problem:** `@libs/diagram-js-egon-plugin` and `@libs/vscode/domain-story` both define `DomainStoryDocument`. These types must stay compatible without a shared dependency.

**Solution:**
- Document the expected shape in both libraries
- Add runtime validation in `EgonClient.import()` to catch mismatches early
- Consider creating a JSON Schema that both libraries validate against during testing

**Testing Strategy:**
```typescript
// In @libs/diagram-js-egon-plugin tests
import { DomainStoryDocument } from "./client/DomainStoryDocument";

// In @libs/vscode/domain-story tests
import { DomainStoryDocument } from "./domain/story/DomainStoryDocument";

// Both should pass the same test fixtures
const testDocument = loadTestFixture("valid-story.json");
expect(testDocument).toMatchSchema(domainStorySchema);
```

### Challenge 2: Import/Export Service Refactoring

**Problem:** Current import/export services work with JSON strings. The new API accepts/returns objects, requiring JSON serialization at the boundary.

**Current Workaround:**
```typescript
// In EgonClient.import()
importService.import(JSON.stringify(document));

// In EgonClient.export()
return JSON.parse(exportService.export());
```

**Future Optimization:** Refactor `DomainStoryImportService` and `DomainStoryExportService` to work with objects directly:

```typescript
// DomainStoryImportService
import(document: DomainStoryDocument): void {
    // Remove JSON.parse, work with document directly
    const configAndDST = document; // Already an object
    // ...
}

// DomainStoryExportService
export(): DomainStoryDocument {
    // Remove JSON.stringify, return object directly
    return this.createConfigAndDST(dst);
}
```

### Challenge 3: Event Callback Memory Management

**Problem:** Wrapped callbacks must be tracked to allow proper cleanup with `off()`.

**Solution:** Use a `Map` to associate original callbacks with their wrapped versions:

```typescript
private callbackRegistry: Map<Function, Function> = new Map();

on(event, callback) {
    const wrapped = this.createWrappedCallback(event, callback);
    this.callbackRegistry.set(callback, wrapped);
    this.eventBus.on(EVENT_MAP[event], wrapped);
}

off(event, callback) {
    const wrapped = this.callbackRegistry.get(callback);
    if (wrapped) {
        this.eventBus.off(EVENT_MAP[event], wrapped);
        this.callbackRegistry.delete(callback);
    }
}
```

### Challenge 4: Debounce Behavior

**Problem:** Current implementation uses `debounce` from an external utility. Each `on()` call creates a new debounced function.

**Considerations:**
- Should debouncing be configurable per event?
- Should multiple callbacks for the same event share a debounce timer?
- Current behavior: Each callback is independently debounced

**Possible Enhancement:**
```typescript
on<E extends EgonEventName>(
    event: E,
    callback: EgonEventMap[E],
    options?: { debounce?: number | false },
): void;
```

### Challenge 5: CSS Injection for Icons

**Problem:** The icon rendering system requires a `<style id="iconsCss">` element in the container.

**Current Solution:** Create this element in the constructor if it doesn't exist.

**Edge Cases to Handle:**
- Container already has the style element (e.g., from a previous client instance)
- Multiple clients sharing the same container (not currently supported)

### Challenge 6: Module System Compatibility

**Problem:** Additional modules must be compatible with diagram-js module format.

**Documentation Needed:** Provide guidance on creating custom modules:

```typescript
// Example custom module
const CustomModule: ModuleDeclaration = {
    __init__: ["customService"],
    customService: ["type", CustomService],
};

class CustomService {
    static $inject = ["eventBus"];
    constructor(private eventBus: EventBus) {
        // ...
    }
}
```

### Challenge 7: Icon Management Architecture

**Problem:** The current icon system uses multiple services (`IconDictionaryService`, `IconSetImportExportService`) with complex interactions. The new API needs to provide a simple facade while handling:
- Global icon dictionary (shared across all element types)
- Type-specific dictionaries (actors vs work objects)
- CSS generation for icon rendering
- Event propagation when icons change

**Current Icon Flow:**
```
1. Import story → DomainStoryImportService
2. Extract icons from domain config → IconSetImportExportService.createIconSetConfiguration()
3. Load icons → IconSetImportExportService.loadConfiguration()
4. Update registries → IconDictionaryService.updateIconRegistries()
5. Generate CSS → IconDictionaryService.addIconsToCss()
6. Fire event → eventBus.fire("dst.config.changed")
```

**Solution:** The `EgonClient` facade wraps this complexity:

```typescript
// Simple API for users
client.loadIcons({ actors: { Robot: "<svg>..." } });

// Internally handles all the steps above
```

**Edge Cases to Handle:**

1. **Icon name sanitization**: Icon names should be sanitized (lowercase, no special chars) for CSS class generation. The existing `sanitizeIconName()` utility handles this.

2. **Duplicate icons**: When loading icons with names that already exist:
   - Current behavior: Overwrites existing icon
   - Should this be configurable? (merge vs replace)

3. **Icon removal and canvas elements**: Removing an icon doesn't remove elements using that icon from the canvas. Document this behavior clearly.

4. **CSS cleanup**: When removing icons, the CSS rules remain in the stylesheet. For long-running sessions with many icon changes, this could accumulate unused CSS.

**Possible Future Enhancement:**

```typescript
interface IconLoadOptions {
    /** How to handle existing icons with the same name */
    onConflict?: "overwrite" | "skip" | "error";
    /** Whether to update elements on canvas using this icon */
    updateExisting?: boolean;
}

client.loadIcons(icons, options);
```

### Challenge 8: Icon Event Timing

**Problem:** The `icons.changed` event needs to fire at the right time so that:
- Palette updates to show new icons
- Context pad updates with new options
- Existing elements re-render if needed

**Solution:** Use the existing `dst.config.changed` event which is already subscribed to by palette and other components. The `EgonClient` maps this to the user-friendly `icons.changed` event name.

**Testing Considerations:**
- Test that palette updates after `loadIcons()` call
- Test that icons appear in context pad replacement menu
- Test that elements created with new icons render correctly

### Challenge 9: DDD Implementation in diagram-js Context

**Problem:** diagram-js uses its own dependency injection system (`didi`) which doesn't align with typical DDD patterns. The existing services (`IconDictionaryService`, `DomainStoryImportService`, etc.) are registered in the diagram-js container, not a separate DI container.

**Solution:** Create a hybrid approach:

1. **Domain Layer**: Pure TypeScript classes with no DI framework dependencies
2. **Application Layer**: `EgonClient` manually wires up adapters (pragmatic approach)
3. **Infrastructure Layer**: Adapters access diagram-js services via `diagram.get()`

```typescript
// EgonClient constructor - manual wiring (not ideal but pragmatic)
constructor(config: EgonClientConfig, additionalModules: ModuleDeclaration[] = []) {
    const modelerAdapter = new DiagramJsModelerAdapter(/* ... */);
    this.modelerPort = modelerAdapter;
    this.iconPort = new DiagramJsIconAdapter(modelerAdapter.getDiagram());
}
```

**Future Enhancement:** Consider introducing a factory pattern or a simple DI container:

```typescript
// Factory approach
export class EgonClientFactory {
    static create(config: EgonClientConfig): EgonClient {
        const modelerPort = new DiagramJsModelerAdapter(/* ... */);
        const iconPort = new DiagramJsIconAdapter(/* ... */);
        return new EgonClient(modelerPort, iconPort, config);
    }
}

// Or with tsyringe (consistent with @libs/vscode/domain-story)
container.register<ModelerPort>("ModelerPort", { useClass: DiagramJsModelerAdapter });
container.register<IconPort>("IconPort", { useClass: DiagramJsIconAdapter });
```

### Challenge 10: Maintaining Domain Purity

**Problem:** The domain layer must remain free of infrastructure concerns, but:
- `DomainStoryDocument` structure is dictated by the `.egn` file format
- `Viewport` values come directly from diagram-js canvas

**Solution:**

1. **Use Data Transfer Objects (DTOs)**: Define simple interfaces in the domain layer that represent the data shape. Infrastructure adapters convert between diagram-js types and domain types.

```typescript
// Domain layer - pure interface
export interface ViewportData {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Domain layer - Value Object with behavior
export class Viewport {
    static fromData(data: ViewportData): Viewport {
        return new Viewport(data.x, data.y, data.width, data.height);
    }
}

// Infrastructure layer - converts diagram-js viewbox to domain type
getViewport(): ViewportData {
    const viewbox = this.canvas.viewbox();
    return { x: viewbox.x, y: viewbox.y, width: viewbox.width, height: viewbox.height };
}
```

2. **Keep domain logic in domain objects**: Business rules like icon validation belong in the `Icon` entity:

```typescript
// Domain layer
export class Icon {
    constructor(readonly name: string, readonly category: IconCategory, readonly svg: string) {
        if (!name || name.trim().length === 0) {
            throw new Error("Icon name cannot be empty");
        }
        // Domain validation - business rule
    }
}
```

---

## Migration Guide

### From Current API to EgonClient

**Before:**
```typescript
import EgonIo from "@libs/diagram-js-egon-plugin";
import Diagram from "diagram-js";

const diagram = new Diagram({
    container,
    modules: [EgonIo],
});

const canvas = diagram.get("canvas");
const elementFactory = diagram.get("elementFactory");
const root = elementFactory.createRoot();
canvas.setRootElement(root);

const importService = diagram.get("domainStoryImportService");
importService.import(jsonString);

diagram.get("eventBus").on("commandStack.changed", debounce(callback, 100));
```

**After:**
```typescript
import { EgonClient } from "@libs/diagram-js-egon-plugin";

const client = new EgonClient({ container });

client.import(document);

client.on("story.changed", callback);
```

---

## Testing Strategy

Following DDD principles, tests are organized by layer with different testing strategies:

### Domain Layer Tests (Pure Unit Tests - No Mocks)

Domain value objects are pure TypeScript with no external dependencies, making them trivial to test.

Note: There are no `Icon` or `IconRegistry` tests because icons are stored in the existing `IconDictionaryService`, not in the client module's domain layer.

```typescript
describe("Viewport (Value Object)", () => {
    it("should be immutable", () => {
        const viewport = new Viewport(0, 0, 100, 100);
        expect(Object.isFrozen(viewport)).toBe(true);
    });

    it("should compare equality by value", () => {
        const v1 = new Viewport(0, 0, 100, 100);
        const v2 = new Viewport(0, 0, 100, 100);
        const v3 = new Viewport(10, 10, 100, 100);

        expect(v1.equals(v2)).toBe(true);
        expect(v1.equals(v3)).toBe(false);
    });

    it("should convert to and from plain object", () => {
        const viewport = new Viewport(10, 20, 800, 600);
        const data = viewport.toPlainObject();
        const restored = Viewport.fromPlainObject(data);

        expect(restored.equals(viewport)).toBe(true);
    });
});
```

### Application Layer Tests (Mock Ports)

Application service tests use mock ports to verify orchestration logic:

```typescript
describe("EgonClient (Application Service)", () => {
    let mockModelerPort: jest.Mocked<ModelerPort>;
    let mockIconPort: jest.Mocked<IconPort>;
    let client: EgonClient;

    beforeEach(() => {
        mockModelerPort = {
            import: jest.fn(),
            export: jest.fn(),
            getViewport: jest.fn().mockReturnValue({ x: 0, y: 0, width: 100, height: 100 }),
            setViewport: jest.fn(),
            onStoryChanged: jest.fn(),
            onViewportChanged: jest.fn(),
            offStoryChanged: jest.fn(),
            offViewportChanged: jest.fn(),
            destroy: jest.fn(),
        };

        mockIconPort = {
            loadIcons: jest.fn(),
            addIcon: jest.fn(),
            removeIcon: jest.fn(),
            getIcons: jest.fn().mockReturnValue({ actors: {}, workObjects: {} }),
            hasIcon: jest.fn(),
            onIconsChanged: jest.fn(),
            offIconsChanged: jest.fn(),
        };

        // Create client with injected mocks (requires constructor that accepts ports)
        client = new EgonClient(mockModelerPort, mockIconPort);
    });

    describe("document operations", () => {
        it("should delegate import to modeler port", () => {
            const doc = { domain: { name: "", actors: {}, workObjects: {} }, dst: [] };
            client.import(doc);

            expect(mockModelerPort.import).toHaveBeenCalledWith(doc);
        });

        it("should delegate export to modeler port", () => {
            const doc = { domain: { name: "", actors: {}, workObjects: {} }, dst: [] };
            mockModelerPort.export.mockReturnValue(doc);

            const result = client.export();

            expect(result).toEqual(doc);
        });
    });

    describe("event subscription", () => {
        it("should route story.changed to modeler port", () => {
            const callback = jest.fn();
            client.on("story.changed", callback);

            expect(mockModelerPort.onStoryChanged).toHaveBeenCalledWith(callback);
        });

        it("should route icons.changed to icon port", () => {
            const callback = jest.fn();
            client.on("icons.changed", callback);

            expect(mockIconPort.onIconsChanged).toHaveBeenCalledWith(callback);
        });
    });

    describe("icon management", () => {
        it("should delegate loadIcons to icon port", () => {
            const icons = { actors: { Test: "<svg>...</svg>" } };
            client.loadIcons(icons);

            expect(mockIconPort.loadIcons).toHaveBeenCalledWith(icons);
        });
    });
});
```

### Infrastructure Layer Tests (Integration with diagram-js)

Infrastructure adapter tests verify correct interaction with diagram-js:

```typescript
describe("DiagramJsModelerAdapter", () => {
    let container: HTMLElement;
    let adapter: DiagramJsModelerAdapter;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        adapter = new DiagramJsModelerAdapter(container, "100%", "100%");
    });

    afterEach(() => {
        adapter.destroy();
        container.remove();
    });

    it("should create iconsCss style element", () => {
        expect(container.querySelector("#iconsCss")).not.toBeNull();
    });

    it("should initialize root element on canvas", () => {
        const viewport = adapter.getViewport();
        expect(viewport).toBeDefined();
    });

    it("should import and export documents", () => {
        const doc = createTestDocument();
        adapter.import(doc);

        const exported = adapter.export();
        expect(exported.dst.length).toBe(doc.dst.length);
    });
});

describe("DiagramJsIconAdapter", () => {
    let container: HTMLElement;
    let modelerAdapter: DiagramJsModelerAdapter;
    let iconAdapter: DiagramJsIconAdapter;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        modelerAdapter = new DiagramJsModelerAdapter(container, "100%", "100%");
        iconAdapter = new DiagramJsIconAdapter(modelerAdapter.getDiagram());
    });

    afterEach(() => {
        modelerAdapter.destroy();
        container.remove();
    });

    it("should add icons to dictionary service", () => {
        iconAdapter.addIcon("actor", "Robot", "<svg>...</svg>");

        expect(iconAdapter.hasIcon("actor", "Robot")).toBe(true);
    });

    it("should fire icons.changed event", (done) => {
        iconAdapter.onIconsChanged((icons) => {
            expect(icons.actors["Robot"]).toBeDefined();
            done();
        });

        iconAdapter.addIcon("actor", "Robot", "<svg>...</svg>");
    });
});
```

### End-to-End Integration Tests

Full integration tests with actual EgonClient:

```typescript
describe("EgonClient Integration", () => {
    let container: HTMLElement;
    let client: EgonClient;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);
        client = new EgonClient({ container });
    });

    afterEach(() => {
        client.destroy();
        container.remove();
    });

    it("should import document with icons and make them available", () => {
        const doc: DomainStoryDocument = {
            domain: {
                name: "Test",
                actors: { Person: "<svg>...</svg>" },
                workObjects: { Document: "<svg>...</svg>" },
            },
            dst: [],
        };

        client.import(doc);

        expect(client.hasIcon("actor", "Person")).toBe(true);
        expect(client.hasIcon("workObject", "Document")).toBe(true);
    });

    it("should support loading icons before import", () => {
        // Load custom icons first
        client.loadIcons({ actors: { CustomActor: "<svg>...</svg>" } });

        // Import document without icon definitions
        const doc: DomainStoryDocument = {
            domain: { name: "", actors: {}, workObjects: {} },
            dst: [],
        };
        client.import(doc);

        // Custom icons should still be available
        expect(client.hasIcon("actor", "CustomActor")).toBe(true);
    });
});
```

---

## Implementation Checklist

### Phase 1: Domain Layer (Types Only)
- [ ] Create `src/client/domain/` directory structure
- [ ] Implement `Viewport` value object with immutability
- [ ] Define `IconTypes.ts` (interfaces only: `IconSet`, `IconSetData`, `IconCategory`, `IconMap`)
- [ ] Define `DomainStoryDocument` value object interface
- [ ] Define domain events (`StoryChangedEvent`, `ViewportChangedEvent`, `IconsChangedEvent`)
- [ ] Write unit tests for `Viewport` value object

**Note:** Do NOT create `Icon` entity or `IconRegistry` aggregate. Icons are stored in the existing `IconDictionaryService`.

### Phase 2: Application Layer (Ports)
- [ ] Create `src/client/application/` directory structure
- [ ] Define `ModelerPort` interface
- [ ] Define `IconPort` interface
- [ ] Define `EgonClientConfig` configuration type

### Phase 3: Infrastructure Layer (Adapters)
- [ ] Create `src/client/infrastructure/` directory structure
- [ ] Implement `DiagramJsModelerAdapter` (implements `ModelerPort`)
- [ ] Implement `DiagramJsIconAdapter` (implements `IconPort`)
- [ ] Write integration tests with mock diagram-js

### Phase 4: Application Service
- [ ] Implement `EgonClient` application service
- [ ] Wire up port implementations in constructor
- [ ] Implement document operations (`import`, `export`)
- [ ] Implement event subscription (`on`, `off`)
- [ ] Implement viewport operations
- [ ] Implement icon management methods
- [ ] Write integration tests for `EgonClient`

### Phase 5: Public API & Exports
- [ ] Update `src/index.ts` with new exports
- [ ] Add deprecation notices to old exports
- [ ] Ensure backward compatibility

### Phase 6: Testing
- [ ] Unit tests for `Viewport` value object (pure logic, no mocks)
- [ ] Unit tests for `EgonClient` application service (mock ports)
- [ ] Integration tests for `DiagramJsModelerAdapter`
- [ ] Integration tests for `DiagramJsIconAdapter` (verify delegation to `IconDictionaryService`)
- [ ] Integration tests for full EgonClient flow
- [ ] Test document import with icons
- [ ] Test document import without icons (icons loaded separately)
- [ ] Verify palette updates when icons are loaded
- [ ] Verify context pad updates when icons are loaded

### Phase 7: Migration & Documentation
- [ ] Update webview to use new `EgonClient` API
- [ ] Update documentation/README
- [ ] Add migration guide examples
- [ ] (Optional) Refactor import/export services to work with objects directly
- [ ] (Optional) Add dependency injection container for adapters
