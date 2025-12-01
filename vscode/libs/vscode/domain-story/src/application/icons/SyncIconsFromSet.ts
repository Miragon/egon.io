import { Icon, parseStoryOrEmpty, serializeStory, StoryIcons } from "../../domain";

export class SyncIconsFromSet {
    execute(currentEgn: string | undefined, icons: Icon[]): string {
        const doc = parseStoryOrEmpty(currentEgn);
        const storyIcons = new StoryIcons(doc);

        for (const icon of icons) {
            storyIcons.addOrUpdate(icon);
        }

        return serializeStory(storyIcons.snapshot());
    }
}
