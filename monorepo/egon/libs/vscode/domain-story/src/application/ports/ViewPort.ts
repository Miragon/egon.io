export interface ViewPort {
    display(editorId: string, text: string): Promise<void>;
}
