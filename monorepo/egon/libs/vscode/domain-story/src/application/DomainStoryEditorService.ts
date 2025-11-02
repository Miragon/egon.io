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
 *         const documentId = document.uri.path;
 *         const view = new VsCodeViewPort(panel);
 *
 *         // Register the session
 *         const sessionId = this.app.registerSession(documentId, document.getText(), view);
 *
 *         // Handle initialization
 *         panel.webview.onDidReceiveMessage(async (cmd) => {
 *             if (cmd.TYPE === 'InitializeWebview') {
 *                 await this.app.initialize(sessionId);
 *             } else if (cmd.TYPE === 'SyncDocument') {
 *                 await this.app.syncFromWebview(sessionId, cmd.text);
 *             }
 *         });
 *
 *         // Handle document changes
 *         workspace.onDidChangeTextDocument(async (event) => {
 *             if (event.document.uri.path === document.uri.path) {
 *                 await this.app.onDocumentChanged(sessionId, event.document.getText());
 *             }
 *         });
 *
 *         // Cleanup
 *         panel.onDidDispose(() => this.app.dispose(sessionId));
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
     * same ID already exists, a new session is generated to avoid conflicts
     * with existing sessions.
     *
     * @param documentId - Unique identifier for the document (typically file path)
     * @param initialText - Initial content of the editor
     * @param view - View port for displaying content to the webview
     * @returns Unique identifier for the registered editor session
     *
     * @example
     * ```typescript
     * const documentId = document.uri.path;
     * const view = new VsCodeViewPort(webviewPanel);
     * const sessionId = service.registerSession(documentId, document.getText(), view);
     * ```
     */
    registerSession(documentId: string, initialText: string, view: ViewPort): string {
        let index = 1;
        let sessionId = documentId + `:${index}`;
        while (this.sessions.has(sessionId)) {
            index++;
            sessionId = documentId + `:${index}`;
        }

        this.sessions.set(sessionId, {
            guard: 0,
            session: new EditorSession(documentId, initialText),
            view,
        });

        return sessionId;
    }

    /**
     * Initializes the webview with the current editor content.
     *
     * This is typically called when the webview sends an initialization message
     * indicating it's ready to receive content.
     *
     * @param sessionId - Unique identifier for the editor session
     *
     * @example
     * ```typescript
     * webview.onDidReceiveMessage(async (cmd) => {
     *     if (cmd.TYPE === 'InitializeWebview') {
     *         await service.initialize(sessionId);
     *     }
     * });
     * ```
     */
    async initialize(sessionId: string): Promise<void> {
        const state = this.get(sessionId);
        if (!state) return;
        await state.view.display(sessionId, state.session.snapshot());
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
     * @param sessionId - Unique identifier for the editor session
     * @param text - Updated content from the webview
     *
     * @example
     * ```typescript
     * webview.onDidReceiveMessage(async (cmd) => {
     *     if (cmd.TYPE === 'SyncDocument') {
     *         await service.syncFromWebview(cmd.sessionId, cmd.text);
     *     }
     * });
     * ```
     */
    async syncFromWebview(sessionId: string, text: string): Promise<void> {
        const state = this.get(sessionId);
        if (!state) return;
        state.guard++;
        state.session.applyRemoteSync(text);
        await this.docs.write(this.getDocumentIdFromSessionId(sessionId), text);
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
     * @param sessionId - Unique identifier for the editor session
     * @param text - Updated content from the text editor
     *
     * @example
     * ```typescript
     * workspace.onDidChangeTextDocument(async (event) => {
     *     if (event.document.uri.path === document.uri.path && event.contentChanges.length > 0) {
     *         await service.onDocumentChanged(sessionId, event.document.getText());
     *     }
     * });
     * ```
     */
    async onDocumentChanged(sessionId: string, text: string): Promise<void> {
        const state = this.get(sessionId);
        if (!state || state.guard > 0) {
            return;
        }
        state.session.applyLocalChange(text);
        await state.view.display(sessionId, text);
    }

    /**
     * Disposes of an editor session and cleans up resources.
     *
     * This should be called when the editor/webview is closed to prevent memory leaks.
     *
     * @param sessionId - Unique identifier for the editor session to dispose
     *
     * @example
     * ```typescript
     * webviewPanel.onDidDispose(() => {
     *     service.dispose(sessionId);
     * });
     * ```
     */
    dispose(sessionId: string): void {
        this.sessions.delete(sessionId);
    }

    /**
     * Retrieves session state for a given id.
     * @param sessionId - Editor session identifier
     * @returns Session state if registered, undefined otherwise
     * @internal
     */
    private get(sessionId: string): SessionState | undefined {
        return this.sessions.get(sessionId);
    }

    private getDocumentIdFromSessionId(sessionId: string): string {
        return sessionId.split(":")[0];
    }
}
