import { Shape } from "diagram-js/lib/model/Types";
import { forEach } from "min-dash";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { DomainStoryReplace } from "./DomainStoryReplace";
import { DomainStoryReplaceOption } from "./DomainStoryReplaceOption";

export class DomainStoryReplaceMenuProvider {
    static $inject: string[] = [];

    constructor(
        private readonly domainStoryReplace: DomainStoryReplace,
        private readonly domainStoryReplaceOption: DomainStoryReplaceOption,
    ) {}

    /**
     * Get all entries from replaceOptions for the given element and apply filters
     * on them. Get, for example, only elements, which are different from the current one.
     * @return a list of menu entry items
     */
    getEntries(element: Shape) {
        let entries;
        if (element["type"].includes(ElementTypes.ACTOR)) {
            entries = this.domainStoryReplaceOption.actorReplaceOptions(element["type"]);
        } else if (element["type"].includes(ElementTypes.WORKOBJECT)) {
            entries = this.domainStoryReplaceOption.workObjectReplaceOptions(
                element["type"],
            );
        }

        return this.createEntries(element, entries);
    }

    /**
     * Creates an array of menu entry objects for a given element and filters the replaceOptions
     * according to a filter function.
     * @return a list of menu items
     */
    private createEntries(element: Shape, replaceOptions: any) {
        const menuEntries: any[] = [];

        forEach(replaceOptions, (definition) => {
            const entry = this.createMenuEntry(definition, element);
            menuEntries.push(entry);
        });

        return menuEntries;
    }

    /**
     * Creates and returns a single menu entry item.
     *
     * @param  definition a single replace options definition object
     * @param  element the element to replace
     * @param  action an action callback function which gets called when
     *         the menu entry is being triggered.
     *
     * @return menu entry item
     */
    private createMenuEntry(definition: any, element: Shape, action?: () => void) {
        const replaceElement = this.domainStoryReplace.replaceElement;
        const replaceAction = () => {
            return replaceElement(element, definition.target);
        };

        action = action || replaceAction;

        return {
            label: definition.label,
            className: definition.className,
            id: definition.actionName,
            action: action,
        };
    }
}

DomainStoryReplaceMenuProvider.$inject = [
    "domainStoryReplace",
    "domainStoryReplaceOption",
];
