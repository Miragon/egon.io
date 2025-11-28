import { Icon, IconChange, IconName, IconType } from "../icons";
import { DomainStoryDocument, IconMap } from "./DomainStoryDocument";

export class StoryIcons {
    constructor(private doc: DomainStoryDocument) {}

    addOrUpdate(icon: Icon): void {
        const map = this.getMap(icon.type);
        map[icon.name.value] = icon.svg;
    }

    delete(type: IconType, name: IconName): void {
        const map = this.getMap(type);
        delete map[name.value];
    }

    applyChange(change: IconChange): void {
        switch (change.kind) {
            case "create":
            case "update":
                if (!change.svg) return;
                this.addOrUpdate({
                    type: change.type,
                    name: change.name,
                    svg: change.svg,
                });
                break;
            case "delete":
                this.delete(change.type, change.name);
                break;
        }
    }

    snapshot(): DomainStoryDocument {
        return this.doc;
    }

    private getMap(type: IconType): IconMap {
        return type === IconType.Actor
            ? this.doc.domain.actors
            : this.doc.domain.workObjects;
    }
}
