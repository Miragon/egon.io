import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";
import { ElementTypes } from "../../domain/entities/elementTypes";

export class DomainStoryReplaceOption {
    static $inject: string[] = [];

    constructor(private readonly iconDictionaryService: IconDictionaryService) {}

    actorReplaceOptions(name: string) {
        const actors = this.iconDictionaryService.getIconsAssignedAs(ElementTypes.ACTOR);

        const replaceOption: any[] = [];

        actors.keysArray().forEach((actorType, index) => {
            if (!name.includes(actorType)) {
                const typeName = actorType;
                replaceOption[index] = {
                    label: "Change to " + typeName,
                    actionName: "replace-with-actor-" + typeName.toLowerCase(),
                    className: this.iconDictionaryService.getCSSClassOfIcon(actorType),
                    target: {
                        type: `${ElementTypes.ACTOR}${actorType}`,
                    },
                };
            }
        });
        return replaceOption;
    }

    workObjectReplaceOptions(name: string) {
        const workObjects = this.iconDictionaryService.getIconsAssignedAs(
            ElementTypes.WORKOBJECT,
        );

        const replaceOption: any[] = [];

        workObjects.keysArray().forEach((workObjectType, index) => {
            if (!name.includes(workObjectType)) {
                const typeName = workObjectType;
                replaceOption[index] = {
                    label: "Change to " + typeName,
                    actionName: "replace-with-actor-" + typeName,
                    className:
                        this.iconDictionaryService.getCSSClassOfIcon(workObjectType),
                    target: {
                        type: `${ElementTypes.WORKOBJECT}${workObjectType}`,
                    },
                };
            }
        });
        return replaceOption;
    }
}

DomainStoryReplaceOption.$inject = ["domainStoryIconDictionaryService"];
