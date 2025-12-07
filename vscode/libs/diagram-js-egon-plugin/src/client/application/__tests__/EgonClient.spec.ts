import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { EgonClient } from "../EgonClient";
import { IconPort, ModelerPort } from "../ports";
import { EgonClientConfig } from "../EgonClientConfig";
import { DomainStoryDocument, IconCategory, IconSet, IconSetData, ViewportData } from "../../domain";

/**
 * Creates mock ports for testing EgonClient.
 * Uses constructor injection to bypass real adapter creation.
 */
function createMockPorts() {
    const mockModelerPort: ModelerPort = {
        import: vi.fn(),
        export: vi.fn(),
        getViewport: vi.fn().mockReturnValue({ x: 0, y: 0, width: 100, height: 100 }),
        setViewport: vi.fn(),
        onStoryChanged: vi.fn(),
        onViewportChanged: vi.fn(),
        offStoryChanged: vi.fn(),
        offViewportChanged: vi.fn(),
        destroy: vi.fn(),
    };

    const mockIconPort: IconPort = {
        loadIcons: vi.fn(),
        addIcon: vi.fn(),
        removeIcon: vi.fn(),
        getIcons: vi.fn().mockReturnValue({ actors: {}, workObjects: {} }),
        hasIcon: vi.fn(),
        onIconsChanged: vi.fn(),
        offIconsChanged: vi.fn(),
    };

    return { mockModelerPort, mockIconPort };
}

describe("EgonClient (Application Service)", () => {
    let mockModelerPort: ModelerPort;
    let mockIconPort: IconPort;
    let client: EgonClient;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.appendChild(container);

        const ports = createMockPorts();
        mockModelerPort = ports.mockModelerPort;
        mockIconPort = ports.mockIconPort;

        const config: EgonClientConfig = {
            container,
            width: "100%",
            height: "100%",
        };

        // Use constructor injection to provide mock ports
        client = new EgonClient(config, [], {
            modelerPort: mockModelerPort,
            iconPort: mockIconPort,
        });
    });

    afterEach(() => {
        container.remove();
        vi.clearAllMocks();
    });

    describe("constructor with initial viewport", () => {
        it("should set initial viewport when provided in config", () => {
            const initialViewport: ViewportData = {
                x: 10,
                y: 20,
                width: 800,
                height: 600,
            };
            const config: EgonClientConfig = {
                container,
                viewport: initialViewport,
            };

            const ports = createMockPorts();
            // Create client with viewport config to trigger setViewport call
            new EgonClient(config, [], {
                modelerPort: ports.mockModelerPort,
                iconPort: ports.mockIconPort,
            });

            expect(ports.mockModelerPort.setViewport).toHaveBeenCalledWith(
                initialViewport,
            );
        });
    });

    describe("document operations", () => {
        it("should delegate import to modeler port", () => {
            const doc: DomainStoryDocument = {
                domain: { name: "", actors: {}, workObjects: {} },
                dst: [],
            };
            client.import(doc);

            expect(mockModelerPort.import).toHaveBeenCalledWith(doc);
        });

        it("should delegate export to modeler port", () => {
            const doc: DomainStoryDocument = {
                domain: { name: "", actors: {}, workObjects: {} },
                dst: [],
            };
            (mockModelerPort.export as Mock).mockReturnValue(doc);

            const result = client.export();

            expect(result).toEqual(doc);
            expect(mockModelerPort.export).toHaveBeenCalledTimes(1);
        });
    });

    describe("event subscription", () => {
        it("should route story.changed to modeler port", () => {
            const callback = vi.fn();
            client.on("story.changed", callback);

            expect(mockModelerPort.onStoryChanged).toHaveBeenCalledWith(callback);
        });

        it("should route viewport.changed to modeler port", () => {
            const callback = vi.fn();
            client.on("viewport.changed", callback);

            expect(mockModelerPort.onViewportChanged).toHaveBeenCalledWith(callback);
        });

        it("should route icons.changed to icon port", () => {
            const callback = vi.fn();
            client.on("icons.changed", callback);

            expect(mockIconPort.onIconsChanged).toHaveBeenCalledWith(callback);
        });

        it("should route off story.changed to modeler port", () => {
            const callback = vi.fn();
            client.off("story.changed", callback);

            expect(mockModelerPort.offStoryChanged).toHaveBeenCalledWith(callback);
        });

        it("should route off viewport.changed to modeler port", () => {
            const callback = vi.fn();
            client.off("viewport.changed", callback);

            expect(mockModelerPort.offViewportChanged).toHaveBeenCalledWith(callback);
        });

        it("should route off icons.changed to icon port", () => {
            const callback = vi.fn();
            client.off("icons.changed", callback);

            expect(mockIconPort.offIconsChanged).toHaveBeenCalledWith(callback);
        });
    });

    describe("viewport operations", () => {
        const mockViewport: ViewportData = { x: 10, y: 20, width: 900, height: 700 };

        it("should delegate getViewport to modeler port", () => {
            (mockModelerPort.getViewport as Mock).mockReturnValue(mockViewport);
            const result = client.getViewport();

            expect(result).toEqual(mockViewport);
            expect(mockModelerPort.getViewport).toHaveBeenCalledTimes(1);
        });

        it("should delegate setViewport to modeler port", () => {
            client.setViewport(mockViewport);

            expect(mockModelerPort.setViewport).toHaveBeenCalledWith(mockViewport);
        });
    });

    describe("icon management", () => {
        const mockIconSet: IconSetData = {
            actors: { TestActor: "<svg>test</svg>" },
            workObjects: {},
        };

        it("should delegate loadIcons to icon port", () => {
            client.loadIcons(mockIconSet);

            expect(mockIconPort.loadIcons).toHaveBeenCalledWith(mockIconSet);
        });

        it("should delegate addIcon to icon port", () => {
            const category: IconCategory = "actor";
            const name = "NewActor";
            const svg = "<svg>new</svg>";
            client.addIcon(category, name, svg);

            expect(mockIconPort.addIcon).toHaveBeenCalledWith(category, name, svg);
        });

        it("should delegate removeIcon to icon port", () => {
            const category: IconCategory = "workObject";
            const name = "OldObject";
            client.removeIcon(category, name);

            expect(mockIconPort.removeIcon).toHaveBeenCalledWith(category, name);
        });

        it("should delegate getIcons to icon port", () => {
            const currentIcons: IconSet = {
                actors: { Existing: "<svg>existing</svg>" },
                workObjects: {},
            };
            (mockIconPort.getIcons as Mock).mockReturnValue(currentIcons);
            const result = client.getIcons();

            expect(result).toEqual(currentIcons);
            expect(mockIconPort.getIcons).toHaveBeenCalledTimes(1);
        });

        it("should delegate hasIcon to icon port", () => {
            (mockIconPort.hasIcon as Mock).mockReturnValue(true);
            const result = client.hasIcon("actor", "CheckActor");

            expect(result).toBe(true);
            expect(mockIconPort.hasIcon).toHaveBeenCalledWith("actor", "CheckActor");
        });
    });

    describe("lifecycle", () => {
        it("should delegate destroy to modeler port", () => {
            client.destroy();
            expect(mockModelerPort.destroy).toHaveBeenCalledTimes(1);
        });
    });
});
