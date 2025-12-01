import { IconName } from "./IconName";
import { IconType } from "./IconType";

export type IconChangeKind = "create" | "update" | "delete";

export interface IconChange {
    type: IconType;
    name: IconName;
    kind: IconChangeKind;
    svg?: string;
}
