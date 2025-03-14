import { DomainStoryEditorUseCase } from "../port/in";
import { DomainStoryEditor, Editor } from "../domain/DomainStoryEditor";
import { injectable } from "tsyringe";

@injectable()
export class DomainStoryEditorService implements DomainStoryEditorUseCase {
    create(id: string, uri: string, content: string): string {
        try {
            const editor = DomainStoryEditor.getInstance();
            editor.addEditor({ id, uri, content });
            editor.setActiveEditor(id);
        } catch (error) {
            DomainStoryEditor.getInstance(id, uri, content);
        }

        return DomainStoryEditor.getInstance().id;
    }

    getActiveEditor(): Editor {
        const editor = DomainStoryEditor.getInstance();
        return {
            id: editor.id,
            uri: editor.uri,
            content: editor.content,
        };
    }

    getEditor(id: string): Editor {
        const editor = DomainStoryEditor.getInstance();
        return editor.getEditor(id);
    }

    sync(id: string, content: string): string {
        const editor = DomainStoryEditor.getInstance();

        if (id !== editor.id) {
            throw new Error("Editor ID does not match the active editor.");
        }

        editor.content = content;

        return editor.content;
    }

    setActiveEditor(id: string): string {
        const editor = DomainStoryEditor.getInstance();
        editor.setActiveEditor(id);
        return editor.id;
    }
}
