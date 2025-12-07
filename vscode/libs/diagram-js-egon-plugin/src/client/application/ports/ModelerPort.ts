import { DomainStoryDocument } from "../../domain/model/DomainStoryDocument";
import { ViewportData } from "../../domain/model/Viewport";

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
