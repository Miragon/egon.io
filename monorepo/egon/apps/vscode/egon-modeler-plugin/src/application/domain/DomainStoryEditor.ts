export interface Editor {
    id: string;
    uri: string;
    content: string;
}

export class DomainStoryEditor {
    private static instance: DomainStoryEditor;
    private readonly editors: Map<string, Editor> = new Map();

    private constructor(id: string, uri: string, content: string) {
        this._id = id;
        this._uri = uri;
        this._content = content;
        this.editors.set(id, { id, uri, content });
    }

    private _id: string;

    get id(): string {
        return this._id;
    }

    private _uri: string;

    get uri(): string {
        return this._uri;
    }

    private _content: string;

    get content(): string {
        return this._content;
    }

    set content(content: string) {
        this._content = content;
    }

    static getInstance(id?: string, uri?: string, content?: string): DomainStoryEditor {
        if (!DomainStoryEditor.instance) {
            if (!id || !uri || !content) {
                throw Error(
                    `DomainStoryEditor instance doesn't exist, therefore you have to path a id, documentPath and content.`,
                );
            }
            DomainStoryEditor.instance = new DomainStoryEditor(id, uri, content);
        }
        return DomainStoryEditor.instance;
    }

    /**
     * It is possible to have multiple tabs open. Every tab is a different editor.
     * @param id
     * @param documentPath
     * @param content
     */
    addEditor({ id, uri, content }: Editor) {
        this.editors.set(id, { id, uri: uri, content });
    }

    getEditor(id: string): Editor {
        const editor = this.editors.get(id);
        if (!editor) {
            throw new Error(`Could not find editor with id ${id}`);
        }
        return editor;
    }

    removeEditor(id: string) {
        this.editors.delete(id);
    }

    /**
     * Set the editor active whose tab is currently selected.
     * @param id
     */
    setActiveEditor(id: string) {
        const editor = this.editors.get(id);
        if (!editor) {
            throw new Error(
                `Editor with id ${id} not found, please create a new editor.`,
            );
        }
        this._id = id;
        this._uri = editor.uri;
        this._content = editor.content;
    }
}
