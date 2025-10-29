import { DomainStoryEditorUseCase } from "../port/in";
import { DomainStoryEditor, Editor } from "../domain/DomainStoryEditor";
import { injectable } from "tsyringe";
import { TextDocument } from "vscode";

@injectable()
export class DomainStoryEditorService implements DomainStoryEditorUseCase {
    create(id: string, uri: string, document: TextDocument): string {
        let editor: DomainStoryEditor;
        try {
            editor = DomainStoryEditor.createInstance(id, uri, document);
            editor.setActiveEditor(id);
        } catch (error: unknown) {
            editor = DomainStoryEditor.getInstance();
            editor.addEditor({ id, uri, document });
            editor.setActiveEditor(id);
        }

        return editor.id;
    }

    getActiveEditor(): Editor {
        const editor = DomainStoryEditor.getInstance();
        return {
            id: editor.id,
            uri: editor.uri,
            document: editor.document,
        };
    }

    getEditor(id: string): Editor {
        const editor = DomainStoryEditor.getInstance();
        return editor.getEditor(id);
    }

    setActiveEditor(id: string): string {
        const editor = DomainStoryEditor.getInstance();
        editor.setActiveEditor(id);
        return editor.id;
    }
}
