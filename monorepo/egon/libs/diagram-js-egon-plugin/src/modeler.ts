import DomainStoryPaletteProvider from "./features/palette";
import DomainStoryElementFactory from "./features/element-factory";
import DomainStoryRenderer from "./features/renderer";
import DomainStoryModeling from "./features/modeling";

export default {
    __depends__: [
        DomainStoryModeling,
        DomainStoryRenderer,
        DomainStoryElementFactory,
        DomainStoryPaletteProvider,
    ],
};
