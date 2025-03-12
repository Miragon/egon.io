import { Webview } from "vscode";

import { WebviewMessage } from "common/webview";
import { WebviewPort } from "port/out";

export class WebviewAdapter implements WebviewPort {
    private activeWebview: WebviewWithId | undefined;

    async postMessage(
        webviewId: string,
        message: WebviewMessage<any>,
    ): Promise<boolean> {
        const webview = this.validate(webviewId);
        return webview.postMessage(message);
    }

    loadActiveWebviewId(): string {
        if (!this.activeWebview) {
            throw new Error("No active webview!");
        }
        return this.activeWebview.id;
    }

    updateActiveWebview(id: string, webview: Webview): boolean {
        this.activeWebview = {
            id,
            webview,
        };
        return true;
    }

    private validate(webviewId: string): Webview {
        if (!this.activeWebview) {
            throw new Error("No active webview!");
        }
        if (this.activeWebview.id !== webviewId) {
            throw new Error("Invalid webview!");
        }

        return this.activeWebview.webview;
    }
}

interface WebviewWithId {
    id: string;
    webview: Webview;
}
