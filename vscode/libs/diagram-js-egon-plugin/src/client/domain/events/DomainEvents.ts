import { Viewport } from "../model/Viewport";
import { IconSet } from "../model/IconTypes";

/**
 * Domain events emitted by the modeler.
 * These are internal events that get mapped to user-friendly event names.
 */
export interface StoryChangedEvent {
    readonly type: "StoryChanged";
}

export interface ViewportChangedEvent {
    readonly type: "ViewportChanged";
    readonly viewport: Viewport;
}

export interface IconsChangedEvent {
    readonly type: "IconsChanged";
    readonly icons: IconSet;
}

export type DomainEvent = StoryChangedEvent | ViewportChangedEvent | IconsChangedEvent;
