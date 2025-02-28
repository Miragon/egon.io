import { assign } from "min-dash";
import { DomainStoryModeling } from "../modeling/DomainStoryModeling";
import { Shape } from "diagram-js/lib/model/Types";

/**
 * service that allow replacing of elements.
 */
export class DomainStoryReplace {
    static $inject: string[] = [];

    constructor(private readonly modeling: DomainStoryModeling) {}

    /**
     * @param oldElement - element to be replaced
     * @param newElementData - containing information about the new Element, for example height, width, type.
     */
    replaceElement(oldElement: Shape, newElementData: Partial<Shape>) {
        const newElement = this.setCenterOfElement(newElementData, oldElement);
        const outgoingActivities = newElement.outgoing;
        const incomingActivities = newElement.incoming;

        outgoingActivities.forEach((element) => {
            element.businessObject.source = newElement.id;
        });

        incomingActivities.forEach((element) => {
            element.businessObject.target = newElement.id;
        });

        return newElement;
    }

    private setCenterOfElement(newElementData: Partial<Shape>, oldElement: Shape) {
        newElementData.x = Math.ceil(
            oldElement.x + (newElementData.width || oldElement.width) / 2,
        );
        newElementData.y = Math.ceil(
            oldElement.y + (newElementData.height || oldElement.height) / 2,
        );

        assign(newElementData, { name: oldElement.businessObject.name });

        return this.modeling.replaceShape(oldElement, newElementData as Shape, {});
    }
}

DomainStoryReplace.$inject = ["modeling"];
