import {
    Command,
    DisplayDomainStoryCommand,
    InitializeWebviewCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";
import { MissingStateError, VsCodeApi } from "./api";

export class VsCodeMock<T, M extends Command> implements VsCodeApi<T, M> {
    protected state: T | undefined;

    getState(): T {
        if (!this.state) throw new MissingStateError();
        return this.state;
    }

    setState(state: T) {
        this.state = state;
    }

    updateState(): void {
        throw new Error("Method not implemented.");
    }

    postMessage(command: Command): void {
        switch (true) {
            case command.TYPE === InitializeWebviewCommand.name: {
                // The initial message that gets sent if the webview is fully
                // loaded.
                dispatchEvent(new DisplayDomainStoryCommand("123456", mockStory));
                break;
            }
            case command.TYPE === SyncDocumentCommand.name: {
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

const mockStory = JSON.stringify({
    domain: {},
    dst: [
        {
            type: "domainStory:activity",
            name: "works",
            id: "connection_1881",
            pickedColor: "black",
            number: 1,
            waypoints: [
                {
                    original: {
                        x: 252,
                        y: 203,
                    },
                    x: 295,
                    y: 203,
                },
                {
                    original: {
                        x: 591,
                        y: 203,
                    },
                    x: 553,
                    y: 203,
                },
            ],
            source: "shape_6953",
            target: "shape_2293",
            multipleNumberAllowed: false,
        },
        {
            type: "domainStory:activity",
            name: "for",
            id: "connection_6090",
            pickedColor: "black",
            number: null,
            waypoints: [
                {
                    original: {
                        x: 591,
                        y: 203,
                    },
                    x: 634,
                    y: 203,
                },
                {
                    original: {
                        x: 872,
                        y: 203,
                    },
                    x: 834,
                    y: 203,
                },
            ],
            source: "shape_2293",
            target: "shape_1799",
            multipleNumberAllowed: false,
        },
        {
            type: "domainStory:actorGroup",
            name: "Movie Company",
            id: "shape_1799",
            x: 834,
            y: 165,
        },
        {
            type: "domainStory:workObjectFolder",
            name: "Movie Project",
            id: "shape_2293",
            x: 553,
            y: 165,
        },
        {
            type: "domainStory:actorPerson",
            name: "Actor",
            id: "shape_6953",
            x: 214,
            y: 165,
        },
        {
            info: "",
        },
        {
            version: "1.0.0",
        },
    ],
});
