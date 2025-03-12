export interface DocumentPort {
    write(fileName: string, content: string): Promise<boolean>;

    save(fileName: string): Promise<boolean>;

    loadActiveDocumentId(): string;
}
