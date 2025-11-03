import { angleBetween } from "./mathExtensions";
import { Connection } from "diagram-js/lib/model/Types";

export interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
    textAlign: string;
}

// defines the box for activity numbers
export function numberBoxDefinitions(element: Connection): Box {
    const alignment = "center";
    const boxWidth = 30;
    const boxHeight = 30;
    let angle = 0;

    if (element.waypoints.length > 1) {
        angle =
            angleBetween(
                // Start of a first arrow segment
                element.waypoints[0],
                // End of a first arrow segment
                element.waypoints[1],
            ) ?? 0;
    }
    let x = element.waypoints[0].x;
    let y = element.waypoints[0].y;

    let fixedOffsetX = 0;
    let fixedOffsetY = 0;
    let angleDependantOffsetX = 0;
    let angleDependantOffsetY = 0;

    // Fine tune positioning of sequence number above beginning of first arrow segment
    if (angle >= 0 && angle <= 45) {
        fixedOffsetX = 25;
        angleDependantOffsetY = 20 * (1 - angle / 45);
    } else if (angle <= 90) {
        fixedOffsetX = 5;
        angleDependantOffsetX = 15 * (1 - (angle - 45) / 45);
    } else if (angle <= 135) {
        fixedOffsetX = 5;
        angleDependantOffsetX = -20 * ((angle - 90) / 45);
    } else if (angle <= 180) {
        fixedOffsetX = -15;
        angleDependantOffsetY = 20 * ((angle - 135) / 45);
    } else if (angle <= 225) {
        fixedOffsetX = -15;
        fixedOffsetY = 15;
        angleDependantOffsetY = 25 * ((angle - 180) / 45);
    } else if (angle <= 270) {
        fixedOffsetX = 5;
        angleDependantOffsetX = -20 * (1 - (angle - 225) / 45);
        fixedOffsetY = 40;
    } else if (angle <= 315) {
        fixedOffsetX = 5;
        angleDependantOffsetX = 25 * ((angle - 270) / 45);
        fixedOffsetY = 40;
    } else {
        fixedOffsetX = 25;
        fixedOffsetY = 20;
        angleDependantOffsetY = 15 * (1 - (angle - 315) / 45);
    }

    x = x + fixedOffsetX + angleDependantOffsetX;
    y = y + fixedOffsetY + angleDependantOffsetY;

    return {
        textAlign: alignment,
        width: boxWidth,
        height: boxHeight,
        x: x,
        y: y,
    };
}
