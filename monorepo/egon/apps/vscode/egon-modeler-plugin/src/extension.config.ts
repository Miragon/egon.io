import { container, Lifecycle } from "tsyringe";
import {
    DocumentAdapter,
    LoggerAdapter,
    TextEditorAdapter,
    WebviewAdapter,
} from "./adapter/out";
import { InitWebviewService } from "./application/domain/service/InitWebviewService";
import { SyncWebviewService } from "./application/domain/service/SyncWebviewService";
import { SyncDocumentService } from "./application/domain/service/SyncDocumentService";
import { TextEditorService } from "./application/domain/service/TextEditorService";

export function config() {
    registerOutAdapters();
    registerServices();
}

function registerOutAdapters() {
    container.register(
        "LoggerPort",
        { useClass: LoggerAdapter },
        { lifecycle: Lifecycle.Singleton },
    );
    container.register(
        "WebviewPort",
        { useClass: WebviewAdapter },
        { lifecycle: Lifecycle.Singleton },
    );
    container.register(
        "DocumentPort",
        { useClass: DocumentAdapter },
        { lifecycle: Lifecycle.Singleton },
    );
    container.register(
        "TextEditorPort",
        { useClass: TextEditorAdapter },
        { lifecycle: Lifecycle.Singleton },
    );
}

function registerServices() {
    container.register(
        "InitWebviewUseCase",
        { useClass: InitWebviewService },
        { lifecycle: Lifecycle.Singleton },
    );
    container.register(
        "SyncWebviewUseCase",
        { useClass: SyncWebviewService },
        { lifecycle: Lifecycle.Singleton },
    );
    container.register(
        "SyncDocumentUseCase",
        { useClass: SyncDocumentService },
        { lifecycle: Lifecycle.Singleton },
    );
    container.register(
        "TextEditorUseCase",
        { useClass: TextEditorService },
        { lifecycle: Lifecycle.Singleton },
    );
}
