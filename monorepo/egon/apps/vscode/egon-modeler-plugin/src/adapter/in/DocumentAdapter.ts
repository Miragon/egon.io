import { TextDocument, workspace } from "vscode";
import { inject, injectable } from "tsyringe";

import { setUpdateFrom, UpdateFrom, updateFrom } from "common/helpers";
import { SyncWebviewCommand, SyncWebviewUseCase } from "port/in/webview";

@injectable()
export class DocumentAdapter {
    constructor(
        private readonly document: TextDocument,
        @inject("SyncWebviewUseCase")
        private readonly syncWebviewUseCase: SyncWebviewUseCase,
    ) {
        this.onDidChangeTextDocument();
    }

    private onDidChangeTextDocument() {
        // Sync document with webview
        workspace.onDidChangeTextDocument(async (event) => {
            if (event.contentChanges.length === 0) {
                return;
            }
            if (updateFrom === UpdateFrom.WEBVIEW) {
                setUpdateFrom(UpdateFrom.NULL);
                return;
            }

            if (this.document.fileName === event.document.fileName) {
                const syncWebviewCommand = new SyncWebviewCommand(
                    this.document.fileName,
                    event.document.getText(),
                );

                this.syncWebviewUseCase.sync(syncWebviewCommand);
            }
        });
    }
}
