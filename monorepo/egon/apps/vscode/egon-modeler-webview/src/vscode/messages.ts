import { VsCodeApi, VsCodeImpl, VsCodeMock } from "./api";
import {
    Command,
    DisplayDomainStoryCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";

declare const process: { env: { NODE_ENV: string } };

type StateType = {
    editorId: string;
};

export function getVsCodeApi(): VsCodeApi<StateType, Command> {
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === "development") {
        return new MockedVsCodeApi();
    } else {
        return new VsCodeImpl<StateType, Command>();
    }
}

class MockedVsCodeApi extends VsCodeMock<StateType, Command> {
    override updateState(): void {
        throw new Error("Method not implemented.");
    }

    override postMessage(message: Command): void {
        switch (true) {
            case message instanceof DisplayDomainStoryCommand: {
                // The initial message that gets sent if the webview is fully
                // loaded.
                console.debug("[DEBUG] DisplayDomainStoryCommand", message);
                dispatchEvent(new DisplayDomainStoryCommand("", ""));
                break;
            }
            case message instanceof SyncDocumentCommand: {
                console.debug("[DEBUG] SyncDocumentCommand", message);
                dispatchEvent(new SyncDocumentCommand("", ""));
                break;
            }
            default: {
                throw new Error(`Unknown message type: ${message.TYPE}`);
            }
        }

        function dispatchEvent(event: Command) {
            window.dispatchEvent(
                new MessageEvent("message", {
                    data: event,
                }),
            );
        }
    }
}
