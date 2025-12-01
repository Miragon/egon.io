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
 *     async display(sessionId: string, text: string): Promise<void> {
 *         const command = new DisplayDomainStoryCommand(sessionId, text);
 *         await this.panel.webview.postMessage(command);
 *     }
 * }
 * ```
 */
export interface ViewPort {
    /**
     * Displays content in the webview.
     *
     * @param sessionId - Unique identifier for the editor session
     * @param text - Content to display in the webview
     * @returns Promise that resolves when the display operation completes
     */
    display(sessionId: string, text: string): Promise<void>;
}
