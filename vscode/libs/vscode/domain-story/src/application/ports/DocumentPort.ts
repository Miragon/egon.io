/**
 * Port interface for document I/O operations.
 * 
 * This abstraction allows the application layer to read and write documents
 * without depending on VS Code's specific APIs.
 * 
 * @example
 * ```typescript
 * class VsCodeDocumentPort implements DocumentPort {
 *     async read(editorId: string): Promise<string> {
 *         const doc = await workspace.openTextDocument(Uri.file(editorId));
 *         return doc.getText();
 *     }
 * 
 *     async write(editorId: string, text: string): Promise<void> {
 *         const edit = new WorkspaceEdit();
 *         edit.replace(Uri.file(editorId), new Range(0, 0, 9999, 0), text);
 *         await workspace.applyEdit(edit);
 *     }
 * }
 * ```
 */
export interface DocumentPort {
    /**
     * Reads the content of a document.
     * 
     * @param editorId - Unique identifier for the editor/document (typically file path)
     * @returns Promise resolving to the document's text content
     */
    read(editorId: string): Promise<string>;

    /**
     * Writes content to a document.
     * 
     * @param editorId - Unique identifier for the editor/document (typically file path)
     * @param text - Content to write to the document
     * @returns Promise that resolves when the write operation completes
     */
    write(editorId: string, text: string): Promise<void>;
}
