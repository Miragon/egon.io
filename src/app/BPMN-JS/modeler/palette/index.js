import ElementFactory from "diagram-js/lib/core/ElementFactory";
import DSModeling from "../modeling/dSModeling";

export default {
  __depends__: [],
  __init__: ["paletteProvider"],
  elementFactoryBpmn: ["type", ElementFactory],
  modeling: ["type", DSModeling],
};
