import { WebviewApi } from "vscode-webview";
import { Command } from "@egon/data-transfer-objects";
import { VsCodeMock } from "./mock";

declare const process: { env: { NODE_ENV: string } };

type StateType = {
    editorId: string;
    viewbox?: any;
};

export function getVsCodeApi(): VsCodeApi<StateType, Command> {
    if (process.env.NODE_ENV === "development") {
        return new VsCodeMock<StateType, Command>();
    } else {
        return new VsCodeImpl<StateType, Command>();
    }
}

export interface VsCodeApi<T, M> {
    /**
     * Get the current state of the webview.
     * @throws MissingStateError if the state is missing
     */
    getState(): T;

    setState(state: T): void;

    updateState(state: Partial<T>): void;

    postMessage(message: M): void;
}

export class VsCodeImpl<T, M extends Command> implements VsCodeApi<T, M> {
    private vscode: WebviewApi<T>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    getState(): T {
        const state = this.vscode.getState();
        if (!state) throw new MissingStateError();
        return state;
    }

    setState(state: T) {
        this.vscode.setState({
            ...state,
        });
    }

    updateState(state: Partial<T>) {
        this.setState({
            ...this.getState(),
            ...state,
        });
    }

    postMessage(message: M) {
        this.vscode.postMessage(message);
    }
}

export class MissingStateError extends Error {
    constructor() {
        super("State is missing.");
    }
}
