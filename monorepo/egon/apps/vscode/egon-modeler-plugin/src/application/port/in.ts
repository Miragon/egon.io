import { Editor } from "../domain/DomainStoryEditor";
import { TextDocument } from "vscode";

export interface DomainStoryEditorUseCase {
    /**
     * Creates and set the active editor.
     * @param id
     * @param uri
     * @param document
     * @return editorId
     */
    create(id: string, uri: string, document: TextDocument): string;

    /**
     * Get the active editor.
     * @return editor
     */
    getActiveEditor(): Editor;

    /**
     * Get the editor with given id.
     * @param id
     * @return editor
     */
    getEditor(id: string): Editor;

    /**
     * If the user changes the tab to a different DomainStoryEditor the active
     * editor has to change too.
     * @param id
     * @return the id of the new active editor
     */
    setActiveEditor(id: string): string;
}
