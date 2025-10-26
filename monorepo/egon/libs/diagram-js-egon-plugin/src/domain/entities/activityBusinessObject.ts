import { BusinessObject } from "./businessObject";
import { Waypoint } from "./waypoint";

export interface ActivityBusinessObject extends BusinessObject {
    number: number | undefined;
    multipleNumberAllowed: boolean;

    waypoints: Waypoint[];

    source: string;
    target: string;
}
