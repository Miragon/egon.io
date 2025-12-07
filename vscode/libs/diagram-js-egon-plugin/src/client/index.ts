// =============================================================================
// Application Layer - Main entry point
// =============================================================================

export { EgonClient, type EgonEventMap, type EgonEventName } from "./application/EgonClient";
export type { EgonClientConfig } from "./application/EgonClientConfig";

// =============================================================================
// Domain Layer - Value Objects & Types (for consumers who need type information)
// =============================================================================

export type {
    DomainStoryDocument,
    DomainConfiguration,
    DomainStoryElement,
} from "./domain/model/DomainStoryDocument";
export type { ViewportData } from "./domain/model/Viewport";
export type { IconSet, IconSetData, IconCategory, IconMap } from "./domain/model/IconTypes";

// =============================================================================
// Ports (for advanced usage / custom integrations)
// =============================================================================

export type { ModelerPort } from "./application/ports/ModelerPort";
export type { IconPort } from "./application/ports/IconPort";
