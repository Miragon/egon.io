import { WebviewPanel } from "vscode";
import { DisplayDomainStoryCommand } from "@egon/data-transfer-objects";
import { ViewPort } from "../application";

export class VsCodeViewPort implements ViewPort {
    constructor(private panel: WebviewPanel) {}

    async display(editorId: string, text: string): Promise<void> {
        const command = new DisplayDomainStoryCommand(editorId, text);
        await this.panel.webview.postMessage(command);
    }
}
