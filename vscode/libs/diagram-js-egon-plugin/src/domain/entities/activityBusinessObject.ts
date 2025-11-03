import { BusinessObject, testBusinessObject } from "./businessObject";
import { Waypoint } from "./waypoint";
import { ElementTypes } from "./elementTypes";

export interface ActivityBusinessObject extends BusinessObject {
    number: number | undefined;
    multipleNumberAllowed: boolean;

    waypoints: Waypoint[];

    source: string;
    target: string;
}

export const testActivityBusinessObject: ActivityBusinessObject = {
    ...testBusinessObject,

    number: undefined,
    multipleNumberAllowed: false,
    waypoints: [],

    type: ElementTypes.ACTIVITY,

    source: "1",
    target: "2",
};
