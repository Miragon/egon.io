import "reflect-metadata";
import { ExtensionContext } from "vscode";
import { setContext } from "./helper";
import { container } from "tsyringe";
import { WebviewController } from "./WebviewController";
import { config } from "./main.config";
import { IconWatcherController } from "./IconWatcherController";

export function activate(context: ExtensionContext) {
    // 1. Set the global application context
    setContext(context);

    // 2. Configure the application
    config();

    // 3. Start the application
    container.resolve(WebviewController);
    container.resolve(IconWatcherController);
}
