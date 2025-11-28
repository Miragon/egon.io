import { IconName } from "./IconName";
import { IconType } from "./IconType";

export const ICON_BASE_PATH = ".egon/icons";
export const ACTOR_ICON_PATH = `${ICON_BASE_PATH}/actors`;
export const WORK_OBJECT_ICON_PATH = `${ICON_BASE_PATH}/work-objects`;

export interface IconPathMetadata {
    type: IconType;
    name: IconName;
}

export function tryParseIconPath(path: string): IconPathMetadata | null {
    const normalizedPath = path.replace(/\\/g, "/");

    let type: IconType | undefined;
    if (normalizedPath.includes(`/${ACTOR_ICON_PATH}/`)) {
        type = IconType.Actor;
    } else if (normalizedPath.includes(`/${WORK_OBJECT_ICON_PATH}/`)) {
        type = IconType.WorkObject;
    } else {
        return null;
    }

    const name = IconName.fromFileName(normalizedPath);
    if (!name) return null;

    return { type, name };
}
