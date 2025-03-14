import { inject, singleton } from "tsyringe";
import {
    CancellationToken,
    CustomTextEditorProvider,
    Disposable,
    Range,
    TextDocument,
    TextDocumentChangeEvent,
    Uri,
    WebviewPanel,
    window,
    workspace,
    WorkspaceEdit,
} from "vscode";
import { DomainStoryEditorUseCase } from "../../application/port/in";
import { domainStoryEditorUi, getContext } from "../helper/vscode";
import {
    Command,
    DisplayDomainStoryCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";

@singleton()
export class WebviewController implements CustomTextEditorProvider {
    protected extension = "egn";

    private isChangeDocumentEventBlocked = false;

    private disposables: Map<string, Disposable[]> = new Map();

    constructor(
        @inject("DomainStoryModelerViewType")
        private readonly viewType: string,
        @inject("DomainStoryEditorUseCase")
        protected readonly editorService: DomainStoryEditorUseCase,
    ) {
        const provider = window.registerCustomEditorProvider(viewType, this);
        getContext().subscriptions.push(provider);
    }

    async resolveCustomTextEditor(
        document: TextDocument,
        webviewPanel: WebviewPanel,
        token: CancellationToken,
    ): Promise<void> {
        try {
            const editorId = this.editorService.create(
                document.uri.path,
                document.uri.toString(),
                document.getText(),
            );
            this.disposables.set(editorId, []);

            webviewPanel.webview.options = { enableScripts: true };
            webviewPanel.webview.html = domainStoryEditorUi(
                webviewPanel.webview,
                getContext().extensionUri,
            );

            // Subscribe to events
            this.subscribeToMessageEvent(webviewPanel, this.disposables.get(editorId));
            this.subscribeToDocumentChangeEvent(
                webviewPanel,
                this.disposables.get(editorId),
            );
            this.subscribeToTabChangeEvent(
                document,
                webviewPanel,
                this.disposables.get(editorId),
            );
            this.subscribeToDisposeEvent(webviewPanel);
        } catch (error) {
            console.error(error);
        }
    }

    private subscribeToMessageEvent(
        webviewPanel: WebviewPanel,
        disposables?: Disposable[],
    ) {
        webviewPanel.webview.onDidReceiveMessage(
            async (message: Command) => {
                console.debug(
                    `[${new Date(Date.now()).toJSON()}] Message received -> ${message.TYPE}`,
                );

                const editor = this.editorService.getActiveEditor();

                if (message.editorId !== editor.id) {
                    throw new Error(
                        `Editor ID's do not match (${message.editorId} != ${editor.id})`,
                    );
                }

                if (message instanceof DisplayDomainStoryCommand) {
                    const content = editor.content;
                    const command = new DisplayDomainStoryCommand(editor.id, content);
                    if (await webviewPanel.webview.postMessage(command)) {
                        console.log("DomainStoryModeler is ready!");
                    }
                }

                if (message instanceof SyncDocumentCommand) {
                    this.isChangeDocumentEventBlocked = true;
                    console.debug("SyncDocumentCommand -> blocked");

                    // Update the content of the active editor
                    editor.content = message.text;
                    const edit = new WorkspaceEdit();
                    edit.replace(
                        Uri.parse(editor.uri),
                        new Range(0, 0, 9999, 0),
                        editor.content,
                    );
                    workspace.applyEdit(edit);

                    this.isChangeDocumentEventBlocked = false;
                    console.debug("SyncDocumentCommand -> released");
                }

                console.debug(
                    `[${new Date(Date.now()).toJSON()}] Message processed -> ${
                        message.TYPE
                    }`,
                );
            },
            null,
            disposables,
        );
    }

    /**
     * User edits the document via text editor.
     * @param webviewPanel
     * @param disposables
     * @private
     */
    private subscribeToDocumentChangeEvent(
        webviewPanel: WebviewPanel,
        disposables?: Disposable[],
    ) {
        workspace.onDidChangeTextDocument(
            (event: TextDocumentChangeEvent) => {
                const editor = this.editorService.getActiveEditor();
                const documentPath = editor.id;

                console.debug("OnDidChangeTextDocument -> trigger");
                if (
                    event.contentChanges.length !== 0 &&
                    documentPath.split(".").pop() === this.extension &&
                    documentPath === event.document.uri.path &&
                    !this.isChangeDocumentEventBlocked
                ) {
                    console.debug("OnDidChangeTextDocument -> send");
                    editor.content = event.document.getText();
                    const command = new DisplayDomainStoryCommand(
                        editor.id,
                        editor.content,
                    );
                    webviewPanel.webview.postMessage(command);
                }
            },
            null,
            disposables,
        );
    }

    /**
     * User changes the tab.
     * @param document
     * @param webviewPanel
     * @param disposables
     * @private
     */
    private subscribeToTabChangeEvent(
        document: TextDocument,
        webviewPanel: WebviewPanel,
        disposables?: Disposable[],
    ) {
        webviewPanel.onDidChangeViewState(
            () => {
                if (webviewPanel.active) {
                    this.editorService.setActiveEditor(document.uri.path);
                }
            },
            null,
            disposables,
        );
    }

    /**
     * If a user closes a tab, we have to clean up.
     * @param webviewPanel
     * @private
     */
    private subscribeToDisposeEvent(webviewPanel: WebviewPanel) {
        webviewPanel.onDidDispose(() => {
            webviewPanel.dispose();
            const editor = this.editorService.getActiveEditor();
            const subscriptions = this.disposables.get(editor.id);
            subscriptions?.forEach((subscription) => subscription.dispose());
            this.disposables.delete(editor.id);
        });
    }
}
