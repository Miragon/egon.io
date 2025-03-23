import { getVsCodeApi } from "./vscode/messages";
import { debounce } from "lodash";
import {
    createDomainStoryModeler,
    exportStory,
    getDomainStoryModeler,
    importStory,
    NoModelerError,
    onCommandStackChanged,
} from "./modeler";
import {
    Command,
    DisplayDomainStoryCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";

const vscode = getVsCodeApi();

/**
 * Debounce the update of the diagram content to avoid too many updates.
 * @param bpmn
 * @throws NoModelerError if the modeler is not available
 */
const updateStory = debounce(importStory, 100);

/**
 * The Main function that gets executed after the webview is fully loaded.
 * This way we can ensure that when the backend sends a message, it is caught.
 * There are two reasons why a webview gets build:
 * 1. A new .egn file was opened
 * 2. User switched to another tab and now switched back
 */
window.onload = async function () {
    window.addEventListener("message", onReceiveMessage);

    vscode.postMessage(new DisplayDomainStoryCommand("", ""));

    console.debug("[DEBUG] Modeler is initialized...");
};

/**
 * Send the changed story to the backend to update the .bpmn file.
 */
function sendStoryChanges() {
    const egn = exportStory();
    vscode.postMessage(new SyncDocumentCommand("", egn));
}

/**
 * Listen to messages from the backend.
 */
async function onReceiveMessage(message: MessageEvent<Command>) {
    const command = message.data;

    switch (true) {
        case command instanceof DisplayDomainStoryCommand: {
            try {
                getDomainStoryModeler();
                updateStory(command.text);
            } catch (error: unknown) {
                if (error instanceof NoModelerError) {
                    initializeDomainStoryModeler(command.text);
                }
            }
            break;
        }
    }
}

function initializeDomainStoryModeler(story: string) {
    createDomainStoryModeler();
    importStory(story);
    onCommandStackChanged(debounce(sendStoryChanges, 100));
}
