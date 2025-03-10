import { inject, injectable } from "tsyringe";

import { SyncWebviewCommand, SyncWebviewUseCase } from "port/in/webview";
import { LoggerPort, WebviewPort } from "port/out";

@injectable()
export class SyncWebviewService implements SyncWebviewUseCase {
    constructor(
        @inject("LoggerPort") private loggerPort: LoggerPort,
        @inject("WebviewPort") private webviewPort: WebviewPort,
    ) {}

    async sync(syncWebviewCommand: SyncWebviewCommand): Promise<boolean> {
        try {
            if (
                await this.webviewPort.postMessage(
                    syncWebviewCommand.webviewId,
                    syncWebviewCommand.message,
                )
            ) {
                return true;
            }
            // e.g., add retry logic
            return false;
        } catch (error) {
            this.loggerPort.error(error);
            return false;
        }
    }
}
