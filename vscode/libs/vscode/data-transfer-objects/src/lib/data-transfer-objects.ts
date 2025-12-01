export interface Command {
    /**
     * After parsing the command, TypeScript can't identify the type of the object
     * with **instanceof**.
     * Therefore, we use this as a workaround.
     */
    TYPE: string;

    /**
     * Unique identifier for the session in which the command is being executed.
     */
    sessionId: string;
}

/**
 * Command to initialize the webview.
 * Used when the webview sends an ` InitializeWebviewCommand ` to the extension.
 *
 * @param sessionId - Unique identifier for the session in which the command is being executed.
 */
export class InitializeWebviewCommand implements Command {
    readonly TYPE = InitializeWebviewCommand.name;

    constructor(readonly sessionId: string) {}
}

/**
 * Command to display domain story content in the webview.
 * Used when the extension sends a `DisplayDomainStoryCommand` to the webview.
 *
 * @param sessionId - Unique identifier for the session in which the command is being executed.
 * @param text - Content to display in the webview
 */
export class DisplayDomainStoryCommand implements Command {
    readonly TYPE = DisplayDomainStoryCommand.name;

    constructor(
        readonly sessionId: string,
        readonly text: string,
    ) {}
}

/**
 * Command to sync document content with the webview.
 * Used when the webview sends a `SyncDocumentCommand` to the extension.
 *
 * @param sessionId - Unique identifier for the session in which the command is being executed.
 * @param text - New content to sync to the webview
 */
export class SyncDocumentCommand implements Command {
    readonly TYPE = SyncDocumentCommand.name;

    constructor(
        readonly sessionId: string,
        readonly text: string,
    ) {}
}

export class GetDomainStoryAsSvgCommand implements Command {
    readonly TYPE = GetDomainStoryAsSvgCommand.name;

    constructor(
        readonly sessionId: string,
        readonly svg?: string,
    ) {}
}
