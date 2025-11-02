import { injectable } from "tsyringe";
import { EditorSession } from "../domain";
import { DocumentPort, ViewPort } from "./ports";

/**
 * Internal state for a single editor session.
 * @internal
 */
interface SessionState {
    /** Guard counter to prevent echo loops (0 = idle, >0 = syncing) */
    guard: number;
    /** Domain aggregate managing the editor state */
    session: EditorSession;
    /** View port for displaying content to the webview */
    view: ViewPort;
}

/**
 * Application service that orchestrates domain story editor sessions.
 *
 * This service manages the lifecycle of editor sessions and coordinates
 * bidirectional synchronization between VS Code documents and webviews.
 * It implements echo prevention using per-session guards to avoid infinite
 * update loops.
 *
 * **Key Responsibilities:**
 * - Register and manage editor sessions
 * - Coordinate document ↔ webview synchronization
 * - Prevent echo loops between document and webview updates
 * - Maintain per-session state isolation
 *
 * @example
 * ```typescript
 * // In your DI container setup
 * container.register(DomainStoryEditorService, {
 *     useFactory: (c) => {
 *         const docs = c.resolve<DocumentPort>("DocumentPort");
 *         return new DomainStoryEditorService(docs);
 *     }
 * });
 *
 * // In your WebviewController
 * class WebviewController {
 *     constructor(private app: DomainStoryEditorService) {}
 *
 *     async resolveCustomTextEditor(document: TextDocument, panel: WebviewPanel) {
 *         const editorId = document.uri.path;
 *         const view = new VsCodeViewPort(panel);
 *
 *         // Register the session
 *         this.app.registerSession(editorId, document.getText(), view);
 *
 *         // Handle initialization
 *         panel.webview.onDidReceiveMessage(async (cmd) => {
 *             if (cmd.TYPE === 'InitializeWebview') {
 *                 await this.app.initialize(editorId);
 *             } else if (cmd.TYPE === 'SyncDocument') {
 *                 await this.app.syncFromWebview(editorId, cmd.text);
 *             }
 *         });
 *
 *         // Handle document changes
 *         workspace.onDidChangeTextDocument(async (event) => {
 *             if (event.document.uri.path === editorId) {
 *                 await this.app.onDocumentChanged(editorId, event.document.getText());
 *             }
 *         });
 *
 *         // Cleanup
 *         panel.onDidDispose(() => this.app.dispose(editorId));
 *     }
 * }
 * ```
 */
@injectable()
export class DomainStoryEditorService {
    private sessions = new Map<string, SessionState>();

    /**
     * Creates a new domain story editor service.
     *
     * @param docs - Port for document I/O operations
     */
    constructor(private docs: DocumentPort) {}

    /**
     * Registers a new editor session.
     *
     * This should be called when a new editor is opened. If a session with the
     * same ID already exists, this method does nothing (sessions are not overridden).
     *
     * @param editorId - Unique identifier for the editor (typically file path)
     * @param initialText - Initial content of the editor
     * @param view - View port for displaying content to the webview
     *
     * @example
     * ```typescript
     * const editorId = document.uri.path;
     * const view = new VsCodeViewPort(webviewPanel);
     * service.registerSession(editorId, document.getText(), view);
     * ```
     */
    registerSession(editorId: string, initialText: string, view: ViewPort): void {
        if (!this.sessions.has(editorId)) {
            this.sessions.set(editorId, {
                guard: 0,
                session: new EditorSession(editorId, initialText),
                view,
            });
        }
    }

    /**
     * Initializes the webview with the current editor content.
     *
     * This is typically called when the webview sends an initialization message
     * indicating it's ready to receive content.
     *
     * @param editorId - Unique identifier for the editor
     *
     * @example
     * ```typescript
     * webview.onDidReceiveMessage(async (cmd) => {
     *     if (cmd.TYPE === 'InitializeWebview') {
     *         await service.initialize(editorId);
     *     }
     * });
     * ```
     */
    async initialize(editorId: string): Promise<void> {
        const state = this.get(editorId);
        if (!state) return;
        await state.view.display(editorId, state.session.snapshot());
    }

    /**
     * Syncs content from the webview to the document.
     *
     * This is called when the webview sends updated content back to VS Code.
     * The method uses a guard mechanism to prevent echo loops - while this sync
     * is in progress, any document change events will be ignored.
     *
     * **Echo Prevention Flow:**
     * 1. Guard counter increments
     * 2. Document is updated (triggers onDidChangeTextDocument)
     * 3. onDocumentChanged sees guard > 0 and skips update
     * 4. Guard counter decrements
     *
     * @param editorId - Unique identifier for the editor
     * @param text - Updated content from the webview
     *
     * @example
     * ```typescript
     * webview.onDidReceiveMessage(async (cmd) => {
     *     if (cmd.TYPE === 'SyncDocument') {
     *         await service.syncFromWebview(editorId, cmd.text);
     *     }
     * });
     * ```
     */
    async syncFromWebview(editorId: string, text: string): Promise<void> {
        const state = this.get(editorId);
        if (!state) return;
        state.guard++;
        state.session.applyRemoteSync(text);
        await this.docs.write(editorId, text);
        state.guard--;
    }

    /**
     * Handles document content changes from the text editor.
     *
     * This is called when the user edits the text document directly in VS Code.
     * If the guard is active (indicating a sync operation is in progress), this
     * method does nothing to prevent echo loops.
     *
     * **Echo Prevention:**
     * - If guard > 0: Change came from syncFromWebview, ignore it
     * - If guard = 0: Change came from user, update the webview
     *
     * @param editorId - Unique identifier for the editor
     * @param text - Updated content from the text editor
     *
     * @example
     * ```typescript
     * workspace.onDidChangeTextDocument(async (event) => {
     *     if (event.document.uri.path === editorId && event.contentChanges.length > 0) {
     *         await service.onDocumentChanged(editorId, event.document.getText());
     *     }
     * });
     * ```
     */
    async onDocumentChanged(editorId: string, text: string): Promise<void> {
        const state = this.get(editorId);
        if (!state || state.guard > 0) {
            return;
        }
        state.session.applyLocalChange(text);
        await state.view.display(editorId, text);
    }

    /**
     * Disposes of an editor session and cleans up resources.
     *
     * This should be called when the editor/webview is closed to prevent memory leaks.
     *
     * @param editorId - Unique identifier for the editor to dispose
     *
     * @example
     * ```typescript
     * webviewPanel.onDidDispose(() => {
     *     service.dispose(editorId);
     * });
     * ```
     */
    dispose(editorId: string): void {
        this.sessions.delete(editorId);
    }

    /**
     * Retrieves session state for a given editor.
     * @param editorId - Editor identifier
     * @returns Session state if registered, undefined otherwise
     * @internal
     */
    private get(editorId: string): SessionState | undefined {
        return this.sessions.get(editorId);
    }
}
