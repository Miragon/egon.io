import { WebviewMessage } from "../../../common/webview";

export interface SyncDocumentUseCase {
    sync(syncDocumentQuery: SyncDocumentCommand): Promise<boolean>;
}

export class SyncDocumentCommand {
    constructor(
        private readonly _fileName: string,
        message: WebviewMessage<string>,
    ) {
        if (!(this.validate(/*message*/))) {
            throw new Error("Invalid message");
        }

        this.mapMessageToContent(message);
    }

    private _content: string | undefined;

    public get content(): string {
        if (!this._content) {
            throw new Error("Content is undefined");
        }
        return this._content;
    }

    public get fileName(): string {
        return this._fileName;
    }

    private validate(/*message: WebviewMessage<any>*/): boolean {
        return true;
    }

    private mapMessageToContent(message: WebviewMessage<string>): void {
        this._content = message.data;
    }
}
