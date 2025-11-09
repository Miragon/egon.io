import { assign, isArray } from "min-dash";
import Canvas from "diagram-js/lib/core/Canvas";
import { Connection, ElementLike, Shape } from "diagram-js/lib/model/Types";
import { html, render } from "diagram-js/lib/ui";
import EventBus from "diagram-js/lib/core/EventBus";
import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import { ImportRepairService } from "./ImportRepairService";
import { BusinessObject } from "../../domain/entities/businessObject";
import { DomainStoryElementFactory } from "../../features/element-factory/DomainStoryElementFactory";
import { ConfigAndDST } from "../../export/domain/configAndDst";
import { ElementTypes } from "../../domain/entities/elementTypes";
import VersionBox from "../../ui/VersionBox";
import {
    FileConfiguration,
    IconSetImportExportService,
} from "../../icon-set-config/service/IconSetImportExportService";
import { IconSet } from "../../domain/entities/iconSet";
import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";

export class DomainStoryImportService {
    static $inject: string[] = [
        "eventBus",
        "canvas",
        "elementRegistry",
        "elementFactory",
        "domainStoryIconDictionaryService",
        "domainStoryIconSetImportExportService",
    ];

    private readonly elements: ElementLike[] = [];

    private readonly groupElements: ElementLike[] = [];

    private readonly importRepairService = new ImportRepairService();

    constructor(
        private readonly eventBus: EventBus,
        private readonly canvas: Canvas,
        private readonly elementRegistry: ElementRegistry,
        private readonly elementFactory: DomainStoryElementFactory,
        private readonly iconDictionaryService: IconDictionaryService,
        private readonly iconSetImportExportService: IconSetImportExportService,
    ) {}

    /**
     * @throws Error if import fails
     * @param story
     */
    import(story: string) {
        const configAndDST: ConfigAndDST = JSON.parse(story);

        let domainStoryElements = configAndDST.dst;
        const domainStoryIcons: FileConfiguration = configAndDST.domain;

        const iconSet: IconSet =
            this.iconSetImportExportService.createIconSetConfiguration(domainStoryIcons);

        this.importRepairService.removeWhitespacesFromIcons(domainStoryElements);
        this.importRepairService.removeUnnecessaryBpmnProperties(domainStoryElements);
        this.importRepairService.checkForUnreferencedElementsInActivitiesAndRepair(
            domainStoryElements,
        );

        this.eventBus.fire("diagram.clear", {});

        if (!isArray(domainStoryElements)) {
            throw new Error("argument must be an array");
        }

        // files downloaded from the web version include objects that are not
        // part of the domain story but are used for the web version.
        // We need to filter them out.
        let lastElement = domainStoryElements[domainStoryElements.length - 1];
        if (!lastElement.id) {
            lastElement = domainStoryElements.pop();
            let importVersionNumber = lastElement;

            // if the last element has the tag 'version',
            // then there exists another tag 'info' for the description
            if (importVersionNumber.version) {
                lastElement = domainStoryElements.pop();
                importVersionNumber = importVersionNumber.version as string;
            } else {
                importVersionNumber = "?";
            }
            domainStoryElements = this.handleVersionNumber(
                importVersionNumber,
                domainStoryElements,
            );
        }

        const connections: Connection[] = [],
            groups: Shape[] = [],
            otherElementTypes: ElementLike[] = [];

        domainStoryElements.forEach(function (bo: any) {
            if (isOfTypeConnection(bo)) {
                connections.push(bo as unknown as Connection);
            } else if (isOfTypeGroup(bo)) {
                groups.push(bo as unknown as Shape);
            } else {
                otherElementTypes.push(bo);
            }
        });

        this.iconSetImportExportService.loadConfiguration(iconSet);
        this.eventBus.fire("dst.config.changed", { iconSet });

        // add groups before shapes and other element types before connections so that connections
        // can already rely on the shapes being part of the diagram
        groups.forEach(this.createElementFromBusinessObject, this);
        otherElementTypes.forEach(this.createElementFromBusinessObject, this);
        connections.forEach(this.addConnection, this);
    }

    private createElementFromBusinessObject(businessObject: any) {
        const parentId = businessObject.parent;
        delete businessObject.children;
        delete businessObject.parent;

        this.elements.push(businessObject);

        const attributes = assign({ businessObject }, businessObject);
        const shape = this.elementFactory.create("shape", attributes);

        if (isOfTypeGroup(businessObject)) {
            this.groupElements[businessObject.id] = shape;
        }

        if (parentId) {
            const parentShape = this.groupElements[parentId];

            if (isOfTypeGroup(parentShape)) {
                return this.canvas.addShape(shape, parentShape, Number(parentShape.id));
            }
        }
        return this.canvas.addShape(shape);
    }

    // FIXME: use an actual type for element. It should be BusinessObject from the domain.
    private addConnection(element: any) {
        this.elements.push(element);

        const attributes = assign({ businessObject: element }, element);

        if (element.source === undefined || element.target === undefined) {
            throw new Error("source and target must be defined");
        }

        const connection = this.elementFactory.create(
            "connection",
            assign(attributes, {
                source: this.elementRegistry.get(element.source),
                target: this.elementRegistry.get(element.target),
            }),
            // this.elementRegistry.get(element.source!.id).parent,
        );

        return this.canvas.addConnection(connection);
    }

    private handleVersionNumber(
        importVersionNumber: string,
        elements: BusinessObject[],
    ): BusinessObject[] {
        const versionPrefix = +importVersionNumber.substring(
            0,
            importVersionNumber.lastIndexOf("."),
        );
        if (versionPrefix <= 0.5) {
            elements =
                this.importRepairService.updateCustomElementsPreviousV050(elements);
            // TODO: add V050 dialog
            // this.showPreviousV050Dialog(versionPrefix);
        }

        const parentElement = document.getElementById("egon-io-container");
        if (parentElement) {
            render(
                html` <${VersionBox} version=${importVersionNumber} />`,
                parentElement,
            );
        }

        return elements;
    }
}

function isOfTypeConnection(element: BusinessObject) {
    return (
        element.type === ElementTypes.ACTIVITY ||
        element.type === ElementTypes.CONNECTION
    );
}

function isOfTypeGroup(element: BusinessObject | ElementLike) {
    return element && element.type === ElementTypes.GROUP;
}
