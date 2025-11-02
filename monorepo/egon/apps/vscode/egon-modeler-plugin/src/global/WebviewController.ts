import { inject, singleton } from "tsyringe";
import {
    CancellationToken,
    CustomTextEditorProvider,
    Disposable,
    Range,
    TextDocument,
    TextDocumentChangeEvent,
    WebviewPanel,
    window,
    workspace,
    WorkspaceEdit
} from "vscode";
import { domainStoryEditorUi, getContext } from "./helper";
import {
    Command,
    DisplayDomainStoryCommand,
    InitializeWebviewCommand,
    SyncDocumentCommand
} from "@egon/data-transfer-objects";

@singleton()
export class WebviewController implements CustomTextEditorProvider {
    protected extension = "egn";

    private isChangeDocumentEventBlocked = false;

    private disposables: Map<string, Disposable[]> = new Map();

    constructor(
        @inject("DomainStoryModelerViewType")
        viewType: string,
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
            this.disposables.set(document.uri.path, []);

            webviewPanel.webview.options = { enableScripts: true };
            webviewPanel.webview.html = domainStoryEditorUi(
                webviewPanel.webview,
                getContext().extensionUri,
            );

            // Subscribe to events
            this.subscribeToMessageEvent(
                document,
                webviewPanel,
                this.disposables.get(document.uri.path),
            );
            this.subscribeToDocumentChangeEvent(
                document,
                webviewPanel,
                this.disposables.get(document.uri.path),
            );
            this.subscribeToDisposeEvent(document, webviewPanel);
        } catch (error) {
            console.error(error);
        }
    }

    private subscribeToMessageEvent(
        document: TextDocument,
        webviewPanel: WebviewPanel,
        disposables?: Disposable[],
    ) {
        webviewPanel.webview.onDidReceiveMessage(
            async (command: Command) => {
                console.debug(
                    `[${new Date(Date.now()).toJSON()}] Message received -> ${command.TYPE}`,
                );

                switch (true) {
                    case command.TYPE === InitializeWebviewCommand.name: {
                        const command = new DisplayDomainStoryCommand(
                            document.uri.path,
                            document.getText(),
                        );
                        if (await webviewPanel.webview.postMessage(command)) {
                            console.log("DomainStoryModeler is ready!");
                        }
                        break;
                    }
                    case command.TYPE === SyncDocumentCommand.name: {
                        const c = command as SyncDocumentCommand;
                        if (c.editorId !== document.uri.path) {
                            throw new Error(
                                `Editor ID's do not match (${command.editorId} != ${document.uri.path})`,
                            );
                        }
                        this.isChangeDocumentEventBlocked = true;
                        console.debug("SyncDocumentCommand -> blocked");

                        // Update the content of the active editor
                        const edit = new WorkspaceEdit();
                        edit.replace(document.uri, new Range(0, 0, 9999, 0), c.text);
                        if (await workspace.applyEdit(edit)) {
                            this.isChangeDocumentEventBlocked = false;
                            console.debug("SyncDocumentCommand -> released");
                        }
                    }
                }

                console.debug(
                    `[${new Date(Date.now()).toJSON()}] Message processed -> ${
                        command.TYPE
                    }`,
                );
            },
            null,
            disposables,
        );
    }

    /**
     * User edits the document via text editor.
     * @param document
     * @param webviewPanel
     * @param disposables
     * @private
     */
    private subscribeToDocumentChangeEvent(
        document: TextDocument,
        webviewPanel: WebviewPanel,
        disposables?: Disposable[],
    ) {
        workspace.onDidChangeTextDocument(
            (event: TextDocumentChangeEvent) => {
                console.debug("OnDidChangeTextDocument -> trigger");
                if (
                    event.contentChanges.length !== 0 &&
                    document.uri.path.split(".").pop() === this.extension &&
                    document.uri.path === event.document.uri.path &&
                    !this.isChangeDocumentEventBlocked
                ) {
                    console.debug("OnDidChangeTextDocument -> send");
                    const command = new DisplayDomainStoryCommand(
                        document.uri.path,
                        event.document.getText(),
                    );
                    webviewPanel.webview.postMessage(command);
                }
            },
            null,
            disposables,
        );
    }

    /**
     * If a user closes a tab, we have to clean up.
     * @param document
     * @param webviewPanel
     * @private
     */
    private subscribeToDisposeEvent(document: TextDocument, webviewPanel: WebviewPanel) {
        webviewPanel.onDidDispose(() => {
            webviewPanel.dispose();
            const subscriptions = this.disposables.get(document.uri.path);
            subscriptions?.forEach((subscription) => subscription.dispose());
            this.disposables.delete(document.uri.path);
        });
    }
}
