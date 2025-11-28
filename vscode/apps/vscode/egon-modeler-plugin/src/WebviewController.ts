import { inject, singleton } from "tsyringe";
import {
    CustomTextEditorProvider,
    Disposable,
    TextDocument,
    WebviewPanel,
    window,
    workspace,
} from "vscode";
import { domainStoryEditorUi, getContext } from "./helper";
import {
    Command,
    InitializeWebviewCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";
import { DomainStoryEditorService, VsCodeViewPort } from "@egon/domain-story";
import { ReadIconService } from "./ReadIconService";

@singleton()
export class WebviewController implements CustomTextEditorProvider {
    constructor(
        @inject("DomainStoryModelerViewType")
        viewType: string,
        @inject("DomainStoryModelerExtensionId")
        protected extensionId: string,
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

            const workspaceFolder = workspace.getWorkspaceFolder(document.uri);
            if (workspaceFolder) {
                const readIconService = new ReadIconService();
                const egnFileWithIcons = await readIconService.read(
                    workspaceFolder,
                    document.getText(),
                );
                await workspace.fs.writeFile(
                    document.uri,
                    new TextEncoder().encode(egnFileWithIcons),
                );
            }

            const view = new VsCodeViewPort(webviewPanel);
            const sessionId = this.app.registerSession(
                editorId,
                document.getText(),
                view,
            );

            const msgSub = webviewPanel.webview.onDidReceiveMessage(
                async (command: Command) => {
                    console.debug(
                        `[${new Date(Date.now()).toJSON()}] Message received -> ${command.TYPE}`,
                    );

                    if (command.TYPE === InitializeWebviewCommand.name) {
                        await this.app.initialize(sessionId);
                    } else if (command.TYPE === SyncDocumentCommand.name) {
                        const cmd = command as SyncDocumentCommand;
                        if (cmd.sessionId !== sessionId) {
                            throw new Error(
                                `Editor ID mismatch (${cmd.sessionId} != ${sessionId})`,
                            );
                        }
                        await this.app.syncFromWebview(cmd.sessionId, cmd.text);
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
                    document.uri.path.split(".").pop() === this.extensionId &&
                    document.uri.path === event.document.uri.path
                ) {
                    console.debug("OnDidChangeTextDocument -> send");
                    await this.app.onDocumentChanged(
                        sessionId,
                        event.document.getText(),
                    );
                }
            });
            disposables.push(docSub);

            webviewPanel.onDidDispose(() => {
                webviewPanel.dispose();
                disposables.forEach((subscription) => subscription.dispose());
                this.app.dispose(sessionId);
            });
        } catch (error) {
            console.error(error);
        }
    }
}
