import { IconDictionaryService } from "@egon/diagram-js-egon-plugin";
import { IconSet } from "../../domain/entities/iconSet";
import { Dictionary } from "../../domain/entities/dictionary";
import { sanitizeIconName } from "../../utils/sanitizer";
import { ElementTypes } from "../../domain/entities/elementTypes";

export interface FileConfiguration {
    actors: { [p: string]: any };
    workObjects: { [p: string]: any };
}

export interface IconSetConfigurationForExport {
    actors: any;
    workObjects: any;
}

export class IconSetImportExportService {
    static $inject: string[] = ["domainStoryIconDictionaryService"];

    constructor(private readonly iconDictionaryService: IconDictionaryService) {}

    public createIconSetConfiguration(fileConfiguration: FileConfiguration): IconSet {
        if (fileConfiguration === undefined) {
            return {
                actors: new Dictionary(),
                workObjects: new Dictionary(),
            };
        }

        const actorsDict = new Dictionary();
        const workObjectsDict = new Dictionary();
        Object.keys(fileConfiguration.actors).forEach((key) => {
            const icon = fileConfiguration.actors[key];
            if (icon) {
                // make sure the actor has an icon
                actorsDict.add(icon, sanitizeIconName(key));
            }
        });

        Object.keys(fileConfiguration.workObjects).forEach((key) => {
            const icon = fileConfiguration.workObjects[key];
            if (icon) {
                // make sure the work object has an icon
                workObjectsDict.add(icon, sanitizeIconName(key));
            }
        });

        return {
            actors: actorsDict,
            workObjects: workObjectsDict,
        };
    }

    public loadConfiguration(customConfig: IconSet): void {
        let actorDict = new Dictionary();
        let workObjectDict = new Dictionary();

        if (customConfig.actors.keysArray()) {
            actorDict = customConfig.actors;
            workObjectDict = customConfig.workObjects;
        } else {
            actorDict.addEach(customConfig.actors);
            workObjectDict.addEach(customConfig.workObjects);
        }

        const actorKeys = actorDict.keysArray();
        const workObjectKeys = workObjectDict.keysArray();

        this.iconDictionaryService.updateIconRegistries([], [], customConfig);

        this.iconDictionaryService.addIconsFromIconSetConfiguration(
            ElementTypes.ACTOR,
            actorKeys.map((a) => ElementTypes.ACTOR + a),
        );
        this.iconDictionaryService.addIconsFromIconSetConfiguration(
            ElementTypes.WORKOBJECT,
            workObjectKeys.map((w) => ElementTypes.WORKOBJECT + w),
        );
    }

    getCurrentConfigurationForExport(): IconSetConfigurationForExport | undefined {
        const currentConfiguration = this.getCurrentConfiguration();

        if (currentConfiguration) {
            const actors: any = {};
            const workObjects: any = {};

            currentConfiguration.actors.all().forEach((entry) => {
                actors[entry.key] = entry.value;
            });
            currentConfiguration.workObjects.all().forEach((entry) => {
                workObjects[entry.key] = entry.value;
            });

            return {
                actors: actors,
                workObjects: workObjects,
            };
        }
        return;
    }

    private getCurrentConfiguration(): IconSet | undefined {
        const actors = this.iconDictionaryService.getActorsDictionary();
        const workObjects = this.iconDictionaryService.getWorkObjectsDictionary();

        let iconSetConfiguration;

        if (actors.size() > 0 && workObjects.size() > 0) {
            iconSetConfiguration = this.createConfigFromDictionaries(
                actors,
                workObjects,
            );
        }
        return iconSetConfiguration;
    }

    private createConfigFromDictionaries(
        actorsDict: Dictionary,
        workObjectsDict: Dictionary,
    ): IconSet {
        const actorNames = actorsDict.keysArray();
        const workobjectNames = workObjectsDict.keysArray();
        const newActors = new Dictionary();
        const newWorkobjects = new Dictionary();

        // Fill Configuration from Canvas-Objects
        actorNames.forEach((actor) => {
            newActors.add(actorsDict.get(actor), actor.replace(ElementTypes.ACTOR, ""));
        });
        workobjectNames.forEach((workObject) => {
            newWorkobjects.add(
                workObjectsDict.get(workObject),
                workObject.replace(ElementTypes.WORKOBJECT, ""),
            );
        });

        return {
            actors: newActors,
            workObjects: newWorkobjects,
        };
    }
}
