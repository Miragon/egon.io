export interface Command {
    TYPE: string;
    editorId: string;
}

export class DisplayDomainStoryCommand implements Command {
    TYPE = "displayDomainStoryCommand";

    constructor(
        private readonly _editorId: string,
        private readonly _text: string,
    ) {}

    get editorId(): string {
        return this._editorId;
    }

    get text(): string {
        return this._text;
    }
}

export class SyncDocumentCommand implements Command {
    TYPE = "syncDocumentCommand";

    constructor(
        private readonly _editorId: string,
        private readonly _text: string,
    ) {}

    get editorId(): string {
        return this._editorId;
    }

    get text(): string {
        return this._text;
    }
}

export class GetDomainStoryAsSvgCommand implements Command {
    TYPE = "getDomainStoryAsSvgCommand";

    constructor(
        private readonly _editorId: string,
        private readonly _svg?: string,
    ) {}

    get editorId(): string {
        return this._editorId;
    }

    get svg(): string {
        if (!this._svg) {
            throw new Error("Property svg is undefined");
        }
        return this._svg;
    }
}
