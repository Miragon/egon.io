import { IconDictionaryService } from "./IconDictionaryService";
import { IconSetImportExportService } from "./IconSetImportExportService";

export default {
    __init__: [
        "domainStoryIconDictionaryService",
        "domainStoryIconSetImportExportService",
    ],
    domainStoryIconDictionaryService: ["type", IconDictionaryService],
    domainStoryIconSetImportExportService: ["type", IconSetImportExportService],
};
