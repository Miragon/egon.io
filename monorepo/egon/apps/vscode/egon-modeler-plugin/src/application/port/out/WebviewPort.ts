import { WebviewMessage } from "../../../common/webview";

export interface WebviewPort {
    postMessage(webviewId: string, message: WebviewMessage<any>): Promise<boolean>;

    loadActiveWebviewId(): string;
}
