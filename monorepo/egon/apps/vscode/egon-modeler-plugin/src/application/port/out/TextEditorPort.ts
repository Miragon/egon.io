import { StandardTextEditor } from "../../domain/model/StandardTextEditor";

export interface TextEditorPort {
    createTextEditor(documentId: string): Promise<string>;

    closeTextEditor(fileName: string): Promise<boolean>;

    loadTextEditors(): Promise<StandardTextEditor>;

    updateTextEditors(textEditors: StandardTextEditor): Promise<boolean>;
}
