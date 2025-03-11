import { inject, injectable } from "tsyringe";

import { SyncDocumentCommand, SyncDocumentUseCase } from "../../port/in/document";
import { DocumentPort, LoggerPort } from "../../port/out";

@injectable()
export class SyncDocumentService implements SyncDocumentUseCase {
    constructor(
        @inject("LoggerPort") private readonly loggerPort: LoggerPort,
        @inject("DocumentPort") private readonly documentPort: DocumentPort,
    ) {}

    async sync(syncDocumentCommand: SyncDocumentCommand): Promise<boolean> {
        if (
            await this.documentPort.write(
                syncDocumentCommand.fileName,
                syncDocumentCommand.content,
            )
        ) {
            return await this.documentPort.save(syncDocumentCommand.fileName);
        }
        // Handle error
        return false;
    }
}
