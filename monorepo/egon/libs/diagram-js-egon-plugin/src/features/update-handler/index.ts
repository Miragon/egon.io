import DomainStoryModeling from "../modeling";
import DomainStoryTextRenderer from "../text-renderer";

import { DomainStoryUpdateLabelHandler } from "./DomainStoryUpdateLabelHandler";

export default {
    __depends__: [DomainStoryModeling, DomainStoryTextRenderer],
    __init__: ["domainStoryUpdateLabelHandler"],
    domainStoryUpdateLabelHandler: ["type", DomainStoryUpdateLabelHandler],
};
