import { RelativePattern, workspace, WorkspaceFolder } from "vscode";
import {
    ICON_BASE_PATH,
    SyncIconsFromSet,
    tryParseIconPath,
    Icon,
} from "@egon/domain-story";

export class ReadIconService {
    private readonly syncIcons = new SyncIconsFromSet();

    public async read(
        workspaceFolder: WorkspaceFolder,
        egnFileContent: string | undefined,
    ): Promise<string> {
        const pattern = new RelativePattern(
            workspaceFolder,
            `**/${ICON_BASE_PATH}/**/*.svg`,
        );

        const uris = await workspace.findFiles(pattern);

        const icons: Icon[] = [];
        for (const uri of uris) {
            const meta = tryParseIconPath(uri.path);
            if (!meta) continue;

            const data = await workspace.fs.readFile(uri);
            const svg = new TextDecoder().decode(data);

            icons.push({
                type: meta.type,
                name: meta.name,
                svg,
            });
        }

        return this.syncIcons.execute(egnFileContent, icons);
    }
}
