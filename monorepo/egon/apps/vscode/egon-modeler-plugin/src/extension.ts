import "reflect-metadata";
import {
    CancellationToken,
    CustomTextEditorProvider,
    ExtensionContext,
    TextDocument,
    WebviewPanel,
    window,
} from "vscode";
import { container } from "tsyringe";

import { config } from "./extension.config";
import {
    DocumentAdapter as InDocumentAdapter,
    TextEditorAdapter,
    WebviewAdapter as InWebviewAdapter,
} from "./adapter/in";
import {
    DocumentAdapter as OutDocumentAdapter,
    WebviewAdapter as OutWebviewAdapter,
} from "./adapter/out";
import { EXTENSION_CONTEXT } from "./common/helpers";

export function activate(context: ExtensionContext) {
    config();

    EXTENSION_CONTEXT.setContext(context);

    // CustomTextEditor
    const editor = window.registerCustomEditorProvider(
        "vscode-hexagonal.editor",
        new CustomTextEditor(),
    );

    // Commands
    container.resolve(TextEditorAdapter);

    EXTENSION_CONTEXT.getContext().subscriptions.push(editor);
}

export function deactivate() {}

class CustomTextEditor implements CustomTextEditorProvider {
    async resolveCustomTextEditor(
        document: TextDocument,
        webviewPanel: WebviewPanel,
        token: CancellationToken,
    ): Promise<void> {
        this.initialSetup(webviewPanel, document);

        new InWebviewAdapter(
            webviewPanel.webview,
            document,
            container.resolve("InitWebviewUseCase"),
            container.resolve("SyncDocumentUseCase"),
        );

        new InDocumentAdapter(document, container.resolve("SyncWebviewUseCase"));
    }

    private initialSetup(webviewPanel: WebviewPanel, document: TextDocument) {
        const documentAdapter = container.resolve<OutDocumentAdapter>("DocumentPort");
        const webviewAdapter = container.resolve<OutWebviewAdapter>("WebviewPort");

        documentAdapter.updateActiveDocument(document);
        webviewAdapter.updateActiveWebview(document.fileName, webviewPanel.webview);

        webviewPanel.onDidChangeViewState((event) => {
            if (event.webviewPanel.active) {
                documentAdapter.updateActiveDocument(document);
                webviewAdapter.updateActiveWebview(
                    document.fileName,
                    webviewPanel.webview,
                );
            }
        });
    }
}
