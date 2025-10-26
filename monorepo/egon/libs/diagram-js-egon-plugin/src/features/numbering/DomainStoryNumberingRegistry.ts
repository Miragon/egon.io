import EventBus from "diagram-js/lib/core/EventBus";
import { Element } from "diagram-js/lib/model/Types";

import { ElementRegistryService } from "../../domain/service/ElementRegistryService";
import { ActivityCanvasObject } from "../../domain/entities/activityCanvasObject";
import CommandStack from "diagram-js/lib/command/CommandStack";
import { ActivityBusinessObject } from "../../domain/entities/activityBusinessObject";

export class DomainStoryNumberingRegistry {
    static $inject: string[] = [];

    /**
     * Specifies the position of the activity in the sequence.
     */
    private numberRegistry: SVGElement[] = [];

    /**
     * Specifies whether the index may occur multiple times.
     */
    private multipleNumberRegistry = [false];

    constructor(
        private readonly eventBus: EventBus,
        private readonly commandStack: CommandStack,
        private readonly domainStoryElementRegistryService: ElementRegistryService,
    ) {}

    /**
     * @returns copy of registry
     */
    getNumberRegistry() {
        return this.numberRegistry.slice(0);
    }

    getMultipleNumberRegistry() {
        return this.multipleNumberRegistry.slice(0);
    }

    add(renderedNumber: SVGElement, number: number) {
        this.numberRegistry[number] = renderedNumber;
    }

    setNumberIsMultiple(number: number, multi: boolean) {
        this.multipleNumberRegistry[number] = multi;
    }

    updateMultipleNumberRegistry(activityBusinessObjects: ActivityBusinessObject[]) {
        activityBusinessObjects.forEach(
            (activity) =>
                (this.multipleNumberRegistry[activity.number ?? 0] =
                    activity.multipleNumberAllowed),
        );
    }

    /**
     * Get the IDs of activities with their associated number, only returns activities that are originating from an actor
     */
    getNumbersAndIDs() {
        const iDWithNumber = [];
        const activities =
            this.domainStoryElementRegistryService.getActivitiesFromActors();

        for (let i = activities.length - 1; i >= 0; i--) {
            const id = activities[i].businessObject.id;
            const number = activities[i].businessObject.number;
            iDWithNumber.push({ id: id, number: number });
        }
        return iDWithNumber;
    }

    /**
     * Determine the next available number that is not yet used
     */
    generateAutomaticNumber(elementActivity: Element) {
        const semantic = elementActivity.businessObject;
        const usedNumbers = [0];
        let wantedNumber = -1;

        const activitiesFromActors =
            this.domainStoryElementRegistryService.getActivitiesFromActors();

        activitiesFromActors.forEach((element) => {
            if (element.businessObject.number) {
                usedNumbers.push(+element.businessObject.number);
            }
        });
        for (let i = 0; i < usedNumbers.length; i++) {
            if (!usedNumbers.includes(i)) {
                if (!usedNumbers.includes(i)) {
                    wantedNumber = i;
                    i = usedNumbers.length;
                }
            }
        }
        if (wantedNumber === -1) {
            wantedNumber = usedNumbers.length;
        }

        this.updateExistingNumbersAtGeneration(activitiesFromActors, wantedNumber);
        semantic.number = wantedNumber;
        return wantedNumber;
    }

    /**
     * update the numbers at the activities when generating a new activity
     */
    updateExistingNumbersAtGeneration(
        activitiesFromActors: ActivityCanvasObject[],
        wantedNumber: number,
    ) {
        activitiesFromActors.forEach((element) => {
            const number = element.businessObject.number ?? 0;

            if (number >= wantedNumber) {
                wantedNumber++;
                setTimeout(() => {
                    this.commandStack.execute("activity.changed", {
                        businessObject: element.businessObject,
                        newLabel: element.businessObject.name,
                        newNumber: number,
                        element: element,
                    });
                }, 10);
            }
        });
    }

    /**
     * Update the numbers at the activities when editing an activity
     */
    updateExistingNumbersAtEditing(
        activitiesFromActors: ActivityCanvasObject[],
        wantedNumber: number,
    ) {
        // get a sorted list of all activities that could need changing
        const sortedActivities: ActivityCanvasObject[][] = [[]];
        activitiesFromActors.forEach((activity) => {
            if (activity.businessObject.number) {
                if (!sortedActivities[activity.businessObject.number]) {
                    sortedActivities[activity.businessObject.number] = [];
                }
                sortedActivities[activity.businessObject.number].push(activity);
            }
        });

        // set the number of each activity to the next highest number, starting from the number, we overrode
        const oldMultipleNumberRegistry = [...this.multipleNumberRegistry];
        let currentNumber = wantedNumber;
        for (currentNumber; currentNumber < sortedActivities.length; currentNumber++) {
            if (sortedActivities[currentNumber]) {
                wantedNumber++;
                this.multipleNumberRegistry[wantedNumber] =
                    oldMultipleNumberRegistry[currentNumber];
                this.setNumberOfActivity(sortedActivities[currentNumber], wantedNumber);
            }
        }
    }

    /**
     * Find all gaps in the sequence starting from 1.
     * @returns Array of missing numbers from 1 to max
     * @example [1, 4, 5, 7] -> [2, 3, 6]
     * @example [3, 5, 5, 8] -> [1, 2, 4, 6, 7]
     */
    private findGaps(): number[] {
        const values = Object.keys(this.numberRegistry).map(Number);

        if (values.length === 0) {
            return [];
        }

        // Get unique values to handle duplicates
        const uniqueValues = new Set(values);

        const max = Math.max(...values);

        const gaps: number[] = [];

        // Check each number from 1 to max
        for (let i = 1; i <= max; i++) {
            if (!uniqueValues.has(i)) {
                gaps.push(i);
            }
        }

        return gaps;
    }

    private setNumberOfActivity(
        elementArray: ActivityCanvasObject[],
        wantedNumber: number,
    ) {
        if (elementArray) {
            elementArray.forEach((element) => {
                if (element) {
                    const businessObject = element.businessObject;
                    if (businessObject) {
                        businessObject.number = wantedNumber;
                    }
                    this.eventBus.fire("element.changed", { element });
                }
            });
        }
    }

    /**
     * If a number was deleted, the numbering needs to be recalculated to avoid gaps.
     * @private
     */
    // private rerender(): void {
    //     const gaps = this.findGaps();
    //     for (const gap of gaps) {
    //         for (const [activityId, index] of this.numberRegistry.entries()) {
    //             // FIXME: if the gap is more than 1, the numbering is not correct
    //             const newNumber = index - 1;
    //             if (index - 1 === gap) {
    //                 this.numberRegistry.set(activityId, newNumber);
    //                 const activity =
    //                     this.domainStoryElementRegistryService.getActivityById(
    //                         activityId,
    //                     );
    //                 if (activity) {
    //                     activity.businessObject.number = newNumber;
    //                     const element = activity.businessObject as unknown as Element;
    //                     this.modeling.updateNumber(element, newNumber);
    //                 }
    //             }
    //         }
    //     }
    // }
}

DomainStoryNumberingRegistry.$inject = [
    "eventBus",
    "commandStack",
    "domainStoryElementRegistryService",
];
