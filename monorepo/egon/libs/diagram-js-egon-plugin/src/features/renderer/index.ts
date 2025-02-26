import DomainStoryTextRenderer from "../text-renderer";

import { DomainStoryRenderer } from "./DomainStoryRenderer";
import CommandStack from "diagram-js/lib/command";

export default {
    __depends__: [DomainStoryTextRenderer, CommandStack],
    __init__: ["domainStoryRenderer"],
    domainStoryRenderer: ["type", DomainStoryRenderer],
};
