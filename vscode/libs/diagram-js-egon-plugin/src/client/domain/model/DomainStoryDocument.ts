/**
 * Value Object representing a complete domain story document.
 * This type is defined independently from @libs/vscode/domain-story
 * to avoid coupling between libraries.
 */
export interface DomainStoryDocument {
    readonly domain: DomainConfiguration;
    readonly dst: readonly DomainStoryElement[];
}

export interface DomainConfiguration {
    readonly name: string;
    readonly actors: Readonly<Record<string, string>>;
    readonly workObjects: Readonly<Record<string, string>>;
}

export type DomainStoryElement = unknown; // Validated during import
