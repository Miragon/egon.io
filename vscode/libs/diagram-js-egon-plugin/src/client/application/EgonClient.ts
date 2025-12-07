import type { ModuleDeclaration } from "didi";

import { EgonClientConfig } from "./EgonClientConfig";
import { IconPort, ModelerPort } from "./ports";

import type { DomainStoryDocument, IconCategory, IconSet, IconSetData, ViewportData } from "../domain";

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
 * Optional port injection for testing purposes.
 * When provided, EgonClient will use these ports instead of creating adapters.
 */
export interface EgonClientPorts {
    modelerPort: ModelerPort;
    iconPort: IconPort;
}

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
    private constructor(
        private readonly modelerPort: ModelerPort,
        private readonly iconPort: IconPort,
        viewport?: ViewportData,
    ) {
        // Apply the initial viewport if provided
        if (viewport) {
            this.setViewport(viewport);
        }
    }

    /**
     * Creates a new EgonClient instance.
     *
     * @param config - Configuration options for the client
     * @param additionalModules - Optional array of additional diagram-js modules
     * @param ports - Optional port injection for testing (bypasses adapter creation)
     */
    static async create(
        config: EgonClientConfig,
        additionalModules: ModuleDeclaration[] = [],
        ports?: EgonClientPorts,
    ): Promise<EgonClient> {
        if (ports) {
            return new EgonClient(ports.modelerPort, ports.iconPort, config.viewport);
        }

        // dynamic ESM import (works in browser and node ESM)
        const { DiagramJsModelerAdapter } = await import(
            "../infrastructure/DiagramJsModelerAdapter"
        );
        const { DiagramJsIconAdapter } = await import(
            "../infrastructure/DiagramJsIconAdapter"
        );

        const modelerAdapter = new DiagramJsModelerAdapter(
            config.container,
            config.width ?? "100%",
            config.height ?? "100%",
            additionalModules,
        );

        const iconAdapter = new DiagramJsIconAdapter(modelerAdapter.getDiagram());

        return new EgonClient(modelerAdapter, iconAdapter, config.viewport);
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
                this.modelerPort.onStoryChanged(
                    callback as EgonEventMap["story.changed"],
                );
                break;
            case "viewport.changed":
                this.modelerPort.onViewportChanged(
                    callback as EgonEventMap["viewport.changed"],
                );
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
                this.modelerPort.offStoryChanged(
                    callback as EgonEventMap["story.changed"],
                );
                break;
            case "viewport.changed":
                this.modelerPort.offViewportChanged(
                    callback as EgonEventMap["viewport.changed"],
                );
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
