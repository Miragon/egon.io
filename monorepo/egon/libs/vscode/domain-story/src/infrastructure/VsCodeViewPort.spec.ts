import { WebviewPanel } from 'vscode';
import { DisplayDomainStoryCommand } from '@egon/data-transfer-objects';
import { VsCodeViewPort } from './VsCodeViewPort';

jest.mock('@egon/data-transfer-objects', () => ({
    DisplayDomainStoryCommand: jest.fn().mockImplementation((editorId, text) => ({
        TYPE: 'DisplayDomainStoryCommand',
        editorId,
        text,
    })),
}));

describe('VsCodeViewPort', () => {
    let mockWebviewPanel: Partial<WebviewPanel>;
    let port: VsCodeViewPort;

    beforeEach(() => {
        mockWebviewPanel = {
            webview: {
                postMessage: jest.fn().mockResolvedValue(true),
            } as any,
        };

        port = new VsCodeViewPort(mockWebviewPanel as WebviewPanel);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('display', () => {
        it('should post message to webview', async () => {
            await port.display('editor-1', 'content to display');

            expect(mockWebviewPanel.webview!.postMessage).toHaveBeenCalled();
        });

        it('should create DisplayDomainStoryCommand with correct parameters', async () => {
            await port.display('editor-1', 'content');

            expect(DisplayDomainStoryCommand).toHaveBeenCalledWith('editor-1', 'content');
        });

        it('should post the command to webview', async () => {
            await port.display('editor-1', 'content');

            expect(mockWebviewPanel.webview!.postMessage).toHaveBeenCalledWith({
                TYPE: 'DisplayDomainStoryCommand',
                editorId: 'editor-1',
                text: 'content',
            });
        });

        it('should handle empty content', async () => {
            await port.display('editor-1', '');

            expect(DisplayDomainStoryCommand).toHaveBeenCalledWith('editor-1', '');
        });

        it('should handle multiline content', async () => {
            const multiline = 'line1\nline2\nline3';
            
            await port.display('editor-1', multiline);

            expect(DisplayDomainStoryCommand).toHaveBeenCalledWith('editor-1', multiline);
        });

        it('should handle special characters', async () => {
            const special = '特殊文字\t\n🎉';
            
            await port.display('editor-1', special);

            expect(DisplayDomainStoryCommand).toHaveBeenCalledWith('editor-1', special);
        });

        it('should handle different editor IDs', async () => {
            await port.display('/path/to/file1.egn', 'content1');
            await port.display('/path/to/file2.egn', 'content2');

            expect(DisplayDomainStoryCommand).toHaveBeenCalledWith('/path/to/file1.egn', 'content1');
            expect(DisplayDomainStoryCommand).toHaveBeenCalledWith('/path/to/file2.egn', 'content2');
        });

        it('should resolve when postMessage succeeds', async () => {
            (mockWebviewPanel.webview!.postMessage as jest.Mock).mockResolvedValue(true);

            await expect(port.display('editor-1', 'content')).resolves.not.toThrow();
        });

        it('should handle postMessage failure', async () => {
            const error = new Error('Webview disposed');
            (mockWebviewPanel.webview!.postMessage as jest.Mock).mockRejectedValue(error);

            await expect(port.display('editor-1', 'content')).rejects.toThrow('Webview disposed');
        });
    });

    describe('multiple displays', () => {
        it('should handle rapid sequential displays', async () => {
            await port.display('editor-1', 'v1');
            await port.display('editor-1', 'v2');
            await port.display('editor-1', 'v3');

            expect(mockWebviewPanel.webview!.postMessage).toHaveBeenCalledTimes(3);
        });

        it('should maintain call order', async () => {
            const calls: string[] = [];
            (mockWebviewPanel.webview!.postMessage as jest.Mock).mockImplementation((cmd) => {
                calls.push(cmd.text);
                return Promise.resolve(true);
            });

            await port.display('editor-1', 'first');
            await port.display('editor-1', 'second');
            await port.display('editor-1', 'third');

            expect(calls).toEqual(['first', 'second', 'third']);
        });
    });
});
