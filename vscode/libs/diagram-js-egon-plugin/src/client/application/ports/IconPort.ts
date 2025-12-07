import { IconSet, IconSetData, IconCategory } from "../../domain/model/IconTypes";

/**
 * Port interface for icon management operations.
 * Infrastructure layer provides the concrete implementation.
 */
export interface IconPort {
    /**
     * Load a set of icons into the modeler.
     */
    loadIcons(icons: Partial<IconSetData>): void;

    /**
     * Add a single icon.
     */
    addIcon(category: IconCategory, name: string, svg: string): void;

    /**
     * Remove an icon.
     */
    removeIcon(category: IconCategory, name: string): void;

    /**
     * Get all currently registered icons.
     */
    getIcons(): IconSet;

    /**
     * Check if an icon exists.
     */
    hasIcon(category: IconCategory, name: string): boolean;

    /**
     * Subscribe to icon changes.
     */
    onIconsChanged(callback: (icons: IconSet) => void): void;

    /**
     * Unsubscribe from icon changes.
     */
    offIconsChanged(callback: (icons: IconSet) => void): void;
}
