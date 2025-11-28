export class IconName {
    private constructor(readonly value: string) {}

    static fromFileName(fileName: string): IconName | null {
        const base = fileName.split("/").pop() ?? "";
        const name = base.split(".")[0]?.trim();
        if (!name) return null;
        return new IconName(name);
    }

    static fromString(name: string): IconName | null {
        const trimmed = name.trim();
        if (!trimmed) return null;
        return new IconName(trimmed);
    }
}
