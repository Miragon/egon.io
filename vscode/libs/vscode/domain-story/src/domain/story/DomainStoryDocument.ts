export interface IconMap {
    [name: string]: string;
}

export interface DomainSection {
    name: string;
    actors: IconMap;
    workObjects: IconMap;
}

export interface DomainStoryDocument {
    domain: DomainSection;
    dst: unknown[];
}
