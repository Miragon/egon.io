/**
 * The origin of a content change.
 * - `local`: Change originated from the user editing the text document directly
 * - `remote`: Change originated from the webview syncing back to the document
 */
export type ContentOrigin = 'local' | 'remote';

/**
 * Domain event emitted when editor content is updated.
 */
export interface ContentUpdatedEvent {
    /** Event type identifier */
    type: 'ContentUpdated';
    /** Origin of the content change */
    origin: ContentOrigin;
    /** Updated text content */
    text: string;
}

/**
 * Aggregate root that manages the state of a single editor session.
 * 
 * This is a pure domain entity with no external dependencies. It encapsulates
 * the content state and emits domain events when content changes.
 * 
 * @example
 * ```typescript
 * const session = new EditorSession('editor-1', 'initial content');
 * 
 * // User edits the document
 * const event = session.applyLocalChange('updated content');
 * console.log(event.origin); // 'local'
 * 
 * // Webview syncs to document
 * const event2 = session.applyRemoteSync('synced content');
 * console.log(event2.origin); // 'remote'
 * 
 * // Get current state
 * console.log(session.snapshot()); // 'synced content'
 * ```
 */
export class EditorSession {
    /**
     * Creates a new editor session.
     * 
     * @param id - Unique identifier for this editor session (typically the file path)
     * @param content - Initial content of the editor
     */
    constructor(
        readonly id: string,
        private content: string,
    ) {}

    /**
     * Returns the current content snapshot.
     * 
     * @returns Current content of the editor
     */
    snapshot(): string {
        return this.content;
    }

    /**
     * Applies a local change to the content.
     * 
     * This is called when the user directly edits the text document in VS Code.
     * 
     * @param text - New content from the text editor
     * @returns Domain event indicating the content was updated locally
     */
    applyLocalChange(text: string): ContentUpdatedEvent {
        this.content = text;
        return {
            type: 'ContentUpdated',
            origin: 'local',
            text,
        };
    }

    /**
     * Applies a remote sync to the content.
     * 
     * This is called when the webview sends updated content back to the document.
     * 
     * @param text - New content from the webview
     * @returns Domain event indicating the content was synced remotely
     */
    applyRemoteSync(text: string): ContentUpdatedEvent {
        this.content = text;
        return {
            type: 'ContentUpdated',
            origin: 'remote',
            text,
        };
    }
}
