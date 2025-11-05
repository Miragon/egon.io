import { ElementRegistryService } from "@egon/diagram-js-egon-plugin";

export class IconSetImportExportService {
    static $inject: string[] = [
        "domainStoryElementRegistryService"
    ];
    
    constructor(
        private readonly elementRegistryService: ElementRegistryService,
    ) {
    }
}
