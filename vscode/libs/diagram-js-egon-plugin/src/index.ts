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
    DomainStoryElement,
} from "./client/domain/model/DomainStoryDocument";
export type { ViewportData } from "./client/domain/model/Viewport";
export type { IconSet, IconSetData, IconCategory, IconMap } from "./client/domain/model/IconTypes";

// =============================================================================
// Plugin module (for advanced usage / custom integrations)
// =============================================================================
export { default } from "./plugin";

// =============================================================================
// Internal services (deprecated - use EgonClient instead)
// These exports are kept for backward compatibility but should be removed
// in future versions.
// =============================================================================

/** @deprecated Use EgonClient.import() instead */
export { DomainStoryImportService } from "./import/service/DomainStoryImportService";
/** @deprecated Use EgonClient.export() instead */
export { DomainStoryExportService } from "./export/service/DomainStoryExportService";
export { ElementRegistryService } from "./domain/service/ElementRegistryService";
export { DirtyFlagService } from "./domain/service/DirtyFlagService";
export { IconDictionaryService } from "./icon-set-config/service/IconDictionaryService";
export { LabelDictionaryService } from "./label-dictionary/service/LabelDictionaryService";
