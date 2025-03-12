export interface TextEditorUseCase {
    toggle(): Promise<boolean>;

    close(textEditorCommand: TextEditorCommand): Promise<boolean>;
}

export class TextEditorCommand {
    private readonly DOCUMENT_EXTENSION: string = ".hexagon";
    private readonly _closedTextDocuments: string[];

    constructor(closedTextDocuments: string[]) {
        if (!(this.validate(/*closedTextDocuments*/))) {
            throw new Error("Invalid closed editors");
        }

        this._closedTextDocuments = this.filterRelevantDocuments(closedTextDocuments);
    }

    get closedTextDocuments(): string[] {
        return this._closedTextDocuments;
    }

    private validate(/*closedTextDocuments: string[]*/): boolean {
        return true;
    }

    /**
     * Filter out the closed editors that are not .hexagon files
     * @param closedTextDocuments - The closed editors
     * @returns The closed editors that are .hexagon files
     * @private
     */
    private filterRelevantDocuments(closedTextDocuments: string[]): string[] {
        const relevantDocuments: string[] = [];
        for (const document of closedTextDocuments) {
            if (document.endsWith(this.DOCUMENT_EXTENSION)) {
                relevantDocuments.push(document);
            }
        }
        return relevantDocuments;
    }
}
