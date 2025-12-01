import KeyboardModule from "diagram-js/lib/features/keyboard";
import EditorActionsModule from "diagram-js/lib/features/editor-actions";
import DomainStoryEditorActions from "../editor-actions";
import { DomainStoryKeyboardBindings } from "./DomainStoryKeyboardBindings";

export default {
    __depends__: [KeyboardModule, EditorActionsModule, DomainStoryEditorActions],
    __init__: ["domainStoryKeyboardBindings"],
    domainStoryKeyboardBindings: ["type", DomainStoryKeyboardBindings],
};
