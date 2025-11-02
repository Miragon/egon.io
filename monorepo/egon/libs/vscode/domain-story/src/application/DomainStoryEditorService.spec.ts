import { DomainStoryEditorService } from "./DomainStoryEditorService";
import { DocumentPort, ViewPort } from "./ports";

class MockDocumentPort implements DocumentPort {
    private documents = new Map<string, string>();

    async read(editorId: string): Promise<string> {
        return this.documents.get(editorId) || "";
    }

    async write(editorId: string, text: string): Promise<void> {
        this.documents.set(editorId, text);
    }

    getWrittenContent(editorId: string): string | undefined {
        return this.documents.get(editorId);
    }
}

class MockViewPort implements ViewPort {
    private displayedContent = new Map<string, string[]>();

    async display(editorId: string, text: string): Promise<void> {
        if (!this.displayedContent.has(editorId)) {
            this.displayedContent.set(editorId, []);
        }
        this.displayedContent.get(editorId)!.push(text);
    }

    getDisplayCalls(editorId: string): string[] {
        return this.displayedContent.get(editorId) || [];
    }

    getLastDisplayedContent(editorId: string): string | undefined {
        const calls = this.displayedContent.get(editorId);
        return calls && calls.length > 0 ? calls[calls.length - 1] : undefined;
    }

    resetCalls(editorId: string): void {
        this.displayedContent.delete(editorId);
    }
}

describe("DomainStoryEditorService", () => {
    let service: DomainStoryEditorService;
    let mockDocs: MockDocumentPort;
    let mockView: MockViewPort;

    beforeEach(() => {
        mockDocs = new MockDocumentPort();
        mockView = new MockViewPort();
        service = new DomainStoryEditorService(mockDocs);
    });

    describe("registerSession", () => {
        it("should register a new session", () => {
            service.registerSession("editor-1", "initial content", mockView);

            expect(() =>
                service.registerSession("editor-1", "other", mockView),
            ).not.toThrow();
        });

        it("should not override existing session", async () => {
            service.registerSession("editor-1", "initial", mockView);
            await service.initialize("editor-1");

            const secondView = new MockViewPort();
            service.registerSession("editor-1", "should not override", secondView);
            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("initial");
        });

        it("should allow registering multiple different sessions", () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();

            service.registerSession("editor-1", "content-1", view1);
            service.registerSession("editor-2", "content-2", view2);

            expect(() => service.initialize("editor-1")).not.toThrow();
            expect(() => service.initialize("editor-2")).not.toThrow();
        });
    });

    describe("initialize", () => {
        it("should display current content to view", async () => {
            service.registerSession("editor-1", "initial content", mockView);

            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("initial content");
        });

        it("should not fail for unregistered session", async () => {
            await expect(service.initialize("unknown")).resolves.not.toThrow();
        });

        it("should display latest content if session was updated", async () => {
            service.registerSession("editor-1", "initial", mockView);
            await service.syncFromWebview("editor-1", "updated");

            mockView.resetCalls("editor-1");
            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("updated");
        });
    });

    describe("syncFromWebview", () => {
        it("should update document from webview", async () => {
            service.registerSession("editor-1", "initial", mockView);

            await service.syncFromWebview("editor-1", "updated from webview");

            expect(mockDocs.getWrittenContent("editor-1")).toBe("updated from webview");
        });

        it("should not fail for unregistered session", async () => {
            await expect(
                service.syncFromWebview("unknown", "text"),
            ).resolves.not.toThrow();
        });

        it("should update session content", async () => {
            service.registerSession("editor-1", "initial", mockView);

            await service.syncFromWebview("editor-1", "updated");
            mockView.resetCalls("editor-1");
            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("updated");
        });

        it("should set guard during sync to prevent echo", async () => {
            service.registerSession("editor-1", "initial", mockView);

            await service.syncFromWebview("editor-1", "updated");

            expect(mockDocs.getWrittenContent("editor-1")).toBe("updated");
        });
    });

    describe("onDocumentChanged", () => {
        it("should update view when document changes", async () => {
            service.registerSession("editor-1", "initial", mockView);
            mockView.resetCalls("editor-1");

            await service.onDocumentChanged("editor-1", "user edited text");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe(
                "user edited text",
            );
        });

        it("should not fail for unregistered session", async () => {
            await expect(
                service.onDocumentChanged("unknown", "text"),
            ).resolves.not.toThrow();
        });

        it("should not update view if guard is active (echo prevention)", async () => {
            service.registerSession("editor-1", "initial", mockView);
            mockView.resetCalls("editor-1");

            const syncPromise = service.syncFromWebview("editor-1", "synced");
            await service.onDocumentChanged("editor-1", "synced");
            await syncPromise;

            expect(mockView.getDisplayCalls("editor-1").length).toBe(0);
        });

        it("should update session content", async () => {
            service.registerSession("editor-1", "initial", mockView);

            await service.onDocumentChanged("editor-1", "updated");
            mockView.resetCalls("editor-1");
            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("updated");
        });
    });

    describe("dispose", () => {
        it("should remove session", async () => {
            service.registerSession("editor-1", "initial", mockView);
            await service.initialize("editor-1");

            service.dispose("editor-1");
            mockView.resetCalls("editor-1");
            await service.initialize("editor-1");

            expect(mockView.getDisplayCalls("editor-1").length).toBe(0);
        });

        it("should not fail for unregistered session", () => {
            expect(() => service.dispose("unknown")).not.toThrow();
        });

        it("should allow re-registering after disposal", async () => {
            service.registerSession("editor-1", "initial", mockView);
            service.dispose("editor-1");

            service.registerSession("editor-1", "new content", mockView);
            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("new content");
        });
    });

    describe("echo prevention", () => {
        it("should not create echo loop between webview and document", async () => {
            service.registerSession("editor-1", "initial", mockView);
            mockView.resetCalls("editor-1");

            await service.syncFromWebview("editor-1", "from webview");

            const displayCallsDuringSync = mockView.getDisplayCalls("editor-1").length;
            expect(displayCallsDuringSync).toBe(0);
        });

        it("should allow normal updates after sync completes", async () => {
            service.registerSession("editor-1", "initial", mockView);
            mockView.resetCalls("editor-1");

            await service.syncFromWebview("editor-1", "synced");
            await service.onDocumentChanged("editor-1", "user edit");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe("user edit");
        });

        it("should handle rapid alternating changes", async () => {
            service.registerSession("editor-1", "initial", mockView);
            mockView.resetCalls("editor-1");

            await service.syncFromWebview("editor-1", "v1");
            await service.onDocumentChanged("editor-1", "v2");
            await service.syncFromWebview("editor-1", "v3");
            await service.onDocumentChanged("editor-1", "v4");

            const calls = mockView.getDisplayCalls("editor-1");
            expect(calls).toEqual(["v2", "v4"]);
        });
    });

    describe("multiple sessions", () => {
        it("should handle multiple independent sessions", async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();

            service.registerSession("editor-1", "content-1", view1);
            service.registerSession("editor-2", "content-2", view2);

            await service.initialize("editor-1");
            await service.initialize("editor-2");

            expect(view1.getLastDisplayedContent("editor-1")).toBe("content-1");
            expect(view2.getLastDisplayedContent("editor-2")).toBe("content-2");
        });

        it("should isolate guards between sessions", async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();

            service.registerSession("editor-1", "initial-1", view1);
            service.registerSession("editor-2", "initial-2", view2);

            view1.resetCalls("editor-1");
            view2.resetCalls("editor-2");

            await service.syncFromWebview("editor-1", "synced-1");
            await service.onDocumentChanged("editor-2", "changed-2");

            expect(view1.getDisplayCalls("editor-1").length).toBe(0);
            expect(view2.getLastDisplayedContent("editor-2")).toBe("changed-2");
        });

        it("should dispose sessions independently", async () => {
            const view1 = new MockViewPort();
            const view2 = new MockViewPort();

            service.registerSession("editor-1", "content-1", view1);
            service.registerSession("editor-2", "content-2", view2);

            service.dispose("editor-1");

            view2.resetCalls("editor-2");
            await service.initialize("editor-2");

            expect(view2.getLastDisplayedContent("editor-2")).toBe("content-2");
        });
    });

    describe("edge cases", () => {
        it("should handle empty content", async () => {
            service.registerSession("editor-1", "", mockView);

            await service.initialize("editor-1");
            expect(mockView.getLastDisplayedContent("editor-1")).toBe("");

            await service.syncFromWebview("editor-1", "");
            expect(mockDocs.getWrittenContent("editor-1")).toBe("");
        });

        it("should handle very long content", async () => {
            const longContent = "x".repeat(100000);
            service.registerSession("editor-1", longContent, mockView);

            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe(longContent);
        });

        it("should handle special characters", async () => {
            const specialContent = "特殊文字\n\t\r\n🎉\0";
            service.registerSession("editor-1", specialContent, mockView);

            await service.initialize("editor-1");

            expect(mockView.getLastDisplayedContent("editor-1")).toBe(specialContent);
        });
    });
});
