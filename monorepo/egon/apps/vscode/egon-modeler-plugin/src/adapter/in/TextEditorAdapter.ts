import { commands, TabInputText, window } from "vscode";
import { inject, singleton } from "tsyringe";

import { EXTENSION_CONTEXT } from "../../common/helpers";
import {
    TextEditorCommand,
    TextEditorUseCase,
} from "../../application/port/in/textEditor";

@singleton()
export class TextEditorAdapter {
    constructor(
        @inject("TextEditorUseCase")
        private readonly textEditorUseCase: TextEditorUseCase,
    ) {
        const command = commands.registerCommand(
            "vscode-hexagonal.toggleTextEditor",
            () => {
                this.textEditorUseCase.toggle();
            },
        );

        this.onDidCloseTextEditor();

        EXTENSION_CONTEXT.getContext().subscriptions.push(command);
    }

    private onDidCloseTextEditor() {
        window.tabGroups.onDidChangeTabs((tabs) => {
            const closedTextEditors: string[] = [];
            for (const tab of tabs.closed) {
                if (tab.input instanceof TabInputText) {
                    closedTextEditors.push(tab.input.uri.path);
                }
            }
            if (closedTextEditors.length === 0) {
                return;
            }
            const textEditorCommand = new TextEditorCommand(closedTextEditors);
            this.textEditorUseCase.close(textEditorCommand);
        });
    }
}
