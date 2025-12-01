import { inject, singleton } from "tsyringe";
import { Disposable, RelativePattern, Uri, workspace } from "vscode";
import { getContext } from "./helper";
import {
    ApplyIconChange,
    ICON_BASE_PATH,
    IconChangeKind,
    tryParseIconPath,
} from "@egon/domain-story";

@singleton()
export class IconWatcherController {
    private readonly applyIconChange = new ApplyIconChange();

    constructor(
        @inject("DomainStoryModelerExtensionId")
        protected extensionId: string,
    ) {
        this.init();
    }

    private init(): void {
        const disposables: Disposable[] = [];

        const watcher = workspace.createFileSystemWatcher(
            `**/${ICON_BASE_PATH}/**/*.svg`,
        );

        disposables.push(
            watcher.onDidCreate((uri) => this.handle(uri, "create")),
            watcher.onDidChange((uri) => this.handle(uri, "update")),
            watcher.onDidDelete((uri) => this.handle(uri, "delete")),
        );

        workspace.onDidChangeWorkspaceFolders(() => {
            const folders = workspace.workspaceFolders;
            if (!folders || folders.length === 0) {
                for (const d of disposables) {
                    d.dispose();
                }
                disposables.length = 0;
            }
        });

        getContext().subscriptions.push(watcher);
    }

    private handle = async (svgUri: Uri, kind: IconChangeKind) => {
        const meta = tryParseIconPath(svgUri.path);
        if (!meta) {
            return;
        }

        const folder = workspace.getWorkspaceFolder(svgUri);
        if (!folder) return;

        const iconBaseDir = this.getIconBaseDir(svgUri.path);
        if (!iconBaseDir) return;

        const rp = new RelativePattern(folder, `**/*.${this.extensionId}`);
        const egnUris = await workspace.findFiles(rp);

        let svg: string | undefined;
        if (kind !== "delete") {
            const doc = await workspace.openTextDocument(svgUri);
            svg = doc.getText();
            if (!svg.trim()) return;
        }

        for (const egnUri of egnUris) {
            if (!this.isDocumentAffectedByIcon(egnUri.path, iconBaseDir)) {
                continue;
            }

            const data = await workspace.fs.readFile(egnUri);
            const text = new TextDecoder().decode(data);

            const newText = this.applyIconChange.execute(text, {
                type: meta.type,
                name: meta.name,
                kind,
                svg,
            });

            await workspace.fs.writeFile(egnUri, new TextEncoder().encode(newText));
        }
    };

    private getIconBaseDir(iconPath: string): string | null {
        const match = iconPath.match(/(.*)\/\.egon\/icons\//);
        return match ? match[1] : null;
    }

    private isDocumentAffectedByIcon(
        documentPath: string,
        iconBaseDir: string,
    ): boolean {
        const documentDir = documentPath.substring(
            0,
            documentPath.lastIndexOf("/"),
        );
        return documentDir.startsWith(iconBaseDir);
    }
}
