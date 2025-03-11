import { inject, injectable } from "tsyringe";

import { TextEditorCommand, TextEditorUseCase } from "../../port/in/textEditor";
import { DocumentPort, TextEditorPort } from "../../port/out";
import { StandardTextEditor } from "../model/StandardTextEditor";

@injectable()
export class TextEditorService implements TextEditorUseCase {
    constructor(
        @inject("DocumentPort") private readonly documentPort: DocumentPort,
        @inject("TextEditorPort") private readonly textEditorPort: TextEditorPort,
    ) {}

    async toggle(): Promise<boolean> {
        const documentId = this.documentPort.loadActiveDocumentId();
        const editor: StandardTextEditor = await this.textEditorPort.loadTextEditors();

        if (editor.isOpen(documentId)) {
            if (await this.textEditorPort.closeTextEditor(documentId)) {
                editor.close(documentId);
                return this.textEditorPort.updateTextEditors(editor);
            }
            throw new Error("Could not close text editor.");
        }

        editor.open(await this.textEditorPort.createTextEditor(documentId));
        return this.textEditorPort.updateTextEditors(editor);
    }

    async close(textEditorCommand: TextEditorCommand): Promise<boolean> {
        const closedTextDocuments = textEditorCommand.closedTextDocuments;
        const editor: StandardTextEditor = await this.textEditorPort.loadTextEditors();

        for (const documentId of closedTextDocuments) {
            if (editor.isOpen(documentId)) {
                editor.close(documentId);
                return this.textEditorPort.updateTextEditors(editor);
            }
        }

        return true;
    }
}
