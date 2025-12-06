import ConnectModule from "diagram-js/lib/features/connect";
import CreateModule from "diagram-js/lib/features/create";
import PopupMenuModule from "diagram-js/lib/features/popup-menu";
import CommandStackModule from "diagram-js/lib/command";
import TranslateModule from "diagram-js/lib/i18n/translate";
import RulesModule from "diagram-js/lib/features/rules";
import SchedulerModule from "diagram-js/lib/features/scheduler";

import DomainStoryElementFactory from "../element-factory";
import DomainStoryModeling from "../modeling";
import DomainStoryReplaceMenuProvider from "../replace";
import DomainStoryDirtyFlagService from "../../domain/service";
import DomainStoryIconDictionaryService from "../../icon-set-config/service";

import { DomainStoryContextPadProvider } from "./DomainStoryContextPadProvider";
import { DomainStoryContextPad } from "./DomainStoryContextPad";

export default {
    __depends__: [
        DomainStoryElementFactory,
        DomainStoryModeling,
        DomainStoryReplaceMenuProvider,
        DomainStoryDirtyFlagService,
        DomainStoryIconDictionaryService,
        RulesModule,
        ConnectModule,
        CreateModule,
        TranslateModule,
        SchedulerModule,
        PopupMenuModule,
        CommandStackModule,
    ],
    __init__: ["contextPad", "domainStoryContextPadProvider"],
    contextPad: ["type", DomainStoryContextPad],
    domainStoryContextPadProvider: ["type", DomainStoryContextPadProvider],
};
