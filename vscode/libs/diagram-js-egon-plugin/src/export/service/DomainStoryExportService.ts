import { ElementRegistryService } from "../../domain/service/ElementRegistryService";
import { BusinessObject } from "../../domain/entities/businessObject";
import { ConfigAndDST } from "../domain/configAndDst";
import { IconSetImportExportService } from "../../icon-set-config/service/IconSetImportExportService";

export class DomainStoryExportService {
    static $inject: string[] = [
        "domainStoryElementRegistryService",
        "domainStoryIconSetImportExportService",
    ];

    constructor(
        private readonly elementRegistryService: ElementRegistryService,
        private readonly iconSetImportExportService: IconSetImportExportService,
    ) {}

    export(): string {
        const dst = this.getStory();
        const configAndDST = this.createConfigAndDST(dst);
        return JSON.stringify(configAndDST, null, 2);
    }

    private getStory(): unknown[] {
        const story = this.elementRegistryService
            .createObjectListForDSTDownload()
            .map((c) => c.businessObject)
            .sort((objA: BusinessObject, objB: BusinessObject) => {
                if (objA.id !== undefined && objB.id !== undefined) {
                    return objA.id.localeCompare(objB.id);
                } else {
                    return 0;
                }
            }) as unknown[];
        story.push({ info: "" });
        story.push({ version: "3.0.0" });
        return story;
    }

    private createConfigAndDST(domainStory: any): ConfigAndDST {
        return new ConfigAndDST(
            this.iconSetImportExportService.getCurrentConfigurationForExport(),
            domainStory,
        );
    }
}
