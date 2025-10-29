import EventBus from "diagram-js/lib/core/EventBus";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { html, render } from "diagram-js/lib/ui";
import PopupMenu from "../../ui/PopupMenu";
import { DomainStoryNumberingRegistry } from "./DomainStoryNumberingRegistry";
import { ActivityCanvasObject } from "../../domain/entities/activityCanvasObject";
import CommandStack from "diagram-js/lib/command/CommandStack";
import { ElementRegistryService } from "../../domain/service/ElementRegistryService";
import Canvas from "diagram-js/lib/core/Canvas";

export class DomainStoryPopupService {
    static $inject: string[] = [];

    private popupElement: HTMLElement | null = null;

    constructor(
        private readonly canvas: Canvas,
        private readonly eventBus: EventBus,
        private readonly commandStack: CommandStack,
        private readonly elementRegistryService: ElementRegistryService,
        private readonly domainStoryNumberingRegistry: DomainStoryNumberingRegistry,
    ) {
        this.eventBus.on("element.dblclick", (event: any) => {
            const { element } = event;
            if (element.type?.includes(ElementTypes.ACTIVITY)) {
                this.open(element);
            }
        });
    }

    open(element: ActivityCanvasObject) {
        const position = this.calculatePosition(element);

        const onUpdate = (
            label: string,
            index: number | undefined,
            isMultiple: boolean,
        ) => {
            this.handleUpdate(element, label, index, isMultiple);
            this.close();
        };

        const onCancel = () => {
            this.close();
        };

        const parentElement = document.getElementById("egon-io-container");
        if (parentElement) {
            // Remove any existing popup first
            this.close();

            const tempContainer = document.createElement("div");

            const isActivityFromActor =
                !!this.elementRegistryService.getActivityFromActorById(
                    element.businessObject.id,
                );

            render(
                html`<${PopupMenu}
                    x=${position.x}
                    y=${position.y}
                    label=${element.businessObject.name}
                    index=${element.businessObject.number}
                    isMultiple=${element.businessObject.multipleNumberAllowed}
                    displayNumber=${isActivityFromActor}
                    onUpdate=${onUpdate}
                    onCancel=${onCancel}
                />`,
                tempContainer,
            );

            // Get the actual popup element (the first child of temp container)
            this.popupElement = tempContainer.firstElementChild as HTMLElement;

            if (this.popupElement) {
                this.popupElement.setAttribute("data-numbering-popup", "true");
                parentElement.appendChild(this.popupElement);
            }

            // Add click listener to close on an outside click
            setTimeout(() => {
                document.addEventListener("click", this.handleOutsideClick, true);
            }, 0);
        }
    }

    private close() {
        if (this.popupElement) {
            document.removeEventListener("click", this.handleOutsideClick, true);
            this.popupElement.remove();
            this.popupElement = null;
        }
    }

    private handleUpdate = (
        element: ActivityCanvasObject,
        label: string,
        number: number | undefined,
        isMultiple: boolean,
    ) => {
        const activitiesFromActors =
            this.elementRegistryService.getActivitiesFromActors();
        const index = activitiesFromActors.indexOf(element);

        activitiesFromActors.splice(index, 1);

        if (number) {
            element.businessObject.number = number;
            this.domainStoryNumberingRegistry.setNumberIsMultiple(number, isMultiple);
        }
        element.businessObject.multipleNumberAllowed = isMultiple;

        let options: any;
        if (number) {
            options = {
                businessObject: element.businessObject,
                newLabel: label,
                newNumber: number,
                element,
            };
        } else {
            options = {
                businessObject: element.businessObject,
                newLabel: label,
                element,
            };
        }

        this.commandStack.execute("activity.changed", options);

        if (number) {
            if (element.businessObject.multipleNumberAllowed) {
                if (
                    !this.domainStoryNumberingRegistry.getMultipleNumberRegistry()[
                        number
                    ]
                ) {
                    this.domainStoryNumberingRegistry.updateExistingNumbersAtEditing(
                        activitiesFromActors,
                        number,
                    );
                }
            } else if (!element.businessObject.multipleNumberAllowed) {
                this.domainStoryNumberingRegistry.updateExistingNumbersAtEditing(
                    activitiesFromActors,
                    number,
                );
            }
        }
    };

    private handleOutsideClick = (event: MouseEvent) => {
        if (!this.popupElement) return;

        // Check if the click target is inside the popup or any of its children
        const target = event.target as HTMLElement;
        const clickedInsidePopup = target.closest('[data-numbering-popup="true"]');

        if (!clickedInsidePopup) {
            this.close();
        }
    };

    private calculatePosition(element: ActivityCanvasObject) {
        const point1 = element["waypoints"][0];
        const point2: any = element["waypoints"][element["waypoints"].length - 1];
        const canvasX = (point1.x + point2.x) / 2;
        const canvasY = (point1.y + point2.y) / 2;

        const viewbox = this.canvas.viewbox();
        return {
            x: (canvasX - viewbox.x) * viewbox.scale,
            y: (canvasY - viewbox.y) * viewbox.scale,
        };
    }
}

DomainStoryPopupService.$inject = [
    "canvas",
    "eventBus",
    "commandStack",
    "domainStoryElementRegistryService",
    "domainStoryNumberingRegistry",
];
