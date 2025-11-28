import { IconChange, parseStoryOrEmpty, serializeStory, StoryIcons } from "../../domain";

export class ApplyIconChange {
    execute(egn: string, change: IconChange): string {
        const doc = parseStoryOrEmpty(egn);
        const storyIcons = new StoryIcons(doc);

        storyIcons.applyChange(change);

        return serializeStory(storyIcons.snapshot());
    }
}
