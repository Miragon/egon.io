import { Tab, TabInputText, TextDocumentShowOptions, ViewColumn, window } from "vscode";
import { container } from "tsyringe";

import { TextEditorPort } from "port/out";
import { DocumentAdapter } from "adapter/out";
import { StandardTextEditor } from "../../application/domain/model/StandardTextEditor";

export class TextEditorAdapter implements TextEditorPort {
    private textEditors: string[] = [];

    async createTextEditor(documentId: string): Promise<string> {
        const document = container
            .resolve<DocumentAdapter>("DocumentPort")
            .loadActiveDocument(documentId);

        const textEditor = await window.showTextDocument(
            document,
            this.getShowOptions(),
        );

        return textEditor.document.fileName;
    }

    async closeTextEditor(documentId: string): Promise<boolean> {
        const tab = this.findTab(documentId);

        if (!tab) {
            return true;
        }

        return window.tabGroups.close(tab);
    }

    async loadTextEditors(): Promise<StandardTextEditor> {
        return new StandardTextEditor(this.textEditors);
    }

    async updateTextEditors(editor: StandardTextEditor): Promise<boolean> {
        this.textEditors = editor.textEditors;
        return true;
    }

    /**
     * Get the tab with the correct text editor.
     * @param documentId - The file name of the document controlled by the text editor.
     * @returns The tab with the correct text editor.
     * @private
     */
    private findTab(documentId: string): Tab | undefined {
        for (const tabGroup of window.tabGroups.all) {
            for (const tab of tabGroup.tabs) {
                if (
                    tab.input instanceof TabInputText &&
                    tab.input.uri.path === documentId
                ) {
                    return tab;
                }
            }
        }
        return undefined;
    }

    /**
     * Dependent on the user settings returns the right options where the standard text editor should be displayed.
     * @param config - The user settings.
     * @returns The options where the standard text editor should be displayed.
     * @private
     */
    private getShowOptions(config = "Group"): TextDocumentShowOptions {
        switch (config) {
            case "Group": {
                return {
                    preserveFocus: true,
                    preview: true,
                    viewColumn: ViewColumn.Beside,
                };
            }
            case "Tab": {
                return {
                    preserveFocus: false,
                    preview: false,
                    viewColumn: ViewColumn.Active,
                };
            }
            default: {
                return {};
            }
        }
    }
}
