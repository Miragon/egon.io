import { RelativePattern, Uri, workspace, WorkspaceFolder } from "vscode";
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
        documentUri: Uri,
        egnFileContent: string | undefined,
    ): Promise<string> {
        const icons = await this.collectIconsInHierarchy(
            workspaceFolder,
            documentUri,
        );
        return this.syncIcons.execute(egnFileContent, icons);
    }

    private async collectIconsInHierarchy(
        workspaceFolder: WorkspaceFolder,
        documentUri: Uri,
    ): Promise<Icon[]> {
        const pattern = new RelativePattern(
            workspaceFolder,
            `**/${ICON_BASE_PATH}/**/*.svg`,
        );

        const allIconUris = await workspace.findFiles(pattern);

        const documentDir = Uri.joinPath(documentUri, "..");
        const workspaceRoot = workspaceFolder.uri.path;
        const documentPath = documentDir.path;

        const icons: Icon[] = [];
        for (const uri of allIconUris) {
            if (!this.isIconVisibleToDocument(uri.path, workspaceRoot, documentPath)) {
                continue;
            }

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

        return icons;
    }

    private isIconVisibleToDocument(
        iconPath: string,
        workspaceRoot: string,
        documentDir: string,
    ): boolean {
        const iconDirMatch = iconPath.match(/(.*)\/\.egon\/icons\//);
        if (!iconDirMatch) return false;

        const iconBaseDir = iconDirMatch[1];

        return (
            iconBaseDir.startsWith(workspaceRoot) &&
            documentDir.startsWith(iconBaseDir)
        );
    }
}
