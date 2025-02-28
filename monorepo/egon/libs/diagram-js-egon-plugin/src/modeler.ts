import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import MoveModule from "diagram-js/lib/features/move";
import BendpointsModule from "diagram-js/lib/features/bendpoints";
import ConnectionPreviewModule from "diagram-js/lib/features/connection-preview";
import SnappingModule from "diagram-js/lib/features/snapping";
import minimapModule from "diagram-js-minimap";

import DomainStoryElementFactory from "./features/element-factory";
import DomainStoryRenderer from "./features/renderer";
import DomainStoryModeling from "./features/modeling";
import DomainStoryPaletteProvider from "./features/palette";
import DomainStoryContextPadProvider from "./features/context-pad";

const buildInModules = [
    MoveCanvasModule,
    KeyboardMoveModule,
    ZoomScrollModule,
    MoveModule,
    BendpointsModule,
    ConnectionPreviewModule,
    SnappingModule,
    minimapModule,
];

const domainStoryModules = [
    DomainStoryElementFactory,
    DomainStoryRenderer,
    DomainStoryModeling,
    DomainStoryPaletteProvider,
    DomainStoryContextPadProvider,
];

export default {
    __depends__: [...domainStoryModules, ...buildInModules],
};
