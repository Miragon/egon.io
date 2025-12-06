import { Dictionary } from "../../domain/entities/dictionary";
import { IconSet } from "../../domain/entities/iconSet";
import { ElementTypes, getIconId } from "../../domain/entities/elementTypes";
import { DomainStoryBusinessObject } from "../../domain/entities/domainStoryBusinessObject";
import { sanitizeIconName } from "../../utils/sanitizer";

export const ICON_CSS_CLASS_PREFIX = "icon-domain-story-";

const customIcons = new Dictionary();

/**
 * The dictionaries hold icons (as SVG) and icon names as key-value pairs:
 */
export class IconDictionaryService {
    static $inject: string[] = [];

    // these dictionaries make up the current icon set:
    private selectedActorsDictionary = new Dictionary();
    private selectedWorkObjectsDictionary = new Dictionary();

    constructor() {}

    /** Load Icons from Configuration **/
    addIconsFromIconSetConfiguration(
        dictionaryType: ElementTypes,
        iconTypes: string[],
    ): void {
        let collection: Dictionary;
        if (dictionaryType === ElementTypes.ACTOR) {
            collection = this.selectedActorsDictionary;
        } else if (dictionaryType === ElementTypes.WORKOBJECT) {
            collection = this.selectedWorkObjectsDictionary;
        }

        const allTypes = new Dictionary();
        allTypes.appendDict(customIcons);

        iconTypes.forEach((name) => {
            if (!collection.has(name)) {
                const src = allTypes.get(name);
                if (src) {
                    this.registerIconForType(dictionaryType, name, src);
                }
            }
        });
    }

    addIconsToTypeDictionary(
        actorIcons: DomainStoryBusinessObject[],
        workObjectIcons: DomainStoryBusinessObject[],
    ) {
        if (!this.allInTypeDictionary(ElementTypes.ACTOR, actorIcons)) {
            this.addIconsFromIconSetConfiguration(
                ElementTypes.ACTOR,
                actorIcons.map((element) => getIconId(element.type)),
            );
        }
        if (!this.allInTypeDictionary(ElementTypes.WORKOBJECT, workObjectIcons)) {
            this.addIconsFromIconSetConfiguration(
                ElementTypes.WORKOBJECT,
                workObjectIcons.map((element) => getIconId(element.type)),
            );
        }
    }

    registerIconForType(type: ElementTypes, name: string, src: string): void {
        if (name.includes(type)) {
            throw new Error("Name should not include type!");
        }

        let collection = new Dictionary();
        if (type === ElementTypes.ACTOR) {
            collection = this.selectedActorsDictionary;
        } else if (type === ElementTypes.WORKOBJECT) {
            collection = this.selectedWorkObjectsDictionary;
        }
        collection.add(src, name);
    }

    unregisterIconForType(type: ElementTypes, name: string): void {
        if (name.includes(type)) {
            throw new Error("Name should not include type!");
        }

        let collection = new Dictionary();
        if (type === ElementTypes.ACTOR) {
            collection = this.selectedActorsDictionary;
        } else if (type === ElementTypes.WORKOBJECT) {
            collection = this.selectedWorkObjectsDictionary;
        }
        collection.delete(name);
    }

    updateIconRegistries(
        actors: DomainStoryBusinessObject[],
        workObjects: DomainStoryBusinessObject[],
        config: IconSet,
    ): void {
        const newIcons = new Dictionary();
        this.extractCustomIconsFromDictionary(config.actors, newIcons);
        this.extractCustomIconsFromDictionary(config.workObjects, newIcons);

        // Add new icons to the global dictionary
        newIcons.keysArray().forEach((key) => {
            const custom = newIcons.get(key);
            this.addIMGToIconDictionary(custom, key);
        });

        // Generate CSS for ALL custom icons in the current story's config
        const allCurrentIcons = new Dictionary();
        allCurrentIcons.appendDict(config.actors);
        allCurrentIcons.appendDict(config.workObjects);
        this.addIconsToCss(allCurrentIcons);

        this.addIconsToTypeDictionary(actors, workObjects);
    }

    addIMGToIconDictionary(input: string, name: string): void {
        customIcons.set(name, input);
    }

    addIconsToCss(customIcons: Dictionary) {
        const sheetEl = document.getElementById("iconsCss");
        customIcons.keysArray().forEach((key) => {
            let src = customIcons.get(key);

            // Remove width and height attributes from SVG tag to ensure consistent scaling
            src = src.replace(/<svg[^>]+>/, (match: string) => {
                return match.replace(/ (width|height)="[^"]*"/g, "");
            });

            const base64Src = btoa(src);

            const iconStyle = `
                .${ICON_CSS_CLASS_PREFIX}${sanitizeIconName(key.toLowerCase())}::before {
                  mask-image: url('data:image/svg+xml;base64,${base64Src}');
                }
            `;

            // @ts-expect-error sheet does not exist on HtmlElement
            sheetEl?.sheet?.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
        });
    }

    /** Getter & Setter **/

    getFullDictionary(): Dictionary {
        const fullDictionary = new Dictionary();
        fullDictionary.appendDict(customIcons);
        return fullDictionary;
    }

    getIconsAssignedAs(type: ElementTypes): Dictionary {
        if (type === ElementTypes.ACTOR) {
            return this.selectedActorsDictionary;
        } else if (type === ElementTypes.WORKOBJECT) {
            return this.selectedWorkObjectsDictionary;
        }
        return new Dictionary();
    }

    getTypeIconSRC(type: ElementTypes, name: string): string {
        if (type === ElementTypes.ACTOR) {
            return this.selectedActorsDictionary.get(name);
        } else if (type === ElementTypes.WORKOBJECT) {
            return this.selectedWorkObjectsDictionary.get(name);
        }
        throw new Error(`[IconDictionaryService] Unsupported value type: ${type}`);
    }

    getCSSClassOfIcon(name: string): string {
        return ICON_CSS_CLASS_PREFIX + sanitizeIconName(name.toLowerCase());
    }

    getIconSource(name: string): string {
        if (customIcons.has(name)) {
            return customIcons.get(name);
        }
        throw new Error(`[IconDictionaryService] Unsupported value name: ${name}`);
    }

    getActorsDictionary(): Dictionary {
        return this.selectedActorsDictionary;
    }

    getWorkObjectsDictionary(): Dictionary {
        return this.selectedWorkObjectsDictionary;
    }

    setIconSet(iconSet: IconSet): void {
        this.selectedActorsDictionary = iconSet.actors;
        this.selectedWorkObjectsDictionary = iconSet.workObjects;
    }

    private allInTypeDictionary(
        type: ElementTypes,
        elements: DomainStoryBusinessObject[],
    ): boolean {
        let collection: Dictionary;
        if (type === ElementTypes.ACTOR) {
            collection = this.selectedActorsDictionary;
        } else if (type === ElementTypes.WORKOBJECT) {
            collection = this.selectedWorkObjectsDictionary;
        }

        let allIn = true;
        if (elements) {
            elements.forEach((element) => {
                if (!collection.has(getIconId(element.type))) {
                    allIn = false;
                }
            });
        } else {
            return false;
        }
        return allIn;
    }

    private extractCustomIconsFromDictionary(
        elementDictionary: Dictionary,
        customIcons: Dictionary,
    ) {
        elementDictionary.keysArray().forEach((name) => {
            const sanitizedName = sanitizeIconName(name);
            if (!this.getFullDictionary().has(sanitizedName)) {
                customIcons.add(elementDictionary.get(name), sanitizedName);
            }
        });
    }
}