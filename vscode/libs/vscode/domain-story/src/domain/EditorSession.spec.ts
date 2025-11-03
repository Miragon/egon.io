import { EditorSession } from './EditorSession';

describe('EditorSession', () => {
    describe('constructor', () => {
        it('should create a session with id and initial content', () => {
            const session = new EditorSession('test-id', 'initial content');

            expect(session.id).toBe('test-id');
            expect(session.snapshot()).toBe('initial content');
        });
    });

    describe('snapshot', () => {
        it('should return current content', () => {
            const session = new EditorSession('test-id', 'content');

            expect(session.snapshot()).toBe('content');
        });

        it('should return updated content after changes', () => {
            const session = new EditorSession('test-id', 'initial');
            session.applyLocalChange('updated');

            expect(session.snapshot()).toBe('updated');
        });
    });

    describe('applyLocalChange', () => {
        it('should update content and return local event', () => {
            const session = new EditorSession('test-id', 'initial');

            const event = session.applyLocalChange('updated text');

            expect(event).toEqual({
                type: 'ContentUpdated',
                origin: 'local',
                text: 'updated text',
            });
            expect(session.snapshot()).toBe('updated text');
        });

        it('should handle empty string', () => {
            const session = new EditorSession('test-id', 'initial');

            const event = session.applyLocalChange('');

            expect(event.text).toBe('');
            expect(session.snapshot()).toBe('');
        });

        it('should handle multiline content', () => {
            const session = new EditorSession('test-id', 'initial');
            const multiline = 'line1\nline2\nline3';

            const event = session.applyLocalChange(multiline);

            expect(event.text).toBe(multiline);
            expect(session.snapshot()).toBe(multiline);
        });

        it('should allow multiple sequential changes', () => {
            const session = new EditorSession('test-id', 'v1');

            session.applyLocalChange('v2');
            session.applyLocalChange('v3');
            const event = session.applyLocalChange('v4');

            expect(event.text).toBe('v4');
            expect(session.snapshot()).toBe('v4');
        });
    });

    describe('applyRemoteSync', () => {
        it('should update content and return remote event', () => {
            const session = new EditorSession('test-id', 'initial');

            const event = session.applyRemoteSync('synced text');

            expect(event).toEqual({
                type: 'ContentUpdated',
                origin: 'remote',
                text: 'synced text',
            });
            expect(session.snapshot()).toBe('synced text');
        });

        it('should handle empty string', () => {
            const session = new EditorSession('test-id', 'initial');

            const event = session.applyRemoteSync('');

            expect(event.text).toBe('');
            expect(session.snapshot()).toBe('');
        });

        it('should allow multiple sequential syncs', () => {
            const session = new EditorSession('test-id', 'v1');

            session.applyRemoteSync('v2');
            session.applyRemoteSync('v3');
            const event = session.applyRemoteSync('v4');

            expect(event.text).toBe('v4');
            expect(session.snapshot()).toBe('v4');
        });
    });

    describe('mixed changes', () => {
        it('should handle alternating local and remote changes', () => {
            const session = new EditorSession('test-id', 'v1');

            const event1 = session.applyLocalChange('v2');
            expect(event1.origin).toBe('local');

            const event2 = session.applyRemoteSync('v3');
            expect(event2.origin).toBe('remote');

            const event3 = session.applyLocalChange('v4');
            expect(event3.origin).toBe('local');

            expect(session.snapshot()).toBe('v4');
        });

        it('should maintain content consistency regardless of change origin', () => {
            const session1 = new EditorSession('test-id', 'initial');
            const session2 = new EditorSession('test-id', 'initial');

            session1.applyLocalChange('final');
            session2.applyRemoteSync('final');

            expect(session1.snapshot()).toBe(session2.snapshot());
        });
    });

    describe('immutability', () => {
        it('should not expose internal state', () => {
            const session = new EditorSession('test-id', 'initial');
            const snapshot1 = session.snapshot();

            session.applyLocalChange('updated');
            const snapshot2 = session.snapshot();

            expect(snapshot1).toBe('initial');
            expect(snapshot2).toBe('updated');
        });
    });
});
