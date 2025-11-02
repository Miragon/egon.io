export type ContentOrigin = 'local' | 'remote';

export interface ContentUpdatedEvent {
    type: 'ContentUpdated';
    origin: ContentOrigin;
    text: string;
}

export class EditorSession {
    constructor(
        readonly id: string,
        private content: string,
    ) {}

    snapshot(): string {
        return this.content;
    }

    applyLocalChange(text: string): ContentUpdatedEvent {
        this.content = text;
        return {
            type: 'ContentUpdated',
            origin: 'local',
            text,
        };
    }

    applyRemoteSync(text: string): ContentUpdatedEvent {
        this.content = text;
        return {
            type: 'ContentUpdated',
            origin: 'remote',
            text,
        };
    }
}
