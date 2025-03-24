import { VsCodeApi, VsCodeImpl, VsCodeMock } from "./api";
import {
    Command,
    DisplayDomainStoryCommand,
    InitializeWebviewCommand,
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

    override postMessage(command: Command): void {
        switch (true) {
            case command.TYPE === InitializeWebviewCommand.name: {
                // The initial message that gets sent if the webview is fully
                // loaded.
                console.debug("[DEBUG] DisplayDomainStoryCommand", command);
                dispatchEvent(new DisplayDomainStoryCommand("123456", mockStory));
                break;
            }
            case command.TYPE === SyncDocumentCommand.name: {
                console.debug("[DEBUG] SyncDocumentCommand", command);
                const c = command as SyncDocumentCommand;
                dispatchEvent(new SyncDocumentCommand("123456", c.text));
                break;
            }
            default: {
                throw new Error(`Unknown message type: ${command.TYPE}`);
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

const mockStory =
    '{"domain":{},"dst":[{"type":"domainStory:actorPerson","name":"dfww","id":"shape_3388","x":285,"y":155}]}';
