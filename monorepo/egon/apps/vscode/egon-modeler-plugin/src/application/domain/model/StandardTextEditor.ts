export class StandardTextEditor {
    constructor(private _textEditors: string[]) {}

    get textEditors(): string[] {
        return this._textEditors;
    }

    isOpen(documentId: string): boolean {
        return this._textEditors.includes(documentId);
    }

    open(documentId: string): void {
        this._textEditors.push(documentId);
    }

    close(documentId: string): void {
        this._textEditors = this._textEditors.filter((id) => id !== documentId);
    }
}
