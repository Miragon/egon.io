import { DomainStoryEditorService } from './DomainStoryEditorService';
import { DocumentPort, ViewPort } from './ports';

class MockDocumentPort implements DocumentPort {
    private documents = new Map<string, string>();

    async read(documentId: string): Promise<string> {
        return this.documents.get(documentId) || '';
    }

    async write(documentId: string, text: string): Promise<void> {
        this.documents.set(documentId, text);
    }

    getWrittenContent(documentId: string): string | undefined {
        return this.documents.get(documentId);
    }
}

class MockViewPort implements ViewPort {
    private displayedContent = new Map<string, string[]>();

    async display(sessionId: string, text: string): Promise<void> {
        if (!this.displayedContent.has(sessionId)) {
            this.displayedContent.set(sessionId, []);
        }
        this.displayedContent.get(sessionId)!.push(text);
    }

    getDisplayCalls(sessionId: string): string[] {
        return this.displayedContent.get(sessionId) || [];
    }

    getLastDisplayedContent(sessionId: string): string | undefined {
        const calls = this.displayedContent.get(sessionId);
        return calls && calls.length > 0 ? calls[calls.length - 1] : undefined;
    }

    resetCalls(sessionId: string): void {
        this.displayedContent.delete(sessionId);
    }
}

describe('DomainStoryEditorService', () => {
    let service: DomainStoryEditorService;
    let mockDocs: MockDocumentPort;
    let mockView: MockViewPort;
    const documentId = '/path/to/file.egn';

    beforeEach(() => {
        mockDocs = new MockDocumentPort();
        mockView = new MockViewPort();
        service = new DomainStoryEditorService(mockDocs);
    });

    describe('registerSession', () => {
        it('should register a new session and return sessionId', () => {
            const sessionId = service.registerSession(documentId, 'initial content', mockView);

            expect(sessionId).toBe(`${documentId}:1`);
        });

        it('should create unique sessionIds for the same document', () => {
            const sessionId1 = service.registerSession(documentId, 'initial', mockView);
            const sessionId2 = service.registerSession(documentId, 'other', mockView);

            expect(sessionId1).toBe(`${documentId}:1`);
            expect(sessionId2).toBe(`${documentId}:2`);
        });

        it('should maintain separate sessions for same document', async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();
            
            const sessionId1 = service.registerSession(documentId, 'initial', view1);
            const sessionId2 = service.registerSession(documentId, 'different', view2);
            
            await service.initialize(sessionId1);
            await service.initialize(sessionId2);

            expect(view1.getLastDisplayedContent(sessionId1)).toBe('initial');
            expect(view2.getLastDisplayedContent(sessionId2)).toBe('different');
        });

        it('should allow registering sessions for different documents', () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();
            const doc1 = '/path/to/file1.egn';
            const doc2 = '/path/to/file2.egn';

            const sessionId1 = service.registerSession(doc1, 'content-1', view1);
            const sessionId2 = service.registerSession(doc2, 'content-2', view2);

            expect(sessionId1).toBe(`${doc1}:1`);
            expect(sessionId2).toBe(`${doc2}:1`);
        });
    });

    describe('initialize', () => {
        it('should display current content to view', async () => {
            const sessionId = service.registerSession(documentId, 'initial content', mockView);

            await service.initialize(sessionId);

            expect(mockView.getLastDisplayedContent(sessionId)).toBe('initial content');
        });

        it('should not fail for unregistered session', async () => {
            await expect(service.initialize('unknown')).resolves.not.toThrow();
        });

        it('should display latest content if session was updated', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            await service.syncFromWebview(sessionId, 'updated');

            mockView.resetCalls(sessionId);
            await service.initialize(sessionId);

            expect(mockView.getLastDisplayedContent(sessionId)).toBe('updated');
        });
    });

    describe('syncFromWebview', () => {
        it('should update document from webview', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);

            await service.syncFromWebview(sessionId, 'updated from webview');

            expect(mockDocs.getWrittenContent(documentId)).toBe('updated from webview');
        });

        it('should not fail for unregistered session', async () => {
            await expect(service.syncFromWebview('unknown', 'text')).resolves.not.toThrow();
        });

        it('should update session content', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);

            await service.syncFromWebview(sessionId, 'updated');
            mockView.resetCalls(sessionId);
            await service.initialize(sessionId);

            expect(mockView.getLastDisplayedContent(sessionId)).toBe('updated');
        });

        it('should set guard during sync to prevent echo', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);

            await service.syncFromWebview(sessionId, 'updated');

            expect(mockDocs.getWrittenContent(documentId)).toBe('updated');
        });
    });

    describe('onDocumentChanged', () => {
        it('should update view when document changes', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            mockView.resetCalls(sessionId);

            await service.onDocumentChanged(sessionId, 'user edited text');

            expect(mockView.getLastDisplayedContent(sessionId)).toBe('user edited text');
        });

        it('should not fail for unregistered session', async () => {
            await expect(service.onDocumentChanged('unknown', 'text')).resolves.not.toThrow();
        });

        it('should not update view if guard is active (echo prevention)', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            mockView.resetCalls(sessionId);

            const syncPromise = service.syncFromWebview(sessionId, 'synced');
            await service.onDocumentChanged(sessionId, 'synced');
            await syncPromise;

            expect(mockView.getDisplayCalls(sessionId).length).toBe(0);
        });

        it('should update session content', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);

            await service.onDocumentChanged(sessionId, 'updated');
            mockView.resetCalls(sessionId);
            await service.initialize(sessionId);

            expect(mockView.getLastDisplayedContent(sessionId)).toBe('updated');
        });
    });

    describe('dispose', () => {
        it('should remove session', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            await service.initialize(sessionId);

            service.dispose(sessionId);
            mockView.resetCalls(sessionId);
            await service.initialize(sessionId);

            expect(mockView.getDisplayCalls(sessionId).length).toBe(0);
        });

        it('should not fail for unregistered session', () => {
            expect(() => service.dispose('unknown')).not.toThrow();
        });

        it('should allow re-registering after disposal', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            service.dispose(sessionId);

            const newSessionId = service.registerSession(documentId, 'new content', mockView);
            await service.initialize(newSessionId);

            expect(mockView.getLastDisplayedContent(newSessionId)).toBe('new content');
        });
    });

    describe('echo prevention', () => {
        it('should not create echo loop between webview and document', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            mockView.resetCalls(sessionId);

            await service.syncFromWebview(sessionId, 'from webview');
            
            const displayCallsDuringSync = mockView.getDisplayCalls(sessionId).length;
            expect(displayCallsDuringSync).toBe(0);
        });

        it('should allow normal updates after sync completes', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            mockView.resetCalls(sessionId);

            await service.syncFromWebview(sessionId, 'synced');
            await service.onDocumentChanged(sessionId, 'user edit');

            expect(mockView.getLastDisplayedContent(sessionId)).toBe('user edit');
        });

        it('should handle rapid alternating changes', async () => {
            const sessionId = service.registerSession(documentId, 'initial', mockView);
            mockView.resetCalls(sessionId);

            await service.syncFromWebview(sessionId, 'v1');
            await service.onDocumentChanged(sessionId, 'v2');
            await service.syncFromWebview(sessionId, 'v3');
            await service.onDocumentChanged(sessionId, 'v4');

            const calls = mockView.getDisplayCalls(sessionId);
            expect(calls).toEqual(['v2', 'v4']);
        });
    });

    describe('multiple sessions', () => {
        it('should handle multiple independent sessions for different documents', async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();
            const doc1 = '/path/to/file1.egn';
            const doc2 = '/path/to/file2.egn';

            const sessionId1 = service.registerSession(doc1, 'content-1', view1);
            const sessionId2 = service.registerSession(doc2, 'content-2', view2);

            await service.initialize(sessionId1);
            await service.initialize(sessionId2);

            expect(view1.getLastDisplayedContent(sessionId1)).toBe('content-1');
            expect(view2.getLastDisplayedContent(sessionId2)).toBe('content-2');
        });

        it('should handle multiple sessions for the same document', async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();

            const sessionId1 = service.registerSession(documentId, 'content-1', view1);
            const sessionId2 = service.registerSession(documentId, 'content-2', view2);

            await service.initialize(sessionId1);
            await service.initialize(sessionId2);

            expect(view1.getLastDisplayedContent(sessionId1)).toBe('content-1');
            expect(view2.getLastDisplayedContent(sessionId2)).toBe('content-2');
            expect(sessionId1).not.toBe(sessionId2);
        });

        it('should isolate guards between sessions', async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();
            const doc1 = '/path/to/file1.egn';
            const doc2 = '/path/to/file2.egn';

            const sessionId1 = service.registerSession(doc1, 'initial-1', view1);
            const sessionId2 = service.registerSession(doc2, 'initial-2', view2);

            view1.resetCalls(sessionId1);
            view2.resetCalls(sessionId2);

            await service.syncFromWebview(sessionId1, 'synced-1');
            await service.onDocumentChanged(sessionId2, 'changed-2');

            expect(view1.getDisplayCalls(sessionId1).length).toBe(0);
            expect(view2.getLastDisplayedContent(sessionId2)).toBe('changed-2');
        });

        it('should dispose sessions independently', async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();
            const doc1 = '/path/to/file1.egn';
            const doc2 = '/path/to/file2.egn';

            const sessionId1 = service.registerSession(doc1, 'content-1', view1);
            const sessionId2 = service.registerSession(doc2, 'content-2', view2);

            service.dispose(sessionId1);

            view2.resetCalls(sessionId2);
            await service.initialize(sessionId2);

            expect(view2.getLastDisplayedContent(sessionId2)).toBe('content-2');
        });
    });

    describe('edge cases', () => {
        it('should handle empty content', async () => {
            const sessionId = service.registerSession(documentId, '', mockView);

            await service.initialize(sessionId);
            expect(mockView.getLastDisplayedContent(sessionId)).toBe('');

            await service.syncFromWebview(sessionId, '');
            expect(mockDocs.getWrittenContent(documentId)).toBe('');
        });

        it('should handle very long content', async () => {
            const longContent = 'x'.repeat(100000);
            const sessionId = service.registerSession(documentId, longContent, mockView);

            await service.initialize(sessionId);

            expect(mockView.getLastDisplayedContent(sessionId)).toBe(longContent);
        });

        it('should handle special characters', async () => {
            const specialContent = '特殊文字\n\t\r\n🎉\0';
            const sessionId = service.registerSession(documentId, specialContent, mockView);

            await service.initialize(sessionId);

            expect(mockView.getLastDisplayedContent(sessionId)).toBe(specialContent);
        });
    });
});
