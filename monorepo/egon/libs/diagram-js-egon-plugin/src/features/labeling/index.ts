import ResizeModule from "diagram-js/lib/features/resize";
import DirectEditingModule from "diagram-js-direct-editing/lib";
import CommandStack from "diagram-js/lib/command";

import DomainStoryModeling from "../modeling";
import DomainStoryTextRenderer from "../text-renderer";
import LabelDictionaryService from "../../label-dictionary/service";

import { DomainStoryLabelEditingProvider } from "./DomainStoryLabelEditingProvider";

export default {
    __depends__: [
        DomainStoryModeling,
        DomainStoryTextRenderer,
        LabelDictionaryService,
        DirectEditingModule,
        ResizeModule,
        CommandStack,
    ],
    __init__: ["domainStoryLabelEditingProvider"],
    domainStoryLabelEditingProvider: ["type", DomainStoryLabelEditingProvider],
};
