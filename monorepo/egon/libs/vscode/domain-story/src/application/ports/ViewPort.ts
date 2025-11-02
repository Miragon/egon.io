/**
 * Port interface for webview display operations.
 * 
 * This abstraction allows the application layer to update the webview
 * without depending on VS Code's specific APIs.
 * 
 * @example
 * ```typescript
 * class VsCodeViewPort implements ViewPort {
 *     constructor(private panel: WebviewPanel) {}
 * 
 *     async display(editorId: string, text: string): Promise<void> {
 *         const command = new DisplayDomainStoryCommand(editorId, text);
 *         await this.panel.webview.postMessage(command);
 *     }
 * }
 * ```
 */
export interface ViewPort {
    /**
     * Displays content in the webview.
     * 
     * @param editorId - Unique identifier for the editor (typically file path)
     * @param text - Content to display in the webview
     * @returns Promise that resolves when the display operation completes
     */
    display(editorId: string, text: string): Promise<void>;
}
