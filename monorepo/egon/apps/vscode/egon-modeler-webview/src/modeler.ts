import Diagram from "diagram-js";
import EgonIo, {
    DomainStoryExportService,
    DomainStoryImportService,
} from "@egon/diagram-js-egon-plugin";
import Canvas from "diagram-js/lib/core/Canvas";
import ElementFactory from "diagram-js/lib/core/ElementFactory";
import EventBus from "diagram-js/lib/core/EventBus";
import { debounce } from "lodash";

let domainStoryModeler: Diagram | undefined;

export interface ModelerConfig {
    viewbox?: any;
}

export function createDomainStoryModeler(config: ModelerConfig): Diagram {
    const additionalModules = [EgonIo];

    domainStoryModeler = new Diagram({
        container: document.getElementById("egon-io-container"),
        width: "100%",
        height: "100%",
        position: "relative",
        modules: [...additionalModules],
    });

    const canvas: Canvas = domainStoryModeler.get("canvas");
    const elementFactory: ElementFactory = domainStoryModeler.get("elementFactory");

    const root = elementFactory.createRoot();

    canvas.setRootElement(root);

    if (config.viewbox) {
        canvas.viewbox(config.viewbox);
    }

    return domainStoryModeler;
}

/**
 * Get the modeler instance.
 * @throws NoModelerError if the modeler is not initialized
 */
export function getDomainStoryModeler(): Diagram {
    if (!domainStoryModeler) {
        throw new NoModelerError();
    }

    return domainStoryModeler;
}

export function importStory(story: string) {
    const importService: DomainStoryImportService = getDomainStoryModeler().get(
        "domainStoryImportService",
    );
    importService.import(story);
}

export function exportStory(): string {
    const exportService: DomainStoryExportService = getDomainStoryModeler().get(
        "domainStoryExportService",
    );
    return exportService.export();
}

/**
 * Subscribe to the `commandStack.changed` event from the `eventBus`.
 * @param cb
 * @throws NoModelerError if the modeler is not initialized
 */
export function onCommandStackChanged(cb: () => void) {
    getDomainStoryModeler()
        .get<EventBus>("eventBus")
        .on("commandStack.changed", debounce(cb, 100));
}

/**
 * Subscribe to the `canvas.viewbox.changed` event from the `eventBus`.
 * @param cb
 * @throws NoModelerError if the modeler is not initialized
 */
export function onZoomChanged(cb: (event: any) => void) {
    getDomainStoryModeler()
        .get<EventBus>("eventBus")
        .on("canvas.viewbox.changed", debounce(cb, 100));
}

export class NoModelerError extends Error {
    constructor() {
        super("Modeler is not initialized!");
    }
}
