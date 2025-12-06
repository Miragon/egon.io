# Custom Icons - Technical Documentation

This document describes the technical implementation of custom SVG icons in the Egon.io VS Code extension for Domain Story Modeling.

## Overview

Custom icons allow users to extend the default icon set with their own SVG icons. These icons appear in:
- **Palette**: The left-hand toolbar for creating new elements
- **Context Pad**: The contextual menu that appears when selecting an element
- **Canvas**: The rendered diagram elements themselves

Icons can be added in two ways:
1. **Workspace Icons**: SVG files in the `.egon/icons/` directory
2. **Embedded Icons**: Icons stored within `.egn` files (Domain Story documents)

## Directory Structure

Custom icons are stored in the workspace under the `.egon/icons/` directory:

```
.egon/
└── icons/
    ├── actors/         # Actor icons (e.g., Person.svg, System.svg)
    │   └── *.svg
    └── work-objects/   # Work object icons (e.g., Document.svg, Email.svg)
        └── *.svg
```

The icon name is derived from the filename (without extension). For example, `MyCustomActor.svg` becomes the icon named "MyCustomActor".

## Architecture

### Icon Loading Flow

There are two main flows for loading icons:

#### 1. Workspace Icons (from `.egon/icons/`)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐
│  .egon/icons/   │────>│  IconPathParser  │────>│  SyncIconsFromSet       │
│  (SVG files)    │     │  (VS Code layer) │     │  (Application layer)    │
└─────────────────┘     └──────────────────┘     └─────────────────────────┘
                                                           │
                                                           v
                                                 ┌─────────────────────────┐
                                                 │  DomainStoryDocument    │
                                                 │  (Icons embedded in .egn)│
                                                 └─────────────────────────┘
```

#### 2. Embedded Icons (from `.egn` files)

```
┌─────────────────┐     ┌──────────────────────────┐     ┌─────────────────────────┐
│  .egn file      │────>│  DomainStoryImportService│────>│  IconSetImportExport    │
│  (JSON + icons) │     │  (Import layer)          │     │  Service                │
└─────────────────┘     └──────────────────────────┘     └─────────────────────────┘
                                                                   │
                                                                   v
                                                         ┌─────────────────────────┐
                                                         │  IconDictionaryService  │
                                                         │  (CSS generation)       │
                                                         └─────────────────────────┘
                                                                   │
                              ┌────────────────────────────────────┼────────────────────────────┐
                              │                                    │                            │
                              v                                    v                            v
                    ┌─────────────────┐              ┌───────────────────┐          ┌───────────────────┐
                    │  DomainStory    │              │  DomainStory      │          │  DomainStory      │
                    │  Palette        │              │  ContextPad       │          │  Renderer         │
                    └─────────────────┘              └───────────────────┘          └───────────────────┘
```

### Key Components

#### VS Code Layer (`libs/vscode/domain-story/`)

##### IconPathParser (`src/domain/icons/IconPathParser.ts`)

Parses file paths to extract icon metadata from workspace files:

```typescript
export const ICON_BASE_PATH = ".egon/icons";
export const ACTOR_ICON_PATH = `${ICON_BASE_PATH}/actors`;
export const WORK_OBJECT_ICON_PATH = `${ICON_BASE_PATH}/work-objects`;

export function tryParseIconPath(path: string): IconPathMetadata | null {
    // Determines if path is an actor or work-object icon
    // Extracts icon name from filename
}
```

##### Icon Domain Model (`src/domain/icons/`)

```typescript
// Icon.ts - Represents a loaded icon
interface Icon {
    type: IconType;      // Actor or WorkObject
    name: IconName;      // Sanitized name from filename
    svg: string;         // Raw SVG content
}

// IconChange.ts - Represents a change event
interface IconChange {
    type: IconType;
    name: IconName;
    kind: "create" | "update" | "delete";
    svg?: string;
}

// IconType.ts
enum IconType {
    Actor = "actors",
    WorkObject = "work-objects",
}
```

##### StoryIcons (`src/domain/story/StoryIcons.ts`)

Manages icons within a DomainStoryDocument:

```typescript
class StoryIcons {
    addOrUpdate(icon: Icon): void;           // Add or update an icon
    delete(type: IconType, name: IconName): void;  // Remove an icon
    applyChange(change: IconChange): void;   // Apply a change event
    snapshot(): DomainStoryDocument;         // Get current document state
}
```

##### Application Use Cases (`src/application/icons/`)

- **ApplyIconChange**: Applies a single icon change to a document
- **SyncIconsFromSet**: Synchronizes multiple icons from workspace to document

```typescript
// SyncIconsFromSet.ts
class SyncIconsFromSet {
    execute(currentEgn: string | undefined, icons: Icon[]): string {
        const doc = parseStoryOrEmpty(currentEgn);
        const storyIcons = new StoryIcons(doc);
        for (const icon of icons) {
            storyIcons.addOrUpdate(icon);
        }
        return serializeStory(storyIcons.snapshot());
    }
}
```

#### diagram-js Layer (`libs/diagram-js-egon-plugin/`)

##### DomainStoryImportService (`src/import/service/DomainStoryImportService.ts`)

Imports `.egn` files and loads embedded icons:

```typescript
class DomainStoryImportService {
    import(story: string) {
        const configAndDST: ConfigAndDST = JSON.parse(story);
        const domainStoryIcons: FileConfiguration = configAndDST.domain;

        // Create icon set from file configuration
        const iconSet: IconSet = this.iconSetImportExportService
            .createIconSetConfiguration(domainStoryIcons);

        // Load icons into dictionaries and generate CSS
        this.iconSetImportExportService.loadConfiguration(iconSet);

        // Notify other components about config change
        this.eventBus.fire("dst.config.changed", { iconSet });

        // ... import diagram elements
    }
}
```

##### IconSetImportExportService (`src/icon-set-config/service/IconSetImportExportService.ts`)

Handles conversion between file format and internal dictionaries:

```typescript
class IconSetImportExportService {
    // Create IconSet from file's domain section
    createIconSetConfiguration(fileConfiguration: FileConfiguration): IconSet;

    // Load configuration into IconDictionaryService
    loadConfiguration(customConfig: IconSet): void;

    // Export current configuration for saving
    getCurrentConfigurationForExport(): IconSetConfigurationForExport | undefined;
}
```

##### IconDictionaryService (`src/icon-set-config/service/IconDictionaryService.ts`)

Central service managing icon registration and CSS generation:

- **Icon Registration**: Stores SVG sources in dictionaries for actors and work objects
- **CSS Generation**: Creates CSS classes for icons using CSS masks
- **Icon Lookup**: Provides icon sources and CSS class names to other components

#### CSS Icon System (`src/styles.scss`)

Uses CSS masks for consistent icon rendering across palette and context pad.

## `.egn` File Format

Domain Story files (`.egn`) are JSON documents that embed icons directly:

```json
{
    "domain": {
        "name": "My Domain",
        "actors": {
            "Customer": "<svg>...</svg>",
            "Employee": "<svg>...</svg>"
        },
        "workObjects": {
            "Order": "<svg>...</svg>",
            "Invoice": "<svg>...</svg>"
        }
    },
    "dst": [
        // ... diagram elements (shapes, connections)
    ]
}
```

### DomainStoryDocument Structure

```typescript
interface DomainStoryDocument {
    domain: {
        name: string;
        actors: { [name: string]: string };      // name -> SVG
        workObjects: { [name: string]: string }; // name -> SVG
    };
    dst: unknown[];  // Diagram elements
}
```

This structure ensures that custom icons travel with the document, making `.egn` files self-contained and portable.

## CSS Mask-Based Icon Rendering

### The Problem

diagram-js expects icons to behave like font icons (using `::before` pseudo-elements with specific dimensions). Custom SVG icons need to integrate seamlessly with this system while supporting:
- Consistent sizing (22x22 pixels)
- Monochrome rendering (matching the UI theme)
- Dynamic icon loading at runtime

### The Solution

Icons are rendered using **CSS masks**, which allow an SVG to act as a stencil for a solid color background:

```scss
/* Base styling for all domain story icons */
[class*="icon-domain-story-"] {
    font-size: 22px;
}

[class*="icon-domain-story-"]::before {
    content: '';
    display: inline-block;
    width: 1em;
    height: 1em;

    /* Icon color (can be customized) */
    background-color: #22242A;

    /* SVG acts as a mask for the background */
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
}
```

### Dynamic CSS Injection

When custom icons are loaded, CSS rules are dynamically injected:

```typescript
addIconsToCss(customIcons: Dictionary) {
    const sheetEl = document.getElementById("iconsCss");
    customIcons.keysArray().forEach((key) => {
        let src = customIcons.get(key);

        // Remove width/height for consistent scaling
        src = src.replace(/<svg[^>]+>/, (match: string) => {
            return match.replace(/ (width|height)="[^"]*"/g, "");
        });

        const base64Src = btoa(src);
        const iconStyle = `
            .${ICON_CSS_CLASS_PREFIX}${sanitizeIconName(key.toLowerCase())}::before {
              mask-image: url('data:image/svg+xml;base64,${base64Src}');
            }
        `;

        sheetEl?.sheet?.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
    });
}
```

### CSS Class Naming Convention

All icon CSS classes follow the pattern:
```
icon-domain-story-{sanitized-icon-name}
```

The `ICON_CSS_CLASS_PREFIX` constant (`"icon-domain-story-"`) ensures consistency across the codebase.

## Context Pad Positioning

### The Problem

The default diagram-js `ContextPad` positions itself using `getBoundingClientRect()` on SVG graphics elements. This can cause misalignment when:
- SVG viewBox differs from rendered size
- Labels extend beyond the icon
- Custom icons have different aspect ratios

### The Solution

A custom `DomainStoryContextPad` class overrides the bounds calculation to use **model coordinates** instead of SVG graphics bounds:

```typescript
// libs/diagram-js-egon-plugin/src/features/context-pad/DomainStoryContextPad.ts

export class DomainStoryContextPad extends ContextPad {
    constructor(...) {
        super(...);
        // Override internal method
        self._getTargetBounds = this.getTargetBoundsFromModel.bind(this);
    }

    private getTargetBoundsFromModel(target: ContextPadTarget): DOMRect {
        // Calculate bounds from element.x, element.y, element.width, element.height
        // Transform to screen coordinates using canvas viewbox
    }
}
```

This ensures the context pad appears exactly at the edge of the element's logical bounds (75x75 pixels for actors/work objects).

## SVG Requirements for Custom Icons

For best results, custom SVG icons should:

1. **Use a viewBox**: Define `viewBox="0 0 24 24"` (or similar square aspect ratio)
2. **Avoid fixed width/height**: These are stripped during processing
3. **Use fill for coloring**: The mask technique works with filled paths
4. **Be monochrome**: Multi-color icons will render as a single color

Example of a well-formed custom icon:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5"/>
</svg>
```

## Module Registration

The context pad module is registered in `libs/diagram-js-egon-plugin/src/features/context-pad/index.ts`:

```typescript
export default {
    __depends__: [
        // ... other modules
        SchedulerModule,  // Required by ContextPad
    ],
    __init__: ["contextPad", "domainStoryContextPadProvider"],
    contextPad: ["type", DomainStoryContextPad],
    domainStoryContextPadProvider: ["type", DomainStoryContextPadProvider],
};
```

Note: The custom `DomainStoryContextPad` replaces the default `ContextPadModule` to provide correct positioning.

## Key Files Reference

### VS Code Layer (`libs/vscode/domain-story/`)

| File | Purpose |
|------|---------|
| `src/domain/icons/Icon.ts` | Icon value object |
| `src/domain/icons/IconType.ts` | Actor/WorkObject enum |
| `src/domain/icons/IconName.ts` | Icon name value object with sanitization |
| `src/domain/icons/IconChange.ts` | Icon change event |
| `src/domain/icons/IconPathParser.ts` | Parse workspace file paths to icon metadata |
| `src/domain/story/StoryIcons.ts` | Icon management within documents |
| `src/domain/story/DomainStoryDocument.ts` | Document structure with embedded icons |
| `src/application/icons/ApplyIconChange.ts` | Apply single icon change use case |
| `src/application/icons/SyncIconsFromSet.ts` | Sync multiple icons use case |

### diagram-js Layer (`libs/diagram-js-egon-plugin/`)

| File | Purpose |
|------|---------|
| `src/import/service/DomainStoryImportService.ts` | Import `.egn` files with embedded icons |
| `src/icon-set-config/service/IconSetImportExportService.ts` | Convert between file format and dictionaries |
| `src/icon-set-config/service/IconDictionaryService.ts` | Icon registry and CSS generation |
| `src/features/context-pad/DomainStoryContextPad.ts` | Custom context pad with model-based positioning |
| `src/features/context-pad/index.ts` | Module registration for custom context pad |
| `src/styles.scss` | Base CSS for mask-based icon rendering |

## Troubleshooting

### Icons not appearing in palette/context pad
- Verify CSS is being injected (check `#iconsCss` stylesheet in DevTools)
- Ensure icon name follows naming conventions (lowercase, sanitized)
- Check that SVG is valid and has a viewBox

### Context pad positioned incorrectly
- Ensure `DomainStoryContextPad` is registered as `contextPad` service
- Verify element has valid x, y, width, height properties

### Icons appearing as solid rectangles
- Check SVG uses `fill` instead of `stroke` for paths
- Verify SVG doesn't have `fill="none"` on visible elements
