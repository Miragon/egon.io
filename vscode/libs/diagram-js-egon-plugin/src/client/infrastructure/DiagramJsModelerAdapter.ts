import Diagram from "diagram-js";
import type { ModuleDeclaration } from "didi";
import type Canvas from "diagram-js/lib/core/Canvas";
import type EventBus from "diagram-js/lib/core/EventBus";
import type ElementFactory from "diagram-js/lib/core/ElementFactory";

import EgonPlugin from "../../plugin";
import { DomainStoryImportService } from "../../import/service/DomainStoryImportService";
import { DomainStoryExportService } from "../../export/service/DomainStoryExportService";

import { ModelerPort } from "../application";
import { DomainStoryDocument, ViewportData } from "../domain";

const DEFAULT_DEBOUNCE_MS = 100;

/**
 * Infrastructure adapter that implements ModelerPort using diagram-js.
 * This adapter isolates all diagram-js framework dependencies.
 */
export class DiagramJsModelerAdapter implements ModelerPort {
    private readonly diagram: Diagram;
    private readonly eventBus: EventBus;
    private readonly canvas: Canvas;
    private readonly callbackRegistry: Map<
        (() => void) | ((viewport: ViewportData) => void),
        (event?: unknown) => void
    > = new Map();

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
        const wrapped = (event: any) =>
            this.createDebouncedCallback(() => callback())(event);
        this.callbackRegistry.set(callback, wrapped);
        (this.eventBus.on as any)("commandStack.changed", wrapped);
    }

    onViewportChanged(callback: (viewport: ViewportData) => void): void {
        const wrapped = this.createDebouncedCallback((event: any) =>
            callback(event.viewbox),
        );
        this.callbackRegistry.set(callback, wrapped);
        (this.eventBus.on as any)("canvas.viewbox.changed", wrapped);
    }

    offStoryChanged(callback: () => void): void {
        const wrapped = this.callbackRegistry.get(callback);
        if (wrapped) {
            (this.eventBus.off as any)("commandStack.changed", wrapped);
            this.callbackRegistry.delete(callback);
        }
    }

    offViewportChanged(callback: (viewport: ViewportData) => void): void {
        const wrapped = this.callbackRegistry.get(callback);
        if (wrapped) {
            (this.eventBus.off as any)("canvas.viewbox.changed", wrapped);
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

    private createDebouncedCallback(
        callback: (event?: unknown) => void,
    ): (event?: unknown) => void {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        return (event?: unknown) => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => callback(event), DEFAULT_DEBOUNCE_MS);
        };
    }
}
