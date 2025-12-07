/**
 * Type definitions for icons.
 *
 * IMPORTANT: These are ONLY type definitions (interfaces).
 * Icons are NOT stored in the client module.
 * The existing IconDictionaryService is the single source of truth.
 */

/** Map of icon names to SVG content */
export interface IconMap {
    readonly [name: string]: string;
}

/**
 * A set of icons for actors and work objects.
 * This is a Data Transfer Object (DTO) - it does not store state.
 */
export interface IconSet {
    readonly actors: IconMap;
    readonly workObjects: IconMap;
}

/** Partial icon set for loading operations */
export type IconSetData = {
    readonly actors?: IconMap;
    readonly workObjects?: IconMap;
};

/** Icon category for identifying icon type */
export type IconCategory = "actor" | "workObject";
