import DomainStoryModeling from "../modeling";
import ElementRegistryService from "../../domain/service";
import { DomainStoryNumberingRegistry } from "./DomainStoryNumberingRegistry";
import { DomainStoryNumberingUi } from "./DomainStoryNumberingUi";

export default {
    __depends__: [DomainStoryModeling, ElementRegistryService],
    __init__: ["domainStoryNumberingRegistry", "domainStoryNumberingUi"],
    domainStoryNumberingRegistry: ["type", DomainStoryNumberingRegistry],
    domainStoryNumberingUi: ["type", DomainStoryNumberingUi],
};
