import { Range, Uri, workspace, WorkspaceEdit } from "vscode";
import { DocumentPort } from "../application";

export class VsCodeDocumentPort implements DocumentPort {
    async read(editorId: string): Promise<string> {
        const uri = Uri.file(editorId);
        const doc = await workspace.openTextDocument(uri);
        return doc.getText();
    }

    async write(editorId: string, text: string): Promise<void> {
        const uri = Uri.file(editorId);
        const edit = new WorkspaceEdit();
        edit.replace(uri, new Range(0, 0, 9999, 0), text);
        await workspace.applyEdit(edit);
    }
}
