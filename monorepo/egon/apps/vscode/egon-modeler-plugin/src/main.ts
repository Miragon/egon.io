import "reflect-metadata";
import { ExtensionContext } from "vscode";
import { setContext } from "./global/helper";
import { container } from "tsyringe";
import { WebviewController } from "./global/WebviewController";
import { config } from "./main.config";

export function activate(context: ExtensionContext) {
    // 1. Set the global application context
    setContext(context);

    // 2. Configure the application
    config();

    // 4. Start the application
    container.resolve(WebviewController);
}
