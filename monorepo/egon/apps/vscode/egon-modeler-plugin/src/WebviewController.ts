import { inject, singleton } from "tsyringe";
import {
    CustomTextEditorProvider,
    Disposable,
    TextDocument,
    WebviewPanel,
    window,
    workspace
} from "vscode";
import { domainStoryEditorUi, getContext } from "./helper";
import {
    Command,
    InitializeWebviewCommand,
    SyncDocumentCommand
} from "@egon/data-transfer-objects";
import { DomainStoryEditorService, VsCodeViewPort } from "@egon/domain-story";

@singleton()
export class WebviewController implements CustomTextEditorProvider {
    protected extension = "egn";

    constructor(
        @inject("DomainStoryModelerViewType")
        viewType: string,
        @inject(DomainStoryEditorService)
        private app: DomainStoryEditorService,
    ) {
        const provider = window.registerCustomEditorProvider(viewType, this);
        getContext().subscriptions.push(provider);
    }

    async resolveCustomTextEditor(
        document: TextDocument,
        webviewPanel: WebviewPanel,
    ): Promise<void> {
        try {
            webviewPanel.webview.options = { enableScripts: true };
            webviewPanel.webview.html = domainStoryEditorUi(
                webviewPanel.webview,
                getContext().extensionUri,
            );

            const editorId = document.uri.path;
            const disposables: Disposable[] = [];

            const view = new VsCodeViewPort(webviewPanel);
            this.app.registerSession(editorId, document.getText(), view);

            const msgSub = webviewPanel.webview.onDidReceiveMessage(
                async (command: Command) => {
                    console.debug(
                        `[${new Date(Date.now()).toJSON()}] Message received -> ${command.TYPE}`,
                    );

                    if (command.TYPE === InitializeWebviewCommand.name) {
                        await this.app.initialize(editorId);
                    } else if (command.TYPE === SyncDocumentCommand.name) {
                        const c = command as SyncDocumentCommand;
                        if (c.editorId !== editorId) {
                            throw new Error(
                                `Editor ID mismatch (${c.editorId} != ${editorId})`,
                            );
                        }
                        await this.app.syncFromWebview(editorId, c.text);
                    }

                    console.debug(
                        `[${new Date(Date.now()).toJSON()}] Message processed -> ${command.TYPE}`,
                    );
                },
            );
            disposables.push(msgSub);

            const docSub = workspace.onDidChangeTextDocument(async (event) => {
                console.debug("OnDidChangeTextDocument -> trigger");
                if (
                    event.contentChanges.length !== 0 &&
                    document.uri.path.split(".").pop() === this.extension &&
                    document.uri.path === event.document.uri.path
                ) {
                    console.debug("OnDidChangeTextDocument -> send");
                    await this.app.onDocumentChanged(
                        editorId,
                        event.document.getText(),
                    );
                }
            });
            disposables.push(docSub);

            webviewPanel.onDidDispose(() => {
                webviewPanel.dispose();
                disposables.forEach((subscription) => subscription.dispose());
                this.app.dispose(editorId);
            });
        } catch (error) {
            console.error(error);
        }
    }
}
