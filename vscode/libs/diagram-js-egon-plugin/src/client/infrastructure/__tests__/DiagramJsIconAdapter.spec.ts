import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import { DiagramJsIconAdapter } from "../DiagramJsIconAdapter";
import { IconCategory, IconSet, IconSetData } from "../../domain/model/IconTypes";
import type Diagram from "diagram-js";
import { ElementTypes } from "../../../domain/entities/elementTypes";

/**
 * Creates mock diagram-js services for testing DiagramJsIconAdapter.
 */
function createMockDiagramServices() {
    const listeners = new Map<string, ((...args: unknown[]) => void)[]>();

    const mockEventBus = {
        on: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
            if (!listeners.has(event)) {
                listeners.set(event, []);
            }
            listeners.get(event)!.push(callback);
        }),
        off: vi.fn((event: string, callback: (...args: unknown[]) => void) => {
            const eventListeners = listeners.get(event);
            if (eventListeners) {
                const index = eventListeners.indexOf(callback);
                if (index > -1) {
                    eventListeners.splice(index, 1);
                }
            }
        }),
        fire: vi.fn((event: string, data?: unknown) => {
            const eventListeners = listeners.get(event);
            if (eventListeners) {
                eventListeners.forEach((cb) => cb(data));
            }
        }),
    };

    const mockIconDictionaryService = {
        addIMGToIconDictionary: vi.fn(),
        registerIconForType: vi.fn(),
        unregisterIconForType: vi.fn(),
        addIconsToCss: vi.fn(),
    };

    const mockIconSetImportExportService = {
        createIconSetConfiguration: vi.fn((icons: Partial<IconSetData>) => icons),
        loadConfiguration: vi.fn(),
        getCurrentConfigurationForExport: vi.fn(() => ({ actors: {}, workObjects: {} })),
    };

    const mockDiagram = {
        get: vi.fn((serviceName: string) => {
            switch (serviceName) {
                case "eventBus":
                    return mockEventBus;
                case "domainStoryIconDictionaryService":
                    return mockIconDictionaryService;
                case "domainStoryIconSetImportExportService":
                    return mockIconSetImportExportService;
                default:
                    return {};
            }
        }),
    } as unknown as Diagram;

    return {
        mockDiagram,
        mockEventBus,
        mockIconDictionaryService,
        mockIconSetImportExportService,
        listeners,
    };
}

describe("DiagramJsIconAdapter", () => {
    let adapter: DiagramJsIconAdapter;
    let mocks: ReturnType<typeof createMockDiagramServices>;

    beforeEach(() => {
        mocks = createMockDiagramServices();
        adapter = new DiagramJsIconAdapter(mocks.mockDiagram);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("loadIcons", () => {
        it("should create icon set configuration and load it", () => {
            const icons: IconSetData = { actors: { Test: "<svg>test</svg>" } };

            adapter.loadIcons(icons);

            expect(mocks.mockIconSetImportExportService.createIconSetConfiguration).toHaveBeenCalledWith({
                actors: icons.actors,
                workObjects: {},
            });
            expect(mocks.mockIconSetImportExportService.loadConfiguration).toHaveBeenCalled();
        });

        it("should fire dst.config.changed event after loading icons", () => {
            const icons: IconSetData = { actors: { Test: "<svg>test</svg>" } };

            adapter.loadIcons(icons);

            expect(mocks.mockEventBus.fire).toHaveBeenCalledWith(
                "dst.config.changed",
                expect.objectContaining({ iconSet: expect.any(Object) }),
            );
        });
    });

    describe("addIcon", () => {
        it("should add actor icon to dictionary service", () => {
            const category: IconCategory = "actor";
            const name = "Robot";
            const svg = "<svg>robot</svg>";

            adapter.addIcon(category, name, svg);

            expect(mocks.mockIconDictionaryService.addIMGToIconDictionary).toHaveBeenCalledWith(svg, name);
            expect(mocks.mockIconDictionaryService.registerIconForType).toHaveBeenCalledWith(
                ElementTypes.ACTOR,
                name,
                svg,
            );
        });

        it("should add workObject icon to dictionary service", () => {
            const category: IconCategory = "workObject";
            const name = "Document";
            const svg = "<svg>document</svg>";

            adapter.addIcon(category, name, svg);

            expect(mocks.mockIconDictionaryService.addIMGToIconDictionary).toHaveBeenCalledWith(svg, name);
            expect(mocks.mockIconDictionaryService.registerIconForType).toHaveBeenCalledWith(
                ElementTypes.WORKOBJECT,
                name,
                svg,
            );
        });

        it("should add icon to CSS", () => {
            adapter.addIcon("actor", "Test", "<svg>test</svg>");

            expect(mocks.mockIconDictionaryService.addIconsToCss).toHaveBeenCalled();
        });

        it("should fire dst.config.changed event after adding icon", () => {
            adapter.addIcon("actor", "Test", "<svg>test</svg>");

            expect(mocks.mockEventBus.fire).toHaveBeenCalledWith(
                "dst.config.changed",
                expect.objectContaining({ iconSet: expect.any(Object) }),
            );
        });
    });

    describe("removeIcon", () => {
        it("should remove actor icon from dictionary service", () => {
            adapter.removeIcon("actor", "Robot");

            expect(mocks.mockIconDictionaryService.unregisterIconForType).toHaveBeenCalledWith(
                ElementTypes.ACTOR,
                "Robot",
            );
        });

        it("should remove workObject icon from dictionary service", () => {
            adapter.removeIcon("workObject", "Document");

            expect(mocks.mockIconDictionaryService.unregisterIconForType).toHaveBeenCalledWith(
                ElementTypes.WORKOBJECT,
                "Document",
            );
        });

        it("should fire dst.config.changed event after removing icon", () => {
            adapter.removeIcon("actor", "Test");

            expect(mocks.mockEventBus.fire).toHaveBeenCalledWith(
                "dst.config.changed",
                expect.objectContaining({ iconSet: expect.any(Object) }),
            );
        });
    });

    describe("getIcons", () => {
        it("should return icons from IconSetImportExportService", () => {
            const expectedIcons: IconSet = {
                actors: { Existing: "<svg>existing</svg>" },
                workObjects: { Report: "<svg>report</svg>" },
            };
            (mocks.mockIconSetImportExportService.getCurrentConfigurationForExport as Mock).mockReturnValue(
                expectedIcons,
            );

            const result = adapter.getIcons();

            expect(result).toEqual(expectedIcons);
        });

        it("should return empty IconSet when service returns undefined", () => {
            (mocks.mockIconSetImportExportService.getCurrentConfigurationForExport as Mock).mockReturnValue(undefined);

            const result = adapter.getIcons();

            expect(result).toEqual({ actors: {}, workObjects: {} });
        });
    });

    describe("hasIcon", () => {
        it("should return true when actor icon exists", () => {
            const existingIcons: IconSet = { actors: { Present: "<svg>p</svg>" }, workObjects: {} };
            (mocks.mockIconSetImportExportService.getCurrentConfigurationForExport as Mock).mockReturnValue(
                existingIcons,
            );

            expect(adapter.hasIcon("actor", "Present")).toBe(true);
        });

        it("should return false when actor icon does not exist", () => {
            const existingIcons: IconSet = { actors: {}, workObjects: {} };
            (mocks.mockIconSetImportExportService.getCurrentConfigurationForExport as Mock).mockReturnValue(
                existingIcons,
            );

            expect(adapter.hasIcon("actor", "Missing")).toBe(false);
        });

        it("should return true when workObject icon exists", () => {
            const existingIcons: IconSet = { actors: {}, workObjects: { Document: "<svg>d</svg>" } };
            (mocks.mockIconSetImportExportService.getCurrentConfigurationForExport as Mock).mockReturnValue(
                existingIcons,
            );

            expect(adapter.hasIcon("workObject", "Document")).toBe(true);
        });
    });

    describe("event subscription", () => {
        it("should subscribe to icon changes via EventBus", () => {
            const callback = vi.fn();

            adapter.onIconsChanged(callback);

            expect(mocks.mockEventBus.on).toHaveBeenCalledWith("dst.config.changed", expect.any(Function));
        });

        it("should unsubscribe from icon changes via EventBus", () => {
            const callback = vi.fn();
            adapter.onIconsChanged(callback);

            adapter.offIconsChanged(callback);

            expect(mocks.mockEventBus.off).toHaveBeenCalledWith("dst.config.changed", expect.any(Function));
        });
    });
});
