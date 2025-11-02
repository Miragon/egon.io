import { Range, Uri, workspace, WorkspaceEdit } from "vscode";
import { DocumentPort } from "../application";

/**
 * VS Code implementation of the DocumentPort interface.
 * 
 * This adapter provides document I/O operations using VS Code's workspace API.
 * It reads documents via `workspace.openTextDocument` and writes them using
 * `WorkspaceEdit` to ensure proper undo/redo support.
 * 
 * @example
 * ```typescript
 * // Register in DI container
 * container.register<DocumentPort>("DocumentPort", {
 *     useClass: VsCodeDocumentPort,
 * });
 * 
 * // Use directly
 * const port = new VsCodeDocumentPort();
 * const content = await port.read('/path/to/file.egn');
 * await port.write('/path/to/file.egn', 'updated content');
 * ```
 */
export class VsCodeDocumentPort implements DocumentPort {
    /**
     * Reads the content of a VS Code document.
     * 
     * @param editorId - File path of the document to read
     * @returns Promise resolving to the document's text content
     * @throws Error if the document cannot be opened
     */
    async read(editorId: string): Promise<string> {
        const uri = Uri.file(editorId);
        const doc = await workspace.openTextDocument(uri);
        return doc.getText();
    }

    /**
     * Writes content to a VS Code document.
     * 
     * This method replaces the entire document content (lines 0-9999) with the
     * provided text. The operation is performed through a WorkspaceEdit to ensure
     * proper integration with VS Code's undo/redo stack.
     * 
     * @param editorId - File path of the document to write
     * @param text - Content to write to the document
     * @returns Promise that resolves when the write operation completes
     * @throws Error if the edit cannot be applied
     */
    async write(editorId: string, text: string): Promise<void> {
        const uri = Uri.file(editorId);
        const edit = new WorkspaceEdit();
        edit.replace(uri, new Range(0, 0, 9999, 0), text);
        await workspace.applyEdit(edit);
    }
}
