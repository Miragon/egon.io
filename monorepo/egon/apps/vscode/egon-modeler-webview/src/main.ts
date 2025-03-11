import Diagram from "diagram-js";
import Canvas from "diagram-js/lib/core/Canvas";
import ElementFactory from "diagram-js/lib/core/ElementFactory";
import EgonIo, {
    DomainStoryExportService,
    DomainStoryImportService,
} from "@egon/diagram-js-egon-plugin";

const additionalModules = [EgonIo];

const container = document.getElementById("domainStoryEditor");

const editor = new Diagram({
    container,
    width: "100%",
    height: "100%",
    position: "relative",
    modules: [...additionalModules],
});

const canvas: Canvas = editor.get("canvas");
const elementFactory: ElementFactory = editor.get("elementFactory");

const root = elementFactory.createRoot();

canvas.setRootElement(root);

/**
 * Example on how to retrieve services
 */
const importString =
    '{\n  "domain": {},\n  "dst": [\n    {\n      "type": "domainStory:actorPerson",\n      "name": "dfww",\n      "id": "shape_3388",\n      "x": 285,\n      "y": 155\n    }\n  ]\n}';
const importService: DomainStoryImportService = editor.get("domainStoryImportService");
importService.import(importString);

const exportService: DomainStoryExportService = editor.get("domainStoryExportService");

const button = document.createElement("button");
button.addEventListener("click", () => {
    const egn = exportService.export();
    console.log(JSON.stringify(egn));
});
button.style.position = "absolute";
button.style.bottom = "0";
button.style.right = "0";
button.style.width = "75px";
button.style.height = "50px";
button.style.cursor = "pointer";
button.style.zIndex = "9999";

container?.appendChild(button);

// const elementRegistryService: ElementRegistryService = editor.get(
//     "domainStoryElementRegistryService",
// );
// const dirtyFlagService: DirtyFlagService = editor.get("domainStoryDirtyFlagService");
// const iconDictionaryService: IconDictionaryService = editor.get(
//     "domainStoryIconDictionaryService",
// );
// const labelDictionaryService: LabelDictionaryService = editor.get(
//     "domainStoryLabelDictionaryService",
// );
//
// console.log("elementRegistryService", elementRegistryService);
// console.log("dirtyFlagService", dirtyFlagService);
// console.log("iconDictionaryService", iconDictionaryService);
// console.log("labelDictionaryService", labelDictionaryService);
