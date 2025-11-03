import Keyboard from "diagram-js/lib/features/keyboard/Keyboard";
import EditorActions from "diagram-js/lib/features/editor-actions/EditorActions";

export class DomainStoryKeyboardBindings {
    static $inject: string[] = ["keyboard", "editorActions"];

    constructor(
        private readonly keyboard: Keyboard,
        private readonly editorActions: EditorActions,
    ) {
        this.addListener(...this.selectAll());
        this.addListener(...this.toggleSpaceTool());
        this.addListener(...this.toggleLassoTool());
        this.addListener(...this.toggleHandTool());
        this.addListener(...this.activateDirectEditing());
    }

    private addListener(action: string, fn: (context: any) => void) {
        if (this.editorActions.isRegistered(action)) {
            this.keyboard.addListener(fn);
        }
    }

    private selectAll(): [string, (context: any) => void] {
        return [
            "selectElements",
            (context: any) => {
                const event = context.keyEvent;

                if (
                    this.keyboard.isKey(["a", "A"], event) &&
                    this.keyboard.isCmd(event)
                ) {
                    this.editorActions.trigger("selectElements", {});
                    return true;
                }

                return undefined;
            },
        ];
    }

    private toggleSpaceTool(): [string, (context: any) => void] {
        return [
            "spaceTool",
            (context: any) => {
                const event = context.keyEvent;

                if (this.keyboard.hasModifier(event)) {
                    return undefined;
                }

                if (this.keyboard.isKey(["s", "S"], event)) {
                    this.editorActions.trigger("spaceTool", {});
                    return true;
                }

                return undefined;
            },
        ];
    }

    private toggleLassoTool(): [string, (context: any) => void] {
        return [
            "lassoTool",
            (context: any) => {
                const event = context.keyEvent;

                if (this.keyboard.hasModifier(event)) {
                    return undefined;
                }

                if (this.keyboard.isKey(["l", "L"], event)) {
                    this.editorActions.trigger("lassoTool", {});
                    return true;
                }

                return undefined;
            },
        ];
    }

    private toggleHandTool(): [string, (context: any) => void] {
        return [
            "handTool",
            (context: any) => {
                const event = context.keyEvent;

                if (this.keyboard.hasModifier(event)) {
                    return undefined;
                }

                if (this.keyboard.isKey(["h", "H"], event)) {
                    this.editorActions.trigger("handTool", {});
                    return true;
                }

                return undefined;
            },
        ];
    }

    private activateDirectEditing(): [string, (context: any) => void] {
        return [
            "directEditing",
            (context: any) => {
                const event = context.keyEvent;

                if (this.keyboard.hasModifier(event)) {
                    return undefined;
                }

                if (this.keyboard.isKey(["e", "E"], event)) {
                    this.editorActions.trigger("directEditing", {});
                    return true;
                }

                return undefined;
            },
        ];
    }
}
