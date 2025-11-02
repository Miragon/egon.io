import { injectable } from 'tsyringe';
import { EditorSession } from '../domain';
import { DocumentPort, ViewPort } from './ports';

interface SessionState {
    guard: number;
    session: EditorSession;
    view: ViewPort;
}

@injectable()
export class DomainStoryEditorService {
    private sessions = new Map<string, SessionState>();

    constructor(
        private docs: DocumentPort,
    ) {}

    private get(editorId: string): SessionState | undefined {
        return this.sessions.get(editorId);
    }

    registerSession(editorId: string, initialText: string, view: ViewPort): void {
        if (!this.sessions.has(editorId)) {
            this.sessions.set(editorId, {
                guard: 0,
                session: new EditorSession(editorId, initialText),
                view,
            });
        }
    }

    async initialize(editorId: string): Promise<void> {
        const state = this.get(editorId);
        if (!state) return;
        await state.view.display(editorId, state.session.snapshot());
    }

    async syncFromWebview(editorId: string, text: string): Promise<void> {
        const state = this.get(editorId);
        if (!state) return;
        state.guard++;
        state.session.applyRemoteSync(text);
        await this.docs.write(editorId, text);
        state.guard--;
    }

    async onDocumentChanged(editorId: string, text: string): Promise<void> {
        const state = this.get(editorId);
        if (!state || state.guard > 0) {
            return;
        }
        state.session.applyLocalChange(text);
        await state.view.display(editorId, text);
    }

    dispose(editorId: string): void {
        this.sessions.delete(editorId);
    }
}
