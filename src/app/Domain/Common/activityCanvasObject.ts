import { CanvasObject, testCanvasObject } from './canvasObject';
import { Waypoint } from './waypoint';
import {
  ActivityBusinessObject,
  testActivityBusinessObject,
} from './activityBusinessObject';
import { elementTypes } from './elementTypes';

export interface ActivityCanvasObject extends CanvasObject {
  source: CanvasObject;
  target: CanvasObject;

  waypoints: Waypoint[];
  businessObject: ActivityBusinessObject;
}

export const testActivityCanvasObject: ActivityCanvasObject = {
  ...testCanvasObject,

  source: testCanvasObject,
  target: testCanvasObject,

  type: elementTypes.ACTIVITY,

  waypoints: [],

  businessObject: testActivityBusinessObject,
};
