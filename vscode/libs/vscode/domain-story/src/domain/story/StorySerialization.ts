import { DomainStoryDocument } from "./DomainStoryDocument";
import { createEmptyStory } from "./EmptyStoryFactory";

export function parseStoryOrEmpty(
    egnText: string | undefined | null,
): DomainStoryDocument {
    if (!egnText || egnText.trim() === "") {
        return createEmptyStory();
    }
    return JSON.parse(egnText) as DomainStoryDocument;
}

export function serializeStory(doc: DomainStoryDocument): string {
    return JSON.stringify(doc, null, 2);
}
