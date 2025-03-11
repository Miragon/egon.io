import { inject, injectable } from "tsyringe";

import { InitWebviewCommand, InitWebviewUseCase } from "../../port/in/webview";
import { LoggerPort, WebviewPort } from "../../port/out";

@injectable()
export class InitWebviewService implements InitWebviewUseCase {
    constructor(
        @inject("LoggerPort") private readonly loggerPort: LoggerPort,
        @inject("WebviewPort") private readonly webviewPort: WebviewPort,
    ) {}

    async initWebview(initWebviewCommand: InitWebviewCommand): Promise<boolean> {
        try {
            if (
                await this.webviewPort.postMessage(
                    initWebviewCommand.webviewId,
                    initWebviewCommand.message,
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
