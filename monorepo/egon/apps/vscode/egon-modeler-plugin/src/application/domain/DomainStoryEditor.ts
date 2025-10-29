import { TextDocument } from "vscode";

export interface Editor {
    id: string;
    uri: string;
    document: TextDocument;
}

export class DomainStoryEditor {
    private static instance: DomainStoryEditor;
    private readonly editors: Map<string, Editor> = new Map();

    private constructor(id: string, uri: string, document: TextDocument) {
        this._id = id;
        this._uri = uri;
        this._document = document;
        this.editors.set(id, { id, uri, document });
    }

    private _id: string;

    get id(): string {
        return this._id;
    }

    private _uri: string;

    get uri(): string {
        return this._uri;
    }

    private _document: TextDocument;

    get document(): TextDocument {
        return this._document;
    }

    set document(document: TextDocument) {
        this._document = document;
    }

    static createInstance(id: string, uri: string, document: TextDocument) {
        if (this.instance) {
            throw new Error(`A instance of DomainStoryEditor already exists.`);
        }
        DomainStoryEditor.instance = new DomainStoryEditor(id, uri, document);
        return DomainStoryEditor.instance;
    }

    static getInstance(): DomainStoryEditor {
        if (!DomainStoryEditor.instance) {
            throw Error(`DomainStoryEditor instance does not exist, please create one.`);
        }
        return DomainStoryEditor.instance;
    }

    /**
     * It is possible to have multiple tabs open. Every tab is a different editor.
     * @param id
     * @param documentPath
     * @param document
     */
    addEditor({ id, uri, document }: Editor) {
        this.editors.set(id, { id, uri: uri, document });
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
        this._document = editor.document;
    }
}
