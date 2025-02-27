import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import MoveModule from "diagram-js/lib/features/move";
import BendpointsModule from "diagram-js/lib/features/bendpoints";
import ConnectionPreviewModule from "diagram-js/lib/features/connection-preview";
import ConnectModule from "diagram-js/lib/features/connect";
import SnappingModule from "diagram-js/lib/features/snapping";
import minimapModule from "diagram-js-minimap";

import DomainStoryPaletteProvider from "./features/palette";
import DomainStoryElementFactory from "./features/element-factory";
import DomainStoryRenderer from "./features/renderer";
import DomainStoryModeling from "./features/modeling";

const buildInModules = [
    MoveCanvasModule,
    KeyboardMoveModule,
    ZoomScrollModule,
    MoveModule,
    BendpointsModule,
    ConnectionPreviewModule,
    ConnectModule,
    SnappingModule,
    minimapModule,
];

const domainStoryModules = [
    DomainStoryModeling,
    DomainStoryRenderer,
    DomainStoryElementFactory,
    DomainStoryPaletteProvider,
];

export default {
    __depends__: [...domainStoryModules, ...buildInModules],
};
