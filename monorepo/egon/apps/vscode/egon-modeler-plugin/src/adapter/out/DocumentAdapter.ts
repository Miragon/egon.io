import { Range, TextDocument, workspace, WorkspaceEdit } from "vscode";

import { DocumentPort } from "port/out";

export class DocumentAdapter implements DocumentPort {
    private activeDocument: TextDocument | undefined;

    async write(fileName: string, content: string): Promise<boolean> {
        const document = this.validate(fileName);

        if (document.getText() === content) {
            throw new Error("No changes to apply!");
        }

        const edit = new WorkspaceEdit();

        edit.replace(document.uri, new Range(0, 0, document.lineCount, 0), content);

        return workspace.applyEdit(edit);
    }

    async save(fileName: string): Promise<boolean> {
        const document = this.validate(fileName);
        return document.save();
    }

    loadActiveDocument(fileName: string): TextDocument {
        return this.validate(fileName);
    }

    loadActiveDocumentId(): string {
        if (!this.activeDocument) {
            throw new Error("No active document!");
        }
        return this.activeDocument.fileName;
    }

    updateActiveDocument(document: TextDocument): boolean {
        this.activeDocument = document;
        return true;
    }

    private validate(fileName: string): TextDocument {
        if (!this.activeDocument) {
            throw new Error("No active document!");
        }
        if (this.activeDocument.fileName !== fileName) {
            throw new Error("Invalid document!");
        }

        return this.activeDocument;
    }
}
