import { ViewportData } from "../domain/model/Viewport";

/**
 * Configuration options for creating an EgonClient instance.
 */
export interface EgonClientConfig {
    /** The HTML element to render the diagram into */
    readonly container: HTMLElement;
    /** Width of the diagram canvas (default: "100%") */
    readonly width?: string;
    /** Height of the diagram canvas (default: "100%") */
    readonly height?: string;
    /** Initial viewport configuration */
    readonly viewport?: ViewportData;
}
