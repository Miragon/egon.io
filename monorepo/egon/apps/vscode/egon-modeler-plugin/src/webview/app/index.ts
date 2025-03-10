import { WebviewApi } from "vscode-webview";
import { MessageType, WebviewMessage } from "../../common/webview";

import "../css/style.css";

const app = document.getElementById("app");
const textarea = document.createElement("textarea");

const vscode: WebviewApi<string> = acquireVsCodeApi();

window.addEventListener("message", receiveMessage);

textarea.addEventListener("input", (event) => {
    const el = event.target as HTMLTextAreaElement;

    const message: WebviewMessage<string> = {
        type: MessageType.UPDATE,
        data: el.value,
    };

    postMessage(message);
});

app?.appendChild(textarea);

const state = vscode.getState();
if (state) {
    textarea.value = state;
}

function postMessage(message: WebviewMessage<string>): void {
    vscode.postMessage(message);
}

function receiveMessage(message: MessageEvent<WebviewMessage<string>>): void {
    const type = message.data.type;
    const data = message.data.data;

    vscode.setState(data);

    switch (type) {
        case MessageType.UPDATE: {
            textarea.value = data ? data : "";
            break;
        }
    }
}
