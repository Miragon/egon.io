import ElementRegistryService from "../../domain/service";
import IconSetImportExportService from "../../icon-set-config/service";
import { DomainStoryExportService } from "./DomainStoryExportService";

export default {
    __depends__: [ElementRegistryService, IconSetImportExportService],
    __init__: ["domainStoryExportService"],
    domainStoryExportService: ["type", DomainStoryExportService],
};
