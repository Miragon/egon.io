import { MessageType, WebviewMessage } from "common/webview";

export interface InitWebviewUseCase {
    initWebview(initWebviewCommand: InitWebviewCommand): Promise<boolean>;
}

export interface SyncWebviewUseCase {
    sync(syncWebviewCommand: SyncWebviewCommand): Promise<boolean>;
}

export class SyncWebviewCommand {
    constructor(
        private readonly _webviewId: string,
        content: string,
    ) {
        if (!(this.validate(/*content*/))) {
            throw new Error("Invalid content");
        }

        this.mapContentToMessage(content);
    }

    // FIXME: change any to a proper type
    private _message: WebviewMessage<any> | undefined;

    public get message(): WebviewMessage<any> {
        if (!this._message) {
            throw new Error("Message is undefined");
        }
        return this._message;
    }

    public get webviewId(): string {
        return this._webviewId;
    }

    private validate(/*data: string*/): boolean {
        return true;
    }

    private mapContentToMessage(data: string): any {
        this._message = {
            type: MessageType.UPDATE,
            data,
        };
    }
}

export class InitWebviewCommand {
    constructor(
        private readonly _webviewId: string,
        content: string,
    ) {
        if (!(this.validate(/*content*/))) {
            throw new Error("Invalid content");
        }

        this.mapContentToMessage(content);
    }

    // FIXME: change any to a proper type
    private _message: WebviewMessage<any> | undefined;

    public get message(): WebviewMessage<any> {
        if (!this._message) {
            throw new Error("Message is undefined");
        }
        return this._message;
    }

    public get webviewId(): string {
        return this._webviewId;
    }

    public validate(/*content: string*/): boolean {
        return true;
    }

    private mapContentToMessage(data: string): any {
        this._message = {
            type: MessageType.UPDATE,
            data,
        };
    }
}
