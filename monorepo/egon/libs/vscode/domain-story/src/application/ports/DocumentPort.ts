export interface DocumentPort {
    read(editorId: string): Promise<string>;
    write(editorId: string, text: string): Promise<void>;
}
