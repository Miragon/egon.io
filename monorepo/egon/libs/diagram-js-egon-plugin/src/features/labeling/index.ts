import ResizeModule from "diagram-js/lib/features/resize";
import DirectEditingModule from "diagram-js-direct-editing/lib";

import DomainStoryModeling from "../modeling";
import DomainStoryTextRenderer from "../text-renderer";

import { DomainStoryLabelEditingProvider } from "./DomainStoryLabelEditingProvider";

export default {
    __depends__: [
        DomainStoryModeling,
        DomainStoryTextRenderer,
        DirectEditingModule,
        ResizeModule,
    ],
    __init__: ["domainStoryLabelEditingProvider"],
    domainStoryLabelEditingProvider: DomainStoryLabelEditingProvider,
};
